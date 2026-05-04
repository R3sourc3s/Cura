from django.urls import path
from .views import NotificationListView, mark_all_read, mark_one_read

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("mark-all-read/", mark_all_read, name="notifications-mark-all-read"),
    path("<int:pk>/read/", mark_one_read, name="notifications-mark-read"),
]
