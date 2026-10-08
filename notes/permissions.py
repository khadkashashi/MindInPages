from rest_framework import permissions
from .access import can_delete_note, can_edit_note


class NoteAccess(permissions.BasePermission):
    message = "You don't have permission to change this note."

    def has_object_permission(self, request, view, note):
        if request.method in permissions.SAFE_METHODS:
            return True  # the queryset already hides notes the user can't read
        if request.method == "DELETE":
            return can_delete_note(request.user, note)
        return can_edit_note(request.user, note)