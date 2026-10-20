# MetaboAge — Core UX & Interaction Design Specification

**Document ID:** MTA-DOC-06  
**Task:** MTA-06 (CollabSphere Task #10)  
**Status:** In Progress / Ready for Review  
**Date:** 2026-10-20  
**Design Lead:** MetaboAge Product & Design Team  

---

## 1. Design System & Visual Philosophy

### 1.1 "Calm Health" Visual Principles
Traditional healthcare interfaces are sterile, clinical, and fear-inducing. MetaboAge adopts a **"Calm Health"** design philosophy designed to reduce health anxiety while maintaining rigorous scientific clarity:
- **Color Palette:** Deep soothing slate dark canvas (`#0b0f17`), rich emerald accents for optimal metabolic balance (`#10b981`), warm amber for focus areas (`#f59e0b`), and muted lavender/indigo for primary interactions (`#6366f1`). Alarmist high-intensity red is strictly reserved for acute, life-threatening safety alerts.
- **Typography:** Modern clean sans-serif (Inter / Plus Jakarta Sans) with tabular numbers (`font-variant-numeric: tabular-nums`) for jitter-free data updates.
- **Micro-Interactions:** Subtle 150ms spring transitions, glassmorphism cards with fine 1px semi-transparent borders, and skeleton loaders to eliminate Cumulative Layout Shift (CLS < 0.01).

---

## 2. Responsive Layout Specifications

### 2.1 Desktop Layout ($1280\text{px} - 1920\text{px}$)

```
+--------------------------------------------------------------------------------------------------------+
|  [ MetaboAge ]       Dashboard      Biomarkers      Trends      Settings        [ Export ]  (Profile)  |
+--------------------------------------------------------------------------------------------------------+
|                                                                                                        |
|  +-----------------------------------------+   +----------------------------------------------------+  |
|  |  METABOLIC RESILIENCE SCORE             |   |  LONGITUDINAL TRENDS                               |  |
|  |  [ 84 / 100 ] Optimal Zone              |   |  [ Fasting Glucose v ] [ 30D | 90D | 1Y | All ]    |  |
|  |                                         |   |                                                    |  |
|  |  * Glycemic Balance:     92 / 100       |   |   120 |                                            |  |
|  |  * Lipid Harmony:        78 / 100       |   |   100 |---.---.---.--- Normal Band (<100) ---------|  |
|  |  * Cardio Biomarkers:    82 / 100       |   |    80 |    \ / \                                   |  |
|  |  (Educational index. Not medical diag.) |   |       +------------------------------------------  |  |
|  +-----------------------------------------+   |         Oct 1      Oct 10     Oct 20               |  |
|                                                |   * Gray dotted lines = Missing data days          |  |
|  +-----------------------------------------+   +----------------------------------------------------+  |
|  |  TODAY'S HABIT CHECK-IN (<30s)          |                                                           |
|  |  Fasting Window: [ 16 hrs ]             |   +----------------------------------------------------+  |
|  |  Movement:       [ 45 mins ]            |   |  RECENT LAB BIOMARKER LOGS                         |  |
|  |  Sleep:          [ 7.5 hrs ] [****.]    |   |  Date       Glucose   HbA1c   Triglycerides   BP   |  |
|  |  [ Log Daily Habits (Quick Submit) ]    |   |  2026-10-18 92 mg/dL  5.3%    138 mg/dL       122  |  |
|  +-----------------------------------------+   +----------------------------------------------------+  |
|                                                                                                        |
+--------------------------------------------------------------------------------------------------------+
```

### 2.2 Mobile Layout ($360\text{px} - 430\text{px}$)

```
+----------------------------------+
|  [=] MetaboAge           (Profile)|
+----------------------------------+
|  METABOLIC RESILIENCE             |
|  [ 84 ] Optimal                  |
|  Last calculated: 2 days ago      |
+----------------------------------+
|  TODAY'S HABIT CHECK-IN          |
|  Fasting: [ 14h ] [ 16h ] [ 18h ]|
|  Movement: [ 15m ] [ 30m ] [ 45m+]|
|  Sleep:    [ 6h ]  [ 7h ]  [ 8h+ ]|
|  [ Quick Check-In (1 Tap) ]      |
+----------------------------------+
|  TREND OVERVIEW                  |
|  Fasting Glucose (90D)           |
|  [~~~~~^~~~~\_~~~~]              |
|  Latest: 92 mg/dL (Normal)       |
+----------------------------------+
|  [ + Log New Lab Biomarkers ]    |
+----------------------------------+
|  [ Home ]  [ Trends ]  [ Settings]|
+----------------------------------+
```

---

## 3. UI States Matrix

| View / Component | Empty State | Loading State | Validation State | Error State |
| :--- | :--- | :--- | :--- | :--- |
| **Resilience Score Card** | Friendly prompt: *"Log your first lab panel or habit to calculate your baseline resilience."* | Shimmer pulse ring loader mimicking circular score gauge. | Shows previous score with subtle recalculating badge. | *"Unable to calculate score. Check input values."* |
| **Habit Quick-Check** | Interactive default slider pre-filled with yesterday's baseline. | Button morphs into spinner on submission (< 150ms). | Immediate inline bounds check (e.g. fasting > 24h prompts alert). | Toast notification: *"Failed to save habit. Stored offline."* |
| **Biomarker Form** | Clean input table with clear placeholder examples (`95 mg/dL`). | Input fields disabled with soft skeleton pulse during batch save. | Non-blocking warning pill for unusual clinical limits with *"Confirm value"* toggle. | Inline red error text under specific invalid field with correction hint. |
| **Longitudinal Trend Chart** | Clean grid canvas with ghost trend line and *"No test history in this date range"*. | Chart container displays shimmering axes and gridlines. | N/A | Offline banner with cached data indicator: *"Showing offline data from Oct 18"*. |

---

## 4. Chart Visualization Conventions: Missing Data vs. Zero Values

To prevent medical misinterpretation of health and habit graphs, charts must strictly adhere to the following rendering standard:

```
Value
  ^
  |          (Logged: 45 mins)
40|               O
  |              / \
20|             /   \ 
  |            /     \   (Dotted bridge across missing day)
 0|-----------O------- - - - - - - - - - - O----------------> Date
            Day 1        Day 2           Day 3
       (Logged: 0m)   (NO LOG/MISSING)  (Logged: 20m)
```

1. **Logged Zero ($y = 0$):**
   - **Render:** Solid circle pip firmly anchored on the horizontal baseline $y=0$ connected by a solid stroke line.
   - **Tooltip:** *"October 1: Logged 0 minutes movement (Rest Day)"*.
2. **Missing / Unlogged Day:**
   - **Render:** Discontinuous data gap or muted dashed line (`stroke-dasharray="4,4"`) with a gray hollow node or no node.
   - **Tooltip:** *"October 2: No habit record logged on this date"*.
   - **Guideline:** Never extrapolate missing days to zero. Missing data is unobserved, not absence of activity.

---

## 5. Prototype Core Journey Walkthrough

### Step 1: Onboarding & Baseline Setup
- User opens application $\rightarrow$ Welcome screen with 1-click "Start Exploring Locally".
- Enter birth year, biological sex (for accurate ADA/AHA clinical reference limits), height, weight.
- No forced email confirmation or password wall; instant local storage initialized.

### Step 2: First Lab Biomarker Entry
- Modal / dedicated screen with standard metabolic panel fields.
- Fasting Glucose: Type `94`, unit defaults to `mg/dL` (toggleable to `mmol/L` with real-time conversion).
- Triglycerides: Type `135`. HDL: Type `55`. Blood pressure: Type `118 / 78`.
- Clicks "Save Lab Record" $\rightarrow$ Instant celebration micro-animation, Resilience score computed to `88 / 100` (Optimal).

### Step 3: Daily Habit Logging (< 30 Seconds)
- Dashboard prominent card: "Daily Habit Check-in for Today".
- 1-click select chips: Fasting `16 hrs`, Movement `30 mins`, Sleep `7.5 hrs` (Rating: 4 stars).
- Click "Quick Submit" $\rightarrow$ Streak incremented to 1 Day; trend chart updates in real-time.

### Step 4: Trend Exploration
- Toggle filter from `30D` to `90D`.
- Dual chart displays fasting glucose points overlaid with weekly movement bars.
- Hovering reveals that periods of consistent 30-minute daily movement align with lower fasting glucose readings.

### Step 5: Privacy & Sovereign Data Management
- Click "Settings & Privacy" $\rightarrow$ "Export Health Data".
- Browser instantly downloads `MetaboAge_Export_2026-10-20.zip` containing JSON and CSV files.
- Click "Delete All Data" $\rightarrow$ Type confirmation phrase $\rightarrow$ Local storage and database wiped clean, redirected to blank onboarding state.
