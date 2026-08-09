"""
Fire-and-forget webhook dispatch. Kept dependency-light (httpx, already pulled in
by the anthropic SDK) and non-blocking: dispatch happens on a short-lived thread
so a slow/unreachable partner endpoint never delays the API response that
triggered the event. Every attempt is logged to WebhookDelivery for visibility.
"""

import hashlib
import hmac
import json
import logging
import threading

import httpx

from .models import WebhookSubscription, WebhookDelivery
from .url_safety import is_safe_webhook_url

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 5.0


def _sign(secret: str, body: bytes) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def _deliver(subscription: WebhookSubscription, event_type: str, payload: dict):
    body = json.dumps({"event": event_type, "data": payload}, default=str).encode()
    signature = _sign(subscription.secret, body)
    status_code = None
    success = False
    error = ""

    safe, reason = is_safe_webhook_url(subscription.target_url)
    if not safe:
        error = f"Blocked: {reason}"
        logger.warning("Refused to deliver webhook %s to %s: %s", event_type, subscription.target_url, reason)
    else:
        try:
            resp = httpx.post(
                subscription.target_url,
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Cura-Event": event_type,
                    "X-Cura-Signature": f"sha256={signature}",
                },
                timeout=TIMEOUT_SECONDS,
                follow_redirects=False,
            )
            status_code = resp.status_code
            success = 200 <= resp.status_code < 300
        except httpx.HTTPError as exc:
            error = str(exc)[:300]
        except Exception as exc:  # pragma: no cover — never let a webhook crash the caller
            error = str(exc)[:300]

    try:
        WebhookDelivery.objects.create(
            subscription=subscription, event_type=event_type,
            payload=payload, status_code=status_code, success=success, error=error,
        )
    except Exception:
        logger.exception("Failed to log webhook delivery for %s", event_type)


def dispatch(care_home, event_type: str, payload: dict):
    """Send `event_type` to every active subscription for `care_home` that listens for it."""
    if care_home is None:
        return
    subscriptions = WebhookSubscription.objects.filter(
        care_home=care_home, is_active=True
    )
    for sub in subscriptions:
        if event_type not in (sub.event_types or []):
            continue
        threading.Thread(target=_deliver, args=(sub, event_type, payload), daemon=True).start()
