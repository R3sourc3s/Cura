from rest_framework.routers import SimpleRouter
from .views import FluidRecordViewSet, MealRecordViewSet

router = SimpleRouter()
router.register("fluid", FluidRecordViewSet, basename="fluid-record")
router.register("meals", MealRecordViewSet, basename="meal-record")
urlpatterns = router.urls
