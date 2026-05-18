from django.db import models
from django.conf import settings


class LeaveType(models.Model):
    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="leave_types")
    name = models.CharField(max_length=100)
    days_entitlement = models.PositiveIntegerField(default=28)
    color = models.CharField(max_length=7, default="#7c3aed")

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class LeaveRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        DECLINED = "declined", "Declined"
        CANCELLED = "cancelled", "Cancelled"

    staff_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_module_requests")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT, related_name="requests")
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.PositiveIntegerField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_leave_requests")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.staff_member} — {self.leave_type} {self.start_date} to {self.end_date}"


class LeaveBalance(models.Model):
    staff_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_balances")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE, related_name="balances")
    year = models.PositiveIntegerField()
    entitlement = models.PositiveIntegerField(default=0)
    used = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [["staff_member", "leave_type", "year"]]
        ordering = ["-year"]

    def __str__(self):
        return f"{self.staff_member} — {self.leave_type} {self.year}"

    @property
    def remaining(self):
        return self.entitlement - self.used
