from rest_framework import serializers
from .models import Supplier, MedicationStock, ControlledDrugRegister, PurchaseOrder, PurchaseOrderItem


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"
        read_only_fields = ["care_home", "created_at"]


class MedicationStockSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = MedicationStock
        fields = "__all__"
        read_only_fields = ["care_home", "updated_at"]


class ControlledDrugRegisterSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True)
    witnessed_by_name = serializers.CharField(source="witnessed_by.get_full_name", read_only=True)

    class Meta:
        model = ControlledDrugRegister
        fields = "__all__"
        read_only_fields = ["care_home", "recorded_by", "created_at"]


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = "__all__"
        read_only_fields = ["purchase_order"]


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, required=False)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    ordered_by_name = serializers.CharField(source="ordered_by.get_full_name", read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ["care_home", "reference", "ordered_by", "created_at", "updated_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = PurchaseOrder.objects.create(**validated_data)
        for item in items_data:
            PurchaseOrderItem.objects.create(purchase_order=order, **item)
        return order
