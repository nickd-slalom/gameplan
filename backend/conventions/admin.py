from django.contrib import admin

from .models import Convention


@admin.register(Convention)
class ConventionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "start_date",
        "end_date",
        "timezone",
        "maximum_attendance_capacity",
    )
    search_fields = ("name", "location")
    list_filter = ("timezone",)
