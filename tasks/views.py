from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from analytics.models import Activity
from analytics.services import log_activity
from goals.services import recalculate_progress
from workspaces.models import Workspace
from workspaces.permissions import WRITE_ROLES, ensure_can_write, get_role
from .models import Task
from .permissions import TaskAccess
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, TaskAccess]

    def get_queryset(self):
        params = self.request.query_params
        qs = Task.objects.filter(workspace__members__user=self.request.user)
        if params.get("workspace"):
            qs = qs.filter(workspace_id=params["workspace"])
        if params.get("status"):
            qs = qs.filter(status=params["status"])
        if params.get("priority"):
            qs = qs.filter(priority=params["priority"])
        if params.get("mine") == "true":
            qs = qs.filter(assigned_to=self.request.user)
        if params.get("overdue") == "true":
            qs = qs.filter(due_date__lt=timezone.now()).exclude(status=Task.Status.DONE)
        return qs.order_by("-created_at")

    def _check_assignee(self, workspace, data):
        assignee = data.get("assigned_to")
        if assignee and not workspace.members.filter(user=assignee).exists():
            raise ValidationError({"assigned_to": "That user is not a member of this workspace."})

    @staticmethod
    def _stamp_completion(task):
        if task.status == Task.Status.DONE and not task.completed_at:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])
        elif task.status != Task.Status.DONE and task.completed_at:
            task.completed_at = None
            task.save(update_fields=["completed_at"])

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404(
            Workspace, id=self.request.data.get("workspace"), members__user=user
        )
        ensure_can_write(user, workspace)
        self._check_assignee(workspace, serializer.validated_data)
        task = serializer.save(workspace=workspace, created_by=user)
        self._stamp_completion(task)
        log_activity(
            workspace, user, Activity.Action.TASK_CREATED, {"task_id": task.id, "title": task.title}
        )

    def perform_update(self, serializer):
        user = self.request.user
        task = serializer.instance
        if get_role(user, task.workspace) in WRITE_ROLES:
            self._check_assignee(task.workspace, serializer.validated_data)
        elif not set(serializer.validated_data) <= {"status"}:
            raise PermissionDenied("Assignees can only change the status of their task.")
        task = serializer.save()
        self._stamp_completion(task)
        for goal in task.goals.all():
            recalculate_progress(goal)

    def perform_destroy(self, instance):
        goals = list(instance.goals.all())
        instance.delete()
        for goal in goals:
            recalculate_progress(goal)