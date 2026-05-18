from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import JobPosting, Applicant
from .serializers import JobPostingSerializer, ApplicantSerializer


class JobPostingViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "contract_type"]
    search_fields = ["title", "department"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("recruitment.view")]
        return [require("recruitment.manage")]

    def get_queryset(self):
        return JobPosting.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, created_by=self.request.user)


class ApplicantViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicantSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "job_posting", "right_to_work_verified"]
    search_fields = ["first_name", "last_name", "email"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("recruitment.view")]
        return [require("recruitment.manage")]

    def get_queryset(self):
        return Applicant.objects.select_related("job_posting").filter(
            job_posting__care_home=self.request.user.care_home
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
