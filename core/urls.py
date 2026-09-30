from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/workspaces/", include("workspaces.urls")),
    path("api/v1/subscriptions/", include("subscriptions.urls")),
    path("api/v1/activities/", include("analytics.urls")),
    path("api/v1/notes/", include("notes.urls")),
    path("api/v1/folders/", include("folders.urls")),
    path("api/v1/tags/", include("tags.urls")),
    path("api/v1/tasks/", include("tasks.urls")),
    path("api/v1/goals/", include("goals.urls")),
    path("api/v1/reminders/", include("reminders.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/search/", include("search.urls")),
    path("api/v1/flashcards/", include("flashcards.urls")),
    path("api/v1/attachments/", include("attachments.urls")),
]

# Append static media serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)