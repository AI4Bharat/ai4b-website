from django.db import models
from datetime import date


class Area(models.TextChoices):
    ASR = "ASR"
    NMT = "NMT"
    TTS = "TTS"
    OCR = "OCR"
    LLM = "LLM"


# Create your models here.
class Dataset(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    area = models.CharField(choices=Area.choices, max_length=3)
    published_on = models.DateField(default=date.today)
    conference = models.CharField(max_length=10, null=True, blank=True)
    description = models.TextField()
    paper_link = models.URLField(max_length=500)
    website_link = models.URLField(max_length=500, null=True, blank=True)
    github_link = models.URLField(max_length=500)
    hf_link = models.URLField(max_length=500)

    def __str__(self) -> str:
        return f"{self.title}"


class Model(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    area = models.CharField(choices=Area.choices, max_length=3)
    published_on = models.DateField(default=date.today)
    conference = models.CharField(max_length=10, null=True, blank=True)
    description = models.TextField()
    paper_link = models.URLField(max_length=500)
    website_link = models.URLField(max_length=500, null=True, blank=True)
    github_link = models.URLField(max_length=500)
    hf_link = models.URLField(max_length=500)
    api_link = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self) -> str:
        return f"{self.title}"


class Tool(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    main_video_hyperlink = models.URLField(max_length=500)
    hyperlink_buttons_json = models.JSONField()
    release_timeline_json = models.JSONField()
    feature_cards_json = models.JSONField()
    contributor_cards_json = models.JSONField()
    installation_steps_json = models.JSONField()

    def __str__(self) -> str:
        return f"{self.title}"
