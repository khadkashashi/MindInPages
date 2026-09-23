from django.db import models
from workspaces.models import Workspace


class Plan(models.Model):
    class Tier(models.TextChoices):
        FREE = "FREE", "Free"
        PRO = "PRO", "Pro"

    name = models.CharField(max_length=10, choices=Tier.choices, unique=True)
    max_members = models.PositiveIntegerField(default=3)
    max_notes = models.PositiveIntegerField(default=50)
    price_per_month = models.DecimalField(max_digits=6, decimal_places=2, default=0)

    def __str__(self):
        return self.name


class Subscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE =  "Active"
        CANCELLED =  "Cancelled"
        EXPIRED =  "Expired"

    workspace = models.OneToOneField(Workspace, on_delete=models.CASCADE, related_name="subscription")
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    started_at = models.DateTimeField(auto_now_add=True)
    renews_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.workspace} - {self.plan} ({self.status})"