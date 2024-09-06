from rest_framework.serializers import ModelSerializer
from .models import Member


class MemberSerializer(ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "first_name", "last_name", "team", "role","prevRol", "photo", "language"]
