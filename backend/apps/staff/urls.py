from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CareHomeViewSet, ShiftViewSet, LeaveRequestViewSet, TrainingViewSet, WingViewSet, wing_oversight, staffing_coverage, group_oversight

router = DefaultRouter()
router.register("care-homes", CareHomeViewSet, basename="care-home")
router.register("shifts", ShiftViewSet, basename="shift")
router.register("leave", LeaveRequestViewSet, basename="leave-request")
router.register("training", TrainingViewSet, basename="training")
router.register("wings", WingViewSet, basename="wing")

urlpatterns = router.urls + [
    path("wings-oversight/", wing_oversight, name="wing-oversight"),
    path("staffing-coverage/", staffing_coverage, name="staffing-coverage"),
    path("group-oversight/", group_oversight, name="group-oversight"),
]
