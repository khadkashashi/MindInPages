from django.contrib.auth import get_user_model
from rest_framework import serializers
from workspaces.permissions import WRITE_ROLES, get_role
from .models import Task

User = get_user_model()
class TaskSerializer(serializers.ModelSerializer):
    assignees = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    assignee_details = serializers.SerializerMethodField()
    can_change_status = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [ "id", "workspace", "title", "description", "status", "priority", "assignees", "assignee_details", "created_by", "due_date", "completed_at","created_at", "updated_at", "can_change_status", "can_delete"]
        read_only_fields = ["workspace", "created_by", "completed_at"]

    def get_assignee_details(self, obj):
        return [{"id": u.id, "email": u.email, "username": u.username} for u in obj.assignees.all()]

    def get_can_change_status(self, obj):
        user = self.context["request"].user
        if get_role(user, obj.workspace) in WRITE_ROLES:
            return True
        return any(a.id == user.id for a in obj.assignees.all())

    def get_can_delete(self, obj):
        return get_role(self.context["request"].user, obj.workspace) in WRITE_ROLES