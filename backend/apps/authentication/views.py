import logging
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, views, response, status
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, FamilyContact
from .serializers import UserSerializer, RegisterSerializer, CuraTokenSerializer, AdminCreateUserSerializer, AdminUpdateUserSerializer
from .permissions import require
from django_filters.rest_framework import DjangoFilterBackend

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    scope = "auth_login"


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "auth_password_reset"


class LoginView(TokenObtainPairView):
    serializer_class = CuraTokenSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginRateThrottle]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["role", "care_home"]

    def get_permissions(self):
        return [require("staff.view")]

    def get_queryset(self):
        return User.objects.filter(care_home=self.request.user.care_home).order_by("first_name")


class AdminCreateUserView(generics.CreateAPIView):
    serializer_class = AdminCreateUserSerializer

    def get_permissions(self):
        return [require("staff.manage")]

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUpdateUserSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [require("staff.view")]
        return [require("staff.manage")]

    def get_queryset(self):
        return User.objects.filter(care_home=self.request.user.care_home)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserSerializer
        return AdminUpdateUserSerializer


class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return response.Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Always return success — prevents email enumeration
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return response.Response({"detail": "If that email is registered, a reset link has been sent."})

        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"

        html_body = render_to_string("authentication/password_reset_email.html", {
            "user": user,
            "reset_url": reset_url,
        })
        try:
            send_mail(
                subject="Reset your Cura password",
                message=f"Reset your password here: {reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_body,
                fail_silently=False,
            )
        except Exception:
            logger.exception("Failed to send password reset email to %s", user.email)
        return response.Response({"detail": "If that email is registered, a reset link has been sent."})


class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get("uid", "")
        token = request.data.get("token", "")
        new_password = request.data.get("new_password", "")

        if not all([uid, token, new_password]):
            return response.Response(
                {"detail": "uid, token and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(new_password) < 8:
            return response.Response(
                {"detail": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return response.Response({"detail": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return response.Response(
                {"detail": "This link has expired or has already been used."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return response.Response({"detail": "Password reset successfully. You can now log in."})


class FamilyResidentView(views.APIView):
    """Returns the resident linked to the logged-in family member."""

    def get_permissions(self):
        return [require("family.view_resident")]

    def get(self, request):
        try:
            contact = FamilyContact.objects.select_related("resident").get(user=request.user)
        except FamilyContact.DoesNotExist:
            return response.Response({"detail": "No resident linked to this account."}, status=404)
        from apps.residents.serializers import ResidentSerializer
        return response.Response(ResidentSerializer(contact.resident, context={"request": request}).data)
