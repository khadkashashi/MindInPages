from rest_framework import viewsets, permissions
from .models import Folder
from .serializers import FolderSerializer

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(workspace__members__user=self.request.user)

    def perform_create(self, serializer):
        from workspaces.models import Workspace
        workspace_id = self.request.data.get("workspace")
        workspace = Workspace.objects.get(id=workspace_id, members__user=self.request.user)
        serializer.save(workspace=workspace, created_by=self.request.user)