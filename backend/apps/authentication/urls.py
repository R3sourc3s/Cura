from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, MeView, UserListView,
    AdminCreateUserView, UserDetailView, FamilyResidentView,
    PasswordResetRequestView, PasswordResetConfirmView, ChangePasswordView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("users/", UserListView.as_view(), name="auth-users"),
    path("users/create/", AdminCreateUserView.as_view(), name="auth-users-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="auth-user-detail"),
    path("family/resident/", FamilyResidentView.as_view(), name="family-resident"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
]
