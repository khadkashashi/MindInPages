from rest_framework import serializers
from .models import Folder


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ["id", "workspace", "parent", "name", "created_at"]
        read_only_fields = ["workspace", "created_by"]