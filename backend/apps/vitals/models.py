from django.db import models


class VitalSign(models.Model):
    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="vitals")
    recorded_by = models.ForeignKey("authentication.User", on_delete=models.SET_NULL, null=True)
    recorded_at = models.DateTimeField()

    bp_systolic = models.PositiveSmallIntegerField(null=True, blank=True, help_text="mmHg")
    bp_diastolic = models.PositiveSmallIntegerField(null=True, blank=True, help_text="mmHg")
    pulse = models.PositiveSmallIntegerField(null=True, blank=True, help_text="bpm")
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="°C")
    oxygen_saturation = models.PositiveSmallIntegerField(null=True, blank=True, help_text="%")
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True, help_text="kg")
    blood_glucose = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True, help_text="mmol/L")

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.resident} vitals @ {self.recorded_at:%Y-%m-%d %H:%M}"
