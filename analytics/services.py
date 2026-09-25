from .models import Activity

def log_activity(workspace, user, action, metadata=None):
    Activity.objects.create(workspace=workspace, user=user, action=action, metadata=metadata or {})