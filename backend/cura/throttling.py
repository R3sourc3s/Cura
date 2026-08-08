"""Custom throttles for layered rate limiting.

We apply two per-identity throttles to every endpoint:
  * BurstRateThrottle    — short window, stops rapid scripted abuse.
  * SustainedRateThrottle — long window, stops slow high-volume scraping.

Both key by authenticated user id (or client IP when anonymous), so a single
user/IP can't hammer the API regardless of which endpoints they hit.
"""
from rest_framework.permissions import SAFE_METHODS
from rest_framework.throttling import UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    scope = "burst"


class SustainedRateThrottle(UserRateThrottle):
    scope = "sustained"


class WriteRateThrottle(UserRateThrottle):
    """Stricter limit that only counts writes (POST/PUT/PATCH/DELETE).

    Reads (GET/HEAD/OPTIONS) — which dominate normal dashboard traffic — are
    exempt, so this throttles record-creation spam without hurting browsing.
    """
    scope = "writes"

    def allow_request(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return super().allow_request(request, view)


class UploadRateThrottle(UserRateThrottle):
    """Tight limit for the heaviest endpoints — multipart file uploads.

    Applied to the document vault (large / multi-file payloads, disk I/O).
    Only counts writes; reads/downloads are exempt.
    """
    scope = "uploads"

    def allow_request(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return super().allow_request(request, view)
