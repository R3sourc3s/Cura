from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.integrations.models import APIKey


class HasAPIKey(BasePermission):
    """Requires a valid APIKey to have authenticated this request (see apps.integrations.auth)."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated) and isinstance(request.auth, APIKey)


class ReadOnlyUnlessReadWriteKey(BasePermission):
    """Write verbs (POST/PUT/PATCH/DELETE) require a read_write-scoped key."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        api_key = request.auth
        return isinstance(api_key, APIKey) and api_key.scope == APIKey.Scope.READ_WRITE
