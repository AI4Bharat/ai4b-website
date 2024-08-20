from django.db import models


class Team(models.TextChoices):
    FOUNDER = 1
    RND = 2
    VISITING = 3
    DATALEAD = 4
    OPERATIONS = 5
    LANGUAGE = 6


def user_directory_path(instance, filename):

    # file will be uploaded to MEDIA_ROOT / user_<id>/<filename>
    return "people/media/{0}/{1}".format(
        instance.first_name + "_" + instance.last_name, filename
    )


# Create your models here.
class Member(models.Model):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    team = models.CharField(max_length=50, choices=Team.choices)
    role = models.CharField(max_length=100)
    photo = models.ImageField(upload_to=user_directory_path)

    def __str__(self):
        return f"{self.first_name}_{self.last_name}"
