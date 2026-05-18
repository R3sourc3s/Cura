from rest_framework.routers import SimpleRouter
from .views import FundingSourceViewSet, InvoiceViewSet, InvoiceItemViewSet, PaymentViewSet

router = SimpleRouter()
router.register("funding-sources", FundingSourceViewSet, basename="billing-funding")
router.register("invoices", InvoiceViewSet, basename="billing-invoice")
router.register("items", InvoiceItemViewSet, basename="billing-item")
router.register("payments", PaymentViewSet, basename="billing-payment")
urlpatterns = router.urls
