from django.urls import path

from . import api


urlpatterns = [
    path("", api.convention_collection, name="convention_collection"),
    path("<int:convention_id>/", api.convention_detail, name="convention_detail"),
]
