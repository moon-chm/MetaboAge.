import React from 'react';
import { BiomarkerRecord, deleteBiomarker } from '../db/storage';

interface BiomarkerTableProps {
  db: IDBDatabase | null;
  records: BiomarkerRecord[];
  onRecordDeleted: () => void;
  onOpenAddModal: () => void;
}

export const BiomarkerTable: React.FC<BiomarkerTableProps> = ({
  db,
  records,
  onRecordDeleted,
  onOpenAddModal,
}) => {
  const handleDelete = async (id: string, date: string) => {
    if (!db) return;
    if (window.confirm(`Delete lab record from ${date}?`)) {
      await deleteBiomarker(db, id);
      onRecordDeleted();
    }
  };

  if (records.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🧪</div>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>No Lab Records Logged Yet</h3>
        <p className="text-body" style={{ maxWidth: 440, margin: '0 auto var(--space-6)' }}>
          Add your recent routine blood work or metabolic panel to calibrate your baseline Resilience Score and track changes over time.
        </p>
        <button
          id="btn-add-lab-empty"
          className="btn btn--primary"
          onClick={onOpenAddModal}
        >
          + Add First Lab Record
        </button>
      </div>
    );
  }

  // Sort descending by date
  const sorted = [...records].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)' }}>Historical Lab Panels</h3>
          <p className="text-caption">Stored locally in your browser's IndexedDB</p>
        </div>
        <button id="btn-table-add-lab" className="btn btn--primary btn--sm" onClick={onOpenAddModal}>
          + Add Lab Record
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>Date</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>Glucose</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>HbA1c</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>Triglycerides</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>HDL</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>Blood Pressure</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)' }}>Waist</th>
            <th style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 150ms' }}
            >
              <td style={{ padding: 'var(--space-3) var(--space-2)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-primary)' }}>
                {r.recordedAt}
                {r.sourceNotes && (
                  <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                    {r.sourceNotes}
                  </span>
                )}
              </td>
              <td className="text-mono" style={{ padding: 'var(--space-3) var(--space-2)' }}>
                {r.fastingGlucoseMgDl !== undefined ? `${r.fastingGlucoseMgDl} mg/dL` : '—'}
              </td>
              <td className="text-mono" style={{ padding: 'var(--space-3) var(--space-2)' }}>
                {r.hba1cPct !== undefined ? `${r.hba1cPct}%` : '—'}
              </td>
              <td className="text-mono" style={{ padding: 'var(--space-3) var(--space-2)' }}>
                {r.triglyceridesMgDl !== undefined ? `${r.triglyceridesMgDl} mg/dL` : '—'}
              </td>
              <td className="text-mono" style={{ padding: 'var(--space-3) var(--space-2)' }}>
                {r.hdlMgDl !== undefined ? `${r.hdlMgDl} mg/dL` : '—'}
              </td>
              <td className="text-mono" style={{ padding: 'var(--space-3) var(--space-2)' }}>
                {r.systolicBpMmHg !== undefined && r.diastolicBpMmHg !== undefined
                  ? `${r.systolicBpMmHg}/${r.diastolicBpMmHg}`
                  : r.systolicBpMmHg !== undefined
                  ? `${r.systolicBpMmHg}/—`
                  : '—'}
              </td>
              <td className="text-mono" style={{ padding: 'var(--space-3) var(--space-2)' }}>
                {r.waistCm !== undefined ? `${r.waistCm} cm` : '—'}
              </td>
              <td style={{ padding: 'var(--space-3) var(--space-2)', textAlign: 'right' }}>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => handleDelete(r.id, r.recordedAt)}
                  title="Delete record"
                  aria-label={`Delete record from ${r.recordedAt}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
