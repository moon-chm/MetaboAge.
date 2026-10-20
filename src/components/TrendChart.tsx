import React, { useState } from 'react';
import { BiomarkerRecord, DailyHabit } from '../db/storage';

export type TimeRange = '7D' | '30D' | '90D' | '1Y';
export type MetricType = 'glucose' | 'movement' | 'fasting' | 'sleep' | 'systolicBp';

interface TrendChartProps {
  biomarkers: BiomarkerRecord[];
  habits: DailyHabit[];
}

interface DataPoint {
  date: string;
  value: number | null; // null represents unlogged/missing; 0 is an intentional logged zero!
  isMissing: boolean;
  notes?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ biomarkers, habits }) => {
  const [range, setRange] = useState<TimeRange>('30D');
  const [metric, setMetric] = useState<MetricType>('movement');
  const [hoveredPoint, setHoveredPoint] = useState<{ point: DataPoint; x: number; y: number } | null>(null);

  const rangeDays = {
    '7D': 7,
    '30D': 30,
    '90D': 90,
    '1Y': 365,
  }[range];

  // Generate consecutive date array
  const dateList: string[] = [];
  const today = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dateList.push(d.toISOString().slice(0, 10));
  }

  // Lookups by date
  const biomarkerMap = new Map<string, BiomarkerRecord>();
  biomarkers.forEach((b) => biomarkerMap.set(b.recordedAt, b));

  const habitMap = new Map<string, DailyHabit>();
  habits.forEach((h) => habitMap.set(h.logDate, h));

  // Extract data points for each day in range
  const points: DataPoint[] = dateList.map((date) => {
    if (metric === 'glucose') {
      const b = biomarkerMap.get(date);
      if (!b || b.fastingGlucoseMgDl === undefined) return { date, value: null, isMissing: true };
      return { date, value: b.fastingGlucoseMgDl, isMissing: false };
    }
    if (metric === 'systolicBp') {
      const b = biomarkerMap.get(date);
      if (!b || b.systolicBpMmHg === undefined) return { date, value: null, isMissing: true };
      return { date, value: b.systolicBpMmHg, isMissing: false };
    }
    if (metric === 'movement') {
      const h = habitMap.get(date);
      if (!h || h.movementMinutes === undefined) return { date, value: null, isMissing: true };
      return { date, value: h.movementMinutes, isMissing: false };
    }
    if (metric === 'fasting') {
      const h = habitMap.get(date);
      if (!h || h.fastingWindowMinutes === undefined) return { date, value: null, isMissing: true };
      return { date, value: Math.round((h.fastingWindowMinutes / 60) * 10) / 10, isMissing: false };
    }
    if (metric === 'sleep') {
      const h = habitMap.get(date);
      if (!h || h.sleepMinutes === undefined) return { date, value: null, isMissing: true };
      return { date, value: Math.round((h.sleepMinutes / 60) * 10) / 10, isMissing: false };
    }
    return { date, value: null, isMissing: true };
  });

  // Metric configs
  const metricConfig = {
    glucose: {
      name: 'Fasting Glucose',
      unit: 'mg/dL',
      min: 60,
      max: 160,
      optimalLo: 70,
      optimalHi: 99,
      color: 'var(--color-emerald)',
    },
    systolicBp: {
      name: 'Systolic Blood Pressure',
      unit: 'mmHg',
      min: 80,
      max: 180,
      optimalLo: 90,
      optimalHi: 120,
      color: 'var(--color-indigo)',
    },
    movement: {
      name: 'Daily Movement',
      unit: 'minutes',
      min: 0,
      max: 90,
      optimalLo: 30,
      optimalHi: 60,
      color: 'var(--color-emerald)',
    },
    fasting: {
      name: 'Fasting Window',
      unit: 'hours',
      min: 8,
      max: 20,
      optimalLo: 14,
      optimalHi: 18,
      color: 'var(--color-amber)',
    },
    sleep: {
      name: 'Sleep Duration',
      unit: 'hours',
      min: 4,
      max: 11,
      optimalLo: 7,
      optimalHi: 9,
      color: '#38bdf8',
    },
  }[metric];

  // SVG dimensions
  const width = 760;
  const height = 260;
  const padL = 50;
  const padR = 20;
  const padT = 30;
  const padB = 40;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  // Scale Y
  const yToPx = (val: number) => {
    const clamped = Math.max(metricConfig.min, Math.min(metricConfig.max, val));
    const ratio = (clamped - metricConfig.min) / (metricConfig.max - metricConfig.min);
    return padT + plotH - ratio * plotH;
  };

  // Scale X
  const xToPx = (idx: number) => {
    return padL + (idx / (points.length - 1)) * plotW;
  };

  // Build segments for line drawing:
  // Solid line for contiguous logged values.
  // Dotted bridge across missing/unlogged days!
  const segments: { path: string; isDotted: boolean }[] = [];
  let currentSegment: { x: number; y: number }[] = [];
  let isCurrentDotted = false;

  points.forEach((p, idx) => {
    const x = xToPx(idx);
    if (!p.isMissing && p.value !== null) {
      const y = yToPx(p.value);
      if (isCurrentDotted && currentSegment.length > 0) {
        // connect previous known point to this point as dotted bridge
        segments.push({
          path: `M ${currentSegment[currentSegment.length - 1].x} ${currentSegment[currentSegment.length - 1].y} L ${x} ${y}`,
          isDotted: true,
        });
        currentSegment = [{ x, y }];
        isCurrentDotted = false;
      } else {
        currentSegment.push({ x, y });
      }
    } else {
      // Missing day
      if (!isCurrentDotted && currentSegment.length > 1) {
        // flush solid line
        const d = currentSegment.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
        segments.push({ path: d, isDotted: false });
        currentSegment = [currentSegment[currentSegment.length - 1]];
      }
      isCurrentDotted = true;
    }
  });

  if (currentSegment.length > 1 && !isCurrentDotted) {
    const d = currentSegment.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
    segments.push({ path: d, isDotted: false });
  }

  return (
    <div className="card card--glass" id="trend-chart-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Chart Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {/* Metric Selector Chips */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {(
            [
              { id: 'movement', label: 'Movement' },
              { id: 'fasting', label: 'Fasting' },
              { id: 'sleep', label: 'Sleep' },
              { id: 'glucose', label: 'Glucose' },
              { id: 'systolicBp', label: 'Blood Pressure' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              id={`tab-metric-${m.id}`}
              className={`chip ${metric === m.id ? 'chip--active' : ''}`}
              style={{ fontSize: 'var(--text-xs)' }}
              onClick={() => setMetric(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Time Window Selector (7D, 30D, 90D, 1Y) */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', background: 'var(--color-surface-alt)', padding: '2px', borderRadius: 'var(--radius-full)' }}>
          {(['7D', '30D', '90D', '1Y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              id={`btn-range-${r}`}
              className={`btn btn--ghost btn--sm ${range === r ? 'btn--secondary' : ''}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '2px 10px', fontSize: 'var(--text-xs)', fontWeight: range === r ? 'bold' : 'normal' }}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Missing vs Zero Visual Contract indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', padding: '0 var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 14, height: 3, background: metricConfig.color, display: 'inline-block', borderRadius: 2 }} />
            Logged Measurement
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 14, height: 2, borderTop: '2px dashed rgba(255,255,255,0.4)', display: 'inline-block' }} />
            Unlogged / Missing Gap
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-amber)', display: 'inline-block' }} />
            Solid 0 Baseline
          </span>
        </div>
        <span className="text-caption">
          Optimal target band: {metricConfig.optimalLo}–{metricConfig.optimalHi} {metricConfig.unit}
        </span>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: 540 }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="optZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-emerald)" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Optimal Target Zone Band */}
          <rect
            x={padL}
            y={yToPx(metricConfig.optimalHi)}
            width={plotW}
            height={Math.abs(yToPx(metricConfig.optimalLo) - yToPx(metricConfig.optimalHi))}
            fill="url(#optZoneGrad)"
            rx="4"
          />

          {/* Target Zone Horizontal Guideline */}
          <line
            x1={padL}
            y1={yToPx(metricConfig.optimalLo)}
            x2={padL + plotW}
            y2={yToPx(metricConfig.optimalLo)}
            stroke="var(--color-emerald)"
            strokeOpacity="0.25"
            strokeDasharray="4 4"
          />

          {/* Grid lines & Y Axis Labels */}
          {[metricConfig.min, Math.round((metricConfig.min + metricConfig.max) / 2), metricConfig.max].map((val) => {
            const y = yToPx(val);
            return (
              <g key={val}>
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="rgba(255, 255, 255, 0.06)" />
                <text x={padL - 8} y={y + 4} textAnchor="end" fill="var(--color-text-muted)" fontSize="10" fontFamily="var(--font-mono)">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Line segments (solid vs dotted bridge) */}
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill="none"
              stroke={seg.isDotted ? 'rgba(255, 255, 255, 0.3)' : metricConfig.color}
              strokeWidth={seg.isDotted ? 2 : 3}
              strokeDasharray={seg.isDotted ? '4 4' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data Points (Solid node for measurements, distinctive indicator for 0) */}
          {points.map((p, idx) => {
            if (p.isMissing || p.value === null) return null;
            const x = xToPx(idx);
            const y = yToPx(p.value);
            const isZero = p.value === 0;

            return (
              <circle
                key={p.date}
                cx={x}
                cy={y}
                r={isZero ? 5 : 4}
                fill={isZero ? 'var(--color-amber)' : metricConfig.color}
                stroke="#111827"
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                onMouseEnter={() => setHoveredPoint({ point: p, x, y })}
              />
            );
          })}

          {/* X Axis Dates (Sample 5-7 dates evenly) */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1).map((p) => {
            const originalIndex = points.findIndex((pt) => pt.date === p.date);
            const x = xToPx(originalIndex);
            return (
              <text
                key={p.date}
                x={x}
                y={height - 12}
                textAnchor={originalIndex === 0 ? 'start' : originalIndex === points.length - 1 ? 'end' : 'middle'}
                fill="var(--color-text-muted)"
                fontSize="10"
                fontFamily="var(--font-mono)"
              >
                {p.date.slice(5)}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            id="chart-tooltip"
            style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${hoveredPoint.y - 10}px`,
              transform: 'translate(-50%, -100%)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-2) var(--space-3)',
              boxShadow: 'var(--shadow-card)',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
              fontSize: 'var(--text-xs)',
            }}
          >
            <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
              {hoveredPoint.point.date}
            </div>
            <div style={{ color: hoveredPoint.point.value === 0 ? 'var(--color-amber)' : 'var(--color-emerald)', marginTop: '2px' }}>
              {hoveredPoint.point.value !== null ? (
                <>
                  <strong>{hoveredPoint.point.value}</strong> {metricConfig.unit}
                  {hoveredPoint.point.value === 0 && ' (Logged 0 Baseline)'}
                </>
              ) : (
                'Unlogged (Missing)'
              )}
            </div>
            <div className="text-caption" style={{ marginTop: '2px' }}>
              Target: {metricConfig.optimalLo}–{metricConfig.optimalHi} {metricConfig.unit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
