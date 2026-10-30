from rest_framework import serializers
from .models import Workspace, WorkspaceInvitation, WorkspaceMember


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    is_me = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceMember
        fields = ["id", "user", "email", "username", "role", "is_me", "joined_at"]
        read_only_fields = ["user", "joined_at"]

    def get_is_me(self, obj):
        request = self.context.get("request")
        return bool(request and obj.user_id == request.user.id)


class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceInvitation
        fields = ["id", "email", "role", "created_at"]


class WorkspaceSerializer(serializers.ModelSerializer):
    members = WorkspaceMemberSerializer(many=True, read_only=True)
    my_role = serializers.SerializerMethodField()
    pending_invitations = serializers.SerializerMethodField()
    seat_limit = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = [
            "id", "name", "owner", "created_at", "members", "my_role",
            "pending_invitations", "seat_limit",
        ]
        read_only_fields = ["owner"]

    def get_my_role(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        member = obj.members.filter(user=request.user).first()
        return member.role if member else None

    def get_pending_invitations(self, obj):
        # only people who can manage members get to see who is still pending
        if self.get_my_role(obj) not in (WorkspaceMember.Role.OWNER, WorkspaceMember.Role.ADMIN):
            return []
        return InvitationSerializer(obj.invitations.all(), many=True).data

    def get_seat_limit(self, obj):
        subscription = getattr(obj, "subscription", None)
        return subscription.plan.max_members if subscription else None