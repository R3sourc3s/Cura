from rest_framework.routers import SimpleRouter
from django.urls import path
from .views import IncidentViewSet, IncidentFollowUpViewSet

router = SimpleRouter()
router.register("", IncidentViewSet, basename="incident")

urlpatterns = router.urls + [
    path("<int:incident_pk>/follow-ups/", IncidentFollowUpViewSet.as_view({"get": "list", "post": "create"}), name="incident-followups"),
    path("<int:incident_pk>/follow-ups/<int:pk>/", IncidentFollowUpViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="incident-followup-detail"),
]
