from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from .serializers import UserSerializer, RegisterSerializer, EmpathikaTokenSerializer, AdminCreateUserSerializer, AdminUpdateUserSerializer
from django_filters.rest_framework import DjangoFilterBackend


class LoginView(TokenObtainPairView):
    serializer_class = EmpathikaTokenSerializer
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

    def get_queryset(self):
        return User.objects.filter(care_home=self.request.user.care_home).order_by("first_name")


class AdminCreateUserView(generics.CreateAPIView):
    serializer_class = AdminCreateUserSerializer

    def perform_create(self, serializer):
        serializer.save(care_home=self.request.user.care_home)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUpdateUserSerializer

    def get_queryset(self):
        return User.objects.filter(care_home=self.request.user.care_home)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserSerializer
        return AdminUpdateUserSerializer
