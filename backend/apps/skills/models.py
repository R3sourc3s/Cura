from django.db import models
from django.conf import settings


class Skill(models.Model):
    class Category(models.TextChoices):
        CLINICAL = "clinical", "Clinical"
        CARE = "care", "Care"
        ADMIN = "admin", "Administrative"
        TECHNICAL = "technical", "Technical"
        LEADERSHIP = "leadership", "Leadership"
        COMMUNICATION = "communication", "Communication"
        OTHER = "other", "Other"

    care_home = models.ForeignKey("staff.CareHome", on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.CARE)
    description = models.TextField(blank=True)
    is_mandatory = models.BooleanField(default=False)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return f"{self.name} ({self.category})"


class StaffSkill(models.Model):
    class Proficiency(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        COMPETENT = "competent", "Competent"
        PROFICIENT = "proficient", "Proficient"
        EXPERT = "expert", "Expert"

    staff_member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="staff_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="staff_skills")
    proficiency = models.CharField(max_length=20, choices=Proficiency.choices, default=Proficiency.COMPETENT)
    certified = models.BooleanField(default=False)
    certification_expiry = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="verified_skills")
    acquired_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["staff_member", "skill"]]
        ordering = ["skill__category", "skill__name"]

    def __str__(self):
        return f"{self.staff_member} — {self.skill.name} ({self.proficiency})"

    @property
    def is_expiring_soon(self):
        if not self.certification_expiry:
            return False
        from django.utils import timezone
        import datetime
        return self.certification_expiry <= (timezone.now().date() + datetime.timedelta(days=30))
