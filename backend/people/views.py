from django.shortcuts import render
from rest_framework.response import Response

from .models import Member
from rest_framework import viewsets
from .serializers import MemberSerializer
from django_filters.rest_framework import DjangoFilterBackend

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page


class MemberViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing accounts.
    """

    queryset = Member.objects.all()
    serializer_class = MemberSerializer

    @method_decorator(cache_page(60*15))
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        members = serializer.data
        return Response(members)
