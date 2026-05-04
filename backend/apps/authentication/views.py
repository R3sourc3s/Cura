from rest_framework import generics, permissions, views, response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, FamilyContact
from .serializers import UserSerializer, RegisterSerializer, CuraTokenSerializer, AdminCreateUserSerializer, AdminUpdateUserSerializer
from .permissions import require
from django_filters.rest_framework import DjangoFilterBackend


class LoginView(TokenObtainPairView):
    serializer_class = CuraTokenSerializer
    permission_classes = [permissions.AllowAny]


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
