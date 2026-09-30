from rest_framework import serializers
from .models import StudySession


class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = [
            "id", "workspace", "deck", "cards_reviewed", "cards_correct",
            "started_at", "ended_at",
        ]
        read_only_fields = ["started_at"]