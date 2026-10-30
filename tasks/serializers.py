from django.contrib.auth import get_user_model
from rest_framework import serializers
from workspaces.permissions import WRITE_ROLES, get_role
from .models import Task

User = get_user_model()
class TaskSerializer(serializers.ModelSerializer):
    assignees = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False)
    assignee_details = serializers.SerializerMethodField()
    my_status = serializers.SerializerMethodField()
    progress_summary = serializers.SerializerMethodField()
    can_change_status = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "workspace", "title", "description", "status", "priority", "completion_mode",
            "assignees", "assignee_details", "my_status", "progress_summary",
            "created_by", "due_date", "completed_at", "created_at", "updated_at",
            "can_change_status", "can_delete",
        ]
        read_only_fields = ["workspace", "created_by", "status", "completed_at"]

    def _statuses(self, obj):
        if obj.completion_mode == Task.CompletionMode.INDIVIDUAL:
            own = {p.user_id: p.status for p in obj.progress.all()}
            return {a.id: own.get(a.id, Task.Status.TODO) for a in obj.assignees.all()}
        return {a.id: obj.status for a in obj.assignees.all()}

    def get_assignee_details(self, obj):
        me = self.context["request"].user.id
        statuses = self._statuses(obj)
        return [{
                "id": a.id, "email": a.email, "username": a.username,
                "status": statuses[a.id], "is_me": a.id == me,
            }
            for a in obj.assignees.all()
        ]

    def get_my_status(self, obj):
        statuses = self._statuses(obj)
        me = self.context["request"].user.id
        if me in statuses:
            return statuses[me]
        return obj.status if obj.completion_mode == Task.CompletionMode.SHARED else None

    def get_progress_summary(self, obj):
        if obj.completion_mode != Task.CompletionMode.INDIVIDUAL:
            return None
        statuses = self._statuses(obj)
        if not statuses:
            return None
        return {"done": sum(s == Task.Status.DONE for s in statuses.values()), "total": len(statuses)}

    def get_can_change_status(self, obj):
        user = self.context["request"].user
        if get_role(user, obj.workspace) in WRITE_ROLES:
            return True
        return any(a.id == user.id for a in obj.assignees.all())

    def get_can_delete(self, obj):
        return get_role(self.context["request"].user, obj.workspace) in WRITE_ROLES