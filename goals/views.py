from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Goal
from .serializers import GoalSerializer
from workspaces.models import Workspace
from tasks.models import Task


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(workspace__members__user=self.request.user)

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace")
        workspace = Workspace.objects.get(id=workspace_id, members__user=self.request.user)
        serializer.save(workspace=workspace, created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def recalculate_progress(self, request, pk=None):
        goal = self.get_object()
        linked = goal.linked_tasks.all()
        if not linked.exists():
            return Response({"detail": "No linked tasks to calculate progress from."}, status=400)

        done_count = linked.filter(status=Task.Status.DONE).count()
        progress = int((done_count / linked.count()) * 100)
        goal.progress = progress
        if progress == 100:
            goal.status = Goal.Status.COMPLETED
        goal.save()

        return Response(GoalSerializer(goal).data)