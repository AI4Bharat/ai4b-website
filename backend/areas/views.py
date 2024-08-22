from django.shortcuts import render

# Create your views here.
from .models import Dataset
from rest_framework import viewsets
from .serializers import DatasetSerializer


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
