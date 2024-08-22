from django.contrib import admin

# Register your models here.
from .models import Dataset


class DatasetAdmin(admin.ModelAdmin):
    list_filter = ["area"]
    search_fields = ["title"]


admin.site.register(Dataset, DatasetAdmin)
