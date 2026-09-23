from rest_framework import viewsets, permissions
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer

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