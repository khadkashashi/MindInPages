from rest_framework import serializers
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ["id", "workspace", "note", "task", "message", "remind_at", "is_sent", "created_at"]
        read_only_fields = ["workspace", "user", "is_sent"]