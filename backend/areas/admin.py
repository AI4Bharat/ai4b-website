from django.contrib import admin

# Register your models here.
from .models import Dataset,Tool


class DatasetAdmin(admin.ModelAdmin):
    list_filter = ["area"]
    search_fields = ["title"]

class ToolAdmin(admin.ModelAdmin):
    search_fields = ["title"]


admin.site.register(Dataset, DatasetAdmin)
admin.site.register(Tool,ToolAdmin)
