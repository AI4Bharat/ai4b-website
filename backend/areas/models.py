from django.db import models
from datetime import date
from django.dispatch import receiver
import os
import github
from dotenv import load_dotenv

load_dotenv(dotenv_path="/home/ai4bharat/ai4b-website/backend/.env")


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
    hf_link = models.URLField(max_length=500,null=True,blank=True)

    def __str__(self) -> str:
        return f"{self.title}"


class Model(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    area = models.CharField(choices=Area.choices, max_length=10)
    published_on = models.DateField(default=date.today)
    latest = models.BooleanField(default=False)
    conference = models.CharField(max_length=20, null=True, blank=True)
    description = models.TextField()
    paper_link = models.URLField(max_length=500,null=True,blank=True)
    website_link = models.URLField(max_length=500, null=True, blank=True)
    github_link = models.URLField(max_length=500,null=True,blank=True)
    colab_link = models.URLField(max_length=500,null=True,blank=True)
    hf_link = models.URLField(max_length=500,null=True,blank=True)
    service_id = models.CharField(max_length=500, null=True, blank=True)
    installation_steps_json = models.JSONField(null=True,blank=True)
    usage_steps_json = models.JSONField(null=True,blank=True)
    testimonials_json = models.JSONField(null=True,blank=True)

    def __str__(self) -> str:
        return f"{self.title}"
    
@receiver(models.signals.post_save, sender=Model)
def execute_after_model_save(sender, instance, created, *args, **kwargs):
    g = github.Github(login_or_token=os.getenv("GITHUB_WORKFLOW_TOKEN"))
    repo = g.get_repo("AI4Bharat/ai4b-website")
    workflow_name = "nextjs.yml"
    workflow = repo.get_workflow(workflow_name)
    ref = repo.get_branch("master")
    workflow.create_dispatch(ref=ref)
    print("New Model Deploy Triggered")
    


class Tool(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    main_video_hyperlink = models.URLField(max_length=500)
    hyperlink_buttons_json = models.JSONField()
    release_timeline_json = models.JSONField()
    feature_cards_json = models.JSONField()
    contributor_cards_json = models.JSONField()
    installation_steps_json = models.JSONField(null=True,blank=True)

    def __str__(self) -> str:
        return f"{self.title}"
    
@receiver(models.signals.post_save, sender=Tool)
def execute_after_tool_save(sender, instance, created, *args, **kwargs):
    if created:
        g = github.Github(login_or_token=os.getenv("GITHUB_WORKFLOW_TOKEN"))
        repo = g.get_repo("AI4Bharat/ai4b-website")
        workflow_name = "nextjs.yml"
        workflow = repo.get_workflow(workflow_name)
        ref = repo.get_branch("master")
        workflow.create_dispatch(ref=ref)
        print("New Tool Deploy Triggered")
    else:
        print("Tool Updated")
    

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
