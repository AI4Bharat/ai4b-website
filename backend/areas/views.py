from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
import requests
import base64 
import ffmpeg
import subprocess

# Create your views here.
from .models import Dataset, Tool, Model,News
from rest_framework import viewsets,status
from .serializers import DatasetSerializer, ToolSerializer, ModelSerializer,NewsSerializer
from rest_framework.decorators import permission_classes
from rest_framework import permissions

from rest_framework.views import APIView

DHRUVA_MODEL_VIEW_URL = "https://api.dhruva.ekstep.ai/services/details/view_service"
DHRUVA_API_KEY = "0aaef7ff-86f3-4bb0-a30b-9f50f3de1a52"


@permission_classes((permissions.AllowAny,))
class InferenceView(APIView):
    def post(self, request, format=None):
        body = request.data
        task = body["task"]
        if task=="transliteration":
            INFERENCE_API = "https://api.dhruva.ekstep.ai/services/inference/transliteration"
            inferenceResult = requests.post(INFERENCE_API,headers=
                                       {'x-auth-source': 'API_KEY',
                                        'Authorization': DHRUVA_API_KEY},
                                        json={
                                                "controlConfig": {
                                                    "dataTracking": True
                                                },
                                                "config": {
                                                    "serviceId": body["serviceId"],
                                                    "language": {
                                                    "sourceLanguage": body["sourceLanguage"],
                                                    "sourceScriptCode": "",
                                                    "targetLanguage": body["targetLanguage"],
                                                    "targetScriptCode": ""
                                                    },
                                                    "isSentence": True,
                                                    "numSuggestions": 0
                                                },
                                                "input": [
                                                    {
                                                    "source": body["input"]
                                                    }
                                                ]
                                                })
            return Response(inferenceResult.json(),status=status.HTTP_200_OK)
        
        elif task=="translation":
            INFERENCE_API = "https://api.dhruva.ekstep.ai/services/inference/translation"
            inferenceResult = requests.post(INFERENCE_API,headers=
                                       {'x-auth-source': 'API_KEY',
                                        'Authorization': DHRUVA_API_KEY},
                                        json={
                                                "controlConfig": {
                                                    "dataTracking": True
                                                },
                                                "config": {
                                                    "serviceId": body["serviceId"],
                                                    "language": {
                                                    "sourceLanguage": body["sourceLanguage"],
                                                    "sourceScriptCode": "",
                                                    "targetLanguage": body["targetLanguage"],
                                                    "targetScriptCode": ""
                                                    }
                                                },
                                                "input": [
                                                    {
                                                    "source": body["input"]
                                                    }
                                                ]
                                                })
            return Response(inferenceResult.json(),status=status.HTTP_200_OK)
        
        elif task == "tts":
            INFERENCE_API = "https://api.dhruva.ekstep.ai/services/inference/tts"

            inferenceResult = requests.post(INFERENCE_API,headers=
                                       {'x-auth-source': 'API_KEY',
                                        'Authorization': DHRUVA_API_KEY},
                                        json={
                                                "controlConfig": {
                                                    "dataTracking": True
                                                },
                                                "config": {
                                                    "serviceId": body["serviceId"],
                                                    "gender": body["gender"],
                                                    "samplingRate": body["samplingRate"],
                                                    "audioFormat": "wav",
                                                    "language": {
                                                    "sourceLanguage": body["sourceLanguage"],
                                                    "sourceScriptCode": ""
                                                    }
                                                },
                                                "input": [
                                                    {
                                                    "source": body["input"],
                                                    "audioDuration": 0
                                                    }
                                                ]
                                                })
            
            return Response(inferenceResult.json(),status=status.HTTP_200_OK)


        
        elif task == "asr":

            INFERENCE_API = "https://api.dhruva.ekstep.ai/services/inference/asr"

            webm_base64 = body["audioContent"]
            webm_data = base64.b64decode(webm_base64)

            with open("/tmp/temp.webm", "wb") as webm_file:
                webm_file.write(webm_data)

            subprocess.run(["ffmpeg","-y", "-i", "/tmp/temp.webm", "/tmp/temp.wav"], check=True)

            with open("/tmp/temp.wav", "rb") as wav_file:
                wav_data = wav_file.read()
                wav_base64 = base64.b64encode(wav_data).decode('utf-8')


            inferenceResult = requests.post(INFERENCE_API,headers=
                                       {'x-auth-source': 'API_KEY',
                                        'Authorization': DHRUVA_API_KEY},
                                        json={
                                                "controlConfig": {
                                                    "dataTracking": True
                                                },
                                                "config": {
                                                    "audioFormat": "wav",
                                                    "language": {
                                                    "sourceLanguage": body["sourceLanguage"],
                                                    "sourceScriptCode": ""
                                                    },
                                                    "encoding": "wav",
                                                    "samplingRate": body["samplingRate"],
                                                    "serviceId": body["serviceId"],
                                                    "preProcessors": body["preProcessors"],
                                                    "postProcessors": body["postProcessors"],
                                                    "transcriptionFormat": {
                                                    "value": "transcript"
                                                    },
                                                    "bestTokenCount": 0
                                                },
                                                "audio": [
                                                    {
                                                    "audioContent": wav_base64,
                                                    }
                                                ]
                                            }
                                            )
            return Response(inferenceResult.json(),status=status.HTTP_200_OK)

            

        


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
        hfData = {}
        if modelData["hf_id"]!=None:
            hfData = requests.get(f"https://huggingface.co/api/models/{modelData['hf_id']}")
            hfData = hfData.json()

        if "service_id" in modelData and modelData["service_id"]!=None:
            serviceId = modelData["service_id"]
            modelData["services"] = {}
            if "," not in serviceId:
                dhruvaModelData = requests.post(DHRUVA_MODEL_VIEW_URL,
                                        headers=
                                        {'x-auth-source': 'API_KEY',
                                            'Authorization': DHRUVA_API_KEY},
                                            json={'serviceId':serviceId}).json()["model"]
            
                languages = dhruvaModelData["languages"]

                sourceLanguages = list(set([x["sourceLanguage"] for x in languages]))
                if "targetLanguage" in languages[0]:
                    targetLanguages = list(set([x["targetLanguage"] for x in languages]))
                else:
                    targetLanguages = []

                modelData["services"][serviceId] = {"service_id":serviceId,"languageFilters":{"sourceLanguages":sourceLanguages,"targetLanguages":targetLanguages}}
            else:
                serviceIds = modelData["service_id"].split(",")
                services = {}
                for serviceId in serviceIds:
                    serviceData = {"service_id":serviceId}

                    dhruvaModelData = requests.post(DHRUVA_MODEL_VIEW_URL,
                                        headers=
                                        {'x-auth-source': 'API_KEY',
                                            'Authorization': DHRUVA_API_KEY},
                                            json={'serviceId':serviceId}).json()["model"]
            
                    languages = dhruvaModelData["languages"]

                    sourceLanguages = list(set([x["sourceLanguage"] for x in languages]))
                    if "targetLanguage" in languages[0]:
                        targetLanguages = list(set([x["targetLanguage"] for x in languages]))
                    else:
                        targetLanguages = []

                    serviceData["languageFilters"] = {"sourceLanguages":sourceLanguages,"targetLanguages":targetLanguages}
                    services[serviceId] = serviceData
                modelData["services"] = services

        modelData["hfData"] = hfData
       
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

        publications.sort(key=lambda pub: pub.get("published_on"),reverse=True)

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

        publications.sort(key=lambda pub: pub.get("published_on"),reverse=True)


        return Response(publications)
    

