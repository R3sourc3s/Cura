from django.contrib import admin
from .models import ChatSession, ChatMessage


class MessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ["role", "content", "created_at"]


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ["user", "resident", "created_at"]
    inlines = [MessageInline]
