import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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

describe("App authentication", () => {
  function getSignInSubmitButton() {
    const signInHeading = screen.getByRole("heading", { name: "Sign in" });
    const form = signInHeading.closest("form");
    if (!form) {
      throw new Error("Sign in form not found.");
    }
    return within(form).getByRole("button", { name: "Sign in" });
  }

  it("shows sign in form when session is unauthenticated", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(makeJsonResponse({ errors: { non_field_errors: ["Authentication required."] } }, 401));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username or email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me/", expect.objectContaining({ credentials: "include" }));
  });

  it("shows client-side validation errors for empty sign in submit", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeJsonResponse({ errors: { non_field_errors: ["Authentication required."] } }, 401),
    );

    render(<App />);

    await screen.findByRole("heading", { name: "Sign in" });
    await userEvent.click(getSignInSubmitButton());

    expect(await screen.findByText("Username or email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
  });

  it("signs in and then creates a convention", async () => {
    const signedInUser = {
      id: 3,
      username: "attendee_one",
      email: "attendee1@example.com",
      name: "Attendee One",
      mobile_phone_number: "5035550101",
      created_at: "2026-06-19T12:00:00Z",
    };

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
      .mockResolvedValueOnce(makeJsonResponse({ errors: { non_field_errors: ["Authentication required."] } }, 401))
      .mockResolvedValueOnce(makeJsonResponse({ user: signedInUser }))
      .mockResolvedValueOnce(makeJsonResponse({ conventions: [] }))
      .mockResolvedValueOnce(makeJsonResponse({ timezones: timezoneOptions }))
      .mockResolvedValueOnce(makeJsonResponse({ convention: createdConvention }, 201));

    render(<App />);
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText("Username or email"), signedInUser.username);
    await user.type(screen.getByLabelText("Password"), "StrongPassword!234");
    await user.click(getSignInSubmitButton());

    expect(await screen.findByText("Conventions")).toBeInTheDocument();

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
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });

    expect(await screen.findByText("Convention created.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /West Coast Showdown/i })).toBeInTheDocument();
  });
});
