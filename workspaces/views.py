import re
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from . import services
from .models import Workspace, WorkspaceMember
from .permissions import IsWorkspaceOwner, IsWorkspaceOwnerOrAdmin, get_role
from .serializers import WorkspaceMemberSerializer, WorkspaceSerializer

Role = WorkspaceMember.Role
def _int(request, key):
    try:
        return int(request.data.get(key))
    except (TypeError, ValueError):
        raise ValidationError({key: "A number is required."})


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin, IsWorkspaceOwner]

    def get_permissions(self):
        if self.action == "leave":  # any member may leave, so the owner/admin rules don't apply
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        return Workspace.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        workspace = services.create_workspace(self.request.user, serializer.validated_data["name"])
        serializer.instance = workspace  # so the response shows the finished workspace

    @action(detail=True, methods=["get"])
    def stats(self, request, pk=None):
        workspace = self.get_object()
        cache_key = f"workspace_stats_{workspace.id}"
        data = cache.get(cache_key)
        if data is None:
            data = {
                "workspace_id": workspace.id,
                "member_count": workspace.members.count(),
                "plan": workspace.subscription.plan.name,
                "cached": False,
            }
            cache.set(cache_key, data, timeout=60)
        else:
            data["cached"] = True
        return Response(data)

    @action(detail=True, methods=["post"])
    def invite_members(self, request, pk=None):
        workspace = self.get_object()
        raw = request.data.get("emails", [])
        if isinstance(raw, str):
            raw = [raw]
        if not isinstance(raw, list):
            raise ValidationError({"emails": "Send a list of email addresses."})
        emails = [e for item in raw for e in re.split(r"[,\s;]+", str(item)) if e]
        if not emails:
            raise ValidationError({"emails": "Provide at least one email address."})
        if len(emails) > 50:
            raise ValidationError({"emails": "Invite at most 50 people at a time."})

        role = request.data.get("role", Role.VIEWER)
        if role not in services.ASSIGNABLE_ROLES:
            raise ValidationError({"role": "Role must be ADMIN, EDITOR or VIEWER."})
        if role == Role.ADMIN and get_role(request.user, workspace) != Role.OWNER:
            raise PermissionDenied("Only the owner can invite admins.")

        return Response({"results": services.invite_people(workspace, request.user, emails, role)})

    @action(detail=True, methods=["post"])
    def change_role(self, request, pk=None):
        workspace = self.get_object()
        actor_role = get_role(request.user, workspace)
        member = get_object_or_404(workspace.members, id=_int(request, "member_id"))
        new_role = request.data.get("role")
        if new_role not in services.ASSIGNABLE_ROLES:
            raise ValidationError({"role": "Role must be ADMIN, EDITOR or VIEWER."})
        if member.role == Role.OWNER:
            raise ValidationError({"detail": "The owner's role can't be changed."})
        if actor_role != Role.OWNER and (member.role == Role.ADMIN or new_role == Role.ADMIN):
            raise PermissionDenied("Only the owner can promote someone to admin or change an admin.")
        member.role = new_role
        member.save()
        return Response(WorkspaceMemberSerializer(member, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def remove_member(self, request, pk=None):
        workspace = self.get_object()
        actor_role = get_role(request.user, workspace)
        member = get_object_or_404(workspace.members, id=_int(request, "member_id"))
        if member.role == Role.OWNER:
            raise ValidationError({"detail": "The owner can't be removed."})
        if member.user_id == request.user.id:
            raise ValidationError({"detail": "Use Leave workspace to remove yourself."})
        if actor_role != Role.OWNER and member.role == Role.ADMIN:
            raise PermissionDenied("Only the owner can remove an admin.")
        services.remove_member(workspace, member)
        return Response(status=204)

    @action(detail=True, methods=["post"])
    def cancel_invitation(self, request, pk=None):
        workspace = self.get_object()
        get_object_or_404(workspace.invitations, id=_int(request, "invitation_id")).delete()
        services._clear_stats_cache(workspace)
        return Response(status=204)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        workspace = get_object_or_404(self.get_queryset(), pk=pk)
        member = get_object_or_404(workspace.members, user=request.user)
        if member.role == Role.OWNER:
            raise ValidationError({"detail": "The owner can't leave. Delete the workspace instead."})
        services.remove_member(workspace, member)
        return Response(status=204)