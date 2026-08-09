from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import APIKey


class APIKeyAuthentication(BaseAuthentication):
    """
    Authenticates partner requests via `Authorization: Bearer cura_<prefix>.<secret>`.

    Deliberately scoped to the partner API only (see apps.partner_api) rather than
    added to the platform's global authentication classes — internal dashboard
    endpoints keep using JWT session auth untouched. request.user becomes the key's
    creator (so care_home-scoped querysets work unmodified); request.auth carries
    the APIKey instance so views/permissions can check `.scope`.
    """

    keyword = "Bearer"
    www_authenticate_realm = "api"

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith(f"{self.keyword} "):
            return None

        raw_key = auth_header[len(self.keyword) + 1:].strip()
        if not raw_key.startswith("cura_"):
            return None  # not one of ours — let this fall through as unauthenticated

        try:
            api_key = APIKey.objects.select_related("created_by", "care_home").get(
                key_hash=APIKey.hash_key(raw_key), is_active=True
            )
        except APIKey.DoesNotExist:
            raise AuthenticationFailed("Invalid or revoked API key.")

        if api_key.created_by is None or not api_key.created_by.is_active:
            raise AuthenticationFailed("This API key's account is no longer active.")

        APIKey.objects.filter(pk=api_key.pk).update(last_used_at=timezone.now())

        return (api_key.created_by, api_key)

    def authenticate_header(self, request):
        return self.keyword
