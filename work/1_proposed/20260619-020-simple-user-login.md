# Proposed Work: Simple User Login

## Metadata

- [Work Item: Simple User Login Foundation]
- [Owner: Backend + Frontend]
- [Date: 2026-06-19]
- [Status: proposed]
- [Approval Evidence: Pending human approval]
- [Completion Report: `work/2_completed/20260619-020-simple-user-login.md` when complete]

## Intent Reference

[1_intent/features/002-simple-user-login.md](../../../1_intent/features/002-simple-user-login.md)

## Intent Delta

- Scope limited to creation, sign-up, sign-in, session management, and basic sign-out.
- Session state is server-managed via cookie-based sessions (Django default).
- Account field validation is server-authoritative per architecture boundaries.
- No email verification, password reset, or account recovery in this slice.

## Relevant Context

- **Architecture**: React client communicates with Django API; server-authoritative
  validation; PostgreSQL persistence.
  ([2_context/architecture.md](../../../2_context/architecture.md))
- **Domain**: Attendees, conventions, and future game hosting depend on user
  identity.
  ([2_context/domain.md](../../../2_context/domain.md))
- **Existing Patterns**: Use Django forms for validation, RESTful API envelope
  from conventions pattern, Vitest + Testing Library for frontend tests.
  ([2_context/skill-patterns.md](../../../2_context/skill-patterns.md))
- **Development Setup**: `DJANGO_DEBUG=true` for local validation;
  migrations required for schema changes.
  ([2_context/architecture.md](../../../2_context/architecture.md))

## Expectations

### Engineering

- Use server-authoritative validation in Django; client validation is
  user-experience enhancement only.
- Reuse established Django form validation and API envelope patterns from
  `backend/conventions/`.
- Apply migrations for schema changes; validate schema is clean before
  integration.
- API response contracts must be stable and documented in API tests.
  ([3_expectations/engineering.md](../../../3_expectations/engineering.md))

### Testing

- API contract changes require integration coverage (sign-up, sign-in, session
  lifecycle).
- Schema migrations require review and validation.
- Regression protection: sign-in error modes and session timeout behavior.
  ([3_expectations/testing.md](../../../3_expectations/testing.md))

### Security

- Authentication framework is a foundational requirement. No explicit threat
  model is defined yet.
- Session cookies must be marked `secure`, `httponly`, and `samesite` per
  Django defaults.
- Passwords must be hashed server-side; plaintext passwords must never appear
  in logs or API responses.
- Unauthenticated endpoints (`/api/auth/signup/`, `/api/auth/signin/`) must
  remain public; authenticated API endpoints must require active session.
  ([3_expectations/security.md](../../../3_expectations/security.md))

### UX

- Sign-up and sign-in flows must be keyboard-navigable and WCAG 2.2 Level AA
  compliant.
- Form validation errors must be programmatically associated with labels for
  assistive technologies.
- Client-side validation should provide responsive feedback without replacing
  server rules.
  ([3_expectations/ux.md](../../../3_expectations/ux.md))

## Proposed Approach

### Backend (Django)

1. **Model** (`backend/conventions/models.py`):
   - Extend Django's built-in `AbstractUser` (from `django.contrib.auth.models`):
     - Inherit standard fields like `username` (unique), `email` (unique), and `password`.
     - Add custom fields: `name` (full display name), `mobile_phone_number` (string).
     - Configure in `settings.py` via `AUTH_USER_MODEL = "conventions.User"` to integrate cleanly with Django's authentication and admin systems.
   - Use Django's native password hashing which uses secure defaults (PBKDF2/Argon2) and standard validators.
   - Define custom `clean()` validation and database check constraints in Meta to ensure `name` and `mobile_phone_number` are not blank.

2. **Authentication Backend & Forms** (`backend/conventions/forms.py` or new `backend/auth/` modules):
   - Implement a small custom authentication backend `UsernameOrEmailBackend` (inheriting from `django.contrib.auth.backends.ModelBackend`) to verify credentials against either `username` or `email` fields using `Q(username__iexact=identifier) | Q(email__iexact=identifier)`.
   - `UserSignUpForm`: inherits or acts as `UserCreationForm` to validate field criteria, password strength via settings-configured validators, and fields (`name`, `email`, `mobile_phone_number`).
   - `UserSignInForm`: captures unified credential string + password, runs backend authentication.

