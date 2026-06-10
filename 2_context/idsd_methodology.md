# IDSD Agent Context Primer

## Purpose

This document summarizes the Intent → Context → Expectations (ICE)
methodology, inspired by Intent-Driven Software Development (IDSD).

Agents should use this document as operating context before planning or
implementing work.

---

## Core Principle

Traditional specification-driven development attempts to describe both:

* what should be built
* how it should be built

IDSD separates those concerns.

Humans provide:

* Intent
* Context
* Expectations

Agents determine:

* architecture decisions
* implementation details
* execution strategy
* task sequencing

The goal is to maximize agent autonomy while maintaining alignment with
business objectives.

---

## Intent

Intent describes the outcome that should exist after the work is complete.

Intent answers:

* What problem are we solving?
* Who benefits?
* Why does this matter?
* What changes when we succeed?

Intent should avoid prescribing implementation details.

Good Intent:

> Allow customers to recover access to their account without contacting support.

Poor Intent:

> Build a React page with an email field that calls an API endpoint and sends a
> password reset token.

The first describes the desired outcome.

The second describes a specific implementation.

When implementation appears in Intent, agents may become constrained to
suboptimal solutions.

---

## Context

Context describes reality.

Context contains information that helps an agent make good decisions.

Examples:

* system architecture
* existing patterns
* technical constraints
* business rules
* domain knowledge
* historical decisions
* regulatory requirements
* operational limitations

Context answers:

* What already exists?
* What constraints must be respected?
* What patterns should be reused?
* What knowledge would a senior engineer already know?

Agents should actively search context before proposing solutions.

Context is not static.

When agents discover important information during implementation, they should
recommend updates to the context repository.

---

## Expectations

Expectations define success.

Expectations are the criteria used to evaluate outcomes.

Examples:

* performance targets
* security requirements
* testing standards
* maintainability expectations
* user experience standards
* operational requirements

Expectations answer:

* How will success be measured?
* What quality standards apply?
* What conditions must be satisfied before completion?

Expectations should be objective whenever possible.

---

## Agent Decision Hierarchy

When conflicts occur:

1. Expectations
2. Context
3. Intent

Reasoning:

Intent describes desired outcomes.

Context describes the environment in which work occurs.

Expectations determine acceptance.

An implementation that satisfies Intent but violates Expectations is not acceptable.

An implementation that satisfies Intent but ignores Context is likely harmful.

---

## Agent Workflow

Before implementation:

1. Read Intent.
2. Gather relevant Context.
3. Identify applicable Expectations.
4. Discover unknowns.
5. Form a proposed approach.
6. Surface risks and assumptions.
7. Stop for human approval before implementation.

Human approval is mandatory for non-trivial repository changes. Agents may
create or refine proposal artifacts, but must not self-approve a proposal or
begin implementation until the human explicitly approves the proposed approach
in the conversation or an existing approval record is present.

During implementation:

1. Prefer existing patterns.
2. Avoid unnecessary complexity.
3. Reuse proven solutions.
4. Validate continuously against Expectations.

After implementation:

1. Verify Expectations.
2. Document discoveries.
3. Recommend Context updates.
4. Record important decisions.

---

## What Agents Should Do

Agents should:

* reason from outcomes
* discover requirements through context
* identify constraints
* propose solutions
* explain tradeoffs
* validate quality
* improve repository knowledge

Agents should act like experienced engineers operating with business awareness.

---

## What Agents Should Avoid

Agents should not:

* invent business requirements
* assume missing rules
* ignore existing architecture
* create unnecessary abstractions
* introduce technology without justification
* optimize prematurely
* treat implementation details as goals

The goal is not to maximize code generation.

The goal is to maximize successful outcomes.

---

## Planning Guidance

When given a task, agents should first produce:

## Artifact Ownership (Avoid Redundancy)

Intent artifacts (`1_intent/`) are the durable source of truth for outcomes and
business framing.

Work artifacts (`work/1_proposed/`, `work/2_completed/`) are lifecycle records
for a specific change.

To avoid redundancy:

* work proposals should reference intent, not restate it in full
* completion reports should validate expectations and record discoveries
* intent files should not be used as approval or completion trackers

When details overlap, keep full detail in the primary artifact and link from
the secondary artifact.

Completed work should still be visible from the original proposal. Keep the
proposal file in `work/1_proposed/`, update its status to `completed`, and add
a link to the matching `work/2_completed/<item>.md` report. The proposal should
not duplicate completion outcomes, validation details, discoveries, or
follow-up work.

### Intent Summary

A concise explanation of the desired outcome.

### Relevant Context

Applicable architecture, constraints, patterns, and prior decisions.

### Applicable Expectations

Acceptance criteria and quality requirements.

### Proposed Approach

Recommended implementation strategy.

### Risks

Potential technical or business concerns.

### Questions

Unknowns that may require clarification.

Only after these are understood and human approval is recorded should
implementation begin.

---

## Definition of Success

Successful work demonstrates all of the following:

* Intent achieved
* Context respected
* Expectations satisfied
* Risks understood
* Knowledge captured
* Future maintainability improved

Implementation quality is judged by outcomes rather than adherence to a
predetermined specification.

This is the central idea of Intent → Context → Expectations.
