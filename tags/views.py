from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from workspaces.models import Workspace
from workspaces.permissions import IsEditorOrReadOnly, ensure_can_write
from .models import Tag
from .serializers import TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorOrReadOnly]

    def workspace_of(self, obj):
        return obj.workspace

    def get_queryset(self):
        qs = Tag.objects.filter(workspace__members__user=self.request.user)
        workspace_id = self.request.query_params.get("workspace")
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404(
            Workspace, id=self.request.data.get("workspace"), members__user=user
        )
        ensure_can_write(user, workspace)
        name = serializer.validated_data["name"].strip()
        if Tag.objects.filter(workspace=workspace, name__iexact=name).exists():
            raise ValidationError({"name": "A tag with this name already exists."})
        serializer.save(workspace=workspace, name=name)

    def perform_update(self, serializer):
        tag = serializer.instance
        name = serializer.validated_data.get("name", tag.name).strip()
        if Tag.objects.filter(workspace=tag.workspace, name__iexact=name).exclude(pk=tag.pk).exists():
            raise ValidationError({"name": "A tag with this name already exists."})
        serializer.save(name=name)