import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task
def send_sensitive_action_email(recipient_emails, subject, message, link_url):
    html_body = render_to_string("notifications/sensitive_action_email.html", {
        "subject": subject,
        "message": message,
        "link_url": link_url,
    })
    for email in recipient_emails:
        try:
            send_mail(
                subject=f"Cura — {subject}",
                message=f"{message}\n\n{link_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_body,
                fail_silently=False,
            )
        except Exception:
            logger.exception("Failed to send sensitive-action email to %s", email)
