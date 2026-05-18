from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import Supplier, MedicationStock, ControlledDrugRegister
from .serializers import SupplierSerializer, MedicationStockSerializer, ControlledDrugRegisterSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "contact_name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("pharmacy.view")]
        return [require("pharmacy.manage")]

    def get_queryset(self):
        return Supplier.objects.filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class MedicationStockViewSet(viewsets.ModelViewSet):
    serializer_class = MedicationStockSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["supplier"]
    search_fields = ["medication_name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("pharmacy.view")]
        return [require("pharmacy.manage")]

    def get_queryset(self):
        return MedicationStock.objects.select_related("supplier").filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class ControlledDrugRegisterViewSet(viewsets.ModelViewSet):
    serializer_class = ControlledDrugRegisterSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["entry_type", "medication_name"]
    ordering_fields = ["recorded_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("pharmacy.view")]
        return [require("pharmacy.manage")]

    def get_queryset(self):
        return ControlledDrugRegister.objects.select_related("resident", "recorded_by", "witnessed_by").filter(care_home=self.request.user.care_home)

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, recorded_by=self.request.user)
