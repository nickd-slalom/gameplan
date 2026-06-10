import json
from datetime import date, time

from django.core.exceptions import ValidationError
from django.test import Client, TestCase
from django.urls import reverse

from .models import Convention


def valid_convention_attrs(**overrides):
    attrs = {
        "name": "Tabletop Weekend",
        "start_date": date(2026, 9, 18),
        "end_date": date(2026, 9, 20),
        "location": "Portland Convention Center",
        "timezone": "America/Los_Angeles",
        "daily_open_time": time(9, 0),
        "daily_close_time": time(22, 0),
        "maximum_attendance_capacity": 250,
    }
    attrs.update(overrides)
    return attrs


def valid_convention_payload(**overrides):
    payload = {
        "name": "Tabletop Weekend",
        "start_date": "2026-09-18",
        "end_date": "2026-09-20",
        "location": "Portland Convention Center",
        "timezone": "America/Los_Angeles",
        "daily_open_time": "09:00:00",
        "daily_close_time": "22:00:00",
        "maximum_attendance_capacity": 250,
    }
    payload.update(overrides)
    return payload


class ConventionModelTests(TestCase):
    def test_valid_convention_passes_model_validation(self):
        convention = Convention(**valid_convention_attrs())

        convention.full_clean()

    def test_end_date_must_not_precede_start_date(self):
        convention = Convention(
            **valid_convention_attrs(
                start_date=date(2026, 9, 20),
                end_date=date(2026, 9, 18),
            )
        )

        with self.assertRaises(ValidationError) as context:
            convention.full_clean()

        self.assertIn("end_date", context.exception.message_dict)

    def test_daily_close_time_must_be_after_open_time(self):
        convention = Convention(
            **valid_convention_attrs(
                daily_open_time=time(22, 0),
                daily_close_time=time(9, 0),
            )
        )

        with self.assertRaises(ValidationError) as context:
            convention.full_clean()

        self.assertIn("daily_close_time", context.exception.message_dict)

    def test_capacity_must_be_positive(self):
        convention = Convention(**valid_convention_attrs(maximum_attendance_capacity=0))

        with self.assertRaises(ValidationError) as context:
            convention.full_clean()

        self.assertIn("maximum_attendance_capacity", context.exception.message_dict)

    def test_timezone_must_be_valid_iana_timezone(self):
        convention = Convention(**valid_convention_attrs(timezone="Mars/Olympus_Mons"))

        with self.assertRaises(ValidationError) as context:
            convention.full_clean()

        self.assertIn("timezone", context.exception.message_dict)


class ConventionApiTests(TestCase):
    def setUp(self):
        self.client = Client()

    def post_json(self, url, payload):
        return self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

    def put_json(self, url, payload):
        return self.client.put(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

    def patch_json(self, url, payload):
        return self.client.patch(
            url,
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_create_convention_returns_stable_json_contract(self):
        response = self.post_json(
            reverse("convention_collection"),
            valid_convention_payload(),
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["convention"]["name"], "Tabletop Weekend")
        self.assertEqual(body["convention"]["start_date"], "2026-09-18")
        self.assertEqual(body["convention"]["end_date"], "2026-09-20")
        self.assertEqual(body["convention"]["daily_open_time"], "09:00:00")
        self.assertEqual(body["convention"]["daily_close_time"], "22:00:00")
        self.assertEqual(body["convention"]["maximum_attendance_capacity"], 250)

    def test_list_conventions_returns_queryable_capacity(self):
        Convention.objects.create(**valid_convention_attrs())

        response = self.client.get(reverse("convention_collection"))

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(len(body["conventions"]), 1)
        self.assertEqual(
            body["conventions"][0]["maximum_attendance_capacity"],
            250,
        )

    def test_retrieve_convention_returns_core_definition_fields(self):
        convention = Convention.objects.create(**valid_convention_attrs())

        response = self.client.get(
            reverse("convention_detail", kwargs={"convention_id": convention.id})
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()["convention"]
        self.assertEqual(body["id"], convention.id)
        self.assertEqual(body["timezone"], "America/Los_Angeles")
        self.assertEqual(body["location"], "Portland Convention Center")

    def test_patch_convention_updates_selected_fields(self):
        convention = Convention.objects.create(**valid_convention_attrs())

        response = self.patch_json(
            reverse("convention_detail", kwargs={"convention_id": convention.id}),
            {"name": "Updated Weekend", "maximum_attendance_capacity": 275},
        )

        self.assertEqual(response.status_code, 200)
        convention.refresh_from_db()
        self.assertEqual(convention.name, "Updated Weekend")
        self.assertEqual(convention.maximum_attendance_capacity, 275)
        self.assertEqual(convention.location, "Portland Convention Center")

    def test_put_convention_requires_full_definition(self):
        convention = Convention.objects.create(**valid_convention_attrs())

        response = self.put_json(
            reverse("convention_detail", kwargs={"convention_id": convention.id}),
            {"name": "Incomplete"},
        )

        self.assertEqual(response.status_code, 400)
        errors = response.json()["errors"]
        self.assertIn("start_date", errors)
        self.assertIn("maximum_attendance_capacity", errors)

    def test_create_convention_reports_boundary_errors_by_field(self):
        response = self.post_json(
            reverse("convention_collection"),
            valid_convention_payload(
                end_date="2026-09-17",
                daily_close_time="08:00:00",
                maximum_attendance_capacity=0,
            ),
        )

        self.assertEqual(response.status_code, 400)
        errors = response.json()["errors"]
        self.assertIn("end_date", errors)
        self.assertIn("daily_close_time", errors)
        self.assertIn("maximum_attendance_capacity", errors)

    def test_create_convention_rejects_invalid_utf8_body(self):
        response = self.client.generic(
            "POST",
            reverse("convention_collection"),
            b"\xff",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("body", response.json()["errors"])

    def test_create_convention_rejects_float_capacity(self):
        response = self.post_json(
            reverse("convention_collection"),
            valid_convention_payload(maximum_attendance_capacity=250.5),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("maximum_attendance_capacity", response.json()["errors"])

    def test_list_conventions_supports_offset_limit_pagination(self):
        Convention.objects.create(**valid_convention_attrs(name="Alpha Con"))
        Convention.objects.create(
            **valid_convention_attrs(
                name="Bravo Con",
                start_date=date(2026, 9, 21),
                end_date=date(2026, 9, 22),
            )
        )

        response = self.client.get(reverse("convention_collection"), {"limit": "1", "offset": "1"})

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["pagination"], {"offset": 1, "limit": 1, "total": 2})
        self.assertEqual(len(body["conventions"]), 1)
        self.assertEqual(body["conventions"][0]["name"], "Bravo Con")

    def test_create_convention_rejects_unknown_fields(self):
        response = self.post_json(
            reverse("convention_collection"),
            valid_convention_payload(ticket_price="25.00"),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.json()["errors"])
