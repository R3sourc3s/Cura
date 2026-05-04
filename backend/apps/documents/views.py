from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["category", "resident", "staff_member", "is_active"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("staff.view")]
        if self.action == "destroy":
            return [require("staff.manage")]
        return [require("staff.view")]

    def get_queryset(self):
        return Document.objects.select_related(
            "resident", "staff_member", "uploaded_by", "care_home"
        ).filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES.get("file")
        file_size = uploaded_file.size if uploaded_file else 0
        file_type = uploaded_file.content_type if uploaded_file else ""
        serializer.save(
            care_home=self.request.user.care_home,
            uploaded_by=self.request.user,
            file_size=file_size,
            file_type=file_type,
        )
