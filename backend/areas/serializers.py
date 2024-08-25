from rest_framework.serializers import ModelSerializer
from .models import Dataset, Tool, Model


class DatasetSerializer(ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            "id",
            "title",
            "area",
            "published_on",
            "conference",
            "description",
            "paper_link",
            "website_link",
            "github_link",
            "hf_link",
        ]


class ModelSerializer(ModelSerializer):
    class Meta:
        model = Model
        fields = [
            "id",
            "title",
            "area",
            "published_on",
            "conference",
            "description",
            "paper_link",
            "website_link",
            "github_link",
            "hf_link",
        ]


class ToolSerializer(ModelSerializer):
    class Meta:
        model = Tool
        fields = [
            "id",
            "title",
            "description",
            "main_video_hyperlink",
            "hyperlink_buttons_json",
            "release_timeline_json",
            "feature_cards_json",
            "contributor_cards_json",
            "installation_steps_json",
        ]
