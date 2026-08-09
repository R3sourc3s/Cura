from django.contrib import admin
from .models import APIKey, WebhookSubscription, WebhookDelivery


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ["name", "care_home", "prefix", "scope", "is_active", "last_used_at", "created_at"]
    list_filter = ["scope", "is_active", "care_home"]


class WebhookDeliveryInline(admin.TabularInline):
    model = WebhookDelivery
    extra = 0
    readonly_fields = ["event_type", "status_code", "success", "error", "delivered_at"]


@admin.register(WebhookSubscription)
class WebhookSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["name", "target_url", "care_home", "is_active", "created_at"]
    list_filter = ["is_active", "care_home"]
    inlines = [WebhookDeliveryInline]
