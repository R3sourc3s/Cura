"""
SSRF guard for partner-supplied URLs (currently: webhook target_url).

Webhook subscriptions let a care home operator paste in an arbitrary URL that
our server will later POST to. Without validation, that URL could point at
internal infrastructure — localhost, RFC1918 ranges, or a cloud metadata
endpoint (169.254.169.254) — turning the webhook dispatcher into a
server-side request forgery primitive. This module is used both at
subscription-creation time (serializers.py) and again immediately before
each delivery attempt (webhooks.py), since a hostname that resolved safely
at creation time could later be repointed at an internal IP (DNS rebinding).
Checking at delivery time too closes most of that gap, though a fully
airtight fix would pin the resolved IP for the actual httpx connection —
out of scope for now given this is a defence-in-depth measure on top of
API-key-gated, per-care-home-scoped subscriptions.
"""

import ipaddress
import socket
from urllib.parse import urlparse

_BLOCKED_HOSTNAMES = {"localhost", "localhost.localdomain", "metadata.google.internal"}


def _is_private_or_reserved(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return True  # unparsable -> treat as unsafe
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )


def is_safe_webhook_url(url: str) -> tuple[bool, str]:
    """
    Returns (is_safe, reason). Refuses target URLs that use a non-http(s)
    scheme, have no hostname, or resolve (directly or via DNS) to a
    loopback / private / link-local / reserved IP address.
    """
    try:
        parsed = urlparse(url)
    except Exception:
        return False, "Could not parse URL."

    if parsed.scheme not in ("http", "https"):
        return False, "URL must use http or https."
    if not parsed.hostname:
        return False, "URL must include a hostname."

    hostname = parsed.hostname.lower()
    if hostname in _BLOCKED_HOSTNAMES:
        return False, "URL host is not allowed."

    try:
        # Handles URLs that give a bare IP as the host, e.g. http://169.254.169.254/
        ipaddress.ip_address(hostname)
        addrs = {hostname}
    except ValueError:
        try:
            infos = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            return False, "URL host could not be resolved."
        addrs = {info[4][0] for info in infos}

    if not addrs:
        return False, "URL host could not be resolved."

    for addr in addrs:
        if _is_private_or_reserved(addr):
            return False, "URL resolves to a private or reserved IP address, which is not allowed."

    return True, ""
