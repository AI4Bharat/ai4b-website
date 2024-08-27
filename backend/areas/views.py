from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
import requests

# Create your views here.
from .models import Dataset, Tool, Model,News
from rest_framework import viewsets
from .serializers import DatasetSerializer, ToolSerializer, ModelSerializer,NewsSerializer
from rest_framework.decorators import permission_classes
from rest_framework import permissions

from datetime import datetime

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer




class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

    def retrieve(self, request, *args, **kwargs):
        title = kwargs.get("title")
        try:
            model = Model.objects.get(title=title)
        except Model.DoesNotExist:
            raise NotFound("Model with the given title does not exist.")

        serializer = self.get_serializer(model)
        modelData = serializer.data
        hfData = requests.get(f"https://huggingface.co/api/models/{modelData['hf_id']}")
        modelData["hfData"] = hfData.json()
        return Response(modelData)


class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        filtered_data = [
            {
                "id": item["id"],
                "title": item["title"],
                "description": item["description"],
            }
            for item in data
        ]
        return Response(filtered_data)

    def retrieve(self, request, *args, **kwargs):
        title = kwargs.get("title")
        try:
            tool = Tool.objects.get(title=title)
        except Tool.DoesNotExist:
            raise NotFound("Tool with the given title does not exist.")

        serializer = self.get_serializer(tool)
        return Response(serializer.data)


@permission_classes((permissions.AllowAny,))
class PublicationFilterOptions(viewsets.ViewSet):
    def list(self, request, *args, **kwargs):

        areas = []
        years = []
        conferences = []

        areas += Dataset.objects.values_list("area", flat=True).distinct()
        areas += Model.objects.values_list("area", flat=True).distinct()

        conferences += Dataset.objects.values_list("conference", flat=True).distinct()
        conferences += Model.objects.values_list("conference", flat=True).distinct()

        years += Dataset.objects.values_list("published_on", flat=True).distinct()
        years += Model.objects.values_list("published_on", flat=True).distinct()

        years = [x.year for x in years]

        return Response(
            {
                "areas": list(set(areas)),
                "years": list(set(years)),
                "conferences": list(set(conferences)),
            }
        )


@permission_classes((permissions.AllowAny,))
class PublicationViewSet(viewsets.ViewSet):
    def list(self, request, *args, **kwargs):
        datasets = Dataset.objects.all()
        models = Model.objects.all()

        dataset_serializer = DatasetSerializer(datasets, many=True)
        model_serializer = ModelSerializer(models, many=True)

        publications = []
        publications += dataset_serializer.data
        publications += model_serializer.data

        for publication in publications:
            if publication in dataset_serializer.data:
                publication["type"] = "Dataset"
            if publication in model_serializer.data:
                publication["type"] = "Model"

        publications.sort(key=lambda pub: pub.get("published_on"))

        return Response(publications)


@permission_classes((permissions.AllowAny,))
class AreaViewSet(viewsets.ViewSet):
    def list(self, request, *args, **kwargs):
        area = kwargs.get("area")
        datasets = Dataset.objects.filter(area=area)
        models = Model.objects.filter(area=area)

        dataset_serializer = DatasetSerializer(datasets, many=True)
        model_serializer = ModelSerializer(models, many=True)

        publications = []
        publications += dataset_serializer.data
        publications += model_serializer.data

        for publication in publications:
            if publication in dataset_serializer.data:
                publication["type"] = "Dataset"
            if publication in model_serializer.data:
                publication["type"] = "Model"

        publications.sort(key=lambda pub: pub.get("published_on"))

        return Response(publications)
