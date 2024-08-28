from django.shortcuts import render

from .models import Member
from rest_framework import viewsets
from .serializers import MemberSerializer
from django_filters.rest_framework import DjangoFilterBackend


class MemberViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing accounts.
    """

    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["language", "team"]
