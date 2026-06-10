# Testing Expectations

## Required

- Documentation-only changes must be validated by direct inspection of the
  affected artifacts.
- API contract changes between React and Django require contract or integration
  coverage.
- Schema changes require migration review and validation.

## Coverage Expectations

- Cover critical scheduling and participation paths where conflicts,
  double-bookings, capacity limits, or convention time boundaries are enforced.

## Regression Protection

- Bug fixes should include focused regression coverage when executable code is
  involved and the failure mode can be reproduced.

## Validation

- Validate completed work against applicable `3_expectations/` categories before
  closing the work item.

## Non-Functional Testing

- Performance-sensitive changes should include query-plan review, load testing,
  or another proportionate validation method when latency risk is material.
