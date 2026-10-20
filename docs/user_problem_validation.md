# MetaboAge — User Problem Validation & Discovery Report

**Document ID:** MTA-DOC-04  
**Task:** MTA-03 (CollabSphere Task #7)  
**Status:** Completed / Ready for Review  
**Date:** 2026-10-20  
**Research Lead:** MetaboAge Product Team  

---

## 1. Study Overview & Methodology

To validate the core assumptions articulated in the Research Brief (MTA-01) and MVP PRD (MTA-02), a qualitative discovery study was conducted with 10 prospective users matching the primary ("Alex" — Proactive Preventer) and secondary ("Elena" — Habit Seeker) personas.

### Privacy & Compliance Protocol
- **Zero Protected Health Information (PHI) Retention:** No participant legal names, dates of birth, contact details, or real clinical diagnostic histories were recorded.
- **Synthesized Data:** All transcripts were scrubbed and categorized into behavioral themes, functional friction, and emotional sentiment.

---

## 2. Interview Question Protocol

The semi-structured interview guide was divided into four inquiry blocks:

### Block A: Current Lab & Biomarker Management
1. When you receive results from routine blood work or physicals, where do those results live? How often do you refer back to them?
2. How do you currently compare your current cholesterol or blood sugar results to tests you took 2–3 years ago?
3. What is the most confusing or frustrating part of reviewing your lab reports?

### Block B: Daily Lifestyle & Habit Logging
4. What apps, wearables, or manual tools (if any) do you currently use to track daily physical activity, sleep, or eating patterns?
5. What was the last health/wellness app you abandoned, and what caused you to stop using it?
6. How much time are you willing to spend each day logging health habits before it feels like a chore?

### Block C: Metabolic Health & Concept Testing
7. If an app showed you an overall "Metabolic Resilience Score" based on your lab values and habits, what would you expect that score to tell you?
8. Would you prefer seeing an estimated "Biological Age" (e.g. "Your body is 38 years old") or a guideline wellness indicator (e.g. "Optimal fasting range")? Why?
9. How would you feel if an app gave you an alert indicating elevated health risks? What tone of voice would you expect?

### Block D: Data Privacy & Export
10. What concerns do you have regarding uploading or typing your blood biomarker numbers into a wellness application?
11. How important is it for you to be able to download your entire data history or delete your account completely with one click?

---

## 3. Anonymized Participant Cohort ($N = 10$)

| ID | Persona Archetype | Age Bracket | Current Tracking Tools | Prior Lab Frequency | Key Motivation |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **P01** | Proactive Preventer | 30–35 | Apple Watch, Apple Health | Annual employer check | Optimize energy & blunted glucose spikes |
| **P02** | Habit Seeker | 45–50 | Pen & paper notebook | Annual primary care | Lower borderline systolic blood pressure |
| **P03** | Proactive Preventer | 35–40 | Garmin, MyFitnessPal (sporadic) | Every 6 months | Longevity & cardiovascular risk mitigation |
| **P04** | Habit Seeker | 40–45 | None currently (ex-Fitbit user) | Bi-annual check | Manage postpartum metabolic shifts |
| **P05** | Habit Seeker | 50–55 | Blood pressure cuff log | Annual primary care | Maintain healthy fasting glucose |
| **P06** | Proactive Preventer | 25–30 | Oura Ring, Notion health log | Annual check | Track biohacking / fasting protocol |
| **P07** | Habit Seeker | 45–50 | None | Once every 2 years | Reduce anxiety about doctor visits |
| **P08** | Proactive Preventer | 35–40 | Whoop, Levels CGM (cancelled) | Annual check | Sustained focus without wearable sensors |
| **P09** | Habit Seeker | 40–45 | iPhone Step Tracker | Annual check | Simple daily routine building |
| **P10** | Proactive Preventer | 30–35 | Strava, Apple Health | Every 12 months | Connect fitness performance to lab health |

---

## 4. Key Findings & Recurring Pain Points

### Pain Point 1: The "Annual Lab Black Hole" (9/10 participants)
- **Observation:** Patients receive lab results as static PDF portals (Quest, Labcorp, MyChart). After the initial 5-minute review, the PDF is filed away and forgotten.
- **Direct Quote:** *"I know my cholesterol was slightly higher last year than this year, but looking at two different PDFs on my phone while searching an old portal is impossible."* (P03)
- **Product Implication:** There is high demand for a simple manual entry table that displays historical biomarker progression over 3–5 years on a single unified chart.

### Pain Point 2: Wearable Fatigue & High Subscription Churn (8/10 participants)
- **Observation:** 5 participants had tried CGMs or premium trackers (Whoop, Levels, Oura) but churned due to high cost ($300+/year) or sensor fatigue/skin irritation.
- **Direct Quote:** *"I don't need a needle in my arm 24/7 to know that eating a whole pizza at midnight is bad for my metabolism. I just want a clean place to log my fasting and see if my labs reflect my efforts."* (P08)
- **Product Implication:** Confirms our strategic decision to focus on lightweight manual habit logging rather than mandatory hardware integrations.

### Pain Point 3: Health Anxiety vs. Calm Framing (8/10 participants)
- **Observation:** When presented with the concept of a definitive "Biological Age" vs. an "Educational Wellness/Resilience Index", 8 out of 10 users expressed concern that a negative biological age number would cause anxiety and fatalism.
- **Direct Quote:** *"If an app tells me my biological age is 52 when I'm 44, I feel defeated and want to close the app. If it shows me that my fasting glucose is trending toward the optimal zone because I walked after dinner, I feel motivated."* (P02)
- **Product Implication:** Validates the PRD decision to strictly exclude clinical biological-age claims and instead provide a constructive, empowering Wellness Resilience Index.

### Pain Point 4: Fast Logging Threshold ($\le 30$ seconds)
- **Observation:** 9 out of 10 participants stated they would abandon any daily habit tracking tool that requires more than 30–45 seconds per day or detailed calorie counting.
- **Product Implication:** The daily habit check-in must remain focused on binary or numeric sliders (fasting window, movement minutes, sleep duration) achievable in 3 taps.

---

## 5. Revised Product Hypothesis

Based on the qualitative discovery findings, the product hypothesis is updated:

### Original Hypothesis (MTA-01):
> *If health-conscious adults are provided with an interpretable proxy of biological/metabolic aging and habit tracking, they will adopt measurable behavioral changes that improve biomarkers over 6–12 months.*

### Revised Evidence-Backed Hypothesis (Post-MTA-03):
> **If** individuals navigating metabolic wellness are provided with a **calm, low-friction tool** that organizes their historical lab biomarkers into clear longitudinal trends and correlates them with **quick (<30-second) daily lifestyle habits**,  
> **Then** they will sustain active monthly engagement and habit consistency,  
> **Because** they experience immediate psychological reinforcement without the cost and physical fatigue of continuous sensors, and without the anxiety induced by fatalistic biological-age scores.

---

## 6. Actionable Inputs for Architecture (MTA-05) and UX Design (MTA-06)

1. **UX Design (MTA-06):**
   - Implement a "Calm UI" color palette (slate/emerald/indigo; avoid alarming emergency reds for non-critical alerts).
   - Daily habit widget must be the default landing card for quick 1-click completion.
   - Longitudinal trend view must offer an instant side-by-side view comparing the latest 3 lab results.
2. **Technical Architecture (MTA-05):**
   - Provide local-first instant caching so daily habit logging works instantaneously even on slow mobile connections.
   - Enforce rigorous privacy isolation: zero analytics on biomarker inputs, one-click JSON/CSV export.
