from django.contrib import admin
from .models import FluidRecord, MealRecord, PEGChart, PEGFeedRecord

admin.site.register(FluidRecord)
admin.site.register(MealRecord)
admin.site.register(PEGChart)
admin.site.register(PEGFeedRecord)
