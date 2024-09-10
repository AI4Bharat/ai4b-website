from rest_framework.serializers import ModelSerializer
from .models import Dataset, Tool, Model,News,ModelFeedback,Publication


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

class ModelFeedbackSerializer(ModelSerializer):
    class Meta:
        model = ModelFeedback
        fields = ['id','serviceId','task','modelInput','modelResponse','comment','liked','postedOn','sourceLanguage','targetLanguage']

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
            "colab_link",
            "website_link",
            "github_link",
            "service_id",
            "hf_link",
            "installation_steps_json",
            "usage_steps_json",
            "testimonials_json",
            "latest"
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

class NewsSerializer(ModelSerializer):
    class Meta:
        model = News
        fields = [
            "id",
            "title",
            "description",
            "published_on",
            "image",
            "related_link",
            "markdown_content"
        ]

class PublicationSerializer(ModelSerializer):
    model = ModelSerializer(many=True)
    dataset = DatasetSerializer(many=True)
    class Meta:
        model = Publication
        fields = [
            "id",
            "title",
            "model",
            "dataset",
        ]


