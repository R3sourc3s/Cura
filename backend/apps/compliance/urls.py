from rest_framework.routers import DefaultRouter
from .views import ComplianceAuditViewSet, AuditActionViewSet, PolicyViewSet, AccreditationViewSet

router = DefaultRouter()
router.register("audits", ComplianceAuditViewSet, basename="audit")
router.register("actions", AuditActionViewSet, basename="audit-action")
router.register("policies", PolicyViewSet, basename="policy")
router.register("accreditations", AccreditationViewSet, basename="accreditation")

urlpatterns = router.urls
