from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from flashcards.models import Deck, Flashcard
from goals.models import Goal
from notes.models import Note
from subscriptions.models import Plan, Subscription
from tasks.models import Task
from workspaces.models import Workspace, WorkspaceMember

PASSWORD = "demo12345"  # local demo accounts only, never use this on a deployed site


class Command(BaseCommand):
    help = "Create a demo classroom: teacher, student, notes, deck, tasks and a goal. Safe to run twice."

    def _user(self, email, username):
        user, created = get_user_model().objects.get_or_create(
            email=email, defaults={"username": username}
        )
        if created:
            user.set_password(PASSWORD)
            user.save()
        return user

    @transaction.atomic
    def handle(self, *args, **options):
        teacher = self._user("teacher@example.com", "teacher")
        student = self._user("student@example.com", "student")

        workspace, created = Workspace.objects.get_or_create(name="Class Room 10", owner=teacher)
        if not created:
            self.stdout.write("Demo data already exists, nothing to do.")
            return

        WorkspaceMember.objects.create(workspace=workspace, user=teacher, role=WorkspaceMember.Role.OWNER)
        WorkspaceMember.objects.create(workspace=workspace, user=student, role=WorkspaceMember.Role.VIEWER)
        plan, _ = Plan.objects.get_or_create(
            name=Plan.Tier.FREE,
            defaults={"max_members": 3, "max_notes": 50, "price_per_month": 0},
        )
        Subscription.objects.create(workspace=workspace, plan=plan)

        syllabus = Note.objects.create(
            workspace=workspace, author=teacher, title="Class syllabus",
            content=(
                "Subject: Database Management System\n\nTopics:\n- Introduction to databases\n"
                "- SQL\n- PostgreSQL\n- Normalization\n- Transactions\n- Indexing"
            ),
            visibility=Note.Visibility.SHARED,
        )
        Note.objects.create(
            workspace=workspace, author=teacher, title="My diary",
            content="Private thoughts. Only the teacher can read this. zebra",
            visibility=Note.Visibility.PRIVATE,
        )

        deck = Deck.objects.create(
            workspace=workspace, name="Database Basics",
            description="Core ideas from the syllabus", created_by=teacher,
        )
        for front, back in [
            ("What is a primary key?", "A column (or set of columns) that uniquely identifies each row."),
            ("What does SQL stand for?", "Structured Query Language."),
            ("What is normalization?", "Organising tables to reduce duplicated data."),
        ]:
            Flashcard.objects.create(deck=deck, note=syllabus, front=front, back=back)

        t1 = Task.objects.create(
            workspace=workspace, created_by=teacher, assigned_to=student,
            title="Assignment 1: draw an ER diagram", priority=Task.Priority.HIGH,
            due_date=timezone.now() + timedelta(days=7),
        )
        t2 = Task.objects.create(
            workspace=workspace, created_by=teacher, assigned_to=student,
            title="Read the SQL chapter", priority=Task.Priority.MEDIUM,
            due_date=timezone.now() + timedelta(days=3),
        )
        goal = Goal.objects.create(
            workspace=workspace, created_by=teacher, title="Finish the DBMS module",
            target_date=(timezone.now() + timedelta(days=30)).date(),
        )
        goal.linked_tasks.set([t1, t2])

        self.stdout.write(self.style.SUCCESS("Demo data created."))
        self.stdout.write(f"  teacher@example.com / {PASSWORD}  (OWNER)")
        self.stdout.write(f"  student@example.com / {PASSWORD}  (VIEWER)")