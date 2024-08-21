from django.urls import path, include
from rest_framework.routers import DefaultRouter
from people import views
from django.conf.urls.static import static
from django.conf import settings

router = DefaultRouter()
router.register(r"member", views.MemberViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
