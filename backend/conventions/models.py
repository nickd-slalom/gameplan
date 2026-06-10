from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.core.exceptions import ValidationError
from django.db import models


class Convention(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.TextField()
    timezone = models.CharField(max_length=64)
    daily_open_time = models.TimeField()
    daily_close_time = models.TimeField()
    maximum_attendance_capacity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "name"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F("start_date")),
                name="convention_end_date_on_or_after_start_date",
            ),
            models.CheckConstraint(
                condition=models.Q(daily_close_time__gt=models.F("daily_open_time")),
                name="convention_daily_close_after_open",
            ),
            models.CheckConstraint(
                condition=models.Q(maximum_attendance_capacity__gt=0),
                name="convention_capacity_positive",
            ),
        ]

    def clean(self) -> None:
        errors = {}

        if self.start_date and self.end_date and self.end_date < self.start_date:
            errors["end_date"] = ["End date must be on or after start date."]

        if (
            self.daily_open_time
            and self.daily_close_time
            and self.daily_close_time <= self.daily_open_time
        ):
            errors["daily_close_time"] = [
                "Daily close time must be after daily open time."
            ]

        if (
            self.maximum_attendance_capacity is not None
            and self.maximum_attendance_capacity <= 0
        ):
            errors["maximum_attendance_capacity"] = [
                "Maximum attendance capacity must be greater than zero."
            ]

        if self.timezone:
            try:
                ZoneInfo(self.timezone)
            except ZoneInfoNotFoundError:
                errors["timezone"] = ["Timezone must be a valid IANA timezone."]

        if errors:
            raise ValidationError(errors)

    def __str__(self) -> str:
        return self.name
