from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from analytics.models import Activity
from analytics.services import log_activity
from workspaces.models import Workspace
from workspaces.permissions import WRITE_ROLES, get_role
from .access import can_create_note, visible_notes
from .models import Note, NoteVersion
from .permissions import NoteAccess
from .serializers import NoteSerializer, NoteVersionSerializer


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated, NoteAccess]

    def get_queryset(self):
        qs = visible_notes(self.request.user)
        workspace_id = self.request.query_params.get("workspace")
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs.order_by("-updated_at")

    def _check_relations(self, workspace, data):
        folder = data.get("folder")
        if folder and folder.workspace_id != workspace.id:
            raise ValidationError({"folder": "That folder belongs to a different workspace."})
        for tag in data.get("tags", []):
            if tag.workspace_id != workspace.id:
                raise ValidationError({"tag_ids": "A tag belongs to a different workspace."})

    def perform_create(self, serializer):
        user = self.request.user
        workspace = get_object_or_404(Workspace, id=self.request.data.get("workspace"), members__user=user)
        visibility = serializer.validated_data.get("visibility", Note.Visibility.PRIVATE)
        if not can_create_note(user, workspace, visibility):
            raise PermissionDenied("Your role can only create private notes in this workspace.")
        self._check_relations(workspace, serializer.validated_data)
        note = serializer.save(workspace=workspace, author=user)
        # the activity feed is visible to the whole workspace, so private notes never go in it
        if note.visibility == Note.Visibility.SHARED:
            log_activity(workspace, user, Activity.Action.NOTE_CREATED,{"note_id": note.id, "title": note.title})

    def perform_update(self, serializer):
        user = self.request.user
        note = serializer.instance
        new_visibility = serializer.validated_data.get("visibility")
        if new_visibility and new_visibility != note.visibility:
            if note.author_id != user.id:
                raise PermissionDenied("Only the author can change who can see a note.")
            if (
                new_visibility == Note.Visibility.SHARED
                and get_role(user, note.workspace) not in WRITE_ROLES
            ):
                raise PermissionDenied("Your role can't share notes with the workspace.")
        self._check_relations(note.workspace, serializer.validated_data)
        NoteVersion.objects.create(note=note, title=note.title, content=note.content, edited_by=user)
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_deleted = True  # soft delete
        instance.save()

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        note = self.get_object()
        return Response(NoteVersionSerializer(note.versions.all(), many=True).data)

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        note = self.get_object()  # NoteAccess treats POST as an edit
        version = get_object_or_404(note.versions.all(), id=request.data.get("version_id"))
        NoteVersion.objects.create(note=note, title=note.title, content=note.content, edited_by=request.user)
        note.title = version.title
        note.content = version.content
        note.save()
        return Response(self.get_serializer(note).data)