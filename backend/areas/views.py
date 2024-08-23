from django.shortcuts import render

# Create your views here.
from .models import Dataset,Tool
from rest_framework import viewsets
from .serializers import DatasetSerializer,ToolSerializer


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer

class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer

