from django.conf import settings
from django.db import models
from workspaces.models import Workspace
from folders.models import Folder
from tags.models import Tag
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector


class Note(models.Model):
    class Visibility(models.TextChoices):
        PRIVATE = "PRIVATE", "Private (only me)"
        SHARED = "SHARED", "Shared with the workspace"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="notes")
    folder = models.ForeignKey(Folder,on_delete=models.SET_NULL,null=True,blank=True,related_name="notes")
    tags = models.ManyToManyField(Tag, blank=True, related_name="notes")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    visibility = models.CharField(max_length=10,choices=Visibility.choices,default=Visibility.PRIVATE)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.title

    class Meta:
        indexes = [GinIndex(SearchVector("title", "content", config="english"),name="note_search_idx")]


class NoteVersion(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name="versions")
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    edited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Version of {self.note.title} at {self.created_at}"