from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Resident, Condition
from .serializers import ResidentSerializer, ResidentListSerializer, ConditionSerializer


class ResidentViewSet(viewsets.ModelViewSet):
    queryset = Resident.objects.select_related("care_home").prefetch_related("conditions")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["care_home", "is_active", "fall_risk"]
    search_fields = ["first_name", "last_name", "nhs_number", "room_number"]
    ordering_fields = ["last_name", "ai_risk_score", "admission_date"]

    def get_serializer_class(self):
        if self.action == "list":
            return ResidentListSerializer
        return ResidentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.care_home:
            return super().get_queryset().filter(care_home=user.care_home)
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.select_related("resident")
    serializer_class = ConditionSerializer

    def get_queryset(self):
        return super().get_queryset().filter(resident_id=self.kwargs.get("resident_pk"))
