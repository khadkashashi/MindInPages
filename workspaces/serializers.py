from rest_framework import serializers
from .models import Workspace, WorkspaceMember

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ["id", "user", "email", "role", "joined_at"]
        read_only_fields = ["user", "joined_at"]


class WorkspaceSerializer(serializers.ModelSerializer):
    members = WorkspaceMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ["id", "name", "owner", "created_at", "members"]
        read_only_fields = ["owner"]