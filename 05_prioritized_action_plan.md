# 05 — Prioritized Action Plan

## Phase 0 — Restore source access (blocking)
1. Confirm the intended repository URL and branch.
2. If the remote is supposed to contain source, verify whether the local project is in a different directory/repository.
3. Capture a read-only inventory using `08_read_only_local_collection.md`.
4. Provide the correct repository URL or a sanitized ZIP.
5. Record the exact revision and inventory before review.

**Exit criteria:** Source tree and relevant build/test files are accessible and tied to a specific revision.

## Phase 1 — Baseline inventory
- Map modules, entry points, feature routes, persistence, APIs, and tests.
- Identify build instructions and available safe validation commands.
- Record environment/toolchain assumptions.
- Produce a feature inventory grounded in actual source.

**Exit criteria:** Every existing feature has an identified entry point and major data dependencies.

## Phase 2 — Critical correctness and security pass
Prioritize authentication/authorization, sensitive data, data loss/corruption, upload handling, injection, crash paths, and broken critical user journeys.

**Exit criteria:** Confirmed high-impact findings are documented with precise evidence and reproducible conditions where possible.

## Phase 3 — Feature-by-feature audit
Review one feature at a time. Do not mark a feature complete until its main flow, request/response mapping, edge cases, cross-feature data, and synchronization behavior have been checked.

**Exit criteria:** Matrix entries are evidence-backed; unverified areas remain explicitly blocked or partial.

## Phase 4 — Reliability, performance, accessibility, and test coverage
Review resource use, concurrency, lifecycle, retries, caching, large datasets, accessibility, and tests.

**Exit criteria:** Safe test results and known coverage gaps are recorded.

## Phase 5 — Second-pass verification
- Re-check every proposed finding against all relevant call sites.
- Look for existing fixes, mitigations, or tests.
- Downgrade false positives and duplicate findings.
- Re-run safe, relevant checks if source and environment permit.

**Exit criteria:** Final findings have confidence levels and no unsupported claims.

## Phase 6 — Final report and proposed fixes
Produce a prioritized findings report and a separate proposed implementation plan. Include expected behavior, minimal scope, regression tests, and risk for each proposed fix.

**Stop condition:** Do not implement fixes during this audit. Wait for explicit authorization after the findings are reviewed.

## Priority definitions
- **P0 — Critical:** Immediate severe security, data-loss, or service-integrity risk with strong evidence.
- **P1 — High:** Major security issue or critical workflow failure.
- **P2 — Medium:** Material feature defect, reliability issue, or performance degradation.
- **P3 — Low:** Limited impact, edge-case defect, maintainability or UX issue.
- **Info:** Evidence-backed observation or improvement opportunity, not a defect.

Severity is assigned only after examining actual code and impact. No code-level P0–P3 findings are currently confirmed.
