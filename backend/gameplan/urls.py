"""URL configuration for the Gameplan project."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/", include("conventions.auth_urls")),
    path("api/conventions/", include("conventions.urls")),
]
