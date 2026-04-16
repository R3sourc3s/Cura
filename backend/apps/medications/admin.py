from django.contrib import admin
from .models import Medication, MAREntry


class MAREntryInline(admin.TabularInline):
    model = MAREntry
    extra = 0
    readonly_fields = ["administered_at", "administered_by"]


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ["resident", "drug_name", "dose", "frequency", "is_controlled", "is_low_stock", "is_active"]
    list_filter = ["is_controlled", "is_active", "route", "frequency"]
    search_fields = ["drug_name", "resident__first_name", "resident__last_name"]
    inlines = [MAREntryInline]


@admin.register(MAREntry)
class MAREntryAdmin(admin.ModelAdmin):
    list_display = ["medication", "scheduled_at", "status", "administered_by"]
    list_filter = ["status"]
