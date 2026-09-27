from django.utils import timezone
from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer
from workspaces.models import Workspace
from analytics.services import log_activity
from analytics.models import Activity


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(workspace__members__user=self.request.user)

        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        priority_param = self.request.query_params.get("priority")
        if priority_param:
            qs = qs.filter(priority=priority_param)

        overdue = self.request.query_params.get("overdue")
        if overdue == "true":
            qs = qs.filter(due_date__lt=timezone.now()).exclude(status=Task.Status.DONE)

        return qs

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace")
        workspace = Workspace.objects.get(id=workspace_id, members__user=self.request.user)
        task = serializer.save(workspace=workspace, created_by=self.request.user)
        log_activity(workspace, self.request.user, Activity.Action.TASK_CREATED, {"task_id": task.id, "title": task.title})

    def perform_update(self, serializer):
        task = serializer.save()
        if task.status == Task.Status.DONE and not task.completed_at:
            task.completed_at = timezone.now()
            task.save()
        elif task.status != Task.Status.DONE:
            task.completed_at = None
            task.save()