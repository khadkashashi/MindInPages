from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError
from workspaces.models import Workspace
from workspaces.permissions import IsEditorOrReadOnly, ensure_can_write
from .models import Folder
from .serializers import FolderSerializer


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorOrReadOnly]

    def workspace_of(self, obj):
        return obj.workspace

    def get_queryset(self):
        qs = Folder.objects.filter(workspace__members__user=self.request.user)
        workspace_id = self.request.query_params.get("workspace")
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs

    def _check_parent(self, workspace, parent, folder=None):
        if not parent:
            return
        if parent.workspace_id != workspace.id:
            raise ValidationError({"parent": "The parent folder belongs to a different workspace."})
        node = parent
        while folder and node:  # walk up the tree so a folder can't end up inside itself
            if node.pk == folder.pk:
                raise ValidationError({"parent": "A folder can't be placed inside itself."})
            node = node.parent

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404(
            Workspace, id=self.request.data.get("workspace"), members__user=user
        )
        ensure_can_write(user, workspace)
        self._check_parent(workspace, serializer.validated_data.get("parent"))
        serializer.save(workspace=workspace, created_by=user)

    def perform_update(self, serializer):
        folder = serializer.instance
        self._check_parent(folder.workspace, serializer.validated_data.get("parent"), folder)
        serializer.save()