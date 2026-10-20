import React, { useState } from 'react';
import { saveBiomarker } from '../db/storage';
import { BOUNDS } from '../engine/clinical-constants';
import { glucoseMmolToMgDl, inchesToCm } from '../engine/metabolic-engine';

interface BiomarkerModalProps {
  db: IDBDatabase | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const BiomarkerModal: React.FC<BiomarkerModalProps> = ({
  db,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [recordedAt, setRecordedAt] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [glucoseUnit, setGlucoseUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [waistUnit, setWaistUnit] = useState<'cm' | 'in'>('cm');

  // Input states (raw strings for clean form typing)
  const [glucose, setGlucose] = useState<string>('');
  const [hba1c, setHba1c] = useState<string>('');
  const [triglycerides, setTriglycerides] = useState<string>('');
  const [hdl, setHdl] = useState<string>('');
  const [ldl, setLdl] = useState<string>('');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [sourceNotes, setSourceNotes] = useState<string>('');

  // Sanity warnings state
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarningConfirm, setShowWarningConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Convert inputs to standard units for storage
  const parseNormalized = () => {
    let normGlucose = glucose ? parseFloat(glucose) : undefined;
    if (normGlucose !== undefined && glucoseUnit === 'mmol/L') {
      normGlucose = Math.round(glucoseMmolToMgDl(normGlucose) * 10) / 10;
    }

    let normWaist = waist ? parseFloat(waist) : undefined;
    if (normWaist !== undefined && waistUnit === 'in') {
      normWaist = Math.round(inchesToCm(normWaist) * 10) / 10;
    }

    return {
      recordedAt,
      fastingGlucoseMgDl: normGlucose,
      hba1cPct: hba1c ? parseFloat(hba1c) : undefined,
      triglyceridesMgDl: triglycerides ? parseFloat(triglycerides) : undefined,
      hdlMgDl: hdl ? parseFloat(hdl) : undefined,
      ldlMgDl: ldl ? parseFloat(ldl) : undefined,
      systolicBpMmHg: systolic ? parseFloat(systolic) : undefined,
      diastolicBpMmHg: diastolic ? parseFloat(diastolic) : undefined,
      waistCm: normWaist,
      sourceNotes: sourceNotes.trim() || undefined,
    };
  };

  const validateSanity = () => {
    const data = parseNormalized();
    const warns: string[] = [];

    if (data.fastingGlucoseMgDl !== undefined) {
      if (data.fastingGlucoseMgDl < BOUNDS.FASTING_GLUCOSE_MGDL.min || data.fastingGlucoseMgDl > BOUNDS.FASTING_GLUCOSE_MGDL.max) {
        warns.push(`Fasting Glucose (${data.fastingGlucoseMgDl} mg/dL) is outside typical physiological limits (40-500 mg/dL).`);
      } else if (data.fastingGlucoseMgDl > 250) {
        warns.push(`Fasting Glucose (${data.fastingGlucoseMgDl} mg/dL) is substantially elevated. Please confirm.`);
      }
    }

    if (data.hba1cPct !== undefined) {
      if (data.hba1cPct < BOUNDS.HBA1C_PCT.min || data.hba1cPct > BOUNDS.HBA1C_PCT.max) {
        warns.push(`HbA1c (${data.hba1cPct}%) is outside typical bounds (3.5-16%).`);
      }
    }

    if (data.systolicBpMmHg !== undefined) {
      if (data.systolicBpMmHg < BOUNDS.SYSTOLIC_BP_MMHG.min || data.systolicBpMmHg > BOUNDS.SYSTOLIC_BP_MMHG.max) {
        warns.push(`Systolic BP (${data.systolicBpMmHg} mmHg) is outside typical bounds.`);
      } else if (data.systolicBpMmHg >= 180) {
        warns.push(`Systolic BP (${data.systolicBpMmHg} mmHg) is in hypertensive crisis range (≥ 180 mmHg).`);
      }
    }

    if (data.diastolicBpMmHg !== undefined && data.systolicBpMmHg !== undefined) {
      if (data.diastolicBpMmHg >= data.systolicBpMmHg) {
        warns.push(`Diastolic BP (${data.diastolicBpMmHg}) cannot be equal to or higher than systolic BP (${data.systolicBpMmHg}).`);
      }
    }

    return warns;
  };

  const handleSubmit = async (bypassWarnings = false) => {
    if (!db) return;

    if (!bypassWarnings) {
      const detectedWarnings = validateSanity();
      if (detectedWarnings.length > 0) {
        setWarnings(detectedWarnings);
        setShowWarningConfirm(true);
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = parseNormalized();
      await saveBiomarker(db, data);
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save biomarker:', err);
      alert('Error saving biomarker record. Ensure date is unique.');
    } finally {
      setSubmitting(false);
      setShowWarningConfirm(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="biomarker-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 id="biomarker-modal-title" style={{ fontSize: 'var(--text-xl)' }}>
              Log Lab Biomarkers
            </h2>
            <p className="text-caption">All parameters are optional. Values stored locally.</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn--ghost"
            style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-1) var(--space-3)' }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Date Selector */}
        <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="input-label" htmlFor="bm-date">Lab Test Date</label>
          <input
            id="bm-date"
            type="date"
            className="input"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            required
          />
        </div>

        {/* Section 1: Glycemic Panel */}
        <div style={{ marginBottom: 'var(--space-4)', background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span className="text-label" style={{ color: 'var(--color-emerald)' }}>Glycemic Panel</span>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                type="button"
                className={`chip ${glucoseUnit === 'mg/dL' ? 'chip--active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                onClick={() => setGlucoseUnit('mg/dL')}
              >
                mg/dL
              </button>
              <button
                type="button"
                className={`chip ${glucoseUnit === 'mmol/L' ? 'chip--active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                onClick={() => setGlucoseUnit('mmol/L')}
              >
                mmol/L
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="bm-glucose">
                Fasting Glucose ({glucoseUnit})
              </label>
              <input
                id="bm-glucose"
                type="number"
                step="any"
                placeholder={glucoseUnit === 'mg/dL' ? 'e.g. 92' : 'e.g. 5.1'}
                className="input"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
              />
              <span className="input-hint">Optimal: 70–99 mg/dL</span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bm-hba1c">HbA1c (%)</label>
              <input
                id="bm-hba1c"
                type="number"
                step="0.1"
                placeholder="e.g. 5.4"
                className="input"
                value={hba1c}
                onChange={(e) => setHba1c(e.target.value)}
              />
              <span className="input-hint">Optimal: 4.0–5.6%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Lipid Panel */}
        <div style={{ marginBottom: 'var(--space-4)', background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
          <span className="text-label" style={{ color: 'var(--color-indigo)', display: 'block', marginBottom: 'var(--space-3)' }}>
            Lipid Panel (mg/dL)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="bm-trig">Triglycerides</label>
              <input
                id="bm-trig"
                type="number"
                placeholder="e.g. 110"
                className="input"
                value={triglycerides}
                onChange={(e) => setTriglycerides(e.target.value)}
              />
              <span className="input-hint">&lt; 150 normal</span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bm-hdl">HDL (Good)</label>
              <input
                id="bm-hdl"
                type="number"
                placeholder="e.g. 62"
                className="input"
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
              />
              <span className="input-hint">&gt; 50 optimal</span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bm-ldl">LDL (Info)</label>
              <input
                id="bm-ldl"
                type="number"
                placeholder="e.g. 95"
                className="input"
                value={ldl}
                onChange={(e) => setLdl(e.target.value)}
              />
              <span className="input-hint">Reference only</span>
            </div>
          </div>
        </div>

        {/* Section 3: Cardiovascular & Anthropometrics */}
        <div style={{ marginBottom: 'var(--space-4)', background: 'var(--color-surface-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span className="text-label" style={{ color: 'var(--color-amber)' }}>Cardio & Anthropometrics</span>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                type="button"
                className={`chip ${waistUnit === 'cm' ? 'chip--active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                onClick={() => setWaistUnit('cm')}
              >
                cm
              </button>
              <button
                type="button"
                className={`chip ${waistUnit === 'in' ? 'chip--active' : ''}`}
                style={{ padding: '2px 8px', fontSize: 'var(--text-xs)' }}
                onClick={() => setWaistUnit('in')}
              >
                inches
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="bm-systolic">Systolic BP</label>
              <input
                id="bm-systolic"
                type="number"
                placeholder="e.g. 118"
                className="input"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
              />
              <span className="input-hint">Optimal &lt; 120</span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bm-diastolic">Diastolic BP</label>
              <input
                id="bm-diastolic"
                type="number"
                placeholder="e.g. 76"
                className="input"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
              />
              <span className="input-hint">Optimal &lt; 80</span>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bm-waist">Waist ({waistUnit})</label>
              <input
                id="bm-waist"
                type="number"
                step="any"
                placeholder={waistUnit === 'cm' ? 'e.g. 84' : 'e.g. 33'}
                className="input"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
              <span className="input-hint">&lt; 94cm M / 80cm F</span>
            </div>
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label className="input-label" htmlFor="bm-notes">Lab Provider / Notes (Optional)</label>
          <input
            id="bm-notes"
            type="text"
            className="input"
            placeholder="e.g. Quest Diagnostics Annual Comprehensive Metabolic Panel"
            value={sourceNotes}
            onChange={(e) => setSourceNotes(e.target.value)}
          />
        </div>

        {/* Non-Blocking Sanity Warning Dialog */}
        {showWarningConfirm && (
          <div
            id="sanity-warning-box"
            style={{
              padding: 'var(--space-4)',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--color-amber)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-amber)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-2)' }}>
              <span>⚠️</span>
              <span>Please Review Flagged Values</span>
            </div>
            <ul style={{ paddingLeft: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
            <p className="text-caption" style={{ marginBottom: 'var(--space-3)' }}>
              You may still save these entries if they match your physician's lab report.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setShowWarningConfirm(false)}
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                id="btn-confirm-override"
                className="btn btn--primary btn--sm"
                onClick={() => handleSubmit(true)}
              >
                Confirm & Save Anyway
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-biomarkers"
            className="btn btn--primary"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Lab Record'}
          </button>
        </div>
      </div>
    </div>
  );
};
