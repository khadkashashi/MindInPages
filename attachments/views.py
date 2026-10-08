from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from notes.access import can_edit_note, visible_notes
from .models import Attachment
from .serializers import AttachmentSerializer


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Attachment.objects.filter(note__in=visible_notes(self.request.user))

    def perform_create(self, serializer):
        note = serializer.validated_data["note"]
        if not can_edit_note(self.request.user, note):
            raise PermissionDenied("You can't attach files to this note.")
        file_obj = serializer.validated_data["file"]
        serializer.save(uploaded_by=self.request.user, original_name=file_obj.name)

    def perform_update(self, serializer):
        if not can_edit_note(self.request.user, serializer.instance.note):
            raise PermissionDenied("You can't change files on this note.")
        new_note = serializer.validated_data.get("note")
        if new_note and not can_edit_note(self.request.user, new_note):
            raise PermissionDenied("You can't move a file to that note.")
        serializer.save()

    def perform_destroy(self, instance):
        if not can_edit_note(self.request.user, instance.note):
            raise PermissionDenied("You can't remove files from this note.")
        instance.delete()