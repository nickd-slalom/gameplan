from django.urls import path

from . import api


urlpatterns = [
    path("signup/", api.auth_signup, name="auth_signup"),
    path("signin/", api.auth_signin, name="auth_signin"),
    path("signout/", api.auth_signout, name="auth_signout"),
    path("me/", api.auth_me, name="auth_me"),
]
