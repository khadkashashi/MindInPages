from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id", "workspace", "title", "description", "status", "priority",
            "assigned_to", "created_by", "due_date", "completed_at",
            "created_at", "updated_at",
        ]
        read_only_fields = ["workspace", "created_by", "completed_at"]