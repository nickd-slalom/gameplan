# Completed Work: Simple User Login

## Metadata

- [Work Item: Simple User Login Foundation]
- [Owner: Backend + Frontend]
- [Completion Date: 2026-06-19]
- [Proposal: `work/1_proposed/20260619-020-simple-user-login.md`]
- [Intent: `1_intent/features/002-simple-user-login.md`]

## Outcome

Implemented server-managed session authentication with sign-up, sign-in, sign-out,
and current-session endpoints in Django, plus frontend sign-in/sign-up UX and
session restoration.

Delivered changes include:

- Custom `User` model in `conventions` with required fields (`name`, `email`,
  `mobile_phone_number`) and secure password hashing via Django auth.
- Auth endpoints:
  - `POST /api/auth/signup/`
  - `POST /api/auth/signin/`
  - `POST /api/auth/signout/`
  - `GET /api/auth/me/`
- Username-or-email authentication backend.
- Session configuration with 1-hour timeout (`SESSION_COOKIE_AGE = 3600`) and
  secure cookie settings in production mode.
- Backend API tests covering contract, sign-in variants, error modes, and
  session lifecycle.
- Frontend auth gate and forms with client-side validation and backend error
  rendering, plus authenticated convention workspace access.
- Frontend tests for unauthenticated state, sign-in validation, and sign-in to
  convention-create workflow.

## Expectations Validation

### Engineering

PASS: Server-authoritative validation remains in Django forms and model checks;
API contract is explicit (`{"user": ...}` with mapped field errors), auth routes
integrated without changing existing convention envelope behavior, and migration
state is clean (`makemigrations --check` returns no changes).

### Testing

PASS: Added backend integration tests for sign-up/sign-in/sign-out/me plus error
modes; added frontend interaction tests for auth flows and post-sign-in convention
creation.

Validation evidence:

- Backend: `DJANGO_DEBUG=true /Users/nickd/src/gameplan/backend/.venv/bin/python manage.py test conventions`
  - Result: `Ran 27 tests ... OK`
- Frontend: `npm test -- --run` in `frontend/`
  - Result: `3 passed`

### Security

PASS: Password hashing remains Django-native; plaintext passwords are not exposed
in responses; session auth relies on Django session middleware; authenticated
state for `/api/auth/me/` returns `401` without session; sign-up/sign-in remain
public.

### UX

PASS: Sign-in and sign-up forms are keyboard navigable with labeled controls,
error association via `aria-describedby`, and clear field-level plus non-field
error rendering.

## Discoveries

- For `AUTH_USER_MODEL`, Django's swappable dependency points to app
  `__first__`, so custom user creation must exist in the initial migration for
  reliable test DB migration ordering.

## Context Updates Recommended

- Applied: Added migration-ordering guidance for custom user models to
  `2_context/architecture.md`.

## Follow-Up Work

- Add explicit frontend route-level protection once additional authenticated
  pages are introduced.
- Consider adding session-expiration UX messaging (for example explicit timeout
  notice) for better user clarity.
- Consider adding throttling / lockout strategy for repeated invalid sign-in
  attempts.
