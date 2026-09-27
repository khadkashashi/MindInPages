from rest_framework import viewsets, permissions
from .models import Reminder
from .serializers import ReminderSerializer
from workspaces.models import Workspace


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(workspace__members__user=self.request.user, user=self.request.user)

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace")
        workspace = Workspace.objects.get(id=workspace_id, members__user=self.request.user)
        serializer.save(workspace=workspace, user=self.request.user)