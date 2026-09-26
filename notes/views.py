from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Note, NoteVersion
from .serializers import NoteSerializer, NoteVersionSerializer
from workspaces.models import Workspace, WorkspaceMember
from analytics.services import log_activity
from analytics.models import Activity


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # isolation: only notes in workspaces this user belongs to
        return Note.objects.filter(workspace__members__user=self.request.user, is_deleted=False)

    def perform_create(self, serializer):
        workspace_id = self.request.data.get("workspace")
        workspace = Workspace.objects.get(id=workspace_id, members__user=self.request.user)
        note = serializer.save(workspace=workspace, author=self.request.user)
        log_activity(workspace, self.request.user, Activity.Action.NOTE_CREATED, {"note_id": note.id, "title": note.title})

    def perform_update(self, serializer):
        note = self.get_object()
        # save a version snapshot BEFORE applying the update
        NoteVersion.objects.create(note=note, title=note.title, content=note.content, edited_by=self.request.user)
        serializer.save()

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        note = self.get_object()
        versions = note.versions.all()
        return Response(NoteVersionSerializer(versions, many=True).data)

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        note = self.get_object()
        version_id = request.data.get("version_id")
        version = note.versions.get(id=version_id)
        # snapshot current state before restoring, so nothing is lost
        NoteVersion.objects.create(note=note, title=note.title, content=note.content, edited_by=request.user)
        note.title = version.title
        note.content = version.content
        note.save()
        return Response(NoteSerializer(note).data)