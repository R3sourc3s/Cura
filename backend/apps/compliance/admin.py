from django.contrib import admin
from .models import ComplianceAudit, AuditAction, Policy, Accreditation


class ActionInline(admin.TabularInline):
    model = AuditAction
    extra = 0


@admin.register(ComplianceAudit)
class ComplianceAuditAdmin(admin.ModelAdmin):
    list_display = ["care_home", "domain", "score", "rating", "audit_date"]
    list_filter = ["domain", "rating", "care_home"]
    inlines = [ActionInline]


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ["title", "version", "review_date", "care_home"]


@admin.register(Accreditation)
class AccreditationAdmin(admin.ModelAdmin):
    list_display = ["name", "care_home", "category", "status", "valid_until"]
    list_filter = ["category", "status", "care_home"]
