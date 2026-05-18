from django.contrib import admin
from .models import FundingSource, Invoice, InvoiceItem, Payment

admin.site.register(FundingSource)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)
admin.site.register(Payment)
