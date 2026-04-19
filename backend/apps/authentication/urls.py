from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, RegisterView, MeView, UserListView, AdminCreateUserView, UserDetailView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("users/", UserListView.as_view(), name="auth-users"),
    path("users/create/", AdminCreateUserView.as_view(), name="auth-users-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="auth-user-detail"),
]
