from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend"]

INSTALLED_APPS += ["django_extensions"]

# Log all SQL queries in development — opt-in via SQL_DEBUG=True, since it's
# unreadably noisy by default (and drowns real failures in `manage.py test` output).
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG" if env.bool("SQL_DEBUG", default=False) else "INFO",
        },
    },
}
