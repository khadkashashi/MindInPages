from rest_framework import serializers
from workspaces.permissions import WRITE_ROLES, get_role
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)
    can_change_status = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "workspace", "title", "description", "status", "priority",
            "assigned_to", "assigned_to_email", "created_by", "due_date", "completed_at",
            "created_at", "updated_at", "can_change_status", "can_delete",
        ]
        read_only_fields = ["workspace", "created_by", "completed_at"]

    def get_can_change_status(self, obj):
        user = self.context["request"].user
        return get_role(user, obj.workspace) in WRITE_ROLES or obj.assigned_to_id == user.id

    def get_can_delete(self, obj):
        return get_role(self.context["request"].user, obj.workspace) in WRITE_ROLES