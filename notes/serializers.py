from rest_framework import serializers
from .models import Note, NoteVersion


class NoteVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteVersion
        fields = ["id", "title", "content", "edited_by", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "workspace", "author", "title", "content", "created_at", "updated_at"]
        read_only_fields = ["author", "workspace"]