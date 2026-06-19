import { FormEvent, useEffect, useMemo, useState } from "react";
import "./App.css";

type Convention = {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  timezone: string;
  daily_open_time: string;
  daily_close_time: string;
  maximum_attendance_capacity: number;
  created_at: string;
  updated_at: string;
};

type AuthUser = {
  id: number;
  username: string;
  email: string;
  name: string;
  mobile_phone_number: string;
  created_at: string;
};

type ConventionFormState = {
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  timezone: string;
  daily_open_time: string;
  daily_close_time: string;
  maximum_attendance_capacity: string;
};

type SignUpFormState = {
  username: string;
  email: string;
  name: string;
  mobile_phone_number: string;
  password1: string;
  password2: string;
};

type SignInFormState = {
  identifier: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof ConventionFormState | "body" | "non_field_errors", string[]>>;
type AuthErrors = Partial<
  Record<
    keyof SignUpFormState | keyof SignInFormState | "body" | "non_field_errors",
    string[]
  >
>;

const emptyForm: ConventionFormState = {
  name: "",
  start_date: "",
  end_date: "",
  location: "",
  timezone: "America/Los_Angeles",
  daily_open_time: "09:00",
  daily_close_time: "22:00",
  maximum_attendance_capacity: "",
};

const emptySignUp: SignUpFormState = {
  username: "",
  email: "",
  name: "",
  mobile_phone_number: "",
  password1: "",
  password2: "",
};

const emptySignIn: SignInFormState = {
  identifier: "",
  password: "",
};

const fallbackTimezoneOptions = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "UTC",
];

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function normalizeTime(value: string) {
  if (!value) {
    return "";
  }

  return value.length === 5 ? `${value}:00` : value;
}

function conventionToForm(convention: Convention): ConventionFormState {
  return {
    name: convention.name,
    start_date: convention.start_date,
    end_date: convention.end_date,
    location: convention.location,
    timezone: convention.timezone,
    daily_open_time: convention.daily_open_time.slice(0, 5),
    daily_close_time: convention.daily_close_time.slice(0, 5),
    maximum_attendance_capacity: String(convention.maximum_attendance_capacity),
  };
}

function validateForm(form: ConventionFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = ["Name is required."];
  }

  if (!form.start_date) {
    errors.start_date = ["Start date is required."];
  }

  if (!form.end_date) {
    errors.end_date = ["End date is required."];
  }

  if (form.start_date && form.end_date && form.end_date < form.start_date) {
    errors.end_date = ["End date must be on or after start date."];
  }

  if (!form.location.trim()) {
    errors.location = ["Location is required."];
  }

  if (!form.timezone) {
    errors.timezone = ["Timezone is required."];
  }

  if (!form.daily_open_time) {
    errors.daily_open_time = ["Daily open time is required."];
  }

  if (!form.daily_close_time) {
    errors.daily_close_time = ["Daily close time is required."];
  }

  if (
    form.daily_open_time &&
    form.daily_close_time &&
    form.daily_close_time <= form.daily_open_time
  ) {
    errors.daily_close_time = ["Daily close time must be after daily open time."];
  }

  const capacity = Number(form.maximum_attendance_capacity);
  if (!form.maximum_attendance_capacity) {
    errors.maximum_attendance_capacity = ["Maximum attendance capacity is required."];
  } else if (!Number.isInteger(capacity) || capacity <= 0) {
    errors.maximum_attendance_capacity = [
      "Maximum attendance capacity must be a positive whole number.",
    ];
  }

  return errors;
}

