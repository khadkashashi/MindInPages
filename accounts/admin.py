from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ["id", "email", "username", "is_verified", "is_staff"]
    ordering = ["id"]


admin.site.register(User, CustomUserAdmin)