from django.urls import path, include
from rest_framework.routers import DefaultRouter
from careers import views
from django.conf.urls.static import static
from django.conf import settings

router = DefaultRouter()
router.register(r"careers", views.JobViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", include(router.urls)),
]