function validateSignUp(form: SignUpFormState): AuthErrors {
  const errors: AuthErrors = {};

  if (!form.username.trim()) {
    errors.username = ["Username is required."];
  }
  if (!form.email.trim()) {
    errors.email = ["Email is required."];
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = ["Email must be valid."];
  }
  if (!form.name.trim()) {
    errors.name = ["Name is required."];
  }
  if (!form.mobile_phone_number.trim()) {
    errors.mobile_phone_number = ["Mobile phone number is required."];
  }
  if (!form.password1) {
    errors.password1 = ["Password is required."];
  } else if (form.password1.length < 8) {
    errors.password1 = ["Password must be at least 8 characters."];
  }
  if (!form.password2) {
    errors.password2 = ["Confirm password is required."];
  } else if (form.password1 !== form.password2) {
    errors.password2 = ["Passwords must match."];
  }

  return errors;
}

function validateSignIn(form: SignInFormState): AuthErrors {
  const errors: AuthErrors = {};

  if (!form.identifier.trim()) {
    errors.identifier = ["Username or email is required."];
  }
  if (!form.password) {
    errors.password = ["Password is required."];
  }

  return errors;
}

function hasErrors(errors: FieldErrors | AuthErrors) {
  return Object.keys(errors).length > 0;
}

function buildPayload(form: ConventionFormState) {
  return {
    name: form.name.trim(),
    start_date: form.start_date,
    end_date: form.end_date,
    location: form.location.trim(),
    timezone: form.timezone,
    daily_open_time: normalizeTime(form.daily_open_time),
    daily_close_time: normalizeTime(form.daily_close_time),
    maximum_attendance_capacity: Number(form.maximum_attendance_capacity),
  };
}

