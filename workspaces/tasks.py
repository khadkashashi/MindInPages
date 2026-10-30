from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_invitation_email(email, workspace_name, inviter_email, role):
    send_mail(
        subject=f"{inviter_email} invited you to {workspace_name} on MindInPages",
        message=(
            f'{inviter_email} invited you to join "{workspace_name}" as {role}.\n\n'
            "Create your account with this email address and you'll be added automatically:\n"
            f"{settings.FRONTEND_URL}/register\n"
        ),
        from_email="noreply@mindinpages.local",
        recipient_list=[email],
    )