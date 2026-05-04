from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import WoundRecord, WoundAssessment
from .serializers import WoundRecordSerializer, WoundAssessmentSerializer


class WoundRecordViewSet(viewsets.ModelViewSet):
    serializer_class = WoundRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["resident", "is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("residents.edit")]

    def get_queryset(self):
        return WoundRecord.objects.select_related(
            "resident", "created_by"
        ).prefetch_related(
            "assessments"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WoundAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = WoundAssessmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["wound"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("residents.edit")]

    def get_queryset(self):
        qs = WoundAssessment.objects.select_related(
            "wound", "assessed_by"
        ).filter(
            wound__resident__care_home=self.request.user.care_home
        )
        wound_pk = self.kwargs.get("wound_pk")
        if wound_pk:
            qs = qs.filter(wound_id=wound_pk)
        return qs

    def perform_create(self, serializer):
        wound_pk = self.kwargs.get("wound_pk")
        if wound_pk:
            serializer.save(assessed_by=self.request.user, wound_id=wound_pk)
        else:
            serializer.save(assessed_by=self.request.user)
