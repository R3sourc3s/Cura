from django.contrib import admin
from .models import ComplianceAudit, AuditAction, Policy


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
