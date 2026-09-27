from django.conf import settings
from django.db import models
from workspaces.models import Workspace
from tasks.models import Task


class Goal(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"
        ARCHIVED = "ARCHIVED", "Archived"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    progress = models.PositiveSmallIntegerField(default=0)  # 0-100
    target_date = models.DateField(null=True, blank=True)
    linked_tasks = models.ManyToManyField(Task, blank=True, related_name="goals")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title