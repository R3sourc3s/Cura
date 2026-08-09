from pathlib import Path
from datetime import timedelta
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
]

LOCAL_APPS = [
    "apps.authentication",
    "apps.residents",
    "apps.medications",
    "apps.care_plans",
    "apps.staff",
    "apps.compliance",
    "apps.ai_assistant",
    "apps.incidents",
    "apps.handover",
    "apps.vitals",
    "apps.notifications",
    "apps.audit_log",
    "apps.care_notes",
    "apps.visitors",
    "apps.maintenance",
    "apps.activities",
    "apps.appointments",
    "apps.body_map",
    "apps.documents",
    "apps.training",
    "apps.nutrition",
    "apps.falls_risk",
    "apps.overnight_checks",
    "apps.safeguarding",
    "apps.messages_board",
    "apps.pharmacy",
    "apps.recruitment",
    "apps.leave",
    "apps.tasks",
    "apps.enquiries",
    "apps.billing",
    "apps.gp_integration",
    "apps.family_portal",
    "apps.skills",
    "apps.integrations",
    "apps.partner_api",
    "apps.devices",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.audit_log.middleware.AuditMiddleware",
]

ROOT_URLCONF = "cura.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "cura.wsgi.application"

DATABASES = {
    "default": env.db("DATABASE_URL", default="sqlite:///db.sqlite3")
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-gb"
TIME_ZONE = "Europe/London"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "authentication.User"

# DRF
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": [
        "cura.throttling.BurstRateThrottle",
        "cura.throttling.SustainedRateThrottle",
        "cura.throttling.WriteRateThrottle",   # stricter, writes only (all endpoints)
        "rest_framework.throttling.AnonRateThrottle",
        # Only throttles views that set `throttle_scope` (e.g. AI endpoints); no-op otherwise.
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",          # unauthenticated (login / marketing / API probing)
        "burst": "200/min",          # per user/IP — blocks rapid scripted abuse (all methods)
        "sustained": "5000/hour",    # per user/IP — blocks slow high-volume scraping
        "writes": "60/min",          # per user — POST/PUT/PATCH/DELETE only (record-spam)
        "uploads": "20/min",         # per user — heaviest endpoints (file uploads)
        "auth_login": "10/minute",   # brute-force protection on login
        "auth_password_reset": "5/hour",
        "ai": "30/hour",             # expensive LLM endpoints (defense-in-depth vs proxy limit)
        "partner_api": "1000/hour",  # third-party integration traffic (per API-key-authenticated user)
        "device_ingest": "6000/hour", # wearable/sensor data ingestion — higher frequency than partner reads
    },
}

# JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env.int("ACCESS_TOKEN_LIFETIME_MINUTES", default=60)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env.int("REFRESH_TOKEN_LIFETIME_DAYS", default=7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# CORS
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:3001"])
CORS_ALLOW_CREDENTIALS = True

# Anthropic
ANTHROPIC_API_KEY = env("ANTHROPIC_API_KEY", default="")

# Redis / Celery
REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/0")
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"

# Cache — backs DRF throttling so rate limits are shared across workers and
# survive restarts (uses a separate Redis DB from Celery).
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("CACHE_URL", default=REDIS_URL.rsplit("/", 1)[0] + "/1"),
    }
}

# Email
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="noreply@curacareplatform.co.uk")
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:3000")

# API docs
SPECTACULAR_SETTINGS = {
    "TITLE": "Cura API",
    "DESCRIPTION": "Care home management platform API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
