# 04 — Feature-by-Feature Audit Matrix

This is a tracking template, not a claim that these features exist in the current MetaboAge source. Populate the feature names from the actual repository after access is restored.

| Area / feature | Entry point | Business rules | Data/API path | Failure & edge cases | Tests | Status |
|---|---|---|---|---|---|---|
| App startup and configuration | TBD | TBD | TBD | Cold start, invalid config, offline | TBD | BLOCKED: source unavailable |
| Authentication and account/session | TBD | TBD | TBD | Invalid credentials, expiry, logout, unauthorized access | TBD | BLOCKED |
| User profile and preferences | TBD | TBD | TBD | Missing fields, stale updates, privacy | TBD | BLOCKED |
| Core dashboard/navigation | TBD | TBD | TBD | Empty state, refresh, navigation restoration | TBD | BLOCKED |
| Primary metabolic-health flows | TBD | TBD | TBD | Invalid inputs, boundary values, units, unavailable data | TBD | BLOCKED |
| Health metrics and calculations | TBD | TBD | TBD | Rounding, units, dates, missing/implausible values | TBD | BLOCKED |
| Charts, trends, and history | TBD | TBD | TBD | Sparse data, out-of-order timestamps, large histories | TBD | BLOCKED |
| Recommendations or insights | TBD | TBD | TBD | Unsupported claims, missing context, stale results | TBD | BLOCKED |
| Notifications and reminders | TBD | TBD | TBD | Permission denied, duplicate, delayed delivery | TBD | BLOCKED |
| Backend/API integration | TBD | TBD | TBD | Timeout, schema mismatch, 4xx/5xx, retry | TBD | BLOCKED |
| Local persistence/cache | TBD | TBD | TBD | Migration, corruption, stale data, logout cleanup | TBD | BLOCKED |
| Sync/offline behavior | TBD | TBD | TBD | Conflicts, duplicate work, retry, restart | TBD | BLOCKED |
| Settings/privacy/data export/deletion | TBD | TBD | TBD | Partial deletion, permission revoke, errors | TBD | BLOCKED |
| Accessibility and localization | TBD | N/A | N/A | Large text, semantics, locale/timezone | TBD | BLOCKED |
| Build/release/CI | N/A | N/A | N/A | Clean build, signing config, environment mismatch | TBD | BLOCKED |

## Required evidence per feature
- Actual file paths and line ranges.
- Normal path and edge-case path.
- Data shape before and after each boundary.
- Failure propagation and user-visible outcome.
- Relevant tests and exact execution result.
- Finding IDs linked to `07_finding_report_template.md`.
