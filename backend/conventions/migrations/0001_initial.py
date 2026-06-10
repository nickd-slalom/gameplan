# Generated manually for feature 001 convention creation.

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Convention",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("location", models.TextField()),
                ("timezone", models.CharField(max_length=64)),
                ("daily_open_time", models.TimeField()),
                ("daily_close_time", models.TimeField()),
                ("maximum_attendance_capacity", models.PositiveIntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["start_date", "name"],
                "constraints": [
                    models.CheckConstraint(
                        condition=models.Q(("end_date__gte", models.F("start_date"))),
                        name="convention_end_date_on_or_after_start_date",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(
                            ("daily_close_time__gt", models.F("daily_open_time"))
                        ),
                        name="convention_daily_close_after_open",
                    ),
                    models.CheckConstraint(
                        condition=models.Q(("maximum_attendance_capacity__gt", 0)),
                        name="convention_capacity_positive",
                    ),
                ],
            },
        ),
    ]
