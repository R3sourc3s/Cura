from django.db import models
from django.conf import settings


class StaffMessage(models.Model):
    class Channel(models.TextChoices):
        GENERAL = "general", "General"
        HANDOVER = "handover", "Handover"
        CLINICAL = "clinical", "Clinical"
        MANAGEMENT = "management", "Management"
        URGENT = "urgent", "Urgent"

    care_home = models.ForeignKey(
        "staff.CareHome",
        on_delete=models.CASCADE,
        related_name="staff_messages",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="staff_messages",
    )
    channel = models.CharField(
        max_length=20,
        choices=Channel.choices,
        default=Channel.GENERAL,
    )
    content = models.TextField()
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        db_table = "messages_board_staffmessage"

    def __str__(self):
        return f"[{self.channel}] {self.author} – {self.content[:50]}"
