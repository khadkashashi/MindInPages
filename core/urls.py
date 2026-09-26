from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/workspaces/", include("workspaces.urls")),
    path("api/v1/subscriptions/", include("subscriptions.urls")),
    path("api/v1/activities/", include("analytics.urls")),
    path("api/v1/notes/", include("notes.urls")),
]