from rest_framework.routers import SimpleRouter
from django.urls import path
from .views import DeviceViewSet, DeviceReadingViewSet, DeviceIngestView

router = SimpleRouter()
router.register("", DeviceViewSet, basename="device")

urlpatterns = [
    # Must precede the router's `<pk>/` route so "ingest" isn't swallowed as a device pk.
    path("ingest/", DeviceIngestView.as_view(), name="device-ingest"),
    path("<int:device_pk>/readings/", DeviceReadingViewSet.as_view({"get": "list"}), name="device-readings"),
    path("<int:device_pk>/readings/<int:pk>/", DeviceReadingViewSet.as_view({"get": "retrieve"}), name="device-reading-detail"),
] + router.urls
