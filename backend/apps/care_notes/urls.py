from rest_framework.routers import SimpleRouter
from .views import CareNoteViewSet

router = SimpleRouter()
router.register("", CareNoteViewSet, basename="care-note")
urlpatterns = router.urls
