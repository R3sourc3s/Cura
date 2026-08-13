from .base import *  # noqa
import environ

env = environ.Env()

DEBUG = False

# Require explicit ALLOWED_HOSTS in production — no wildcard fallback
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# Trust X-Forwarded-Proto from the reverse proxy / load balancer terminating
# TLS in front of this container (standard on Railway, Render, Fly, ALB,
# Cloudflare, nginx, Caddy, etc). Required for SECURE_SSL_REDIRECT to work
# without an infinite redirect loop when Django itself only ever sees plain
# HTTP from the proxy. Only safe if Django is NOT directly reachable bypassing
# that proxy — verify your deployment's network path before relying on this.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
