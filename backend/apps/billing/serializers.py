from rest_framework import serializers
from .models import FundingSource, Invoice, InvoiceItem, Payment


class FundingSourceSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)

    class Meta:
        model = FundingSource
        fields = "__all__"


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = "__all__"
        read_only_fields = ["line_total"]


class PaymentSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source="recorded_by.get_full_name", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["recorded_by", "created_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    resident_name = serializers.CharField(source="resident.full_name", read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ["care_home", "created_by", "created_at"]
