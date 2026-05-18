from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from .models import FundingSource, Invoice, InvoiceItem, Payment
from .serializers import FundingSourceSerializer, InvoiceSerializer, InvoiceItemSerializer, PaymentSerializer


class FundingSourceViewSet(viewsets.ModelViewSet):
    serializer_class = FundingSourceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["funding_type", "resident", "is_active"]
    search_fields = ["funder_name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("billing.view")]
        return [require("billing.manage")]

    def get_queryset(self):
        return FundingSource.objects.select_related("resident").filter(
            resident__care_home=self.request.user.care_home
        )


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "resident"]
    search_fields = ["invoice_number", "resident__full_name"]
    ordering_fields = ["issue_date", "due_date", "total"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("billing.view")]
        return [require("billing.manage")]

    def get_queryset(self):
        return Invoice.objects.select_related("resident", "created_by").prefetch_related("items", "payments").filter(
            care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, created_by=self.request.user)


class InvoiceItemViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceItemSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("billing.view")]
        return [require("billing.manage")]

    def get_queryset(self):
        return InvoiceItem.objects.filter(invoice__care_home=self.request.user.care_home)


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["invoice", "payment_method"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("billing.view")]
        return [require("billing.manage")]

    def get_queryset(self):
        return Payment.objects.select_related("invoice", "recorded_by").filter(
            invoice__care_home=self.request.user.care_home
        )

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
