from rest_framework import serializers
from .models import Deck, Flashcard
from notes.access import visible_notes

class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ["id", "workspace", "name", "description", "created_at"]
        read_only_fields = ["created_at"]
        extra_kwargs = {"workspace": {"required": True}}


class FlashcardSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        deck = attrs.get("deck") or (self.instance.deck if self.instance else None)
        note = attrs.get("note")
        if note and deck and note.workspace_id != deck.workspace_id:
            raise serializers.ValidationError("The note must belong to the same workspace as the deck.")
        if note and not visible_notes(self.context["request"].user).filter(pk=note.pk).exists():
            raise serializers.ValidationError("You can't link a note you can't see.")
        return attrs
    
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