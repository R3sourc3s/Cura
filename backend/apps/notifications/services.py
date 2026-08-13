from django.conf import settings
from .models import Notification


def notify(users, notif_type, message, link="", *, email=False, email_subject=None):
    """
    Create a bell notification for each user. Sensitive-action notifications
    always hit the bell; pass email=True only for the high-severity ones
    (safeguarding, privilege changes, etc.) so managers aren't drowned in
    inbox noise for routine actions like a new medication being logged.
    """
    users = list(users)
    if not users:
        return
    Notification.objects.bulk_create([
        Notification(user=u, notif_type=notif_type, message=message, link=link)
        for u in users
    ])
    if email:
        from .tasks import send_sensitive_action_email
        recipient_emails = [u.email for u in users if u.email]
        if recipient_emails:
            link_url = f"{settings.FRONTEND_URL.rstrip('/')}{link}" if link else settings.FRONTEND_URL
            send_sensitive_action_email.delay(
                recipient_emails, email_subject or "Action requires attention", message, link_url,
            )
