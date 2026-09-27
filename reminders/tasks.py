from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from .models import Reminder


@shared_task
def send_due_reminders():
    due = Reminder.objects.filter(remind_at__lte=timezone.now(), is_sent=False)
    count = 0
    for reminder in due:
        send_mail(
            subject="Reminder from MindInPages",
            message=reminder.message,
            from_email="noreply@mindinpages.local",
            recipient_list=[reminder.user.email],
        )
        reminder.is_sent = True
        reminder.save()
        count += 1
    return f"Sent {count} reminder(s)"