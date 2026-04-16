from django.contrib import admin
from .models import CarePlan, CarePlanSection, CarePlanNote


class SectionInline(admin.StackedInline):
    model = CarePlanSection
    extra = 0


class NoteInline(admin.TabularInline):
    model = CarePlanNote
    extra = 0
    readonly_fields = ["author", "created_at"]


@admin.register(CarePlan)
class CarePlanAdmin(admin.ModelAdmin):
    list_display = ["resident", "version", "status", "ai_generated", "next_review_date", "updated_at"]
    list_filter = ["status", "ai_generated"]
    inlines = [SectionInline, NoteInline]
    readonly_fields = ["version", "created_at", "updated_at"]
