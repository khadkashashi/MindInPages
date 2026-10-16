from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from workspaces.models import Workspace
from workspaces.permissions import IsEditorOrReadOnly, ensure_can_write
from . import services
from .models import Goal
from .serializers import GoalSerializer


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsEditorOrReadOnly]

    def workspace_of(self, obj):
        return obj.workspace

    def get_queryset(self):
        qs = Goal.objects.filter(workspace__members__user=self.request.user)
        workspace_id = self.request.query_params.get("workspace")
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs.order_by("-created_at")

    def _check_tasks(self, workspace, data):
        for task in data.get("linked_tasks", []):
            if task.workspace_id != workspace.id:
                raise ValidationError({"linked_tasks": "A linked task belongs to a different workspace."})

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404(
            Workspace, id=self.request.data.get("workspace"), members__user=user
        )
        ensure_can_write(user, workspace)
        self._check_tasks(workspace, serializer.validated_data)
        goal = serializer.save(workspace=workspace, created_by=user)
        services.recalculate_progress(goal)

    def perform_update(self, serializer):
        goal = serializer.instance
        self._check_tasks(goal.workspace, serializer.validated_data)
        goal = serializer.save()
        if "linked_tasks" in serializer.validated_data:
            services.recalculate_progress(goal)

    @action(detail=True, methods=["post"])
    def recalculate_progress(self, request, pk=None):
        goal = self.get_object()
        if not goal.linked_tasks.exists():
            return Response({"detail": "No linked tasks to calculate progress from."}, status=400)
        return Response(self.get_serializer(services.recalculate_progress(goal)).data)