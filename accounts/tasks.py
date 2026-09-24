from celery import shared_task
from django.core.mail import send_mail


@shared_task
def send_welcome_email(user_email, username):
    send_mail(
        subject="Welcome to MindInPages",
        message=f"Hi {username}, thanks for signing up!",
        from_email="noreply@mindinpages.local",
        recipient_list=[user_email],
    )
    return f"Welcome email sent to {user_email}"