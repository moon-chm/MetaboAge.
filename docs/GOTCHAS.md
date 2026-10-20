# MetaboAge — Implementation Learnings & Gotchas (GOTCHAS.md)

## Summary
- **Diagnostic vs. Wellness Framing**: Calling the index "Biological Age" creates FDA device exposure; strictly use "Metabolic Resilience Score" (0–100) with required disclaimer.
- **Missing vs. Zero Distortions**: Unlogged habit days must render as discontinuous dashed bridges without solid nodes; logged 0s render as solid baseline nodes at y=0.
- **Sex-Stratified Waist Norms**: Waist circumference thresholds require stratified bounds per Alberti (2009) (male <94cm vs female <80cm).
- **Bundle Optimization**: Built custom pure SVG charting engine to keep gzipped bundle at 62 KB (budget: 150 KB).

---

## How to add an entry
When you encounter an unexpected edge case, subtle clinical calculation boundary, browser IndexedDB nuance, or design standard friction:
1. Summarize the pitfall and its root cause in one sentence under `## Summary`.
2. Add a detailed section under `## Entries` describing: The Trap, Clinical/Technical Root Cause, and The Resolution.
3. Include tests or code references where applicable.

---

## Entries

### 1. Clinical Calculation & Scoring
- **Non-Diagnostic Positioning**: Calling the composite score "Biological Age" or "Metabolic Age" introduces regulatory risk. The application strictly calculates a **Metabolic Resilience Score** (0–100 index) accompanied by the educational disclaimer banner.
- **Missing vs. Zero Handling**: Converting unlogged habit entries to `0` artificially distorts rolling averages. In the trend chart, missing days render as dashed bridges with no node, while active rest days (logged 0 minutes) render as solid baseline nodes. In the scoring engine, missing domains are omitted from the denominator and active domains are linearly renormalized.
- **Sex-Stratified Thresholds**: Waist circumference cut-offs differ by biological sex (Alberti et al., 2009). The engine defaults to male thresholds when unspecified, but allows sex calibration in Settings.

### 2. Local-First IndexedDB Persistence
- **React StrictMode Asynchrony**: `openDb()` returns a pure `Promise<IDBDatabase>`. Avoid global singletons to prevent race conditions during React 18 double mounting in development.
- **Idempotent Date Keys**: Daily habits are indexed by ISO date string (`YYYY-MM-DD`). Submitting a check-in for an already logged date automatically updates rather than duplicates records.

### 3. UI/UX & Design Tokens
- **<= 3-Tap Habit Logging**: Pre-selected sensible defaults (16h fasting, 30m movement, 8h sleep) allow users to complete daily logging in 1 to 3 taps in under 30 seconds.
- **Pure SVG Trend Engine**: Avoided heavy charting dependencies, achieving a production bundle of 62.07 KB gzipped (58.6% under 150 KB budget).
