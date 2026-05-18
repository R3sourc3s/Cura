from rest_framework.routers import SimpleRouter
from .views import LeaveTypeViewSet, LeaveRequestViewSet, LeaveBalanceViewSet

router = SimpleRouter()
router.register("types", LeaveTypeViewSet, basename="leave-type")
router.register("requests", LeaveRequestViewSet, basename="leave-request")
router.register("balances", LeaveBalanceViewSet, basename="leave-balance")
urlpatterns = router.urls
