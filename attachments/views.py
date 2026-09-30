from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .models import Attachment
from .serializers import AttachmentSerializer


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Attachment.objects.filter(note__workspace__members__user=self.request.user)

    def perform_create(self, serializer):
        note = serializer.validated_data["note"]
        if not note.workspace.members.filter(user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this note's workspace.")
        file_obj = serializer.validated_data["file"]
        serializer.save(uploaded_by=self.request.user, original_name=file_obj.name)