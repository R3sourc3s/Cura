from django.db import models


class Incident(models.Model):
    class IncidentType(models.TextChoices):
        FALL = "fall", "Fall"
        MEDICATION_ERROR = "medication_error", "Medication Error"
        NEAR_MISS = "near_miss", "Near Miss"
        BEHAVIOUR = "behaviour", "Behaviour Incident"
        INJURY = "injury", "Injury"
        OTHER = "other", "Other"

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        UNDER_REVIEW = "under_review", "Under Review"
        CLOSED = "closed", "Closed"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="incidents")
    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="incidents", null=True, blank=True)
    reported_by = models.ForeignKey("authentication.User", on_delete=models.SET_NULL, null=True, related_name="reported_incidents")

    incident_type = models.CharField(max_length=20, choices=IncidentType.choices)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.LOW)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)

    incident_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    immediate_action = models.TextField(blank=True)
    injury_sustained = models.BooleanField(default=False)
    injury_description = models.TextField(blank=True)
    witnesses = models.TextField(blank=True)

    reported_to_gp = models.BooleanField(default=False)
    reported_to_family = models.BooleanField(default=False)
    reported_to_cqc = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-incident_date"]

    def __str__(self):
        return f"{self.get_incident_type_display()} — {self.incident_date:%Y-%m-%d}"


class IncidentFollowUp(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name="follow_ups")
    note = models.TextField()
    actioned_by = models.ForeignKey("authentication.User", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
