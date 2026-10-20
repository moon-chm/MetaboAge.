/**
 * MetaboAge — Deterministic Metabolic Resilience Scoring Engine  (MTA-08)
 *
 * Pure, side-effect-free functions.
 * No external dependencies — test with plain Vitest.
 *
 * Outputs an educational "Metabolic Resilience Score" in [0, 100].
 * DISCLAIMER: Not a medical device. Not a biological-age diagnostic.
 */

import {
  BOUNDS,
  REFERENCE_RANGES,
  WEIGHTS,
  UNIT_CONV,
  DISCLAIMER,
} from './clinical-constants.ts';

export { DISCLAIMER };

// ── Public types ─────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female' | 'unspecified';

export interface BiomarkerInput {
  /** mg/dL (use convertGlucose helpers if in mmol/L) */
  fastingGlucoseMgDl?: number;
  /** % (e.g. 5.7) */
  hba1cPct?: number;
  /** mg/dL */
  triglyceridesMgDl?: number;
  /** mg/dL — higher = better */
  hdlMgDl?: number;
  /** mg/dL — informational only in MVP */
  ldlMgDl?: number;
  /** mmHg */
  systolicBpMmHg?: number;
  /** mmHg */
  diastolicBpMmHg?: number;
  /** cm */
  waistCm?: number;
  /** Required for sex-stratified waist thresholds */
  biologicalSex?: Sex;
}

export interface HabitInput {
  /** Fasting window in minutes (e.g. 960 = 16 h) */
  fastingWindowMinutes?: number;
  /** Moderate-intensity movement in minutes */
  movementMinutes?: number;
  /** Sleep duration in minutes */
  sleepMinutes?: number;
  /** Subjective quality 1–5 */
  sleepQualityRating?: 1 | 2 | 3 | 4 | 5;
  /** ISO-8601 date strings of the logged days in last 7 days */
  loggedDatesLast7?: string[];
}

export type RiskTier = 'optimal' | 'borderline' | 'elevated' | 'unknown';

export interface MarkerScore {
  /** Normalised sub-score in [0, 100] */
  score: number;
  tier: RiskTier;
}

export interface DomainScores {
  glycemic:       MarkerScore;
  lipid:          MarkerScore;
  cardiovascular: MarkerScore;
  lifestyleBonus: MarkerScore;
}

export interface ResilienceResult {
  /** Final weighted composite in [0, 100]. Higher = better. */
  overallScore: number;
  /** Tier of the overall score */
  overallTier: RiskTier;
  domain: DomainScores;
  /** Markers excluded from scoring due to missing or out-of-bounds values */
  skippedMarkers: string[];
  disclaimer: string;
}

// ── Unit converters (pure) ────────────────────────────────────────────────────

export function glucoseMmolToMgDl(mmol: number): number {
  return mmol * UNIT_CONV.GLUCOSE_MMOLL_TO_MGDL;
}

export function glucoseMgDlToMmol(mgDl: number): number {
  return mgDl * UNIT_CONV.GLUCOSE_MGDL_TO_MMOLL;
}

export function inchesToCm(inches: number): number {
  return inches * UNIT_CONV.IN_TO_CM;
}

export function cmToInches(cm: number): number {
  return cm * UNIT_CONV.CM_TO_IN;
}

// ── Validation ────────────────────────────────────────────────────────────────

function inRange(value: number, lo: number, hi: number): boolean {
  return value >= lo && value <= hi;
}

type BoundsKey = keyof typeof BOUNDS;

function validBound(value: number | undefined, key: BoundsKey): boolean {
  if (value === undefined || value === null || !isFinite(value)) return false;
  const { min, max } = BOUNDS[key];
  return value >= min && value <= max;
}

// ── Sub-score helpers ─────────────────────────────────────────────────────────

/**
 * Clamps a raw marker to its three tiers and returns a sub-score in [0, 100].
 * optimal → 100, borderline → 50, elevated → 10.
 * Linear interpolation within each band for smooth transitions.
 */
function scoreStandardMarker(
  value: number,
  ref: { optimal: { lo: number; hi: number }; borderline: { lo: number; hi: number }; elevated: { lo: number; hi: number } }
): MarkerScore {
  if (inRange(value, ref.optimal.lo, ref.optimal.hi)) {
    return { score: 100, tier: 'optimal' };
  }
  if (inRange(value, ref.borderline.lo, ref.borderline.hi)) {
    // Linear: 100 at optimal boundary → 50 at elevated boundary
    const t = (value - ref.borderline.lo) / (ref.borderline.hi - ref.borderline.lo + 1);
    return { score: Math.round(100 - t * 50), tier: 'borderline' };
  }
  // elevated — linear 50 → 10 over the elevated range
  const span = ref.elevated.hi - ref.elevated.lo + 1;
  const t    = Math.min((value - ref.elevated.lo) / span, 1);
  return { score: Math.round(50 - t * 40), tier: 'elevated' };
}

