from rest_framework import permissions
from .models import WorkspaceMember
from rest_framework import permissions
from .models import WorkspaceMember


WRITE_ROLES = {
    WorkspaceMember.Role.OWNER,
    WorkspaceMember.Role.ADMIN,
    WorkspaceMember.Role.EDITOR,
}


def get_role(user, workspace):
    member = WorkspaceMember.objects.filter(workspace=workspace,user=user).first()
    return member.role if member else None

class IsWorkspaceMember(permissions.BasePermission):
    """Any role can view; only members of the workspace get in at all."""

    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(workspace=obj, user=request.user).exists()


class IsWorkspaceOwnerOrAdmin(permissions.BasePermission):
    """Only OWNER/ADMIN can update workspace settings or manage members."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return WorkspaceMember.objects.filter(workspace=obj, user=request.user).exists()
        return WorkspaceMember.objects.filter(
            workspace=obj,
            user=request.user,
            role__in=[WorkspaceMember.Role.OWNER, WorkspaceMember.Role.ADMIN]).exists()


class IsWorkspaceOwner(permissions.BasePermission):
    """Only OWNER can delete the workspace."""

    def has_object_permission(self, request, view, obj):
        if request.method != "DELETE":
            return True
        return WorkspaceMember.objects.filter(
            workspace=obj, user=request.user, role=WorkspaceMember.Role.OWNER).exists()