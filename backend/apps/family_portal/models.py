from django.db import models
from django.conf import settings


class FamilyMember(models.Model):
    class Relationship(models.TextChoices):
        SPOUSE = "spouse", "Spouse/Partner"
        CHILD = "child", "Child"
        SIBLING = "sibling", "Sibling"
        PARENT = "parent", "Parent"
        GRANDCHILD = "grandchild", "Grandchild"
        FRIEND = "friend", "Friend"
        LEGAL_GUARDIAN = "legal_guardian", "Legal Guardian"
        OTHER = "other", "Other"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="family_members")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=20, choices=Relationship.choices)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    is_primary_contact = models.BooleanField(default=False)
    is_emergency_contact = models.BooleanField(default=False)
    has_lasting_power_of_attorney = models.BooleanField(default=False)
    portal_access = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary_contact", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.relationship}) — {self.resident}"


class FamilyMessage(models.Model):
    class Direction(models.TextChoices):
        INBOUND = "inbound", "Family to Home"
        OUTBOUND = "outbound", "Home to Family"

    class Status(models.TextChoices):
        UNREAD = "unread", "Unread"
        READ = "read", "Read"
        REPLIED = "replied", "Replied"
        ARCHIVED = "archived", "Archived"

    resident = models.ForeignKey("residents.Resident", on_delete=models.CASCADE, related_name="family_messages")
    family_member = models.ForeignKey(FamilyMember, on_delete=models.SET_NULL, null=True, blank=True)
    direction = models.CharField(max_length=10, choices=Direction.choices)
    subject = models.CharField(max_length=300)
    body = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD)
    sent_by_staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"{self.direction} — {self.subject}"
