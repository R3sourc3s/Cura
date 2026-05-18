from django.db import models
from django.conf import settings
import decimal


class FundingSource(models.Model):
    class FundingType(models.TextChoices):
        SELF_FUNDED = "self_funded", "Self-Funded"
        LOCAL_AUTHORITY = "local_authority", "Local Authority"
        NHS = "nhs", "NHS Continuing Healthcare"
        MIXED = "mixed", "Mixed"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="funding_sources")
    funding_type = models.CharField(max_length=20, choices=FundingType.choices)
    funder_name = models.CharField(max_length=200, blank=True)
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.resident} — {self.funding_type} ({self.funder_name})"


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        PAID = "paid", "Paid"
        OVERDUE = "overdue", "Overdue"
        CANCELLED = "cancelled", "Cancelled"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="invoices")
    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=50, unique=True)
    period_start = models.DateField()
    period_end = models.DateField()
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issue_date"]

    def __str__(self):
        return f"INV-{self.invoice_number} — {self.resident} ({self.status})"


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=300)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} x{self.quantity}"


class Payment(models.Model):
    class Method(models.TextChoices):
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        CHEQUE = "cheque", "Cheque"
        DIRECT_DEBIT = "direct_debit", "Direct Debit"
        CASH = "cash", "Cash"
        OTHER = "other", "Other"

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=Method.choices)
    payment_date = models.DateField()
    reference = models.CharField(max_length=200, blank=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self):
        return f"Payment {self.amount} for {self.invoice}"
