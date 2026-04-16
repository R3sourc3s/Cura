from rest_framework.routers import DefaultRouter
from .views import CareHomeViewSet, ShiftViewSet, LeaveRequestViewSet, TrainingViewSet

router = DefaultRouter()
router.register("care-homes", CareHomeViewSet, basename="care-home")
router.register("shifts", ShiftViewSet, basename="shift")
router.register("leave", LeaveRequestViewSet, basename="leave-request")
router.register("training", TrainingViewSet, basename="training")

urlpatterns = router.urls
