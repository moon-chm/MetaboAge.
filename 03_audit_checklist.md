# 03 — Comprehensive Read-Only Audit Checklist

Use `[x]` only after inspecting evidence; use `[blocked]` where source is unavailable. Do not treat an unchecked item as a confirmed defect.

## A. Repository and build
- [ ] Confirm repository URL, branch, commit SHA, and working-tree status.
- [ ] Inventory modules, source roots, generated files, and ignored files.
- [ ] Identify build system, runtime/toolchain versions, and reproducible build steps.
- [ ] Inspect dependency manifests, lockfiles, version constraints, and repositories.
- [ ] Inspect CI workflows, lint, formatting, static analysis, and test jobs.
- [ ] Verify environment-specific configuration and safe defaults.
- [ ] Check for committed credentials or private material without copying values.

## B. Architecture and code health
- [ ] Trace application entry points and dependency injection.
- [ ] Identify module boundaries, circular dependencies, and duplicated logic.
- [ ] Check separation of UI, domain logic, persistence, and networking.
- [ ] Inspect nullability, state ownership, lifecycle, cancellation, and resource cleanup.
- [ ] Check dead code, unreachable branches, unsafe casts, and broad exception catches.
- [ ] Verify error states are actionable and do not hide failures.

## C. Existing feature behavior
- [ ] Build a feature inventory from actual navigation and entry points.
- [ ] Trace each feature end-to-end through validation, business rules, data access, and UI.
- [ ] Verify empty, loading, success, partial-success, offline, and error states.
- [ ] Check back navigation, repeated taps, duplicate submissions, and lifecycle recreation.
- [ ] Verify permissions and feature availability for relevant platform/API versions.
- [ ] Confirm existing behavior is consistent across related features.

## D. API and networking
- [ ] Compare client request models with server routes and response schemas.
- [ ] Validate status-code handling, serialization, optional fields, and schema evolution.
- [ ] Check timeouts, cancellation, retries, backoff, and idempotency.
- [ ] Ensure retries cannot duplicate payments, messages, uploads, or mutations.
- [ ] Check TLS usage, cleartext restrictions, and certificate/configuration assumptions.
- [ ] Ensure logs do not include tokens, passwords, private messages, or sensitive payloads.

## E. Data and synchronization
- [ ] Review schema definitions, migrations, indexes, and destructive migration paths.
- [ ] Check transaction boundaries and consistency across related writes.
- [ ] Verify cache invalidation and stale-data behavior.
- [ ] Inspect offline queue ordering, retry policy, deduplication, and conflict resolution.
- [ ] Check timestamp, timezone, locale, identifier, and numeric conversion behavior.
- [ ] Confirm deletion and logout semantics for local and remote data.

## F. Security and privacy
- [ ] Map authentication and authorization checks at every protected boundary.
- [ ] Check ownership checks for IDs supplied by clients.
- [ ] Inspect input validation, output encoding, and injection risks.
- [ ] Review file upload/download size, type, path, access control, and storage behavior.
- [ ] Check token/session storage, expiry, revocation, and logout behavior.
- [ ] Check sensitive data at rest, in transit, in logs, analytics, and crash reports.
- [ ] Inspect dependency advisories using trustworthy sources when manifests are available.
- [ ] Check rate limits and abuse controls for sensitive or expensive endpoints.
- [ ] Verify privacy permissions and data minimization.

## G. Performance and reliability
- [ ] Look for main-thread/blocking I/O and expensive work on interactive paths.
- [ ] Inspect unbounded lists, repeated queries, N+1 access, and redundant recomposition/rendering.
- [ ] Check memory leaks, long-lived references, streams, sockets, and file handles.
- [ ] Verify bounded queues, pagination, payload sizes, and backpressure.
- [ ] Check background work constraints, retries, and battery/network impact.
- [ ] Check resilience to network loss, server errors, slow responses, and process restart.

## H. UX, accessibility, and compatibility
- [ ] Verify labels, focus order, semantics, contrast, text scaling, and touch targets.
- [ ] Check localization, date/time formatting, and input methods.
- [ ] Inspect small screens, orientation changes, and platform-version behavior.
- [ ] Ensure destructive actions have clear confirmation/undo behavior where appropriate.
- [ ] Verify loading and error feedback does not leave users stuck.

## I. Testing and release readiness
- [ ] Map tests to critical user journeys and business rules.
- [ ] Identify missing unit, integration, contract, UI, and regression tests.
- [ ] Run only safe, non-destructive commands/tests and record exact commands/results.
- [ ] Check flaky tests and order-dependent/shared-state tests.
- [ ] Inspect release signing/configuration without revealing secrets.
- [ ] Check crash reporting, observability, rollback, and migration readiness.

## J. Reporting quality
- [ ] Every finding has evidence and a precise location.
- [ ] Severity reflects impact and exploitability, not guesswork.
- [ ] Re-check call sites and existing safeguards before declaring a defect.
- [ ] Mark uncertainty and environmental assumptions.
- [ ] Separate confirmed findings, potential risks, and improvement suggestions.
- [ ] Deliver report before any proposed implementation.
