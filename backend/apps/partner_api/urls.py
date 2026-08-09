from rest_framework.routers import SimpleRouter
from .views import (
    PartnerResidentViewSet, PartnerMedicationViewSet, PartnerIncidentViewSet, PartnerPurchaseOrderViewSet,
)

router = SimpleRouter()
router.register("residents", PartnerResidentViewSet, basename="partner-resident")
router.register("medications", PartnerMedicationViewSet, basename="partner-medication")
router.register("incidents", PartnerIncidentViewSet, basename="partner-incident")
router.register("purchase-orders", PartnerPurchaseOrderViewSet, basename="partner-purchase-order")
urlpatterns = router.urls
