from django.contrib import admin
from .models import Incident, IncidentFollowUp

admin.site.register(Incident)
admin.site.register(IncidentFollowUp)
