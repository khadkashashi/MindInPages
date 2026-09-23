from rest_framework import viewsets, permissions
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer
from subscriptions.models import Plan, Subscription

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Data isolation: only return workspaces this user is a member of
        return Workspace.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role=WorkspaceMember.Role.OWNER,
        )
        free_plan, _ = Plan.objects.get_or_create(name=Plan.Tier.FREE,defaults={"max_members": 3, "max_notes": 50, "price_per_month": 0})
        Subscription.objects.create(workspace=workspace, plan=free_plan)