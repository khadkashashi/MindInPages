from datetime import timedelta
from django.utils import timezone


def apply_review(card, quality):
    if quality < 3:
        # failed: start over, see it again tomorrow
        card.repetitions = 0
        card.interval_days = 1
    else:
        if card.repetitions == 0:
            card.interval_days = 1
        elif card.repetitions == 1:
            card.interval_days = 6
        else:
            card.interval_days = round(card.interval_days * card.ease_factor)
        card.repetitions += 1

    card.ease_factor = max(
        1.3,
        card.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    )
    card.last_reviewed = timezone.now()
    card.next_review = timezone.now() + timedelta(days=card.interval_days)
    card.save()
    return card