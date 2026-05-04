from rest_framework.routers import SimpleRouter
from .views import HandoverNoteViewSet

router = SimpleRouter()
router.register("", HandoverNoteViewSet, basename="handover")

urlpatterns = router.urls
