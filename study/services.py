from django.utils import timezone


def calculate_streak(user):
    dates = (
        user.study_sessions
        .exclude(ended_at__isnull=True)
        .order_by("-started_at")
        .values_list("started_at__date", flat=True)
        .distinct()
    )
    dates = list(dates)
    if not dates:
        return 0

    today = timezone.now().date()
    if dates[0] not in (today, today - timezone.timedelta(days=1)):
        return 0  # streak broken, last session wasn't today or yesterday

    streak = 1
    for i in range(len(dates) - 1):
        if (dates[i] - dates[i + 1]).days == 1:
            streak += 1
        else:
            break
    return streak