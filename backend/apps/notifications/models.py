from django.db import models


class Notification(models.Model):
    class NotifType(models.TextChoices):
        INCIDENT = "incident", "Incident"
        LEAVE = "leave", "Leave Request"
        STOCK = "stock", "Low Stock"
        HANDOVER = "handover", "Handover"
        GENERAL = "general", "General"

    user = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="notifications")
    notif_type = models.CharField(max_length=20, choices=NotifType.choices, default=NotifType.GENERAL)
    message = models.CharField(max_length=300)
    link = models.CharField(max_length=200, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} — {self.message[:50]}"
