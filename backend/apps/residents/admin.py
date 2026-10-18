from django.contrib import admin
from .models import Resident, Condition, Allergy


class ConditionInline(admin.TabularInline):
    model = Condition
    extra = 0


class AllergyInline(admin.TabularInline):
    model = Allergy
    extra = 0
    readonly_fields = ["recorded_by", "created_at"]


@admin.register(Resident)
class ResidentAdmin(admin.ModelAdmin):
    list_display = ["full_name", "room_number", "age", "fall_risk", "ai_risk_score", "is_active"]
    list_filter = ["care_home", "fall_risk", "is_active"]
    search_fields = ["first_name", "last_name", "nhs_number"]
    inlines = [AllergyInline, ConditionInline]
    readonly_fields = ["ai_risk_score", "created_at", "updated_at"]
