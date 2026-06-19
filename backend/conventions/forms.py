from __future__ import annotations

from typing import Any

from django import forms
from django.contrib.auth import authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import AbstractBaseUser
from django.db.models import Q

from .models import Convention, User


CONVENTION_FIELDS = (
    "name",
    "start_date",
    "end_date",
    "location",
    "timezone",
    "daily_open_time",
    "daily_close_time",
    "maximum_attendance_capacity",
)


class ConventionWriteForm(forms.ModelForm):
    class Meta:
        model = Convention
        fields = CONVENTION_FIELDS

    def __init__(self, *args, partial: bool = False, **kwargs):
        if partial:
            data = kwargs.get("data")
            if data is None and args:
                data = args[0]

        if partial and isinstance(data, dict):
            merged_data = dict(data)
            instance = kwargs.get("instance")
            if instance is not None:
                for field_name in CONVENTION_FIELDS:
                    if field_name not in merged_data:
                        value: Any = getattr(instance, field_name)
                        merged_data[field_name] = value

            kwargs["data"] = merged_data
            if args:
                args = args[1:]

        super().__init__(*args, **kwargs)
        if partial:
            for field in self.fields.values():
                field.required = False


class UserSignUpForm(UserCreationForm):
    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "name",
            "mobile_phone_number",
            "password1",
            "password2",
        )

    def clean_email(self) -> str:
        email = (self.cleaned_data.get("email") or "").strip()
        if not email:
            raise forms.ValidationError("This field is required.")

        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("A user with that email already exists.")

        return email


class UserSignInForm(forms.Form):
    identifier = forms.CharField(max_length=254)
    password = forms.CharField(widget=forms.PasswordInput)

    def __init__(self, *args, request=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.request = request
        self.user: AbstractBaseUser | None = None

    def clean(self):
        cleaned_data = super().clean()
        identifier = (cleaned_data.get("identifier") or "").strip()
        password = cleaned_data.get("password") or ""

        if not identifier or not password:
            return cleaned_data

        matched_user = User.objects.filter(
            Q(username__iexact=identifier) | Q(email__iexact=identifier)
        ).first()
        auth_username = matched_user.username if matched_user else identifier

        self.user = authenticate(self.request, username=auth_username, password=password)
        if self.user is None:
            raise forms.ValidationError("Invalid credentials.")

        return cleaned_data