from datetime import date

from django.db import models


class Document(models.Model):
    class Category(models.TextChoices):
        POLICY = "policy", "Policy"
        PROCEDURE = "procedure", "Procedure"
        CERTIFICATE = "certificate", "Certificate"
        DBS = "dbs", "DBS Check"
        CONTRACT = "contract", "Contract"
        RESIDENT = "resident", "Resident Document"
        RISK_ASSESSMENT = "risk_assessment", "Risk Assessment"
        OTHER = "other", "Other"

    care_home = models.ForeignKey(
        "staff.CareHome",
        on_delete=models.CASCADE,
        related_name="documents",
    )
    resident = models.ForeignKey(
        "residents.Resident",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    staff_member = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_documents",
    )
    uploaded_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_documents",
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    title = models.CharField(max_length=300)
    file = models.FileField(upload_to="documents/%Y/%m/")
    file_size = models.PositiveIntegerField(default=0)
    file_type = models.CharField(max_length=50, blank=True)
    version = models.CharField(max_length=20, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

    @property
    def is_expired(self):
        return bool(self.expiry_date and self.expiry_date < date.today())
