from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from analytics.models import Activity
from analytics.services import log_activity
from notifications.models import Notification
from notifications.services import notify
from workspaces.models import Workspace
from workspaces.permissions import WRITE_ROLES, ensure_can_write, get_role
from . import services
from .models import Task
from .permissions import TaskAccess
from .serializers import TaskSerializer

User = get_user_model()
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, TaskAccess]
    member_actions = ("set_status",)  # any member may call it; the action checks who may do what

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
            qs = qs.filter(assignees=self.request.user)
        if params.get("overdue") == "true":
            qs = qs.filter(due_date__lt=timezone.now()).exclude(status=Task.Status.DONE)
        return qs.prefetch_related("assignees", "progress").order_by("-created_at")

    def _check_assignees(self, workspace, data):
        member_ids = set(workspace.members.values_list("user_id", flat=True))
        outsiders = [u.email for u in data.get("assignees", []) if u.id not in member_ids]
        if outsiders:
            raise ValidationError({"assignees": f"Not members of this workspace: {', '.join(outsiders)}"})

    def _notify_new_assignees(self, task, before_ids):
        me = self.request.user
        for user in task.assignees.exclude(pk__in=before_ids).exclude(pk=me.pk):
            notify(task.workspace, user, f'{me.email} assigned you "{task.title}".',type=Notification.Type.TASK_ASSIGNED)

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404( Workspace, id=self.request.data.get("workspace"), members__user=user)
        ensure_can_write(user, workspace)
        self._check_assignees(workspace, serializer.validated_data)
        task = serializer.save(workspace=workspace, created_by=user)
        self._notify_new_assignees(task, before_ids=set())
        log_activity(workspace, user, Activity.Action.TASK_CREATED, {"task_id": task.id, "title": task.title})

    def perform_update(self, serializer):
        task = serializer.instance
        old_mode = task.completion_mode
        before = set(task.assignees.values_list("pk", flat=True))
        self._check_assignees(task.workspace, serializer.validated_data)
        task = serializer.save()
        after = set(task.assignees.values_list("pk", flat=True))
        services.reconcile(task, old_mode, before, after)
        self._notify_new_assignees(task, before)
        services.refresh_goals(task)

    def perform_destroy(self, instance):
        goals = list(instance.goals.all())
        instance.delete()
        from goals.services import recalculate_progress
        for goal in goals:
            recalculate_progress(goal)

    @action(detail=True, methods=["post"])
    def set_status(self, request, pk=None):
        task = self.get_object()
        user = request.user
        new_status = request.data.get("status")
        if new_status not in Task.Status.values:
            raise ValidationError({"status": "Must be TODO, IN_PROGRESS or DONE."})
        is_writer = get_role(user, task.workspace) in WRITE_ROLES
        finisher = user

        if task.completion_mode == Task.CompletionMode.SHARED:
            if not (is_writer or task.assignees.filter(pk=user.pk).exists()):
                raise PermissionDenied("Only assignees and editors can change this task.")
            task.status = new_status
            task.save(update_fields=["status"])
            services.stamp_completion(task)
        else:
            target_id = request.data.get("user")
            if target_id in (None, ""):
                target = user
            else:
                try:
                    target_id = int(target_id)
                except (TypeError, ValueError):
                    raise ValidationError({"user": "A number is required."})
                if target_id != user.pk and not is_writer:
                    raise PermissionDenied("Only editors can change someone else's status.")
                target = get_object_or_404(User, pk=target_id)
            if not task.assignees.filter(pk=target.pk).exists():
                raise ValidationError({"user": "You aren't assigned to this task." if target == user
                    else "That person isn't assigned to this task."
                })
            services.set_user_status(task, target, new_status)
            finisher = target

        services.refresh_goals(task)
        if new_status == Task.Status.DONE and task.created_by_id and task.created_by_id != user.pk:
            notify(task.workspace, task.created_by, f'{finisher.email} finished "{task.title}".',type=Notification.Type.GENERAL)
        return Response(self.get_serializer(self.get_queryset().get(pk=task.pk)).data)