# 06 — Test and Regression Plan

## Current status
Blocked until source and a suitable test environment are available. This plan does not imply that any test has run.

## Principles
- Prefer deterministic, isolated tests.
- Do not run destructive migrations, production mutations, load tests against production, or commands that alter tracked files.
- Record command, environment, exit code, and relevant output.
- Never place secrets or personal data in logs or reports.
- If a check may modify generated files, caches, databases, or remote state, inspect its behavior first and avoid it unless explicitly approved.

## Test layers
1. **Static inspection:** source review, nullability, unsafe casts, error paths, dependency/configuration review.
2. **Unit tests:** calculations, validation, state transitions, date/time and unit conversions.
3. **Contract tests:** API request/response schemas, optional fields, status codes, and error payloads.
4. **Integration tests:** persistence, migrations in disposable test databases, repositories, synchronization, and background work.
5. **UI tests:** critical navigation and flows, loading/error/empty states, permissions, accessibility semantics.
6. **Regression tests:** one targeted test for each confirmed defect, plus neighboring workflows.
7. **Resilience tests:** offline/slow network, timeouts, retries, duplicate submission, cancellation, process restart, and partial failure.

## Suggested scenario matrix
| Scenario | Expected behavior to verify |
|---|---|
| Valid primary flow | Correct result and consistent persisted state |
| Invalid or missing input | Clear validation; no invalid mutation |
| Network timeout | Bounded wait, recoverable error, no duplicate mutation |
| Server 4xx/5xx | Correct error mapping; no false success |
| Offline and reconnect | Defined cached behavior and safe synchronization |
| Duplicate tap/retry | Idempotent outcome where required |
| Expired session | Secure rejection and predictable re-authentication |
| Empty dataset | Stable UI and useful empty state |
| Large dataset | Bounded memory, pagination, responsive interaction |
| App/process recreation | State restored or reset according to intended behavior |
| Permission denied/revoked | Graceful degradation and clear explanation |
| Data deletion/logout | Required local/remote data removed according to policy |

## Result log template
| Date | Revision | Command/test | Environment | Exit/result | Evidence or artifact | Notes |
|---|---|---|---|---|---|---|
| TBD | TBD | Not run — source unavailable | TBD | BLOCKED | N/A | No test result claimed |
