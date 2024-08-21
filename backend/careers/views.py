from django.shortcuts import render

from .models import Job
from rest_framework import viewsets
from .serializers import JobSerializer


class JobViewSet(viewsets.ModelViewSet):

    queryset = Job.objects.all()
    serializer_class = JobSerializer


# Create your views here.
