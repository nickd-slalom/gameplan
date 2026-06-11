import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

type FetchJson = Record<string, unknown>;

function makeJsonResponse(body: FetchJson, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const timezoneOptions = [
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "UTC",
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("App", () => {
  it("shows client-side validation errors when create form is submitted empty", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeJsonResponse({ conventions: [] }))
      .mockResolvedValueOnce(makeJsonResponse({ timezones: timezoneOptions }));

    render(<App />);

    const createButton = await screen.findByRole("button", { name: "Create" });
    await userEvent.click(createButton);

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Start date is required.")).toBeInTheDocument();
    expect(screen.getByText("End date is required.")).toBeInTheDocument();
    expect(screen.getByText("Location is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Maximum attendance capacity is required."),
    ).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("creates a convention and shows success status", async () => {
    const createdConvention = {
      id: 7,
      name: "West Coast Showdown",
      start_date: "2026-08-01",
      end_date: "2026-08-03",
      location: "Seattle Convention Center",
      timezone: "America/Denver",
      daily_open_time: "09:00:00",
      daily_close_time: "22:00:00",
      maximum_attendance_capacity: 750,
      created_at: "2026-06-10T12:00:00Z",
      updated_at: "2026-06-10T12:00:00Z",
    };

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeJsonResponse({ conventions: [] }))
      .mockResolvedValueOnce(makeJsonResponse({ timezones: timezoneOptions }))
      .mockResolvedValueOnce(makeJsonResponse({ convention: createdConvention }, 201));

    render(<App />);
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText("Convention name"), createdConvention.name);
    await user.type(screen.getByLabelText("Location"), createdConvention.location);
    await user.type(screen.getByLabelText("Start date"), createdConvention.start_date);
    await user.type(screen.getByLabelText("End date"), createdConvention.end_date);
    await user.selectOptions(screen.getByLabelText("Timezone"), createdConvention.timezone);
    await user.clear(screen.getByLabelText("Maximum attendance"));
    await user.type(
      screen.getByLabelText("Maximum attendance"),
      String(createdConvention.maximum_attendance_capacity),
    );

    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/conventions/",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const postRequest = fetchMock.mock.calls[2];
    const postInit = postRequest[1] as { body?: string };
    const postBody = JSON.parse(String(postInit.body));
    expect(postBody).toMatchObject({
      name: createdConvention.name,
      start_date: createdConvention.start_date,
      end_date: createdConvention.end_date,
      location: createdConvention.location,
      timezone: createdConvention.timezone,
      daily_open_time: "09:00:00",
      daily_close_time: "22:00:00",
      maximum_attendance_capacity: createdConvention.maximum_attendance_capacity,
    });

    expect(await screen.findByText("Convention created.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /West Coast Showdown/i }),
    ).toBeInTheDocument();
  });

  it("loads an existing convention and saves edits", async () => {
    const existingConvention = {
      id: 11,
      name: "River City Open",
      start_date: "2026-09-10",
      end_date: "2026-09-12",
      location: "Old Venue",
      timezone: "America/Chicago",
      daily_open_time: "10:00:00",
      daily_close_time: "23:00:00",
      maximum_attendance_capacity: 240,
      created_at: "2026-06-10T12:00:00Z",
      updated_at: "2026-06-10T12:00:00Z",
    };

    const updatedConvention = {
      ...existingConvention,
      location: "New Venue Hall A",
      updated_at: "2026-06-10T13:00:00Z",
    };

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeJsonResponse({ conventions: [existingConvention] }))
      .mockResolvedValueOnce(makeJsonResponse({ timezones: timezoneOptions }))
      .mockResolvedValueOnce(makeJsonResponse({ convention: updatedConvention }));

    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: /River City Open/i }));

    expect(screen.getByLabelText("Timezone")).toHaveValue(existingConvention.timezone);

    const locationInput = screen.getByLabelText("Location");
    await user.clear(locationInput);
    await user.type(locationInput, updatedConvention.location);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `/api/conventions/${existingConvention.id}/`,
        expect.objectContaining({ method: "PUT" }),
      );
    });

    const putRequest = fetchMock.mock.calls[2];
    const putInit = putRequest[1] as { body?: string };
    const putBody = JSON.parse(String(putInit.body));
    expect(putBody.location).toBe(updatedConvention.location);

    expect(await screen.findByText("Convention updated.")).toBeInTheDocument();
  });
});
