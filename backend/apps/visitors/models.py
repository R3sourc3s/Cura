from django.db import models


class VisitorLog(models.Model):
    resident = models.ForeignKey(
        "residents.Resident", on_delete=models.CASCADE, related_name="visitor_logs"
    )
    visitor_name = models.CharField(max_length=200)
    relationship = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    signed_in = models.DateTimeField()
    signed_out = models.DateTimeField(null=True, blank=True)
    purpose = models.CharField(max_length=200, blank=True)
    health_screening_passed = models.BooleanField(default=True)
    screening_notes = models.TextField(blank=True)
    logged_by = models.ForeignKey(
        "authentication.User", on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-signed_in"]

    @property
    def is_signed_out(self):
        return bool(self.signed_out)

    def __str__(self):
        return f"{self.visitor_name} visiting {self.resident} @ {self.signed_in:%Y-%m-%d %H:%M}"
