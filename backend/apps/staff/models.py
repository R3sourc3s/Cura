from django.db import models
from django.conf import settings


class CareHome(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    cqc_registration_number = models.CharField(max_length=50, unique=True)
    bed_count = models.PositiveIntegerField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Shift(models.Model):
    class ShiftType(models.TextChoices):
        DAY = "day", "Day"
        EVENING = "evening", "Evening"
        NIGHT = "night", "Night"

    care_home = models.ForeignKey(CareHome, on_delete=models.CASCADE, related_name="shifts")
    staff_member = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shifts"
    )
    shift_type = models.CharField(max_length=10, choices=ShiftType.choices)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_agency = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):
        return f"{self.staff_member} — {self.date} {self.shift_type}"


class LeaveRequest(models.Model):
    class LeaveType(models.TextChoices):
        ANNUAL = "annual", "Annual Leave"
        SICK = "sick", "Sick Leave"
        TRAINING = "training", "Training"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    staff_member = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_requests"
    )
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    reason = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_leaves"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.staff_member} — {self.leave_type} {self.start_date}–{self.end_date}"


class Training(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        EXPIRED = "expired", "Expired"

    staff_member = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trainings"
    )
    course_name = models.CharField(max_length=200)
    completed_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    certificate_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.staff_member} — {self.course_name}"
