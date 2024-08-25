from django.contrib import admin

# Register your models here.
from .models import Dataset, Tool, Model


class DatasetAdmin(admin.ModelAdmin):
    list_filter = ["area", "conference"]
    search_fields = ["title"]


class ModelAdmin(admin.ModelAdmin):
    list_filter = ["area", "conference"]
    search_fields = ["title"]


class ToolAdmin(admin.ModelAdmin):
    search_fields = ["title"]


admin.site.register(Dataset, DatasetAdmin)
admin.site.register(Tool, ToolAdmin)
admin.site.register(Model, ModelAdmin)
