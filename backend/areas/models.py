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
    description = models.TextField()
    paper_link = models.URLField(max_length=500)
    website_link = models.URLField(max_length=500)
    github_link = models.URLField(max_length=500)
    hf_link = models.URLField(max_length=500)

    def __str__(self) -> str:
        return f"{self.title}"
