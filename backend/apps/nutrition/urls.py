from rest_framework.routers import SimpleRouter
from .views import FluidRecordViewSet, MealRecordViewSet, PEGChartViewSet, PEGFeedRecordViewSet

router = SimpleRouter()
router.register("fluid", FluidRecordViewSet, basename="fluid-record")
router.register("meals", MealRecordViewSet, basename="meal-record")
router.register("peg-charts", PEGChartViewSet, basename="peg-chart")
router.register("peg-feeds", PEGFeedRecordViewSet, basename="peg-feed")
urlpatterns = router.urls
