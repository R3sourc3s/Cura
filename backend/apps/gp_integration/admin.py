from django.contrib import admin
from .models import GPContact, HospitalContact, DischargeSummary, Referral

admin.site.register(GPContact)
admin.site.register(HospitalContact)
admin.site.register(DischargeSummary)
admin.site.register(Referral)
