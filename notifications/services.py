from .models import Notification


def notify(workspace, user, message, type=Notification.Type.GENERAL):
    Notification.objects.create(workspace=workspace, user=user, message=message, type=type)