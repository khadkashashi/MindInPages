from django.conf import settings
from django.db import models
from workspaces.models import Workspace
from flashcards.models import Deck


class StudySession(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="study_sessions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="study_sessions")
    deck = models.ForeignKey(Deck, on_delete=models.SET_NULL, null=True, blank=True, related_name="study_sessions")
    cards_reviewed = models.PositiveIntegerField(default=0)
    cards_correct = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} studied {self.deck} on {self.started_at.date()}"