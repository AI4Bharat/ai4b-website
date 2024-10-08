from django.db import models
import datetime
from django.core.validators import MaxValueValidator, MinValueValidator

class Team(models.TextChoices):
    FOUNDER = 1
    RND = 2
    VISITING = 3
    DATALEAD = 4
    OPERATIONS = 5
    ALUMNI = 6
    LANGUAGE = 7

class Role(models.TextChoices):
    PHD = "PhD"
    MS = "MS"
    MTECH = "MTech"
    BTECH = "BTech"
    DUAL = "Dual Degree"
    RESEARCH = "Research"
    DEVELOPMENT = "Development"


class Language(models.TextChoices):
    ASSAMESE = "as", "Assamese"
    BENGALI = "bn", "Bengali"
    BODO = "br", "Bodo"
    DOGRI = "doi", "Dogri"
    GUJARATI = "gu", "Gujarati"
    HINDI = "hi", "Hindi"
    KANNADA = "kn", "Kannada"
    KASHMIRI = "ks", "Kashmiri"
    KONKANI = "kok", "Konkani"
    MAITHILI = "mai", "Maithili"
    MALAYALAM = "ml", "Malayalam"
    MANIPURI = "mni", "Manipuri"
    MARATHI = "mr", "Marathi"
    NEPALI = "ne", "Nepali"
    ODIA = "or", "Odia"
    PUNJABI = "pa", "Punjabi"
    SANSKRIT = "sa", "Sanskrit"
    SANTALI = "sat", "Santali"
    SINDHI = "sd", "Sindhi"
    TAMIL = "ta", "Tamil"
    TELUGU = "te", "Telugu"
    URDU = "ur", "Urdu"


def user_directory_path(instance, filename):

    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    return "people/{0}/{1}".format(
        instance.first_name + "_" + instance.last_name, filename
    )

def current_year():
    return datetime.date.today().year

def max_value_current_year(value):
    return MaxValueValidator(current_year())(value)  

def year_choices():
    return [(r,r) for r in range(1984, datetime.date.today().year+1)]


# Create your models here.
class Member(models.Model):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    team = models.CharField(max_length=50, choices=Team.choices)
    role = models.CharField(max_length=100)
    prevRol = models.CharField(max_length=20,choices=Role.choices,null=True,blank=True)
    gradYear = models.IntegerField(choices=year_choices(), validators=[MinValueValidator(1984), max_value_current_year],null=True,blank=True)
    photo = models.ImageField(upload_to=user_directory_path,null=True,blank=True)
    language = models.CharField(
        max_length=50, choices=Language.choices, null=True, blank=True
    )

    def __str__(self):
        return f"{self.first_name}_{self.last_name}"
