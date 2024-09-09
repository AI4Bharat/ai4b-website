from django.contrib import admin

# Register your models here.
from .models import Dataset, Tool, Model,News,ModelFeedback

from import_export import resources

from import_export.admin import ImportExportModelAdmin

class FeedbackResource(resources.ModelResource):

    class Meta:
        model = ModelFeedback


class NewsAdmin(admin.ModelAdmin):
    search_fields=["title"]

class ModelFeedbackAdmin(ImportExportModelAdmin):
    resource_classes = [FeedbackResource]
    list_filter = ["task", "serviceId","postedOn"]
    search_fields = ["serviceId"]

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
admin.site.register(News,NewsAdmin)
admin.site.register(ModelFeedback,ModelFeedbackAdmin)
