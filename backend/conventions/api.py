from __future__ import annotations

from datetime import date, time
import json
from typing import Any

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods

from .models import Convention


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

DATE_FIELDS = {"start_date", "end_date"}
TIME_FIELDS = {"daily_open_time", "daily_close_time"}
INTEGER_FIELDS = {"maximum_attendance_capacity"}


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


def parse_json_body(request: HttpRequest) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None, error_response({"body": ["Request body must be valid JSON."]})

    if not isinstance(payload, dict):
        return None, error_response({"body": ["Request body must be a JSON object."]})

    return payload, None


def error_response(errors: dict[str, list[str]], status: int = 400) -> JsonResponse:
    return JsonResponse({"errors": errors}, status=status)


def validation_errors_to_dict(error: ValidationError) -> dict[str, list[str]]:
    if hasattr(error, "message_dict"):
        return {
            field: [str(message) for message in messages]
            for field, messages in error.message_dict.items()
        }

    return {"non_field_errors": [str(message) for message in error.messages]}


def parse_field(field: str, value: Any) -> Any:
    if field in DATE_FIELDS:
        if not isinstance(value, str):
            raise ValueError("Must be a date string in YYYY-MM-DD format.")
        return date.fromisoformat(value)

    if field in TIME_FIELDS:
        if not isinstance(value, str):
            raise ValueError("Must be a time string in HH:MM or HH:MM:SS format.")
        return time.fromisoformat(value)

    if field in INTEGER_FIELDS:
        if isinstance(value, bool):
            raise ValueError("Must be an integer.")
        return int(value)

    if not isinstance(value, str):
        raise ValueError("Must be a string.")

    return value.strip()


def convention_attrs_from_payload(
    payload: dict[str, Any], *, partial: bool
) -> tuple[dict[str, Any], dict[str, list[str]]]:
    attrs: dict[str, Any] = {}
    errors: dict[str, list[str]] = {}

    unknown_fields = sorted(set(payload) - set(CONVENTION_FIELDS))
    if unknown_fields:
        errors["non_field_errors"] = [
            "Unknown field(s): " + ", ".join(unknown_fields) + "."
        ]

    if not partial:
        for field in CONVENTION_FIELDS:
            if field not in payload:
                errors.setdefault(field, []).append("This field is required.")

    for field in CONVENTION_FIELDS:
        if field not in payload:
            continue
        try:
            attrs[field] = parse_field(field, payload[field])
        except (TypeError, ValueError):
            if field in DATE_FIELDS:
                message = "Must be a date string in YYYY-MM-DD format."
            elif field in TIME_FIELDS:
                message = "Must be a time string in HH:MM or HH:MM:SS format."
            elif field in INTEGER_FIELDS:
                message = "Must be an integer."
            else:
                message = "Must be a string."
            errors.setdefault(field, []).append(message)

    return attrs, errors


def save_convention(convention: Convention) -> tuple[Convention | None, JsonResponse | None]:
    try:
        convention.full_clean()
        convention.save()
    except ValidationError as error:
        return None, error_response(validation_errors_to_dict(error))
    except IntegrityError:
        return None, error_response(
            {"non_field_errors": ["Convention could not be saved."]},
            status=409,
        )

    return convention, None


@require_http_methods(["GET", "POST"])
def convention_collection(request: HttpRequest) -> JsonResponse:
    if request.method == "GET":
        conventions = Convention.objects.all()
        return JsonResponse(
            {"conventions": [serialize_convention(convention) for convention in conventions]}
        )

    payload, error = parse_json_body(request)
    if error:
        return error

    attrs, errors = convention_attrs_from_payload(payload or {}, partial=False)
    if errors:
        return error_response(errors)

    convention, error = save_convention(Convention(**attrs))
    if error:
        return error

    return JsonResponse({"convention": serialize_convention(convention)}, status=201)


@require_http_methods(["GET", "PUT", "PATCH"])
def convention_detail(request: HttpRequest, convention_id: int) -> JsonResponse:
    convention = get_object_or_404(Convention, id=convention_id)

    if request.method == "GET":
        return JsonResponse({"convention": serialize_convention(convention)})

    payload, error = parse_json_body(request)
    if error:
        return error

    attrs, errors = convention_attrs_from_payload(
        payload or {}, partial=request.method == "PATCH"
    )
    if errors:
        return error_response(errors)

    for field, value in attrs.items():
        setattr(convention, field, value)

    convention, error = save_convention(convention)
    if error:
        return error

    return JsonResponse({"convention": serialize_convention(convention)})
