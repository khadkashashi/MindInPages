from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from .models import WorkspaceMember

WRITE_ROLES = {
    WorkspaceMember.Role.OWNER,
    WorkspaceMember.Role.ADMIN,
    WorkspaceMember.Role.EDITOR,
}

def get_role(user, workspace):
    if not user or not user.is_authenticated:
        return None
    member = WorkspaceMember.objects.filter(workspace=workspace, user=user).first()
    return member.role if member else None

def ensure_can_write(user, workspace):
    role = get_role(user, workspace)
    if role not in WRITE_ROLES:
        raise PermissionDenied("Your role in this workspace is read-only.")

class IsEditorOrReadOnly(permissions.BasePermission):
    """Allows read-only access for any member, but write access only for OWNER, ADMIN, or EDITOR."""
    message = "Your role in this workspace can't make changes."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        workspace = view.workspace_of(obj) if hasattr(view, "workspace_of") else getattr(obj, "workspace", None)
        if not workspace:
            return False
        
        role = get_role(request.user, workspace)
        if request.method in permissions.SAFE_METHODS:
            return role is not None
        return role in WRITE_ROLES


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