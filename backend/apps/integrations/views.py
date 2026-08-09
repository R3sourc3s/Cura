from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.authentication.permissions import require
from .models import APIKey, WebhookSubscription
from .serializers import APIKeySerializer, WebhookSubscriptionSerializer


class APIKeyViewSet(viewsets.ModelViewSet):
    serializer_class = APIKeySerializer
    http_method_names = ["get", "post", "delete", "head", "options"]  # keys are immutable once created

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("integrations.view")]
        return [require("integrations.manage")]

    def get_queryset(self):
        return APIKey.objects.filter(care_home=self.request.user.care_home)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        raw_key, prefix, key_hash = APIKey.generate()
        instance = serializer.save(
            care_home=request.user.care_home,
            created_by=request.user,
            prefix=prefix,
            key_hash=key_hash,
        )
        data = self.get_serializer(instance).data
        data["raw_key"] = raw_key  # shown exactly once — the client must store this now
        return Response(data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        from django.utils import timezone
        instance = self.get_object()
        instance.is_active = False
        instance.revoked_at = timezone.now()
        instance.save(update_fields=["is_active", "revoked_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class WebhookSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = WebhookSubscriptionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("integrations.view")]
        return [require("integrations.manage")]

    def get_queryset(self):
        return WebhookSubscription.objects.prefetch_related("deliveries").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def event_types(self, request):
        return Response([{"value": v, "label": l} for v, l in WebhookSubscription.EVENT_CHOICES])