/**
 * HDL is "higher = better" — invert the scale.
 */
function scoreHdl(value: number): MarkerScore {
  const ref = REFERENCE_RANGES.HDL_MGDL;
  if (inRange(value, ref.low_risk.lo, ref.low_risk.hi)) return { score: 100, tier: 'optimal'    };
  if (inRange(value, ref.mid.lo,      ref.mid.hi      )) return { score:  60, tier: 'borderline' };
  return { score: 20, tier: 'elevated' };
}

function avgScore(scores: number[]): number {
  return scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
}

function tierFromScore(s: number): RiskTier {
  if (s >= 75) return 'optimal';
  if (s >= 45) return 'borderline';
  if (s > 0)   return 'elevated';
  return 'unknown';
}

// ── Domain: Glycemic ──────────────────────────────────────────────────────────

function scoreGlycemic(
  input: BiomarkerInput,
  skipped: string[]
): MarkerScore {
  const parts: number[] = [];

  if (validBound(input.fastingGlucoseMgDl, 'FASTING_GLUCOSE_MGDL')) {
    parts.push(scoreStandardMarker(input.fastingGlucoseMgDl!, REFERENCE_RANGES.FASTING_GLUCOSE_MGDL).score);
  } else if (input.fastingGlucoseMgDl !== undefined) {
    skipped.push('fastingGlucoseMgDl');
  }

  if (validBound(input.hba1cPct, 'HBA1C_PCT')) {
    parts.push(scoreStandardMarker(input.hba1cPct!, REFERENCE_RANGES.HBA1C_PCT).score);
  } else if (input.hba1cPct !== undefined) {
    skipped.push('hba1cPct');
  }

  const score = parts.length ? Math.round(avgScore(parts)) : 0;
  return { score, tier: parts.length ? tierFromScore(score) : 'unknown' };
}

// ── Domain: Lipid ─────────────────────────────────────────────────────────────

function scoreLipid(
  input: BiomarkerInput,
  skipped: string[]
): MarkerScore {
  const parts: number[] = [];

  if (validBound(input.triglyceridesMgDl, 'TRIGLYCERIDES_MGDL')) {
    parts.push(scoreStandardMarker(input.triglyceridesMgDl!, REFERENCE_RANGES.TRIGLYCERIDES_MGDL).score);
  } else if (input.triglyceridesMgDl !== undefined) {
    skipped.push('triglyceridesMgDl');
  }

  if (validBound(input.hdlMgDl, 'HDL_MGDL')) {
    parts.push(scoreHdl(input.hdlMgDl!).score);
  } else if (input.hdlMgDl !== undefined) {
    skipped.push('hdlMgDl');
  }

  // LDL is informational in MVP — not weighted
  const score = parts.length ? Math.round(avgScore(parts)) : 0;
  return { score, tier: parts.length ? tierFromScore(score) : 'unknown' };
}

// ── Domain: Cardiovascular ────────────────────────────────────────────────────

function scoreCardiovascular(
  input: BiomarkerInput,
  skipped: string[]
): MarkerScore {
  const parts: number[] = [];

  if (validBound(input.systolicBpMmHg, 'SYSTOLIC_BP_MMHG')) {
    parts.push(scoreStandardMarker(input.systolicBpMmHg!, REFERENCE_RANGES.SYSTOLIC_BP_MMHG).score);
  } else if (input.systolicBpMmHg !== undefined) {
    skipped.push('systolicBpMmHg');
  }

  if (validBound(input.diastolicBpMmHg, 'DIASTOLIC_BP_MMHG')) {
    parts.push(scoreStandardMarker(input.diastolicBpMmHg!, REFERENCE_RANGES.DIASTOLIC_BP_MMHG).score);
  } else if (input.diastolicBpMmHg !== undefined) {
    skipped.push('diastolicBpMmHg');
  }

  if (validBound(input.waistCm, 'WAIST_CM')) {
    const sex = input.biologicalSex ?? 'unspecified';
    const ref =
      sex === 'female'
        ? REFERENCE_RANGES.WAIST_CM_FEMALE
        : REFERENCE_RANGES.WAIST_CM_MALE; // default to male thresholds for unspecified
    parts.push(scoreStandardMarker(input.waistCm!, ref).score);
  } else if (input.waistCm !== undefined) {
    skipped.push('waistCm');
  }

  const score = parts.length ? Math.round(avgScore(parts)) : 0;
  return { score, tier: parts.length ? tierFromScore(score) : 'unknown' };
}

