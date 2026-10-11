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
    my_role = serializers.SerializerMethodField()  # <-- Yo line add garnus

    class Meta:
        model = Workspace
        fields = ["id", "name", "owner", "created_at", "members", "my_role"] # <-- "my_role" yeta pani rakhnus
        read_only_fields = ["owner"]

    def get_my_role(self, obj):
        # Yeta request bata logged-in user ko role k ho herne logic huncha
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            member = obj.members.filter(user=request.user).first()
            return member.role if member else None
        return None