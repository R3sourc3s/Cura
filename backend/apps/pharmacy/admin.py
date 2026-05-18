from django.contrib import admin
from .models import Supplier, MedicationStock, ControlledDrugRegister

admin.site.register(Supplier)
admin.site.register(MedicationStock)
admin.site.register(ControlledDrugRegister)
