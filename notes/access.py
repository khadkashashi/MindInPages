from django.db.models import Q
from workspaces.models import WorkspaceMember
from workspaces.permissions import WRITE_ROLES, get_role
from .models import Note


def visible_notes(user):
    return Note.objects.filter(Q(author=user) | Q(visibility=Note.Visibility.SHARED),workspace__members__user=user,is_deleted=False)


def can_create_note(user, workspace, visibility):
    role = get_role(user, workspace)
    if role is None:
        return False
    if visibility == Note.Visibility.PRIVATE:
        return True
    return role in WRITE_ROLES


def can_edit_note(user, note):
    role = get_role(user, note.workspace)
    if role is None:
        return False
    if note.visibility == Note.Visibility.PRIVATE:
        return note.author_id == user.id
    return role in WRITE_ROLES


def can_delete_note(user, note):
    role = get_role(user, note.workspace)
    if role is None:
        return False
    if note.visibility == Note.Visibility.PRIVATE:
        return note.author_id == user.id
    if role in (WorkspaceMember.Role.OWNER, WorkspaceMember.Role.ADMIN):
        return True
    return note.author_id == user.id and role in WRITE_ROLES