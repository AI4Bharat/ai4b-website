from django.db import models
from datetime import date



class Area(models.TextChoices):
    ASR = "ASR"
    NMT = "NMT"
    TTS = "TTS"
    XLIT = "XLIT"
    LLM = "LLM"


# Create your models here.
class Dataset(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    area = models.CharField(choices=Area.choices, max_length=10)
    published_on = models.DateField(default=date.today)
    conference = models.CharField(max_length=20, null=True, blank=True)
    description = models.TextField()
    paper_link = models.URLField(max_length=500)
    website_link = models.URLField(max_length=500, null=True, blank=True)
    github_link = models.URLField(max_length=500,null=True,blank=True)
    hf_id = models.CharField(max_length=500,null=True,blank=True)

    def __str__(self) -> str:
        return f"{self.title}"


class Model(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    area = models.CharField(choices=Area.choices, max_length=10)
    published_on = models.DateField(default=date.today)
    conference = models.CharField(max_length=20, null=True, blank=True)
    description = models.TextField()
    paper_link = models.URLField(max_length=500)
    website_link = models.URLField(max_length=500, null=True, blank=True)
    github_link = models.URLField(max_length=500,null=True,blank=True)
    colab_link = models.URLField(max_length=500,null=True,blank=True)
    hf_id = models.CharField(max_length=500,null=True,blank=True)
    service_id = models.CharField(max_length=500, null=True, blank=True)
    installation_steps_json = models.JSONField(null=True,blank=True)
    usage_steps_json = models.JSONField(null=True,blank=True)
    testimonials_json = models.JSONField(null=True,blank=True)

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
    

def image_directory_path(instance, filename):

    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    return "images/{0}/{1}".format(
        instance.title, filename
    )

class News(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    published_on = models.DateField(default=date.today)
    image = models.ImageField(upload_to=image_directory_path,null=True,blank=True)
    related_link = models.URLField(max_length=500, null=True, blank=True)
    markdown_content = models.TextField(null=True,blank=True)

    def __str__(self) -> str:
        return f"{self.title}"
