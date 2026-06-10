from __future__ import annotations

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
        super().__init__(*args, **kwargs)
        if partial:
            for field in self.fields.values():
                field.required = False