from rest_framework.serializers import ModelSerializer
from .models import Dataset


class DatasetSerializer(ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id",
            "title",
            "area",
            "description",
            "paper_link",
            "website_link",
            "github_link",
            "hf_link",
        ]
