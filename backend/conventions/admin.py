from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Convention, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = (
        "username",
        "email",
        "name",
        "mobile_phone_number",
        "is_staff",
        "is_active",
    )
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Profile", {"fields": ("name", "mobile_phone_number")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Profile", {"fields": ("name", "mobile_phone_number")}),
    )
    search_fields = ("username", "email", "name", "mobile_phone_number")


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
