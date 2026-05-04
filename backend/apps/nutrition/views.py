from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import FluidRecord, MealRecord
from .serializers import FluidRecordSerializer, MealRecordSerializer


class FluidRecordViewSet(viewsets.ModelViewSet):
    serializer_class = FluidRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        "resident": ["exact"],
        "recorded_at": ["date__gte", "date__lte"],
    }

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("care_notes.create")]

    def get_queryset(self):
        return FluidRecord.objects.select_related(
            "resident", "recorded_by"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class MealRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MealRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        "resident": ["exact"],
        "recorded_at": ["date__gte", "date__lte"],
    }

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("care_notes.create")]

    def get_queryset(self):
        return MealRecord.objects.select_related(
            "resident", "recorded_by"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
