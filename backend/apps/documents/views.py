import os

from django.http import FileResponse, Http404
from rest_framework import viewsets, filters, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Document, DocumentFile
from .serializers import DocumentSerializer, DocumentFileSerializer


def stream_file(document_file, *, as_attachment):
    """Return a FileResponse streaming a DocumentFile inline or as attachment."""
    if not document_file.file:
        raise Http404("This file is missing.")
    try:
        handle = document_file.file.open("rb")
    except (FileNotFoundError, ValueError):
        raise Http404("File not found.")
    filename = document_file.original_name or os.path.basename(document_file.file.name)
    return FileResponse(
        handle,
        as_attachment=as_attachment,
        filename=filename,
        content_type=document_file.file_type or None,
    )


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
        ).prefetch_related("files").filter(
            care_home=self.request.user.care_home
        )

    def _uploaded_files(self):
        return self.request.FILES.getlist("files") or self.request.FILES.getlist("file")

    def _attach_files(self, document):
        for f in self._uploaded_files():
            DocumentFile.objects.create(
                document=document,
                file=f,
                original_name=f.name,
                file_size=f.size,
                file_type=getattr(f, "content_type", "") or "",
            )

    def _resolve_relations(self):
        """Map resident / staff_member ids from the request to care-home-scoped
        objects. Only keys actually present are returned (empty string => unset)."""
        from apps.residents.models import Resident
        from apps.authentication.models import User

        data = self.request.data
        care_home = self.request.user.care_home
        result = {}
        if "resident" in data:
            rid = data.get("resident")
            result["resident"] = (
                Resident.objects.filter(pk=rid, care_home=care_home).first()
                if rid not in (None, "", "null") else None
            )
        if "staff_member" in data:
            sid = data.get("staff_member")
            result["staff_member"] = (
                User.objects.filter(pk=sid, care_home=care_home).first()
                if sid not in (None, "", "null") else None
            )
        return result

    def perform_create(self, serializer):
        if not self._uploaded_files():
            raise ValidationError({"files": "At least one file is required."})
        relations = self._resolve_relations()
        self._validate_exclusive(relations)
        document = serializer.save(
            care_home=self.request.user.care_home,
            uploaded_by=self.request.user,
            **relations,
        )
        self._attach_files(document)

    def perform_update(self, serializer):
        relations = self._resolve_relations()
        self._validate_exclusive(relations, instance=serializer.instance)
        document = serializer.save(**relations)
        self._attach_files(document)

    def _validate_exclusive(self, relations, instance=None):
        """A document may be linked to a resident OR a staff member, not both."""
        resident = relations["resident"] if "resident" in relations else (instance.resident if instance else None)
        staff = relations["staff_member"] if "staff_member" in relations else (instance.staff_member if instance else None)
        if resident and staff:
            raise ValidationError(
                {"resident": "Link to either a resident or a staff member, not both."}
            )

    def perform_destroy(self, instance):
        # Remove the physical files from storage, then the record.
        for df in instance.files.all():
            df.file.delete(save=False)
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()


class DocumentFileViewSet(mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = DocumentFileSerializer

    def get_permissions(self):
        return [require("staff.view")]

    def perform_destroy(self, instance):
        instance.file.delete(save=False)
        instance.delete()

    def get_queryset(self):
        return DocumentFile.objects.select_related("document").filter(
            document__care_home=self.request.user.care_home
        )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        return stream_file(self.get_object(), as_attachment=True)

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        return stream_file(self.get_object(), as_attachment=False)
