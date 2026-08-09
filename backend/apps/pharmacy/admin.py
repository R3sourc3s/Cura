from django.contrib import admin
from .models import Supplier, MedicationStock, ControlledDrugRegister, PurchaseOrder, PurchaseOrderItem

admin.site.register(Supplier)
admin.site.register(MedicationStock)
admin.site.register(ControlledDrugRegister)
admin.site.register(PurchaseOrder)
admin.site.register(PurchaseOrderItem)
