from rest_framework.routers import SimpleRouter
from .views import EnquiryViewSet, PreAdmissionAssessmentViewSet

router = SimpleRouter()
# Named routes before the empty catch-all so they aren't captured as detail lookups.
router.register("assessments", PreAdmissionAssessmentViewSet, basename="enquiry-assessment")
router.register("", EnquiryViewSet, basename="enquiry")
urlpatterns = router.urls
