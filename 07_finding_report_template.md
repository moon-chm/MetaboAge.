# 07 — Finding Report Template

Use one section per finding. Do not file a vulnerability or defect without evidence.

## [ID] Short, specific title

- **Severity:** P0 / P1 / P2 / P3 / Info
- **Confidence:** High / Medium / Low
- **Status:** Confirmed / Needs reproduction / Not a finding / Fixed outside this audit
- **Area:** 
- **Affected revision:** 
- **Location:** `path/to/file.ext:line-line`
- **Preconditions:** 
- **Observed behavior:** 
- **Expected behavior:** 
- **Reproduction steps:** 
- **Impact:** 
- **Evidence:** Minimal sanitized snippet, test output, or trace. Never include secrets or personal data.
- **Root cause:** 
- **Related call sites / features:** 
- **Existing safeguards checked:** 
- **Why current safeguards are insufficient:** 
- **Recommended minimal fix (proposal only):** 
- **Regression test proposal:** 
- **Validation still needed:** 

## False-positive review
Before finalizing, confirm:
- The code path is reachable.
- The relevant input can occur in practice.
- The suspected behavior is not prevented by upstream validation or downstream authorization.
- No existing test, migration, or recent fix already addresses it.
- The impact matches the assigned severity.
- Duplicate findings have been merged.

## Executive summary table
| ID | Severity | Area | Title | Confidence | Status |
|---|---|---|---|---|---|
| None confirmed | — | — | Code-level findings unavailable until source is accessible | — | BLOCKED |
