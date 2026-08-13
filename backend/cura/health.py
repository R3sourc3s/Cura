from django.conf import settings
from django.db import connections
from django.db.utils import OperationalError
from django.http import JsonResponse
import redis


def health_check(request):
    """Unauthenticated liveness/readiness probe for orchestration (Docker
    healthcheck, load balancers, uptime monitors) — deliberately reports only
    up/down booleans, no version info or internals."""
    checks = {"database": False, "redis": False}

    try:
        connections["default"].cursor()
        checks["database"] = True
    except OperationalError:
        pass

    try:
        redis.from_url(settings.REDIS_URL, socket_connect_timeout=2).ping()
        checks["redis"] = True
    except Exception:
        pass

    healthy = all(checks.values())
    return JsonResponse(
        {"status": "ok" if healthy else "unhealthy", "checks": checks},
        status=200 if healthy else 503,
    )
