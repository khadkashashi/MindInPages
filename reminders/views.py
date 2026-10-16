from rest_framework import viewsets, permissions
from .models import Reminder
from .serializers import ReminderSerializer
from workspaces.models import Workspace
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from notes.access import visible_notes

class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(workspace__members__user=self.request.user, user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404(Workspace, id=self.request.data.get("workspace"), members__user=user)
        note = serializer.validated_data.get("note")
        task = serializer.validated_data.get("task")
        if note and not visible_notes(user).filter(pk=note.pk, workspace=workspace).exists():
            raise ValidationError({"note": "You can't set a reminder on a note you can't see here."})
        if task and task.workspace_id != workspace.id:
            raise ValidationError({"task": "That task belongs to a different workspace."})
        serializer.save(workspace=workspace, user=user)