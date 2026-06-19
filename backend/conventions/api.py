from __future__ import annotations

import json
from typing import Any
from zoneinfo import available_timezones

from django.contrib.auth import login, logout
from django.db import IntegrityError
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .forms import CONVENTION_FIELDS, ConventionWriteForm, UserSignInForm, UserSignUpForm
from .models import Convention, User

AUTH_BACKEND_PATH = "conventions.auth_backends.UsernameOrEmailBackend"

DEFAULT_LIMIT = 50
MAX_LIMIT = 200


def serialize_convention(convention: Convention) -> dict[str, Any]:
    return {
        "id": convention.id,
        "name": convention.name,
        "start_date": convention.start_date.isoformat(),
        "end_date": convention.end_date.isoformat(),
        "location": convention.location,
        "timezone": convention.timezone,
        "daily_open_time": convention.daily_open_time.strftime("%H:%M:%S"),
        "daily_close_time": convention.daily_close_time.strftime("%H:%M:%S"),
        "maximum_attendance_capacity": convention.maximum_attendance_capacity,
        "created_at": convention.created_at.isoformat(),
        "updated_at": convention.updated_at.isoformat(),
    }


def serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "mobile_phone_number": user.mobile_phone_number,
        "created_at": user.created_at.isoformat(),
    }


def parse_json_body(request: HttpRequest) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except UnicodeDecodeError:
        return None, error_response({"body": ["Request body must be valid UTF-8."]})
    except json.JSONDecodeError:
        return None, error_response({"body": ["Request body must be valid JSON."]})

    if not isinstance(payload, dict):
        return None, error_response({"body": ["Request body must be a JSON object."]})

    return payload, None


def error_response(errors: dict[str, list[str]], status: int = 400) -> JsonResponse:
    return JsonResponse({"errors": errors}, status=status)


def unknown_field_errors(payload: dict[str, Any], allowed_fields: tuple[str, ...]) -> dict[str, list[str]]:
    unknown_fields = sorted(set(payload) - set(allowed_fields))
    if unknown_fields:
        return {
            "non_field_errors": ["Unknown field(s): " + ", ".join(unknown_fields) + "."]
        }

    return {}


def form_errors_to_dict(form) -> dict[str, list[str]]:
    errors: dict[str, list[str]] = {}
    for field, messages in form.errors.get_json_data().items():
        key = "non_field_errors" if field == "__all__" else field
        errors[key] = [entry["message"] for entry in messages]
    return errors


KNOWN_CONSTRAINT_NAMES = {
    "convention_end_date_on_or_after_start_date",
    "convention_daily_close_after_open",
    "convention_capacity_positive",
}


def save_form(form: ConventionWriteForm) -> tuple[Convention | None, JsonResponse | None]:
    try:
        convention = form.save()
    except IntegrityError as exc:
        error_message = str(exc).lower()
        if any(constraint_name in error_message for constraint_name in KNOWN_CONSTRAINT_NAMES):
            return None, error_response(
                {
                    "non_field_errors": [
                        "Convention data violates a database constraint."
                    ]
                },
                status=409,
            )
        raise

    return convention, None


def parse_non_negative_int(raw_value: str | None, *, field: str) -> tuple[int | None, JsonResponse | None]:
    if raw_value is None:
        return None, None

    try:
        value = int(raw_value)
    except ValueError:
        return None, error_response({field: ["Must be an integer."]})

    if value < 0:
        return None, error_response({field: ["Must be greater than or equal to zero."]})

    return value, None


def parse_pagination(request: HttpRequest) -> tuple[tuple[int, int] | None, JsonResponse | None]:
    offset, error = parse_non_negative_int(request.GET.get("offset"), field="offset")
    if error:
        return None, error

    limit, error = parse_non_negative_int(request.GET.get("limit"), field="limit")
    if error:
        return None, error

    resolved_offset = offset if offset is not None else 0
    resolved_limit = limit if limit is not None else DEFAULT_LIMIT

    if resolved_limit == 0:
        return None, error_response({"limit": ["Must be greater than zero."]})
    if resolved_limit > MAX_LIMIT:
        return None, error_response({"limit": [f"Must be less than or equal to {MAX_LIMIT}."]})

    return (resolved_offset, resolved_limit), None


