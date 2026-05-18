from rest_framework.routers import SimpleRouter
from .views import GPContactViewSet, HospitalContactViewSet, DischargeSummaryViewSet, ReferralViewSet

router = SimpleRouter()
router.register("gp-contacts", GPContactViewSet, basename="gp-contact")
router.register("hospital-contacts", HospitalContactViewSet, basename="hospital-contact")
router.register("discharge-summaries", DischargeSummaryViewSet, basename="discharge-summary")
router.register("referrals", ReferralViewSet, basename="referral")
urlpatterns = router.urls
