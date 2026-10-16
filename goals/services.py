from tasks.models import Task
from .models import Goal


def recalculate_progress(goal):
    """Progress = share of linked tasks that are DONE. Reaching 100 completes the goal; slipping back reopens it."""
    linked = goal.linked_tasks.all()
    total = linked.count()
    if total == 0:
        return goal
    goal.progress = int(linked.filter(status=Task.Status.DONE).count() / total * 100)
    if goal.progress == 100:
        goal.status = Goal.Status.COMPLETED
    elif goal.status == Goal.Status.COMPLETED:
        goal.status = Goal.Status.ACTIVE
    goal.save()
    return goal