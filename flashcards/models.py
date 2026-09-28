from django.conf import settings
from django.db import models
from django.utils import timezone
from workspaces.models import Workspace
from notes.models import Note


class Deck(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="decks")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Flashcard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="cards")
    note = models.ForeignKey(Note, on_delete=models.SET_NULL, null=True, blank=True, related_name="flashcards")
    front = models.TextField()
    back = models.TextField()

    # spaced repetition state (SM-2)
    ease_factor = models.FloatField(default=2.5)
    interval_days = models.PositiveIntegerField(default=0)
    repetitions = models.PositiveIntegerField(default=0)
    next_review = models.DateTimeField(default=timezone.now)
    last_reviewed = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.front[:50]