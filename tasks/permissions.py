from rest_framework import permissions

from workspaces.permissions import WRITE_ROLES, get_role


class TaskAccess(permissions.BasePermission):
    message = "Your role in this workspace can't change this task."

    def has_object_permission(self, request, view, task):
        role = get_role(request.user, task.workspace)
        if role is None:
            return False
        if request.method in permissions.SAFE_METHODS or role in WRITE_ROLES:
            return True
        # an assignee may update (never delete) their own task; the allowed fields are enforced in the view
        return request.method in ("PUT", "PATCH") and task.assigned_to_id == request.user.id