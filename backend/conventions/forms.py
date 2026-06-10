from __future__ import annotations

from typing import Any

from django import forms

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