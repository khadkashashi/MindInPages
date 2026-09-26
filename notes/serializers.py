from rest_framework import serializers
from .models import Note, NoteVersion
from tags.serializers import TagSerializer
from tags.models import Tag


class NoteVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteVersion
        fields = ["id", "title", "content", "edited_by", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, write_only=True, required=False, source="tags")

    class Meta:
        model = Note
        fields = ["id", "workspace", "folder", "tags", "tag_ids", "author", "title", "content", "created_at", "updated_at"]
        read_only_fields = ["author", "workspace"]