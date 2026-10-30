from django.conf import settings
from django.db import models
from workspaces.models import Workspace
# Create your models here.

class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "TODO", "To Do"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        DONE = "DONE", "Done"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"

    class CompletionMode(models.TextChoices):
        SHARED = "SHARED", "Group: one result for everyone"
        INDIVIDUAL = "INDIVIDUAL", "Each person completes their own"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.TODO)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    assignees = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="tasks_assigned")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_tasks")
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completion_mode = models.CharField(max_length=12, choices=CompletionMode.choices, default=CompletionMode.SHARED)
    def __str__(self):
        return self.title

class TaskProgress(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="progress")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_progress")
    status = models.CharField(max_length=15, choices=Task.Status.choices, default=Task.Status.TODO)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("task", "user")