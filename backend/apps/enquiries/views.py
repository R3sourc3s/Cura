from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Enquiry, PreAdmissionAssessment
from .serializers import EnquirySerializer, PreAdmissionAssessmentSerializer


class EnquiryViewSet(viewsets.ModelViewSet):
    serializer_class = EnquirySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "funding_type", "assigned_to"]
    search_fields = ["prospective_resident_name", "contact_name", "contact_email"]
    ordering_fields = ["enquiry_date", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("enquiries.view")]
        return [require("enquiries.manage")]

    def get_queryset(self):
        return Enquiry.objects.select_related("assigned_to").filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class PreAdmissionAssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = PreAdmissionAssessmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["outcome", "enquiry"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("enquiries.view")]
        return [require("enquiries.manage")]

    def get_queryset(self):
        return PreAdmissionAssessment.objects.select_related("enquiry", "assessor").filter(
            enquiry__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(assessor=self.request.user)
