from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from workspaces.models import Workspace
from .models import Deck, Flashcard
from .serializers import DeckSerializer, FlashcardSerializer
from .services import apply_review


class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Deck.objects.filter(workspace__members__user=self.request.user)

    def perform_create(self, serializer):
        workspace = get_object_or_404(Workspace, id=self.request.data.get("workspace"), members__user=self.request.user)
        serializer.save(workspace=workspace, created_by=self.request.user)


class FlashcardViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Flashcard.objects.filter(deck__workspace__members__user=self.request.user)
        deck_id = self.request.query_params.get("deck")
        if deck_id:
            qs = qs.filter(deck_id=deck_id)
        return qs

    def perform_create(self, serializer):
        # isolation: the deck must belong to a workspace this user is in
        deck = serializer.validated_data["deck"]
        if not deck.workspace.members.filter(user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this deck's workspace.")
        serializer.save()

    @action(detail=False, methods=["get"])
    def due(self, request):
        cards = self.get_queryset().filter(next_review__lte=timezone.now()).order_by("next_review")
        return Response(FlashcardSerializer(cards, many=True).data)

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        card = self.get_object()
        try:
            quality = int(request.data.get("quality"))
        except (TypeError, ValueError):
            raise ValidationError({"quality": "Must be an integer from 0 to 5."})
        if not 0 <= quality <= 5:
            raise ValidationError({"quality": "Must be an integer from 0 to 5."})

        card = apply_review(card, quality)
        return Response(FlashcardSerializer(card).data)