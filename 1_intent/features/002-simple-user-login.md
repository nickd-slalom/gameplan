# Feature Intent: Simple User Login

## Metadata

- [Feature Name: Simple User Login]
- [Owner: Product]
- [Status: proposed]
- [Last Updated: 2026-06-19]

## Problem

The system currently cannot reliably distinguish one attendee from another,
which prevents ownership and accountability for attendee-created data. Without a
simple login capability, later workflows like hosted game creation cannot attach
actions to a specific user.

## Desired Outcome

An attendee can create an account, sign in, and maintain an authenticated
session so the system can identify the current user for subsequent features.

## Business Value

This provides foundational identity needed to personalize behavior, associate
records with users, and enable multi-user workflows safely. It unlocks future
features that depend on user-level ownership, including hosted game creation.

## User Impact

- Attendees can sign up and sign in with a basic credential flow.
- Returning attendees can authenticate and continue using the product as
  themselves.
- The system can attribute actions and records to a specific user identity.

## Anti-Goals

- Not social login or third-party identity providers.
- Not password reset, account recovery, or email verification workflows.
- Not role-based permissions beyond basic authenticated access.
- Not profile editing, avatars, or social features.
- Not multi-factor authentication.

## Decisions

- Account fields required: name, email, mobile phone number.
- Sign-in support: both username and email addresses.
- Session duration: maximum 1 hour before re-authentication required.
- Authenticated API: not publicly available; requires active session.
