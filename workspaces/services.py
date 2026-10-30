import logging
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import transaction
from analytics.models import Activity
from analytics.services import log_activity
from notifications.models import Notification
from notifications.services import notify
from subscriptions.models import Plan, Subscription
from .models import Workspace, WorkspaceInvitation, WorkspaceMember
from .tasks import send_invitation_email

logger = logging.getLogger(__name__)
Role = WorkspaceMember.Role
ASSIGNABLE_ROLES = (Role.ADMIN, Role.EDITOR, Role.VIEWER)  # OWNER is never handed out


def _clear_stats_cache(workspace):
    cache.delete(f"workspace_stats_{workspace.id}")


@transaction.atomic
def create_workspace(owner, name):
    workspace = Workspace.objects.create(name=name, owner=owner)
    WorkspaceMember.objects.create(workspace=workspace, user=owner, role=Role.OWNER)
    free_plan, _ = Plan.objects.get_or_create(name=Plan.Tier.FREE,defaults={"max_members": 3, "max_notes": 50, "price_per_month": 0})
    Subscription.objects.create(workspace=workspace, plan=free_plan)
    log_activity(workspace, owner, Activity.Action.WORKSPACE_CREATED)
    return workspace


def invite_people(workspace, inviter, emails, role):
    User = get_user_model()
    plan = workspace.subscription.plan
    used = workspace.members.count() + workspace.invitations.count()  # pending invitations hold a seat
    results, seen = [], set()

    for raw in emails:
        email = str(raw).strip().lower()
        if not email or email in seen:
            continue
        seen.add(email)

        try:
            validate_email(email)
        except DjangoValidationError:
            results.append({"email": email, "status": "invalid", "detail": "That isn't a valid email address."})
            continue

        user = User.objects.filter(email__iexact=email).first()
        if user and workspace.members.filter(user=user).exists():
            results.append({"email": email, "status": "already_member", "detail": "Already in this workspace."})
            continue
        if not user and workspace.invitations.filter(email=email).exists():
            results.append({"email": email, "status": "already_invited", "detail": "An invitation is already waiting."})
            continue
        if used >= plan.max_members:
            results.append({
                "email": email, "status": "limit_reached",
                "detail": f"The {plan.name} plan allows {plan.max_members} people, counting pending invitations.",
            })
            continue

        if user:
            WorkspaceMember.objects.create(workspace=workspace, user=user, role=role)
            notify(workspace, user, f"{inviter.email} added you to {workspace.name} as {role}.",type=Notification.Type.MEMBER_INVITED)
            status, detail = "added", "Added to the workspace."
        else:
            WorkspaceInvitation.objects.create(workspace=workspace, email=email, role=role, invited_by=inviter)
            try:
                send_invitation_email.delay(email, workspace.name, inviter.email, role)
            except Exception:  # a down broker must not undo the invitation itself
                logger.warning("Could not queue invitation email for %s", email, exc_info=True)
            status, detail = "invited", "Invitation sent. They join automatically when they register with this email."

        used += 1
        log_activity(workspace, inviter, Activity.Action.MEMBER_INVITED,{"invited_email": email, "role": role, "status": status})
        results.append({"email": email, "status": status, "detail": detail})

    _clear_stats_cache(workspace)
    return results


@transaction.atomic
def accept_pending_invitations(user):
    invitations = list(WorkspaceInvitation.objects.filter(email__iexact=user.email).select_related("workspace"))
    for invitation in invitations:
        WorkspaceMember.objects.get_or_create(workspace=invitation.workspace, user=user, defaults={"role": invitation.role})
        notify(invitation.workspace, user,
            f"You joined {invitation.workspace.name} as {invitation.role}.",
            type=Notification.Type.MEMBER_INVITED,
        )
        _clear_stats_cache(invitation.workspace)
    WorkspaceInvitation.objects.filter(pk__in=[i.pk for i in invitations]).delete()


@transaction.atomic
def remove_member(workspace, member):
    from tasks.services import unassign_user
    user = member.user
    for task in list(user.tasks_assigned.filter(workspace=workspace)):
        unassign_user(task, user)
    member.delete()
    _clear_stats_cache(workspace)