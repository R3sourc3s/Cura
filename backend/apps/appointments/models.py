from django.db import models


class Appointment(models.Model):
    class AppointmentType(models.TextChoices):
        GP = "gp", "GP Visit"
        HOSPITAL = "hospital", "Hospital"
        SPECIALIST = "specialist", "Specialist"
        DENTIST = "dentist", "Dentist"
        OPTICIAN = "optician", "Optician"
        PHYSIO = "physio", "Physiotherapy"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        DNA = "dna", "Did Not Attend"

    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    appointment_type = models.CharField(
        max_length=15,
        choices=AppointmentType.choices,
    )
    provider_name = models.CharField(max_length=200)
    location = models.CharField(max_length=300, blank=True)
    scheduled_at = models.DateTimeField()
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )
    outcome = models.TextField(blank=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(blank=True)
    escort_required = models.BooleanField(default=False)
    transport_arranged = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_appointments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return f"{self.get_appointment_type_display()} — {self.resident} ({self.scheduled_at:%Y-%m-%d})"
