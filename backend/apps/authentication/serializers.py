from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import User

# Cura is a staff-only platform for now — next-of-kin/family accounts exist in
# the data model (FamilyContact, role="family") but can't sign in until a
# proper family portal is built, and staff-management endpoints shouldn't be
# able to create/promote one either. Single source of truth, reused by the
# login gate below and by the two admin-facing user serializers.
STAFF_ROLES = (User.Role.ADMIN, User.Role.MANAGER, User.Role.NURSE, User.Role.CARER, User.Role.HR)
STAFF_ROLE_CHOICES = [(r.value, r.label) for r in STAFF_ROLES]

# admin and manager both hold staff.manage (see permissions.py), so both can
# reach the create/update-user endpoints — but only an admin may grant either
# of those two roles themselves, so a manager can't hand out admin/manager
# access (to themselves or anyone else) via this endpoint.
PRIVILEGED_ROLES = {User.Role.ADMIN, User.Role.MANAGER}


def _check_role_grant(role, request):
    if role in PRIVILEGED_ROLES and request.user.role != User.Role.ADMIN:
        raise serializers.ValidationError("Only an admin can assign the admin or manager role.")


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name", "role", "phone", "avatar", "care_home", "is_group_admin"]
        read_only_fields = ["id", "is_group_admin"]

    def get_full_name(self, obj):
        return obj.get_full_name()


class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # Overrides the model field's auto-generated ChoiceField: the model allows
    # role="family" too (for FamilyContact logins), but this endpoint creates
    # staff accounts only, and the role must be explicit — no more silently
    # falling back to the model's default of "carer" when omitted.
    role = serializers.ChoiceField(choices=STAFF_ROLE_CHOICES)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "role", "phone"]

    def validate_role(self, value):
        _check_role_grant(value, self.context["request"])
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    # required=False: role isn't mandatory on every PATCH, but if it IS given
    # it must be a real staff role — same reasoning as AdminCreateUserSerializer.
    role = serializers.ChoiceField(choices=STAFF_ROLE_CHOICES, required=False)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "role", "phone", "password", "is_active"]

    def validate_role(self, value):
        _check_role_grant(value, self.context["request"])
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CuraTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.role not in STAFF_ROLES:
            raise AuthenticationFailed("This account type cannot sign in to Cura yet.")
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.get_full_name()
        return token
