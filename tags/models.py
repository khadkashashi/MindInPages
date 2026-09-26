from django.db import models
from workspaces.models import Workspace


class Tag(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="tags")
    name = models.CharField(max_length=50)

    class Meta:
        unique_together = ("workspace", "name")  # no duplicate tag names per workspace

    def __str__(self):
        return self.name