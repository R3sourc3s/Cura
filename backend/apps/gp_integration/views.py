from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import GPContact, HospitalContact, DischargeSummary, Referral
from .serializers import GPContactSerializer, HospitalContactSerializer, DischargeSummarySerializer, ReferralSerializer


class GPContactViewSet(viewsets.ModelViewSet):
    serializer_class = GPContactSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["practice_name", "gp_name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("gp.view")]
        return [require("gp.manage")]

    def get_queryset(self):
        return GPContact.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class HospitalContactViewSet(viewsets.ModelViewSet):
    serializer_class = HospitalContactSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["hospital_name", "department"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("gp.view")]
        return [require("gp.manage")]

    def get_queryset(self):
        return HospitalContact.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class DischargeSummaryViewSet(viewsets.ModelViewSet):
    serializer_class = DischargeSummarySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "resident"]
    search_fields = ["resident__full_name", "diagnosis"]
    ordering_fields = ["discharge_date"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("gp.view")]
        return [require("gp.manage")]

    def get_queryset(self):
        return DischargeSummary.objects.select_related("resident", "hospital", "reviewed_by").filter(
            resident__care_home=self.request.user.care_home
        )


class ReferralViewSet(viewsets.ModelViewSet):
    serializer_class = ReferralSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "referral_type", "urgency", "resident"]
    search_fields = ["resident__full_name", "referred_to"]
    ordering_fields = ["referral_date"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("gp.view")]
        return [require("gp.manage")]

    def get_queryset(self):
        return Referral.objects.select_related("resident", "referred_by").filter(
            resident__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(referred_by=self.request.user)
