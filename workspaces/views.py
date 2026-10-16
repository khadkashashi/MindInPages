from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer
from .permissions import IsWorkspaceOwnerOrAdmin, IsWorkspaceOwner
from subscriptions.models import Plan, Subscription
from django.core.cache import cache
from analytics.services import log_activity
from analytics.models import Activity
from notifications.services import notify
from notifications.models import Notification
from .services import create_workspace

User = get_user_model()
class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin, IsWorkspaceOwner]

    def get_queryset(self):
        return Workspace.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        workspace = create_workspace(self.request.user, serializer.validated_data["name"])
        serializer.instance = workspace  
        
    @action(detail=True, methods=["post"])
    def invite_member(self, request, pk=None):
        workspace = self.get_object()
        subscription = workspace.subscription
        current_count = workspace.members.count()
        if current_count >= subscription.plan.max_members:
            return Response({"detail": f"Member limit ({subscription.plan.max_members}) reached for {subscription.plan.name} plan."},status=status.HTTP_403_FORBIDDEN)

        email = request.data.get("email")
        role = request.data.get("role", WorkspaceMember.Role.VIEWER)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        member, created = WorkspaceMember.objects.get_or_create(workspace=workspace, user=user, defaults={"role": role})
        if not created:
            return Response({"detail": "User already a member."}, status=status.HTTP_400_BAD_REQUEST)
        notify(workspace, user,f"You were added to {workspace.name} as {role}.",type=Notification.Type.MEMBER_INVITED)
        cache.delete(f"workspace_stats_{workspace.id}")
        log_activity(workspace, request.user, Activity.Action.MEMBER_INVITED, {"invited_email": email, "role": role})
        return Response(WorkspaceMemberSerializer(member).data, status=status.HTTP_201_CREATED)
        
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
            cache.set(cache_key, data, timeout=60)  # cache for 60 seconds
        else:
            data["cached"] = True
        return Response(data)