from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer
from .permissions import IsWorkspaceOwnerOrAdmin, IsWorkspaceOwner
from subscriptions.models import Plan, Subscription

User = get_user_model()
class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin, IsWorkspaceOwner]

    def get_queryset(self):
        return Workspace.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(workspace=workspace, user=self.request.user, role=WorkspaceMember.Role.OWNER)
        free_plan, _ = Plan.objects.get_or_create(name=Plan.Tier.FREE,defaults={"max_members": 3, "max_notes": 50, "price_per_month": 0})
        Subscription.objects.create(workspace=workspace, plan=free_plan)

    @action(detail=True, methods=["post"])
    def invite_member(self, request, pk=None):
        workspace = self.get_object()

        # enforce plan limit
        subscription = workspace.subscription
        current_count = workspace.members.count()
        if current_count >= subscription.plan.max_members:
            return Response(
                {"detail": f"Member limit ({subscription.plan.max_members}) reached for {subscription.plan.name} plan."},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get("email")
        role = request.data.get("role", WorkspaceMember.Role.VIEWER)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        member, created = WorkspaceMember.objects.get_or_create(workspace=workspace, user=user, defaults={"role": role})
        if not created:
            return Response({"detail": "User already a member."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(WorkspaceMemberSerializer(member).data, status=status.HTTP_201_CREATED)