import React from 'react';
import { ResilienceResult } from '../engine/metabolic-engine';

interface ResilienceGaugeProps {
  result: ResilienceResult | null;
  loading?: boolean;
}

export const ResilienceGauge: React.FC<ResilienceGaugeProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="card card--glass card--glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
        <div className="skeleton" style={{ width: 160, height: 160, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: 140, height: 24, borderRadius: 'var(--radius-sm)' }} />
      </div>
    );
  }

  const score = result?.overallScore ?? 0;
  const tier = result?.overallTier ?? 'unknown';

  // SVG ring calculations (radius = 70, circumference = 2 * PI * 70 ≈ 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getTierColor = (t: string) => {
    switch (t) {
      case 'optimal': return 'var(--color-emerald)';
      case 'borderline': return 'var(--color-amber)';
      case 'elevated': return 'var(--color-elevated)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getTierBadge = (t: string) => {
    switch (t) {
      case 'optimal': return 'badge--optimal';
      case 'borderline': return 'badge--moderate';
      case 'elevated': return 'badge--elevated';
      default: return 'badge--neutral';
    }
  };

  const tierLabel = {
    optimal: 'Optimal Resilience',
    borderline: 'Moderate Resilience',
    elevated: 'Attention Suggested',
    unknown: 'Awaiting Biomarkers',
  }[tier];

  return (
    <div className="card card--glass card--glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-label">Metabolic Resilience Score</span>
        <span className={`badge ${getTierBadge(tier)}`} id="resilience-tier-badge">
          {tierLabel}
        </span>
      </div>

      {/* Circular Gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', margin: 'var(--space-2) 0' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }} aria-label={`Resilience score gauge: ${score} out of 100`}>
          {/* Background Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="14"
          />
          {/* Animated Value Ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={getTierColor(tier)}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 800ms cubic-bezier(0.34, 1.56, 0.64, 1), stroke 400ms ease',
              filter: `drop-shadow(0 0 8px ${getTierColor(tier)}88)`,
            }}
          />
        </svg>

        {/* Center score readout */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            id="resilience-score-num"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--weight-bold)',
              lineHeight: 1,
              color: 'var(--color-text-primary)',
            }}
          >
            {score > 0 ? score : '--'}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
            / 100 Index
          </span>
        </div>
      </div>

      {/* Domain Sub-Scores Breakdown */}
      {result && result.domain && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', background: 'var(--color-surface-alt)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Glycemic</span>
              <span className="text-mono">{result.domain.glycemic.tier !== 'unknown' ? `${result.domain.glycemic.score}%` : 'N/A'}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${result.domain.glycemic.score}%`, height: '100%', background: getTierColor(result.domain.glycemic.tier), transition: 'width 600ms ease' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Lipid Profile</span>
              <span className="text-mono">{result.domain.lipid.tier !== 'unknown' ? `${result.domain.lipid.score}%` : 'N/A'}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${result.domain.lipid.score}%`, height: '100%', background: getTierColor(result.domain.lipid.tier), transition: 'width 600ms ease' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Cardio / BP</span>
              <span className="text-mono">{result.domain.cardiovascular.tier !== 'unknown' ? `${result.domain.cardiovascular.score}%` : 'N/A'}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${result.domain.cardiovascular.score}%`, height: '100%', background: getTierColor(result.domain.cardiovascular.tier), transition: 'width 600ms ease' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Habit Bonus</span>
              <span className="text-mono">{result.domain.lifestyleBonus.score}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${result.domain.lifestyleBonus.score}%`, height: '100%', background: getTierColor(result.domain.lifestyleBonus.tier), transition: 'width 600ms ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Non-Diagnostic Educational Disclaimer */}
      <div className="disclaimer" id="resilience-disclaimer" style={{ width: '100%', boxSizing: 'border-box' }}>
        <span aria-hidden="true" style={{ fontSize: '1rem', flexShrink: 0 }}>ⓘ</span>
        <span>
          <strong>Non-diagnostic educational index:</strong> This resilience score reflects relative lifestyle & biomarker alignment based on published consensus criteria. It is not biological age, medical advice, or a clinical diagnosis.
        </span>
      </div>
    </div>
  );
};
