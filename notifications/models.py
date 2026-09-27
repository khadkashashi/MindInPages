from django.conf import settings
from django.db import models
from workspaces.models import Workspace


class Notification(models.Model):
    class Type(models.TextChoices):
        MEMBER_INVITED = "MEMBER_INVITED", "Member Invited"
        TASK_ASSIGNED = "TASK_ASSIGNED", "Task Assigned"
        REMINDER_DUE = "REMINDER_DUE", "Reminder Due"
        GENERAL = "GENERAL", "General"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="notifications")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.GENERAL)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.message