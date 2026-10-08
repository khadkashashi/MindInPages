from rest_framework import serializers
from tags.models import Tag
from tags.serializers import TagSerializer
from .access import can_delete_note, can_edit_note
from .models import Note, NoteVersion


class NoteVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteVersion
        fields = ["id", "title", "content", "edited_by", "created_at"]


class NoteSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, write_only=True, required=False, source="tags")
    author_email = serializers.EmailField(source="author.email", read_only=True)
    is_author = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id", "workspace", "folder", "tags", "tag_ids", "visibility",
            "author", "author_email", "is_author", "can_edit", "can_delete",
            "title", "content", "created_at", "updated_at",
        ]
        read_only_fields = ["author", "workspace"]

    def get_is_author(self, obj):
        return obj.author_id == self.context["request"].user.id

    def get_can_edit(self, obj):
        return can_edit_note(self.context["request"].user, obj)

    def get_can_delete(self, obj):
        return can_delete_note(self.context["request"].user, obj)