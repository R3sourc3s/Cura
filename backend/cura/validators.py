from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.utils.deconstruct import deconstructible

IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"]
DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "doc", "docx"]


@deconstructible
class MaxFileSizeValidator:
    """Rejects uploads over max_mb — Django has no built-in size validator."""

    def __init__(self, max_mb):
        self.max_mb = max_mb

    def __call__(self, file):
        limit = self.max_mb * 1024 * 1024
        if file.size > limit:
            raise ValidationError(
                f"File must be under {self.max_mb}MB (got {file.size / 1024 / 1024:.1f}MB)."
            )

    def __eq__(self, other):
        return isinstance(other, MaxFileSizeValidator) and self.max_mb == other.max_mb


def image_upload_validators(max_mb=5):
    return [FileExtensionValidator(allowed_extensions=IMAGE_EXTENSIONS), MaxFileSizeValidator(max_mb)]


def document_upload_validators(max_mb=20):
    return [FileExtensionValidator(allowed_extensions=DOCUMENT_EXTENSIONS), MaxFileSizeValidator(max_mb)]