function ErrorList({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <ul aria-live="polite" className="field-errors" id={id} role="alert">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signInForm, setSignInForm] = useState<SignInFormState>(emptySignIn);
  const [signUpForm, setSignUpForm] = useState<SignUpFormState>(emptySignUp);
  const [authErrors, setAuthErrors] = useState<AuthErrors>({});
  const [authStatusMessage, setAuthStatusMessage] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const [timezoneOptions, setTimezoneOptions] = useState<string[]>([]);
  const [conventions, setConventions] = useState<Convention[]>([]);
  const [form, setForm] = useState<ConventionFormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedConventionId, setSelectedConventionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [timezoneStatusMessage, setTimezoneStatusMessage] = useState("");

  const selectedConvention = useMemo(
    () => conventions.find((convention) => convention.id === selectedConventionId) ?? null,
    [conventions, selectedConventionId],
  );

  const availableTimezoneOptions = useMemo(() => {
    if (!form.timezone || timezoneOptions.includes(form.timezone)) {
      return timezoneOptions;
    }

    return [form.timezone, ...timezoneOptions];
  }, [form.timezone, timezoneOptions]);

  async function loadConventions() {
    setIsLoading(true);
    setStatusMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/conventions/`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to load conventions.");
      }
      const body = (await response.json()) as { conventions: Convention[] };
      setConventions(body.conventions);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to load conventions.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTimezoneOptions() {
    setTimezoneStatusMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/conventions/timezones/`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to load timezone options.");
      }
      const body = (await response.json()) as { timezones: string[] };
      setTimezoneOptions(body.timezones);
    } catch {
      setTimezoneOptions(fallbackTimezoneOptions);
      setTimezoneStatusMessage("Timezone options could not be loaded. Showing common choices.");
    }
  }

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me/`, {
          credentials: "include",
        });

        if (response.ok) {
          const body = (await response.json()) as { user: AuthUser };
          setUser(body.user);
          return;
        }

        if (response.status !== 401) {
          setAuthStatusMessage("Unable to restore session.");
        }
      } catch {
        setAuthStatusMessage("Unable to restore session.");
      } finally {
        setAuthLoading(false);
      }
    }

    void bootstrapAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadConventions();
    void loadTimezoneOptions();
  }, [user]);

  function resetForm() {
    setSelectedConventionId(null);
    setForm(emptyForm);
    setErrors({});
    setStatusMessage("");
  }

  function editConvention(convention: Convention) {
    setSelectedConventionId(convention.id);
    setForm(conventionToForm(convention));
    setErrors({});
    setStatusMessage("");
  }

  function updateField(field: keyof ConventionFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      delete next.non_field_errors;
      return next;
    });
  }

  function updateSignInField(field: keyof SignInFormState, value: string) {
    setSignInForm((current) => ({ ...current, [field]: value }));
    setAuthErrors((current) => {
      const next = { ...current };
      delete next[field];
      delete next.non_field_errors;
      return next;
    });
  }

  function updateSignUpField(field: keyof SignUpFormState, value: string) {
    setSignUpForm((current) => ({ ...current, [field]: value }));
    setAuthErrors((current) => {
      const next = { ...current };
      delete next[field];
      delete next.non_field_errors;
      return next;
    });
  }

  function switchAuthMode(mode: "signin" | "signup") {
    setAuthMode(mode);
    setAuthErrors({});
    setAuthStatusMessage("");
  }

  async function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateSignIn(signInForm);
    setAuthErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setIsAuthSubmitting(true);
    setAuthStatusMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/signin/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signInForm),
      });

      const body = (await response.json()) as { user?: AuthUser; errors?: AuthErrors };
      if (!response.ok) {
        setAuthErrors(body.errors ?? { non_field_errors: ["Unable to sign in."] });
        return;
      }

      setUser(body.user ?? null);
      setSignInForm(emptySignIn);
      setAuthErrors({});
      setAuthStatusMessage("Signed in.");
    } catch {
      setAuthErrors({ non_field_errors: ["Unable to sign in."] });
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSignUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateSignUp(signUpForm);
    setAuthErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setIsAuthSubmitting(true);
    setAuthStatusMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signUpForm),
      });

      const body = (await response.json()) as { user?: AuthUser; errors?: AuthErrors };
      if (!response.ok) {
        setAuthErrors(body.errors ?? { non_field_errors: ["Unable to sign up."] });
        return;
      }

      setUser(body.user ?? null);
      setSignUpForm(emptySignUp);
      setAuthErrors({});
      setAuthStatusMessage("Account created.");
    } catch {
      setAuthErrors({ non_field_errors: ["Unable to sign up."] });
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleSignOut() {
    setAuthStatusMessage("");
    try {
      await fetch(`${apiBaseUrl}/api/auth/signout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } finally {
      setUser(null);
      setConventions([]);
      resetForm();
      setSignInForm(emptySignIn);
      setSignUpForm(emptySignUp);
      setAuthErrors({});
      setAuthStatusMessage("Signed out.");
      setAuthMode("signin");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    const isEditing = selectedConventionId !== null;
    const endpoint = isEditing
      ? `${apiBaseUrl}/api/conventions/${selectedConventionId}/`
      : `${apiBaseUrl}/api/conventions/`;

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload(form)),
      });
      const body = (await response.json()) as {
        convention?: Convention;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setErrors(body.errors ?? { non_field_errors: ["Convention could not be saved."] });
        return;
      }

      const savedConvention = body.convention as Convention;
      setConventions((current) => {
        if (isEditing) {
          return current.map((convention) =>
            convention.id === savedConvention.id ? savedConvention : convention,
          );
        }
        return [...current, savedConvention].sort((left, right) =>
          `${left.start_date}-${left.name}`.localeCompare(`${right.start_date}-${right.name}`),
        );
      });
      setSelectedConventionId(savedConvention.id);
      setForm(conventionToForm(savedConvention));
      setErrors({});
      setStatusMessage(isEditing ? "Convention updated." : "Convention created.");
    } catch {
      setErrors({ non_field_errors: ["Convention could not be saved."] });
    } finally {
      setIsSaving(false);
    }
  }

  const formHeading = selectedConvention ? "Edit convention" : "Create convention";

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-title">Gameplan</h1>
          {user ? (
            <div className="auth-nav" aria-label="Authenticated user actions">
              <span className="auth-nav__name">{user.name}</span>
              <button className="secondary-button" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="auth-nav" aria-label="Authentication navigation">
              <button
                className="secondary-button"
                type="button"
                onClick={() => switchAuthMode("signin")}
              >
                Sign in
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={() => switchAuthMode("signup")}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        {authLoading ? (
          <p className="muted">Loading session...</p>
        ) : !user ? (
          <section className="workspace auth-workspace" aria-labelledby="auth-heading">
            <div className="workspace__header">
              <div>
                <h2 id="auth-heading">Welcome to Gameplan</h2>
                <p>Create an account or sign in to manage conventions.</p>
              </div>
            </div>
            {authStatusMessage ? (
              <p className="status-message" role="status">
                {authStatusMessage}
              </p>
            ) : null}
            <form
              className="convention-form"
              onSubmit={authMode === "signin" ? handleSignInSubmit : handleSignUpSubmit}
              noValidate
            >
              <div className="form-header">
                <h3>{authMode === "signin" ? "Sign in" : "Create account"}</h3>
              </div>

              <ErrorList
                id="auth-form-errors"
                errors={[...(authErrors.non_field_errors ?? []), ...(authErrors.body ?? [])]}
              />

              {authMode === "signin" ? (
                <>
                  <div className="field">
                    <label htmlFor="identifier">Username or email</label>
                    <input
                      aria-describedby={authErrors.identifier ? "identifier-errors" : undefined}
                      aria-invalid={authErrors.identifier ? "true" : "false"}
                      id="identifier"
                      name="identifier"
                      type="text"
                      value={signInForm.identifier}
                      onChange={(event) => updateSignInField("identifier", event.target.value)}
                    />
                    <ErrorList id="identifier-errors" errors={authErrors.identifier} />
                  </div>

                  <div className="field">
                    <label htmlFor="signin-password">Password</label>
                    <input
                      aria-describedby={authErrors.password ? "signin-password-errors" : undefined}
                      aria-invalid={authErrors.password ? "true" : "false"}
                      id="signin-password"
                      name="password"
                      type="password"
                      value={signInForm.password}
                      onChange={(event) => updateSignInField("password", event.target.value)}
                    />
                    <ErrorList id="signin-password-errors" errors={authErrors.password} />
                  </div>
                </>
              ) : (
                <>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="signup-username">Username</label>
                      <input
                        aria-describedby={authErrors.username ? "signup-username-errors" : undefined}
                        aria-invalid={authErrors.username ? "true" : "false"}
                        id="signup-username"
                        name="username"
                        type="text"
                        value={signUpForm.username}
                        onChange={(event) => updateSignUpField("username", event.target.value)}
                      />
                      <ErrorList id="signup-username-errors" errors={authErrors.username} />
                    </div>
                    <div className="field">
                      <label htmlFor="signup-email">Email</label>
                      <input
                        aria-describedby={authErrors.email ? "signup-email-errors" : undefined}
                        aria-invalid={authErrors.email ? "true" : "false"}
                        id="signup-email"
                        name="email"
                        type="email"
                        value={signUpForm.email}
                        onChange={(event) => updateSignUpField("email", event.target.value)}
                      />
                      <ErrorList id="signup-email-errors" errors={authErrors.email} />
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="signup-name">Name</label>
                      <input
                        aria-describedby={authErrors.name ? "signup-name-errors" : undefined}
                        aria-invalid={authErrors.name ? "true" : "false"}
                        id="signup-name"
                        name="name"
                        type="text"
                        value={signUpForm.name}
                        onChange={(event) => updateSignUpField("name", event.target.value)}
                      />
                      <ErrorList id="signup-name-errors" errors={authErrors.name} />
                    </div>
                    <div className="field">
                      <label htmlFor="signup-mobile-phone-number">Mobile phone number</label>
                      <input
                        aria-describedby={
                          authErrors.mobile_phone_number
                            ? "signup-mobile-phone-number-errors"
                            : undefined
                        }
                        aria-invalid={authErrors.mobile_phone_number ? "true" : "false"}
                        id="signup-mobile-phone-number"
                        name="mobile_phone_number"
                        type="text"
                        value={signUpForm.mobile_phone_number}
                        onChange={(event) =>
                          updateSignUpField("mobile_phone_number", event.target.value)
                        }
                      />
                      <ErrorList
                        id="signup-mobile-phone-number-errors"
                        errors={authErrors.mobile_phone_number}
                      />
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="signup-password1">Password</label>
                      <input
                        aria-describedby={authErrors.password1 ? "signup-password1-errors" : undefined}
                        aria-invalid={authErrors.password1 ? "true" : "false"}
                        id="signup-password1"
                        name="password1"
                        type="password"
                        value={signUpForm.password1}
                        onChange={(event) => updateSignUpField("password1", event.target.value)}
                      />
                      <ErrorList id="signup-password1-errors" errors={authErrors.password1} />
                    </div>
                    <div className="field">
                      <label htmlFor="signup-password2">Confirm password</label>
                      <input
                        aria-describedby={authErrors.password2 ? "signup-password2-errors" : undefined}
                        aria-invalid={authErrors.password2 ? "true" : "false"}
                        id="signup-password2"
                        name="password2"
                        type="password"
                        value={signUpForm.password2}
                        onChange={(event) => updateSignUpField("password2", event.target.value)}
                      />
                      <ErrorList id="signup-password2-errors" errors={authErrors.password2} />
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button className="primary-button" type="submit" disabled={isAuthSubmitting}>
                  {isAuthSubmitting
                    ? "Submitting..."
                    : authMode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => switchAuthMode(authMode === "signin" ? "signup" : "signin")}
                >
                  {authMode === "signin" ? "Need an account?" : "Already have an account?"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <section className="workspace" aria-labelledby="workspace-heading">
            <div className="workspace__header">
              <div>
                <h2 id="workspace-heading">Conventions</h2>
                <p>Define the event container organizers, hosts, and attendees use.</p>
              </div>
              <button className="secondary-button" type="button" onClick={resetForm}>
                New convention
              </button>
            </div>

            {statusMessage ? (
              <p className="status-message" role="status">
                {statusMessage}
              </p>
            ) : null}
            {timezoneStatusMessage ? (
              <p className="status-message" role="status">
                {timezoneStatusMessage}
              </p>
            ) : null}

            <div className="workspace-grid">
              <aside className="convention-list" aria-label="Convention list">
                {isLoading ? (
                  <p className="muted">Loading conventions...</p>
                ) : conventions.length ? (
                  <div className="convention-list__items">
                    {conventions.map((convention) => (
                      <button
                        aria-current={convention.id === selectedConventionId ? "true" : undefined}
                        className={
                          convention.id === selectedConventionId
                            ? "convention-list__item convention-list__item--selected"
                            : "convention-list__item"
                        }
                        key={convention.id}
                        type="button"
                        onClick={() => editConvention(convention)}
                      >
                        <span className="convention-list__name">{convention.name}</span>
                        <span className="convention-list__meta">
                          {convention.start_date} to {convention.end_date}
                        </span>
                        <span className="convention-list__meta">
                          Capacity {convention.maximum_attendance_capacity}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No conventions yet.</p>
                )}
              </aside>

              <form className="convention-form" onSubmit={handleSubmit} noValidate>
                <div className="form-header">
                  <h3>{formHeading}</h3>
                  {selectedConvention ? (
                    <span className="form-header__meta">ID {selectedConvention.id}</span>
                  ) : null}
                </div>

                <ErrorList
                  id="form-errors"
                  errors={[...(errors.non_field_errors ?? []), ...(errors.body ?? [])]}
                />

                <div className="field">
                  <label htmlFor="name">Convention name</label>
                  <input
                    aria-describedby={errors.name ? "name-errors" : undefined}
                    aria-invalid={errors.name ? "true" : "false"}
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                  <ErrorList id="name-errors" errors={errors.name} />
                </div>

                <div className="field">
                  <label htmlFor="location">Location</label>
                  <textarea
                    aria-describedby={errors.location ? "location-errors" : undefined}
                    aria-invalid={errors.location ? "true" : "false"}
                    id="location"
                    name="location"
                    rows={3}
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                  />
                  <ErrorList id="location-errors" errors={errors.location} />
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="start_date">Start date</label>
                    <input
                      aria-describedby={errors.start_date ? "start-date-errors" : undefined}
                      aria-invalid={errors.start_date ? "true" : "false"}
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={form.start_date}
                      onChange={(event) => updateField("start_date", event.target.value)}
                    />
                    <ErrorList id="start-date-errors" errors={errors.start_date} />
                  </div>

                  <div className="field">
                    <label htmlFor="end_date">End date</label>
                    <input
                      aria-describedby={errors.end_date ? "end-date-errors" : undefined}
                      aria-invalid={errors.end_date ? "true" : "false"}
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={form.end_date}
                      onChange={(event) => updateField("end_date", event.target.value)}
                    />
                    <ErrorList id="end-date-errors" errors={errors.end_date} />
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      aria-describedby={errors.timezone ? "timezone-errors" : undefined}
                      aria-invalid={errors.timezone ? "true" : "false"}
                      id="timezone"
                      name="timezone"
                      value={form.timezone}
                      onChange={(event) => updateField("timezone", event.target.value)}
                    >
                      {availableTimezoneOptions.map((timezone) => (
                        <option key={timezone} value={timezone}>
                          {timezone}
                        </option>
                      ))}
                    </select>
                    <p className="field-hint">Select the convention scheduling timezone.</p>
                    <ErrorList id="timezone-errors" errors={errors.timezone} />
                  </div>

                  <div className="field">
                    <label htmlFor="maximum_attendance_capacity">Maximum attendance</label>
                    <input
                      aria-describedby={
                        errors.maximum_attendance_capacity ? "capacity-errors" : undefined
                      }
                      aria-invalid={errors.maximum_attendance_capacity ? "true" : "false"}
                      id="maximum_attendance_capacity"
                      min="1"
                      name="maximum_attendance_capacity"
                      step="1"
                      type="number"
                      value={form.maximum_attendance_capacity}
                      onChange={(event) =>
                        updateField("maximum_attendance_capacity", event.target.value)
                      }
                    />
                    <ErrorList
                      id="capacity-errors"
                      errors={errors.maximum_attendance_capacity}
                    />
                  </div>
                </div>

                <fieldset className="field-set">
                  <legend>Daily open hours</legend>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="daily_open_time">Opens</label>
                      <input
                        aria-describedby={
                          errors.daily_open_time ? "daily-open-time-errors" : undefined
                        }
                        aria-invalid={errors.daily_open_time ? "true" : "false"}
                        id="daily_open_time"
                        name="daily_open_time"
                        type="time"
                        value={form.daily_open_time}
                        onChange={(event) => updateField("daily_open_time", event.target.value)}
                      />
                      <ErrorList id="daily-open-time-errors" errors={errors.daily_open_time} />
                    </div>

                    <div className="field">
                      <label htmlFor="daily_close_time">Closes</label>
                      <input
                        aria-describedby={
                          errors.daily_close_time ? "daily-close-time-errors" : undefined
                        }
                        aria-invalid={errors.daily_close_time ? "true" : "false"}
                        id="daily_close_time"
                        name="daily_close_time"
                        type="time"
                        value={form.daily_close_time}
                        onChange={(event) => updateField("daily_close_time", event.target.value)}
                      />
                      <ErrorList id="daily-close-time-errors" errors={errors.daily_close_time} />
                    </div>
                  </div>
                </fieldset>

                <div className="form-actions">
                  <button className="primary-button" type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : selectedConvention ? "Save changes" : "Create"}
                  </button>
                  <button className="secondary-button" type="button" onClick={resetForm}>
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
