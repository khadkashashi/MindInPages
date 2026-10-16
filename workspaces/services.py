from django.db import transaction

from analytics.models import Activity
from analytics.services import log_activity
from subscriptions.models import Plan, Subscription
from .models import Workspace, WorkspaceMember


@transaction.atomic
def create_workspace(owner, name):
    """Workspace + owner membership + FREE subscription + activity entry, all or nothing."""
    workspace = Workspace.objects.create(name=name, owner=owner)
    WorkspaceMember.objects.create(workspace=workspace, user=owner, role=WorkspaceMember.Role.OWNER)
    free_plan, _ = Plan.objects.get_or_create(name=Plan.Tier.FREE,defaults={"max_members": 3, "max_notes": 50, "price_per_month": 0})
    Subscription.objects.create(workspace=workspace, plan=free_plan)
    log_activity(workspace, owner, Activity.Action.WORKSPACE_CREATED)
    return workspace