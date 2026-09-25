from django.conf import settings
from django.db import models
from workspaces.models import Workspace

# Create your models here.
class Activity(models.Model):
    class Action(models.TextChoices):
        WORKSPACE_CREATED = "WORKSPACE_CREATED", "Workspace Created"
        MEMBER_INVITED = "MEMBER_INVITED", "Member Invited"
        EDITING="EDITING", "editing"
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="activities")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="activities")
    action = models.CharField(max_length=50, choices=Action.choices)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} in {self.workspace} by {self.user}"