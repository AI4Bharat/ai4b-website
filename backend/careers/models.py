from django.db import models
from datetime import date


# Create your models here.
class Job(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    link = models.URLField(max_length=200)
    created_at = models.DateField(default=date.today)

    def __str__(self):
        return f"{self.title}"
