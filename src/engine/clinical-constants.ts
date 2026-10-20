/**
 * MetaboAge — Clinical Constants
 *
 * All biomarker reference ranges and scoring weights are defined here.
 * Never hard-code these values inside calculation logic.
 * Sources: Alberti et al. (2009), ADA Standards of Medical Care 2024, AHA Guidelines.
 */

// ── Biomarker physiological plausibility bounds ─────────────────────────────
export const BOUNDS = {
  FASTING_GLUCOSE_MGDL:   { min: 40,   max: 500  },
  HBA1C_PCT:              { min: 3.5,  max: 16.0 },
  TRIGLYCERIDES_MGDL:     { min: 20,   max: 2000 },
  HDL_MGDL:               { min: 10,   max: 200  },
  LDL_MGDL:               { min: 20,   max: 500  },
  SYSTOLIC_BP_MMHG:       { min: 60,   max: 260  },
  DIASTOLIC_BP_MMHG:      { min: 40,   max: 160  },
  WAIST_CM:               { min: 40,   max: 220  },
} as const;

// ── ADA / AHA / Alberti consensus reference ranges ───────────────────────────
// Each marker has three tiers: optimal, borderline, elevated
// Used to compute normalised sub-scores in [0, 100].
export const REFERENCE_RANGES = {
  FASTING_GLUCOSE_MGDL: {
    optimal:    { lo: 70,  hi: 99  },  // ADA: normal fasting
    borderline: { lo: 100, hi: 125 },  // ADA: impaired fasting / prediabetes
    elevated:   { lo: 126, hi: 500 },  // ADA: diabetes range
  },
  HBA1C_PCT: {
    optimal:    { lo: 4.0, hi: 5.6  },
    borderline: { lo: 5.7, hi: 6.4  },
    elevated:   { lo: 6.5, hi: 16.0 },
  },
  TRIGLYCERIDES_MGDL: {
    optimal:    { lo: 0,   hi: 149 },  // AHA: normal
    borderline: { lo: 150, hi: 199 },
    elevated:   { lo: 200, hi: 2000 },
  },
  HDL_MGDL: {
    // Higher HDL is better — scores invert for this marker
    low_risk:  { lo: 60, hi: 200 },    // protective
    mid:       { lo: 40, hi: 59  },
    high_risk: { lo: 0,  hi: 39  },    // Alberti: MetSyn criterion
  },
  SYSTOLIC_BP_MMHG: {
    optimal:    { lo: 90,  hi: 120 },
    borderline: { lo: 121, hi: 129 },
    elevated:   { lo: 130, hi: 260 },  // AHA Stage 1+ hypertension
  },
  DIASTOLIC_BP_MMHG: {
    optimal:    { lo: 60, hi: 80  },
    borderline: { lo: 81, hi: 89  },
    elevated:   { lo: 90, hi: 160 },
  },
  // Waist circumference — sex-stratified per Alberti (2009)
  WAIST_CM_MALE: {
    optimal:    { lo: 0,   hi: 93  },
    borderline: { lo: 93,  hi: 101 },
    elevated:   { lo: 102, hi: 220 },
  },
  WAIST_CM_FEMALE: {
    optimal:    { lo: 0,   hi: 79  },
    borderline: { lo: 80,  hi: 87  },
    elevated:   { lo: 88,  hi: 220 },
  },
} as const;

// ── Sub-score weights (must sum to 1.0) ──────────────────────────────────────
export const WEIGHTS = {
  GLYCEMIC:       0.35, // glucose + HbA1c
  LIPID:          0.30, // triglycerides + HDL (LDL informational only in MVP)
  CARDIOVASCULAR: 0.25, // systolic BP + diastolic BP + waist
  LIFESTYLE_BONUS: 0.10, // 7-day habit consistency bonus
} as const;

// ── Unit conversion constants ─────────────────────────────────────────────────
export const UNIT_CONV = {
  GLUCOSE_MGDL_TO_MMOLL: 0.05551,
  GLUCOSE_MMOLL_TO_MGDL: 18.0182,
  CM_TO_IN: 0.393701,
  IN_TO_CM: 2.54,
  KG_TO_LB: 2.20462,
  LB_TO_KG: 0.453592,
} as const;

// ── Disclaimers (must be shown alongside any score) ──────────────────────────
export const DISCLAIMER =
  'Educational wellness index. Not medical advice or a biological-age diagnostic.';