@csrf_exempt
@require_http_methods(["GET", "POST"])
def convention_collection(request: HttpRequest) -> JsonResponse:
    if request.method == "GET":
        pagination, error = parse_pagination(request)
        if error:
            return error

        offset, limit = pagination or (0, DEFAULT_LIMIT)
        queryset = Convention.objects.all()
        total = queryset.count()
        conventions = queryset[offset : offset + limit]

        return JsonResponse(
            {
                "conventions": [serialize_convention(convention) for convention in conventions],
                "pagination": {
                    "offset": offset,
                    "limit": limit,
                    "total": total,
                },
            }
        )

    payload, error = parse_json_body(request)
    if error:
        return error

    checked_payload = payload or {}

    errors = unknown_field_errors(checked_payload, CONVENTION_FIELDS)
    if errors:
        return error_response(errors)

    form = ConventionWriteForm(data=checked_payload)
    if not form.is_valid():
        return error_response(form_errors_to_dict(form))

    convention, error = save_form(form)
    if error:
        return error

    return JsonResponse({"convention": serialize_convention(convention)}, status=201)


@require_http_methods(["GET"])
def timezone_options(_request: HttpRequest) -> JsonResponse:
    return JsonResponse({"timezones": sorted(available_timezones())})


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH"])
def convention_detail(request: HttpRequest, convention_id: int) -> JsonResponse:
    convention = get_object_or_404(Convention, id=convention_id)

    if request.method == "GET":
        return JsonResponse({"convention": serialize_convention(convention)})

    payload, error = parse_json_body(request)
    if error:
        return error

    checked_payload = payload or {}

    errors = unknown_field_errors(checked_payload, CONVENTION_FIELDS)
    if errors:
        return error_response(errors)

    form = ConventionWriteForm(
        data=checked_payload,
        instance=convention,
        partial=request.method == "PATCH",
    )

    if not form.is_valid():
        return error_response(form_errors_to_dict(form))

    convention, error = save_form(form)
    if error:
        return error

    return JsonResponse({"convention": serialize_convention(convention)})


SIGNUP_FIELDS = (
    "username",
    "email",
    "name",
    "mobile_phone_number",
    "password1",
    "password2",
)

SIGNIN_FIELDS = ("identifier", "password")


@csrf_exempt
@require_http_methods(["POST"])
def auth_signup(request: HttpRequest) -> JsonResponse:
    payload, error = parse_json_body(request)
    if error:
        return error

    checked_payload = payload or {}
    errors = unknown_field_errors(checked_payload, SIGNUP_FIELDS)
    if errors:
        return error_response(errors)

    form = UserSignUpForm(data=checked_payload)
    if not form.is_valid():
        return error_response(form_errors_to_dict(form))

    user = form.save()
    login(request, user, backend=AUTH_BACKEND_PATH)
    return JsonResponse({"user": serialize_user(user)}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def auth_signin(request: HttpRequest) -> JsonResponse:
    payload, error = parse_json_body(request)
    if error:
        return error

    checked_payload = payload or {}
    errors = unknown_field_errors(checked_payload, SIGNIN_FIELDS)
    if errors:
        return error_response(errors)

    form = UserSignInForm(data=checked_payload, request=request)
    if not form.is_valid():
        return error_response(form_errors_to_dict(form))

    user = form.user
    login(request, user)
    return JsonResponse({"user": serialize_user(user)})


@csrf_exempt
@require_http_methods(["POST"])
def auth_signout(request: HttpRequest) -> JsonResponse:
    logout(request)
    return JsonResponse({"signed_out": True})


@require_http_methods(["GET"])
def auth_me(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return error_response({"non_field_errors": ["Authentication required."]}, status=401)

    user = User.objects.get(pk=request.user.pk)
    return JsonResponse({"user": serialize_user(user)})
