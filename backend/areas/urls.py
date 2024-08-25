from django.urls import path, include
from rest_framework.routers import DefaultRouter
from areas import views
from django.conf.urls.static import static
from django.conf import settings
from .views import PublicationViewSet, PublicationFilterOptions, AreaViewSet

router = DefaultRouter()
router.register(r"datasets", views.DatasetViewSet)
router.register(r"models", views.ModelViewSet)
# Do not register the ToolViewSet with the router, as we need custom routes

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", include(router.urls)),
    # Custom URL pattern for the ToolViewSet to use title for retrieval
    path("tools/", views.ToolViewSet.as_view({"get": "list"}), name="tool-list"),
    path(
        "tools/<str:title>/",
        views.ToolViewSet.as_view({"get": "retrieve"}),
        name="tool-detail",
    ),
    path(
        "pubfilters/",
        PublicationFilterOptions.as_view({"get": "list"}),
        name="pubfilters-list",
    ),
    path(
        "publications/",
        PublicationViewSet.as_view({"get": "list"}),
        name="publication-list",
    ),
    path(
        "area/<str:area>/",
        AreaViewSet.as_view({"get":"list"}),
        name="area-list"
    )
]
# Add static file serving if needed
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)