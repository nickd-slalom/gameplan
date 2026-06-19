from __future__ import annotations

from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

from .models import User


class UsernameOrEmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = kwargs.get("identifier") or username
        if not identifier or not password:
            return None

        user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()
        if user is None:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
