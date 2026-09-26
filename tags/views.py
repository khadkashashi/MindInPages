from rest_framework import viewsets, permissions
from .models import Tag
from .serializers import TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(workspace__members__user=self.request.user)

    def perform_create(self, serializer):
        from workspaces.models import Workspace
        workspace_id = self.request.data.get("workspace")
        workspace = Workspace.objects.get(id=workspace_id, members__user=self.request.user)
        serializer.save(workspace=workspace)