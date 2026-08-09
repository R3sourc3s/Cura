"""Shared purchase-order status-transition logic — used by both the internal
dashboard API and the partner API (so a pharmacy partner pushing 'delivered'
has exactly the same stock-received side effect as a staff member doing it
by hand in the UI)."""

from django.db import transaction
from django.utils import timezone

from .models import PurchaseOrder


def apply_status_transition(order: PurchaseOrder, new_status: str) -> PurchaseOrder:
    previous_status = order.status
    order.status = new_status
    order.save(update_fields=["status", "updated_at"])

    if previous_status == new_status:
        return order

    now = timezone.now()
    fields = []
    if new_status == PurchaseOrder.Status.SUBMITTED and not order.ordered_at:
        order.ordered_at = now
        fields.append("ordered_at")
    elif new_status == PurchaseOrder.Status.DISPATCHED and not order.dispatched_at:
        order.dispatched_at = now
        fields.append("dispatched_at")
    elif new_status == PurchaseOrder.Status.DELIVERED and not order.delivered_at:
        order.delivered_at = now
        fields.append("delivered_at")
        _receive_stock(order)

    if fields:
        order.save(update_fields=fields)
    return order


@transaction.atomic
def _receive_stock(order: PurchaseOrder):
    for item in order.items.select_related("medication_stock"):
        item.quantity_received = item.quantity_ordered
        item.save(update_fields=["quantity_received"])
        if item.medication_stock:
            stock = item.medication_stock
            stock.quantity_on_hand = stock.quantity_on_hand + item.quantity_ordered
            stock.last_restocked = timezone.now()
            stock.save(update_fields=["quantity_on_hand", "last_restocked"])
