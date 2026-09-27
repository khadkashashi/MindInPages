from rest_framework import serializers
from .models import Goal


class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = [
            "id", "workspace", "title", "description", "status", "progress",
            "target_date", "linked_tasks", "created_by", "created_at", "updated_at",
        ]
        read_only_fields = ["workspace", "created_by"]