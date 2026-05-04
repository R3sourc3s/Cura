from django.contrib import admin
from .models import StaffMessage


@admin.register(StaffMessage)
class StaffMessageAdmin(admin.ModelAdmin):
    list_display = ["id", "channel", "author", "care_home", "is_pinned", "created_at"]
    list_filter = ["channel", "is_pinned", "care_home"]
    search_fields = ["content", "author__username", "author__first_name", "author__last_name"]
    ordering = ["-created_at"]
