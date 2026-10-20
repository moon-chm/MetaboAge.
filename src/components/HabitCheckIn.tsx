import React, { useState, useEffect } from 'react';
import { DailyHabit, saveDailyHabit } from '../db/storage';

interface HabitCheckInProps {
  db: IDBDatabase | null;
  existingHabit?: DailyHabit;
  currentStreak: number;
  onHabitSaved: () => void;
}

export const HabitCheckIn: React.FC<HabitCheckInProps> = ({
  db,
  existingHabit,
  currentStreak,
  onHabitSaved,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Default values optimized for <= 3 taps (sensible defaults pre-filled)
  const [fastingMinutes, setFastingMinutes] = useState<number>(
    existingHabit?.fastingWindowMinutes ?? 960 // 16h default
  );
  const [movementMinutes, setMovementMinutes] = useState<number>(
    existingHabit?.movementMinutes ?? 30 // 30m default
  );
  const [sleepMinutes, setSleepMinutes] = useState<number>(
    existingHabit?.sleepMinutes ?? 480 // 8h default
  );
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(
    (existingHabit?.sleepQualityRating as 1 | 2 | 3 | 4 | 5) ?? 4
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (existingHabit) {
      if (existingHabit.fastingWindowMinutes) setFastingMinutes(existingHabit.fastingWindowMinutes);
      if (existingHabit.movementMinutes) setMovementMinutes(existingHabit.movementMinutes);
      if (existingHabit.sleepMinutes) setSleepMinutes(existingHabit.sleepMinutes);
      if (existingHabit.sleepQualityRating) setSleepQuality(existingHabit.sleepQualityRating);
    }
  }, [existingHabit]);

  const handleSave = async () => {
    if (!db) return;
    setSaving(true);
    try {
      await saveDailyHabit(db, {
        logDate: todayStr,
        fastingWindowMinutes: fastingMinutes,
        movementMinutes: movementMinutes,
        sleepMinutes: sleepMinutes,
        sleepQualityRating: sleepQuality,
      });
      setSaveSuccess(true);
      onHabitSaved();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save habit check-in:', err);
    } finally {
      setSaving(false);
    }
  };

  const fastingOptions = [
    { label: '12h', val: 720 },
    { label: '14h', val: 840 },
    { label: '16h', val: 960 },
    { label: '18h+', val: 1080 },
  ];

  const movementOptions = [
    { label: '15m', val: 15 },
    { label: '30m', val: 30 },
    { label: '45m', val: 45 },
    { label: '60m+', val: 60 },
  ];

  const sleepOptions = [
    { label: '6h', val: 360 },
    { label: '7h', val: 420 },
    { label: '8h', val: 480 },
    { label: '9h+', val: 540 },
  ];

  return (
    <div className="card card--glass" id="habit-checkin-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Header with Streak indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
            Daily Habit Check-In
          </h2>
          <p className="text-caption" style={{ marginTop: '2px' }}>
            Fast 1-tap logging • Takes &lt; 30 seconds
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            id="streak-badge"
            className="badge badge--optimal"
            style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-3)' }}
          >
            🔥 {currentStreak > 0 ? `${currentStreak}-Day Streak` : 'Start Streak'}
          </span>
          {existingHabit && (
            <span className="badge badge--neutral" style={{ fontSize: 'var(--text-xs)' }}>
              ✓ Logged for Today
            </span>
          )}
        </div>
      </div>

      {/* Habit Presets - 3 core pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'var(--space-4)' }}>
        {/* 1. Fasting Window */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label className="text-label" htmlFor="fasting-chips" style={{ fontSize: 'var(--text-xs)' }}>
            Fasting Window ({Math.round(fastingMinutes / 60)}h)
          </label>
          <div className="chip-group" id="fasting-chips" role="radiogroup" aria-label="Fasting Window">
            {fastingOptions.map((opt) => (
              <button
                key={opt.val}
                type="button"
                role="radio"
                aria-checked={fastingMinutes === opt.val}
                className={`chip ${fastingMinutes === opt.val ? 'chip--active' : ''}`}
                onClick={() => setFastingMinutes(opt.val)}
                id={`chip-fasting-${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Movement / Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label className="text-label" htmlFor="movement-chips" style={{ fontSize: 'var(--text-xs)' }}>
            Activity ({movementMinutes}m)
          </label>
          <div className="chip-group" id="movement-chips" role="radiogroup" aria-label="Daily Movement">
            {movementOptions.map((opt) => (
              <button
                key={opt.val}
                type="button"
                role="radio"
                aria-checked={movementMinutes === opt.val}
                className={`chip ${movementMinutes === opt.val ? 'chip--active' : ''}`}
                onClick={() => setMovementMinutes(opt.val)}
                id={`chip-movement-${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sleep Duration & Quality */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label className="text-label" htmlFor="sleep-chips" style={{ fontSize: 'var(--text-xs)' }}>
            Sleep ({Math.round(sleepMinutes / 60)}h)
          </label>
          <div className="chip-group" id="sleep-chips" role="radiogroup" aria-label="Sleep Duration">
            {sleepOptions.map((opt) => (
              <button
                key={opt.val}
                type="button"
                role="radio"
                aria-checked={sleepMinutes === opt.val}
                className={`chip ${sleepMinutes === opt.val ? 'chip--active' : ''}`}
                onClick={() => setSleepMinutes(opt.val)}
                id={`chip-sleep-${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Sleep Quality Rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label className="text-label" htmlFor="quality-chips" style={{ fontSize: 'var(--text-xs)' }}>
            Sleep Quality ({sleepQuality} / 5)
          </label>
          <div className="chip-group" id="quality-chips" role="radiogroup" aria-label="Sleep Quality">
            {([1, 2, 3, 4, 5] as const).map((q) => (
              <button
                key={q}
                type="button"
                role="radio"
                aria-checked={sleepQuality === q}
                className={`chip ${sleepQuality === q ? 'chip--active' : ''}`}
                onClick={() => setSleepQuality(q)}
                id={`chip-quality-${q}`}
              >
                {q}★
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Action & Feedback */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', paddingTop: 'var(--space-2)' }}>
        <button
          id="btn-save-habits"
          className="btn btn--primary"
          onClick={handleSave}
          disabled={saving || !db}
          style={{ minWidth: 180 }}
          aria-label="Save today's habit check-in"
        >
          {saving ? 'Saving...' : existingHabit ? 'Update Today’s Log' : '✓ Quick Check-In (1-Tap)'}
        </button>

        {saveSuccess && (
          <span
            id="habit-save-success-msg"
            style={{
              color: 'var(--color-emerald)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
          >
            ✓ Check-in saved! Streak updated to {currentStreak > 0 ? currentStreak : 1} days.
          </span>
        )}
      </div>
    </div>
  );
};
