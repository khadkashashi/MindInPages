from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from workspaces.models import Workspace
from .models import StudySession
from .serializers import StudySessionSerializer
from .services import calculate_streak


class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        workspace = get_object_or_404(Workspace, id=self.request.data.get("workspace"), members__user=self.request.user)
        serializer.save(workspace=workspace, user=self.request.user)

    @action(detail=True, methods=["post"])
    def end(self, request, pk=None):
        session = self.get_object()
        session.cards_reviewed = request.data.get("cards_reviewed", session.cards_reviewed)
        session.cards_correct = request.data.get("cards_correct", session.cards_correct)
        session.ended_at = timezone.now()
        session.save()
        return Response(StudySessionSerializer(session).data)

    @action(detail=False, methods=["get"])
    def streak(self, request):
        return Response({"current_streak": calculate_streak(request.user)})