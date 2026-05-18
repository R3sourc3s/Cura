from rest_framework.routers import SimpleRouter
from .views import SupplierViewSet, MedicationStockViewSet, ControlledDrugRegisterViewSet

router = SimpleRouter()
router.register("suppliers", SupplierViewSet, basename="pharmacy-supplier")
router.register("stock", MedicationStockViewSet, basename="pharmacy-stock")
router.register("controlled-drugs", ControlledDrugRegisterViewSet, basename="pharmacy-cd")
urlpatterns = router.urls
