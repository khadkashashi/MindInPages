from django.utils import timezone
from goals.services import recalculate_progress
from .models import Task, TaskProgress


def stamp_completion(task):
    if task.status == Task.Status.DONE and not task.completed_at:
        task.completed_at = timezone.now()
        task.save(update_fields=["completed_at"])
    elif task.status != Task.Status.DONE and task.completed_at:
        task.completed_at = None
        task.save(update_fields=["completed_at"])

def refresh_goals(task):
    for goal in task.goals.all():
        recalculate_progress(goal)


def sync_task_status(task):
    if task.completion_mode != Task.CompletionMode.INDIVIDUAL:
        return task
    ids = list(task.assignees.values_list("pk", flat=True))
    if not ids:
        return task  # nobody assigned, so there is nothing to derive from
    own = dict(task.progress.filter(user_id__in=ids).values_list("user_id", "status"))
    statuses = [own.get(i, Task.Status.TODO) for i in ids]
    if all(s == Task.Status.DONE for s in statuses):
        derived = Task.Status.DONE
    elif any(s != Task.Status.TODO for s in statuses):
        derived = Task.Status.IN_PROGRESS
    else:
        derived = Task.Status.TODO
    if derived != task.status:
        task.status = derived
        task.save(update_fields=["status"])
    stamp_completion(task)
    return task


def set_user_status(task, user, status):
    progress, _ = TaskProgress.objects.get_or_create(task=task, user=user)
    progress.status = status
    progress.completed_at = timezone.now() if status == Task.Status.DONE else None
    progress.save()
    return sync_task_status(task)


def reconcile(task, old_mode, before_ids, after_ids):
    removed = before_ids - after_ids
    if removed:
        task.progress.filter(user_id__in=removed).delete()
    if task.completion_mode == Task.CompletionMode.INDIVIDUAL:
        if old_mode != Task.CompletionMode.INDIVIDUAL:
            for user_id in after_ids:  # switching from group: everyone keeps today's status
                TaskProgress.objects.get_or_create(
                    task=task, user_id=user_id,
                    defaults={"status": task.status, "completed_at": task.completed_at},
                )
        sync_task_status(task)


def unassign_user(task, user):
    task.assignees.remove(user)
    task.progress.filter(user=user).delete()
    sync_task_status(task)
    refresh_goals(task)