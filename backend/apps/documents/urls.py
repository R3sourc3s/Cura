from rest_framework.routers import SimpleRouter
from .views import DocumentViewSet, DocumentFileViewSet

router = SimpleRouter()
# Register "files" before the document catch-all so /documents/files/<id>/…
# isn't captured as a document detail lookup.
router.register("files", DocumentFileViewSet, basename="document-file")
router.register("", DocumentViewSet, basename="document")

urlpatterns = router.urls
