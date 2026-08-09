from rest_framework.routers import SimpleRouter
from .views import SupplierViewSet, MedicationStockViewSet, ControlledDrugRegisterViewSet, PurchaseOrderViewSet

router = SimpleRouter()
router.register("suppliers", SupplierViewSet, basename="pharmacy-supplier")
router.register("stock", MedicationStockViewSet, basename="pharmacy-stock")
router.register("controlled-drugs", ControlledDrugRegisterViewSet, basename="pharmacy-cd")
router.register("orders", PurchaseOrderViewSet, basename="pharmacy-order")
urlpatterns = router.urls
