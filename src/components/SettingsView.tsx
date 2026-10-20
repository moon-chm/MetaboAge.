import React, { useState } from 'react';
import { exportAllData, purgeAllData, UserProfile, saveProfile } from '../db/storage';

interface SettingsViewProps {
  db: IDBDatabase | null;
  profile: UserProfile | undefined;
  onProfileUpdated: () => void;
  onDataPurged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  db,
  profile,
  onProfileUpdated,
  onDataPurged,
}) => {
  const [sex, setSex] = useState<'male' | 'female' | 'unspecified'>(
    profile?.biologicalSex ?? 'unspecified'
  );
  const [birthYear, setBirthYear] = useState<number>(profile?.birthYear ?? 1990);
  const [units, setUnits] = useState<'metric' | 'imperial'>(
    profile?.preferredUnits ?? 'metric'
  );
  const [heightCm, setHeightCm] = useState<number>(profile?.heightCm ?? 175);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const [confirmPurgeText, setConfirmPurgeText] = useState('');
  const [purging, setPurging] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setSavingProfile(true);
    try {
      await saveProfile(db, {
        biologicalSex: sex,
        birthYear,
        preferredUnits: units,
        heightCm,
      });
      setProfileSavedMsg(true);
      onProfileUpdated();
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExport = async () => {
    if (!db) return;
    try {
      await exportAllData(db);
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Export failed. Please check browser download permissions.');
    }
  };

  const handlePurge = async () => {
    if (!db) return;
    if (confirmPurgeText !== 'DELETE ALL MY DATA') {
      alert('Please type "DELETE ALL MY DATA" exactly to confirm.');
      return;
    }

    setPurging(true);
    try {
      await purgeAllData(db);
      alert('All MetaboAge data has been permanently and irreversibly purged from this device.');
      onDataPurged();
    } catch (err) {
      console.error('Failed to purge data:', err);
    } finally {
      setPurging(false);
      setConfirmPurgeText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 720 }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>
          Settings & Privacy Isolation
        </h1>
        <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
          MetaboAge operates local-first. Your health markers never leave this device.
        </p>
      </div>

      {/* User Profile Card */}
      <form onSubmit={handleSaveProfile} className="card card--glass" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
          Biometric Calibration Profile
        </h2>
        <p className="text-caption">
          Used solely for sex-stratified clinical threshold alignment (e.g. waist circumference standards).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="set-sex">Biological Sex</label>
            <select
              id="set-sex"
              className="input"
              value={sex}
              onChange={(e) => setSex(e.target.value as any)}
            >
              <option value="unspecified">Unspecified (Default)</option>
              <option value="male">Male (Alberti standard)</option>
              <option value="female">Female (Alberti standard)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="set-birthyear">Birth Year</label>
            <input
              id="set-birthyear"
              type="number"
              className="input"
              min="1920"
              max="2015"
              value={birthYear}
              onChange={(e) => setBirthYear(parseInt(e.target.value) || 1990)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="set-height">Height (cm)</label>
            <input
              id="set-height"
              type="number"
              className="input"
              min="100"
              max="250"
              value={heightCm}
              onChange={(e) => setHeightCm(parseInt(e.target.value) || 175)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="set-units">Preferred Units</label>
            <select
              id="set-units"
              className="input"
              value={units}
              onChange={(e) => setUnits(e.target.value as any)}
            >
              <option value="metric">Metric (mg/dL, cm, kg)</option>
              <option value="imperial">Imperial (mg/dL, in, lbs)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
          <button type="submit" id="btn-save-profile" className="btn btn--primary" disabled={savingProfile || !db}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
          {profileSavedMsg && (
            <span style={{ color: 'var(--color-emerald)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
              ✓ Profile saved!
            </span>
          )}
        </div>
      </form>

      {/* Export Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
          Data Portability & Backup
        </h2>
        <p className="text-body" style={{ fontSize: 'var(--text-sm)' }}>
          Download your complete historical records. You will receive 3 standalone files: complete JSON database backup, Biomarkers CSV, and Daily Habits CSV.
        </p>
        <div>
          <button id="btn-export-all" className="btn btn--secondary" onClick={handleExport} disabled={!db}>
            📥 Export All Data (JSON + CSV)
          </button>
        </div>
      </div>

      {/* Irreversible Hard Wipe Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.03)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: '#ef4444' }}>
            Irreversible Hard Data Purge
          </h2>
          <p className="text-body" style={{ fontSize: 'var(--text-sm)', marginTop: '4px' }}>
            Permanently clear all IndexedDB object stores (profile, biomarker history, daily habits). This action cannot be undone.
          </p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="purge-confirm-input" style={{ color: '#ef4444' }}>
            Type <strong>DELETE ALL MY DATA</strong> to confirm:
          </label>
          <input
            id="purge-confirm-input"
            type="text"
            className="input input--error"
            placeholder="DELETE ALL MY DATA"
            value={confirmPurgeText}
            onChange={(e) => setConfirmPurgeText(e.target.value)}
          />
        </div>

        <div>
          <button
            id="btn-purge-data"
            className="btn btn--danger"
            onClick={handlePurge}
            disabled={confirmPurgeText !== 'DELETE ALL MY DATA' || purging || !db}
          >
            {purging ? 'Purging All Stores...' : 'Permanently Delete All Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
