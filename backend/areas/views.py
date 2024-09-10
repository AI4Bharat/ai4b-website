from rest_framework.response import Response
from rest_framework.exceptions import NotFound

import hashlib

import os
import requests
import base64 
import subprocess

# Create your views here.
from .models import Dataset, Tool, Model,News,ModelFeedback,Publication
from rest_framework import viewsets,status
from .serializers import DatasetSerializer, ToolSerializer, ModelSerializer,NewsSerializer,ModelFeedbackSerializer,PublicationSerializer
from rest_framework.decorators import permission_classes
from rest_framework import permissions
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.decorators import api_view

import uuid

from dotenv import load_dotenv

load_dotenv()

def fetchDhruvaServiceInfo(serviceId):
    try:
        dhruvaServiceInfo = requests.post(os.getenv("DHRUVA_MODEL_VIEW_URL"),
                                        headers=
                                        {'x-auth-source': 'API_KEY',
                                            'Authorization': os.getenv('DHRUVA_API_KEY')},
                                            json={'serviceId':serviceId},timeout=3)
        if dhruvaServiceInfo.status_code!=200:
            return {}
        else:
            return dhruvaServiceInfo.json()["model"]
    except:
        return {}

## Inference Views
@ratelimit(key='ip', rate='30/m', method='POST')
@api_view(["POST"])
@permission_classes((permissions.AllowAny,))
def translate(request):
    body = request.data
    inferenceResult = requests.post(os.getenv("DHRUVA_TRANSLATION_ENDPOINT"),headers=
                                       {'x-auth-source': 'API_KEY',
                                        'Authorization': os.getenv('DHRUVA_API_KEY')},
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
    if inferenceResult.status_code!=200:
        return Response({"message":"Inference Failed"},status=status.HTTP_503_SERVICE_UNAVAILABLE)
    else:
        return Response(inferenceResult.json(),status=status.HTTP_200_OK)
    


@ratelimit(key='ip', rate='50/m', method='POST')
@api_view(["POST"])
@permission_classes((permissions.AllowAny,))
def transcribe(request):

    body = request.data

    webm_base64 = body["audioContent"]
    webm_data = base64.b64decode(webm_base64)

    webmUUID = uuid.uuid4()
    wavUUID = uuid.uuid4()

    webmPath = f"/tmp/{webmUUID}.webm"
    wavPath = f"/tmp/{wavUUID}.wav"

    with open(webmPath, "wb") as webm_file:
        webm_file.write(webm_data)

    subprocess.run(["ffmpeg","-y", "-i", webmPath, wavPath], check=True)

    with open(wavPath, "rb") as wav_file:
        wav_data = wav_file.read()
        wav_base64 = base64.b64encode(wav_data).decode('utf-8')


    inferenceResult = requests.post(os.getenv("DHRUVA_ASR_ENDPOINT"),headers=
                                {'x-auth-source': 'API_KEY',
                                'Authorization': os.getenv('DHRUVA_API_KEY')},
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
                                            "domain":body["domain"],
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
    os.remove(webmPath)
    os.remove(wavPath)
    if inferenceResult.status_code!=200:
        return Response({"message":"Inference Failed"},status=status.HTTP_503_SERVICE_UNAVAILABLE)
    else:
        return Response(inferenceResult.json(),status=status.HTTP_200_OK)
    

@ratelimit(key='ip', rate='30/m', method='POST')
@api_view(["POST"])
@permission_classes((permissions.AllowAny,))
def convertToAudio(request):

    body = request.data
    inferenceResult = requests.post(os.getenv("DHRUVA_TTS_ENDPOINT"),headers=
                                       {'x-auth-source': 'API_KEY',
                                        'Authorization': os.getenv('DHRUVA_API_KEY')},
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
    if inferenceResult.status_code!=200:
        return Response({"message":"Inference Failed"},status=status.HTTP_503_SERVICE_UNAVAILABLE)
    else:
        return Response(inferenceResult.json(),status=status.HTTP_200_OK)

    

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer

class PubViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer

def val2Bool(val):
    if val=="true":
        return True
    elif val=="false":
        return False

@permission_classes((permissions.AllowAny,))
class ModelFeedbackViewSet(viewsets.ModelViewSet):
    queryset = ModelFeedback.objects.all()
    serializer_class = ModelFeedbackSerializer

    def create(self, request, *args, **kwargs):
        body = request.data
        task = body["task"]

        modelInput = body["modelInput"]
        modelResponse = body["modelResponse"]

        if task=="asr":
            webm_base64 = modelInput
            webm_data = base64.b64decode(webm_base64)

            webmUUID = uuid.uuid4()
            wavUUID = uuid.uuid4()

            webmPath = f"/tmp/{webmUUID}.webm"
            wavPath = f"/tmp/{wavUUID}.wav"

            with open(webmPath, "wb") as webm_file:
                webm_file.write(webm_data)

            subprocess.run(["ffmpeg","-y", "-i", webmPath, wavPath], check=True)

            with open(wavPath, "rb") as wav_file:
                wav_data = wav_file.read()
                wav_base64 = base64.b64encode(wav_data).decode('utf-8')

            modelInput = hashlib.sha256(wav_base64.encode())
            modelInput = modelInput.hexdigest()

        elif task=="tts":

            modelResponse = hashlib.sha256(modelResponse.encode())
            modelResponse = modelResponse.hexdigest()

        feedback = ModelFeedback(serviceId = body["serviceId"],task=task,modelInput=modelInput,modelResponse=modelResponse,liked=val2Bool(body["liked"]),comment=body["comment"])
        feedback.save()

        return Response({"message":"Submitted Feedback"},status=status.HTTP_201_CREATED)
        
            




class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer

    @method_decorator(cache_page(60*15))
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        datasets = serializer.data
        datasets.sort(key=lambda dataset: dataset.get("area"))
        return Response(datasets)

class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    
    @method_decorator(cache_page(60*15))
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        models = serializer.data
        return Response(models)

    def retrieve(self, request, *args, **kwargs):

        

        title = kwargs.get("title")
        try:
            model = Model.objects.get(title=title)
        except Model.DoesNotExist:
            return Response({"message":"Model Not found"},status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(model)

        modelData = serializer.data

        modelData["type"] = "Model" 

        hfData = None
        if modelData["hf_link"]!=None:
            hf_link = modelData["hf_link"]
            if "collections" in hf_link:
                hf_link = hf_link.replace("https://huggingface.co/collections/","https://huggingface.co/api/collections/")
                response = requests.get(hf_link)
                items = response.json()["items"]
                downloads = sum([item["downloads"] for item in items])
                hfData = {'downloads':downloads}
            

            else:
                hf_link = hf_link.replace("https://huggingface.co/","https://huggingface.co/api/models/")
                hfData = requests.get(hf_link)
                hfData = hfData.json()

        modelData["hfData"] = hfData
        modelData["services"] = {}

        if modelData["service_id"] != None:

            serviceIds = modelData["service_id"].split(",")

            if len(serviceIds)==1:

                serviceId = serviceIds[0]

                dhruvaServiceData = fetchDhruvaServiceInfo(serviceId=serviceId)

                sourceLanguages = []
                targetLanguages = []

                modelData["services"][serviceId] = {"service_id":serviceId,"languageFilters":{"sourceLanguages":sourceLanguages,"targetLanguages":targetLanguages}}

                if dhruvaServiceData!={}:

                    languages = dhruvaServiceData["languages"]

                    sourceLanguages = list(set([x["sourceLanguage"] for x in languages]))
                    if "targetLanguage" in languages[0]:
                        targetLanguages = list(set([x["targetLanguage"] for x in languages]))
                    else:
                        targetLanguages = []

                    modelData["services"][serviceId] = {"service_id":serviceId,"languageFilters":{"sourceLanguages":sourceLanguages,"targetLanguages":targetLanguages}}
            
            else:

                for serviceId in serviceIds:

                    dhruvaServiceData = fetchDhruvaServiceInfo(serviceId=serviceId)

                    sourceLanguages = []
                    targetLanguages = []

                    modelData["services"][serviceId] = {"service_id":serviceId,"languageFilters":{"sourceLanguages":sourceLanguages,"targetLanguages":targetLanguages}}

                    if dhruvaServiceData!={}:

                        languages = dhruvaServiceData["languages"]

                        sourceLanguages = list(set([x["sourceLanguage"] for x in languages]))
                        if "targetLanguage" in languages[0]:
                            targetLanguages = list(set([x["targetLanguage"] for x in languages]))
                        else:
                            targetLanguages = []

                        modelData["services"][serviceId] = {"service_id":serviceId,"languageFilters":{"sourceLanguages":sourceLanguages,"targetLanguages":targetLanguages}}
                
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
        conferences = [x for x in conferences if x!=None]

        years += Dataset.objects.values_list("published_on", flat=True).distinct()
        years += Model.objects.values_list("published_on", flat=True).distinct()
        years = [x.year for x in years]
        years = sorted(list(set(years)))
        years = [str(x) for x in years]

        return Response(
            {
                "areas": list(set(areas)),
                "years": years,
                "conferences": list(set(conferences)),
            }
        )


@permission_classes((permissions.AllowAny,))
class PublicationViewSet(viewsets.ViewSet):
    @method_decorator(cache_page(60*15))
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
    
    