// ── Domain: Lifestyle bonus ───────────────────────────────────────────────────

/**
 * Habit consistency bonus — 0..100 based on:
 * - % of last 7 days logged
 * - fasting window (target ≥ 720 min = 12 h)
 * - movement (target ≥ 30 min/day)
 * - sleep adequacy (target 420–540 min = 7–9 h)
 */
export function scoreLifestyleBonus(habit: HabitInput): MarkerScore {
  const parts: number[] = [];

  // Consistency
  const logged = habit.loggedDatesLast7?.length ?? 0;
  parts.push(Math.round((logged / 7) * 100));

  // Fasting
  if (habit.fastingWindowMinutes !== undefined) {
    const fw = Math.min(habit.fastingWindowMinutes, 1440);
    parts.push(fw >= 720 ? 100 : Math.round((fw / 720) * 100));
  }

  // Movement
  if (habit.movementMinutes !== undefined) {
    const mv = Math.min(habit.movementMinutes, 120);
    parts.push(mv >= 30 ? 100 : Math.round((mv / 30) * 100));
  }

  // Sleep
  if (habit.sleepMinutes !== undefined) {
    const sl = habit.sleepMinutes;
    if (sl >= 420 && sl <= 540) {
      parts.push(100);
    } else if (sl < 420) {
      parts.push(Math.round((sl / 420) * 100));
    } else {
      // over-sleep penalty is mild
      parts.push(Math.max(60, 100 - Math.round(((sl - 540) / 60) * 20)));
    }
  }

  // Quality multiplier
  const qualityMultiplier = habit.sleepQualityRating
    ? 0.6 + (habit.sleepQualityRating - 1) * 0.1
    : 1;

  const raw = parts.length ? avgScore(parts) * qualityMultiplier : 0;
  const score = Math.min(100, Math.max(0, Math.round(raw)));
  return { score, tier: tierFromScore(score) };
}

// ── Composite engine ──────────────────────────────────────────────────────────

/**
 * Compute the full Metabolic Resilience Score.
 *
 * @param biomarker — Lab biomarker input. All fields are optional.
 * @param habit     — Lifestyle habit data. Can be omitted.
 */
export function computeResilienceScore(
  biomarker: BiomarkerInput,
  habit: HabitInput = {}
): ResilienceResult {
  const skipped: string[] = [];

  const glycemic       = scoreGlycemic(biomarker, skipped);
  const lipid          = scoreLipid(biomarker, skipped);
  const cardiovascular = scoreCardiovascular(biomarker, skipped);
  const lifestyleBonus = scoreLifestyleBonus(habit);

  // Collect active domain weights
  const slots: { score: number; weight: number; active: boolean }[] = [
    { score: glycemic.score,       weight: WEIGHTS.GLYCEMIC,       active: glycemic.tier       !== 'unknown' },
    { score: lipid.score,          weight: WEIGHTS.LIPID,          active: lipid.tier          !== 'unknown' },
    { score: cardiovascular.score, weight: WEIGHTS.CARDIOVASCULAR, active: cardiovascular.tier !== 'unknown' },
    { score: lifestyleBonus.score, weight: WEIGHTS.LIFESTYLE_BONUS, active: true },
  ];

  const activeWeight = slots.reduce((s, sl) => s + (sl.active ? sl.weight : 0), 0);

  // Renormalise weights if domains are missing
  const overallScore = activeWeight > 0
    ? Math.round(
        slots.reduce(
          (s, sl) => s + (sl.active ? (sl.score * sl.weight) / activeWeight : 0),
          0
        )
      )
    : 0;

  return {
    overallScore,
    overallTier: tierFromScore(overallScore),
    domain: { glycemic, lipid, cardiovascular, lifestyleBonus },
    skippedMarkers: skipped,
    disclaimer: DISCLAIMER,
  };
}

// ── "Missing vs Zero" chart rendering contract ────────────────────────────────

/**
 * Returns a chart-safe value.
 * undefined/null  → null  (render as gap in trend line — do NOT draw 0)
 * 0               → 0     (valid zero measurement)
 */
export function chartValue(v: number | null | undefined): number | null {
  return v === undefined || v === null ? null : v;
}
