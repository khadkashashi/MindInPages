from rest_framework import serializers
from .models import Deck, Flashcard


class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ["id", "workspace", "name", "description", "created_at"]
        read_only_fields = ["created_at"]
        extra_kwargs = {"workspace": {"required": True}}


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            "id", "deck", "note", "front", "back",
            "ease_factor", "interval_days", "repetitions",
            "next_review", "last_reviewed", "created_at",
        ]
        read_only_fields = [
            "ease_factor", "interval_days", "repetitions",
            "next_review", "last_reviewed",
        ]