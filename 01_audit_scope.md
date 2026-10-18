# 01 — Audit Scope and Rules

## Objective
Perform a comprehensive, evidence-based review of the existing MetaboAge project to identify defects, reliability risks, security concerns, performance bottlenecks, maintainability problems, and missing regression coverage—without adding product scope.

## Non-negotiable constraints
- Read-only inspection.
- Do not modify application source code, configuration, tests, or project files.
- Do not create commits, branches, pull requests, or pushes.
- Do not introduce new features or unrelated tasks.
- Do not expose, copy into reports, or commit secrets, credentials, tokens, private keys, or personal data.
- Do not claim a test passed unless it was actually run and its result recorded.
- Distinguish verified defects from hypotheses and unverified risks.
- Report findings before proposing any future code changes.

## In scope
- Repository structure and build reproducibility.
- Application architecture and module boundaries.
- Existing user flows and business logic.
- API contracts, request/response mapping, error handling, and timeouts.
- Persistence, migrations, cache behavior, and synchronization.
- Authentication, authorization, session handling, and sensitive-data handling.
- Input validation, file handling, and dependency security.
- Concurrency, lifecycle, background work, retries, and idempotency.
- Performance, resource management, logging, accessibility, and UX failure states.
- Existing automated tests and safe regression validation.

## Out of scope
- New features or product redesign.
- Broad refactoring not required to explain an existing defect.
- Speculative architecture migration.
- Any code or configuration changes during the audit.
- Publishing or sharing source code or sensitive artifacts.

## Method
1. Confirm the exact repository and revision.
2. Inventory files, modules, build files, dependency manifests, tests, and CI.
3. Trace existing features from entry point through UI/domain/data/API boundaries.
4. Validate behavior with static inspection and safe tests where feasible.
5. Record evidence with file path and line range, impact, reproducibility, and confidence.
6. Cross-check suspected issues against call sites, tests, history, and current behavior to avoid false positives.
7. Produce a prioritized report and a separate proposed fix plan; do not implement fixes.
