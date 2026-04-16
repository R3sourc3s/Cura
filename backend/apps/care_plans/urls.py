from rest_framework.routers import DefaultRouter
from .views import CarePlanViewSet

router = DefaultRouter()
router.register("", CarePlanViewSet, basename="care-plan")

urlpatterns = router.urls
