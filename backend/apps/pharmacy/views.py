from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.authentication.permissions import require
from apps.integrations.webhooks import dispatch as dispatch_webhook
from .models import Supplier, MedicationStock, ControlledDrugRegister, PurchaseOrder, PurchaseOrderItem
from .serializers import (
    SupplierSerializer, MedicationStockSerializer, ControlledDrugRegisterSerializer,
    PurchaseOrderSerializer,
)
from .services import apply_status_transition


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
        stock = serializer.save(care_home=self.request.user.care_home)
        if stock.is_low_stock:
            dispatch_webhook(stock.care_home, "medication.low_stock", {
                "id": stock.id, "medication_name": stock.medication_name,
                "quantity_on_hand": str(stock.quantity_on_hand), "reorder_threshold": str(stock.reorder_threshold),
            })

    def perform_update(self, serializer):
        was_low = self.get_object().is_low_stock
        stock = serializer.save()
        if stock.is_low_stock and not was_low:
            dispatch_webhook(stock.care_home, "medication.low_stock", {
                "id": stock.id, "medication_name": stock.medication_name,
                "quantity_on_hand": str(stock.quantity_on_hand), "reorder_threshold": str(stock.reorder_threshold),
            })


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
        entry = serializer.save(care_home=self.request.user.care_home, recorded_by=self.request.user)
        if entry.witness_method == ControlledDrugRegister.WitnessMethod.FACE_MATCH and entry.witness_confidence:
            entry.witness_verified_at = timezone.now()
            entry.save(update_fields=["witness_verified_at"])
        dispatch_webhook(entry.care_home, "controlled_drug.recorded", {
            "id": entry.id, "medication_name": entry.medication_name, "entry_type": entry.entry_type,
            "quantity": str(entry.quantity), "recorded_at": entry.recorded_at.isoformat(),
        })


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "supplier"]
    ordering_fields = ["created_at", "expected_delivery"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [require("pharmacy.view")]
        return [require("pharmacy.manage")]

    def get_queryset(self):
        return (
            PurchaseOrder.objects.select_related("supplier", "ordered_by")
            .prefetch_related("items")
            .filter(care_home=self.request.user.care_home)
        )

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home, ordered_by=self.request.user)

    def perform_update(self, serializer):
        previous_status = self.get_object().status
        order = serializer.save()
        if order.status != previous_status:
            order = apply_status_transition(order, order.status)
            if order.status == PurchaseOrder.Status.DELIVERED:
                dispatch_webhook(order.care_home, "purchase_order.delivered", {
                    "id": order.id, "reference": order.reference,
                    "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
                })

    @action(detail=False, methods=["post"])
    def generate_from_low_stock(self, request):
        """Create a draft PO pre-populated with every low-stock item (optionally for one supplier)."""
        supplier_id = request.data.get("supplier")
        low_stock_qs = MedicationStock.objects.filter(care_home=request.user.care_home)
        if supplier_id:
            low_stock_qs = low_stock_qs.filter(supplier_id=supplier_id)
        low_stock_items = [s for s in low_stock_qs if s.is_low_stock]

        if not low_stock_items:
            return Response({"detail": "No low-stock items found."}, status=status.HTTP_400_BAD_REQUEST)

        order = PurchaseOrder.objects.create(
            care_home=request.user.care_home,
            supplier_id=supplier_id or (low_stock_items[0].supplier_id),
            ordered_by=request.user,
            notes="Auto-generated from low-stock alert.",
        )
        for stock_item in low_stock_items:
            target_qty = max(stock_item.reorder_threshold * 3, stock_item.reorder_threshold + 10)
            PurchaseOrderItem.objects.create(
                purchase_order=order,
                medication_stock=stock_item,
                medication_name=stock_item.medication_name,
                quantity_ordered=target_qty - stock_item.quantity_on_hand,
                unit=stock_item.unit,
            )
        return Response(PurchaseOrderSerializer(order).data, status=status.HTTP_201_CREATED)
