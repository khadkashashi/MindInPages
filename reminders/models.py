from django.conf import settings
from django.db import models
from workspaces.models import Workspace
from notes.models import Note
from tasks.models import Task


class Reminder(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="reminders")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reminders")
    note = models.ForeignKey(Note, on_delete=models.CASCADE, null=True, blank=True, related_name="reminders")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name="reminders")
    message = models.CharField(max_length=255)
    remind_at = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.message} at {self.remind_at}"