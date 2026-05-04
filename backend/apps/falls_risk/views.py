from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import FallsRiskAssessment
from .serializers import FallsRiskAssessmentSerializer


class FallsRiskAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = FallsRiskAssessmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["resident"]
    ordering_fields = ["assessment_date"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("residents.view")]
        return [require("residents.edit")]

    def get_queryset(self):
        return FallsRiskAssessment.objects.select_related(
            "resident", "assessed_by"
        ).filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(assessed_by=self.request.user)