3. **API Endpoints** (`backend/conventions/api.py`):
   - `POST /api/auth/signup/`: accepts sign-up payload, creates user via form, calls Django's native `login(request, user)` to set session, and returns user record.
   - `POST /api/auth/signin/`: authenticates user via custom backend, calls native `login(request, user)`, and returns user record.
   - `POST /api/auth/signout/`: calls Django's native `logout(request)` to clear and invalidate the session cookie.
   - `GET /api/auth/me/`: returns current authenticated user details if `request.user.is_authenticated` is True; else returns `401 Unauthorized`.
   - Envelop shape: `{"user": serialize_user(user)}`, and return validation errors in the same field-mapped lists format standard to other endpoints.

4. **Session Management** (Django built-in):
   - Configure `SESSION_COOKIE_AGE = 3600` (1 hour) in `settings.py`.
   - Django session middleware natively handles cookie security flags (`secure`, `httponly`, `samesite`), rotation on login to prevent fixation, and cryptographically signed/encrypted session payloads.

5. **URLs** (`backend/conventions/urls.py`):
   - Add `/api/auth/signup/`, `/api/auth/signin/`, `/api/auth/signout/`, and `/api/auth/me/` views.

6. **Tests** (`backend/conventions/tests.py`):
   - Happy path: sign-up with valid payload, sign-in with username/email, valid
     session on subsequent requests.
   - Error cases: duplicate username/email, invalid email, weak password,
     missing fields, invalid credentials on sign-in.
   - Session lifecycle: session persists across requests, expires after 1 hour,
     sign-out clears session.
   - Boundary: unauthenticated endpoints reject invalid payloads with 400;
     authenticated endpoints return 401 without session.

### Frontend (React)

1. **Types** (`frontend/src/`):
   - `User` type: `{ id: string; username: string; email: string; name: string;
     mobile_phone_number: string; created_at: string; }`.
   - `AuthState` type: `{ user: User | null; loading: boolean; error: Record<string,
     string>; }`.

2. **Context/State Management** (`frontend/src/AuthContext.tsx` or similar):
   - Provide `AuthContext` with sign-up, sign-in, sign-out, and current user
     fetch.
   - On app mount, fetch `/api/auth/me/` to restore session if present.

3. **Sign-Up and Sign-In Forms** (`frontend/src/SignUpForm.tsx`,
   `frontend/src/SignInForm.tsx`):
   - Controlled form inputs with client-side validation (email format, required
     fields, password strength).
   - Submit to backend, handle field-level and non-field errors.
   - Redirect to appropriate screen after successful sign-in.

4. **Navigation Integration**:
   - Show sign-up/sign-in buttons when unauthenticated.
   - Show user name and sign-out button when authenticated.
   - Protect routes: redirect unauthenticated users to sign-in before accessing
     authenticated areas.

5. **Tests** (`frontend/src/*.test.tsx`):
   - Sign-up form: render, fill, validate client-side errors, submit, handle
     server errors.
   - Sign-in form: render, fill, submit with username and email variants, test
     session restoration on app mount.
   - Integration: verify redirect on sign-in, sign-out clears user state.

### Migrations

- Single migration creating `User` table with unique constraints on username and
  email.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| **Password storage vulnerability** | Medium | High | Use Django's built-in `set_password()` and `check_password()`; never store plaintext; validate in code review. |
| **Session fixation/hijacking** | Low | High | Rely on Django's session framework with secure/httponly/samesite cookies; validate over HTTPS. |
| **API contract drift between frontend and backend** | Medium | Medium | Write API contract tests in backend; frontend must parse and validate response shape. |
| **WCAG compliance gaps** | Medium | Medium | Audit sign-up and sign-in forms against WCAG 2.2 Level AA checklist before completion; include in test plan. |
| **Session timeout user experience** | Low | Low | Document 1-hour timeout in UX; consider a refresh/extend mechanism if needed in later work. |

## Questions

- Should session timeout trigger an explicit alert to the user, or silent
  redirect to sign-in?
- Should the sign-in form default to username or email field focus?
- Is there a need for "remember me" functionality (extended session duration)?
- Should username and email sign-in be separate forms or a unified detection
  field?
- Should the `User` model live in `backend/conventions/models.py` since it already has a database setup and is the primary app?

## Approval Gate

**Status remains `proposed` until explicit human approval is recorded.**

Do not begin implementation, create migrations, or add code until:
1. This proposal is reviewed and approved.
2. Approval evidence is added to Metadata above.
3. Status is updated to `approved`.

Upon approval, implementation will follow the Proposed Approach in sequence:
backend model, forms, API, tests, then frontend integration.
