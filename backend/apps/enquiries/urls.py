from rest_framework.routers import SimpleRouter
from .views import EnquiryViewSet, PreAdmissionAssessmentViewSet

router = SimpleRouter()
router.register("", EnquiryViewSet, basename="enquiry")
router.register("assessments", PreAdmissionAssessmentViewSet, basename="enquiry-assessment")
urlpatterns = router.urls
