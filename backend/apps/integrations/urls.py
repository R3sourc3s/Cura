from rest_framework.routers import SimpleRouter
from .views import APIKeyViewSet, WebhookSubscriptionViewSet

router = SimpleRouter()
router.register("api-keys", APIKeyViewSet, basename="api-key")
router.register("webhooks", WebhookSubscriptionViewSet, basename="webhook")
urlpatterns = router.urls
