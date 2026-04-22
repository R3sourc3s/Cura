from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "role", "care_home"]
    list_filter = ["role", "care_home", "is_active"]
    fieldsets = UserAdmin.fieldsets + (
        ("Cura", {"fields": ("role", "care_home", "phone", "avatar")}),
    )
