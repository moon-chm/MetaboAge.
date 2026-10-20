import { useState, useEffect, useCallback } from 'react';
import {
  openDb,
  getProfile,
  getBiomarkers,
  getDailyHabits,
  computeStreak,
  UserProfile,
  BiomarkerRecord,
  DailyHabit,
} from './db/storage';
import {
  computeResilienceScore,
  ResilienceResult,
} from './engine/metabolic-engine';
import { ResilienceGauge } from './components/ResilienceGauge';
import { HabitCheckIn } from './components/HabitCheckIn';
import { BiomarkerModal } from './components/BiomarkerModal';
import { BiomarkerTable } from './components/BiomarkerTable';
import { TrendChart } from './components/TrendChart';
import { SettingsView } from './components/SettingsView';

type Page = 'dashboard' | 'biomarkers' | 'trends' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  // Application Data States
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [biomarkers, setBiomarkers] = useState<BiomarkerRecord[]>([]);
  const [habits, setHabits] = useState<DailyHabit[]>([]);
  const [streak, setStreak] = useState(0);
  const [resilienceResult, setResilienceResult] = useState<ResilienceResult | null>(null);

  // Modals
  const [isBiomarkerModalOpen, setIsBiomarkerModalOpen] = useState(false);

  // Initialize DB
  useEffect(() => {
    let mounted = true;
    openDb()
      .then((database) => {
        if (mounted) setDb(database);
      })
      .catch((err) => {
        console.error('Failed to open IndexedDB:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Reload all data
  const reloadData = useCallback(async () => {
    if (!db) return;
    try {
      const [prof, bms, hbs] = await Promise.all([
        getProfile(db),
        getBiomarkers(db),
        getDailyHabits(db, 365),
      ]);

      setProfile(prof);
      setBiomarkers(bms);
      setHabits(hbs);

      // Compute streak
      const currentStreak = computeStreak(hbs);
      setStreak(currentStreak);

      // Latest biomarker for score calculation
      const sortedBms = [...bms].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
      const latestBm = sortedBms[0];

      // Last 7 days habit consistency
      const today = new Date();
      const last7Days: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7Days.push(d.toISOString().slice(0, 10));
      }
      const loggedDates7 = hbs
        .filter((h) => last7Days.includes(h.logDate))
        .map((h) => h.logDate);

      // Today's or most recent habit
      const todayStr = today.toISOString().slice(0, 10);
      const latestHabit = hbs.find((h) => h.logDate === todayStr) || hbs[hbs.length - 1];

      // Calculate Resilience Score
      const res = computeResilienceScore(
        {
          fastingGlucoseMgDl: latestBm?.fastingGlucoseMgDl,
          hba1cPct: latestBm?.hba1cPct,
          triglyceridesMgDl: latestBm?.triglyceridesMgDl,
          hdlMgDl: latestBm?.hdlMgDl,
          ldlMgDl: latestBm?.ldlMgDl,
          systolicBpMmHg: latestBm?.systolicBpMmHg,
          diastolicBpMmHg: latestBm?.diastolicBpMmHg,
          waistCm: latestBm?.waistCm,
          biologicalSex: prof?.biologicalSex,
        },
        {
          fastingWindowMinutes: latestHabit?.fastingWindowMinutes,
          movementMinutes: latestHabit?.movementMinutes,
          sleepMinutes: latestHabit?.sleepMinutes,
          sleepQualityRating: latestHabit?.sleepQualityRating,
          loggedDatesLast7: loggedDates7,
        }
      );

      setResilienceResult(res);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      reloadData();
    }
  }, [db, reloadData]);

  // Today's habit record
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayHabit = habits.find((h) => h.logDate === todayStr);

  return (
    <>
      {/* Primary Navigation Bar */}
      <nav className="app-nav" role="navigation" aria-label="Main navigation">
        <span className="app-nav__brand" aria-label="MetaboAge">
          MetaboAge<span style={{ color: 'var(--color-emerald)' }}>.</span>
        </span>
        <ul className="app-nav__links" role="list">
          {(['dashboard', 'biomarkers', 'trends', 'settings'] as Page[]).map((p) => (
            <li key={p}>
              <button
                id={`nav-${p}`}
                className={`app-nav__link btn btn--ghost${page === p ? ' app-nav__link--active' : ''}`}
                onClick={() => setPage(p)}
                aria-current={page === p ? 'page' : undefined}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        <div className="app-nav__spacer" />
        <button
          id="btn-nav-log-lab"
          className="btn btn--primary btn--sm"
          onClick={() => setIsBiomarkerModalOpen(true)}
        >
          + Log Lab Biomarkers
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="app-main" id="main-content">
        {page === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header Greeting */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  Metabolic Wellness Dashboard
                </h1>
                <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
                  A calm, private space to monitor health markers and build resilience.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge--optimal" style={{ padding: '6px 12px', fontSize: 'var(--text-sm)' }}>
                  🔥 {streak > 0 ? `${streak}-Day Logging Streak` : 'Start your streak today!'}
                </span>
              </div>
            </div>

            {/* Dashboard Grid: Left gauge, Right trend summary */}
            <div className="dashboard-grid">
              <ResilienceGauge result={resilienceResult} loading={loading} />
              <TrendChart biomarkers={biomarkers} habits={habits} />
            </div>

            {/* Daily Habit Check-In Widget */}
            <HabitCheckIn
              db={db}
              existingHabit={todayHabit}
              currentStreak={streak}
              onHabitSaved={reloadData}
            />

            {/* Quick Summary of Recent Biomarkers */}
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>
                  Recent Lab Biomarkers
                </h2>
                <button className="btn btn--ghost btn--sm" onClick={() => setPage('biomarkers')}>
                  View All History →
                </button>
              </div>
              <BiomarkerTable
                db={db}
                records={biomarkers.slice(0, 3)}
                onRecordDeleted={reloadData}
                onOpenAddModal={() => setIsBiomarkerModalOpen(true)}
              />
            </div>
          </div>
        )}

        {page === 'biomarkers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>
                Metabolic Lab Biomarkers
              </h1>
              <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
                Record results from your routine blood panels (lipids, glycemic index, blood pressure).
              </p>
            </div>
            <BiomarkerTable
              db={db}
              records={biomarkers}
              onRecordDeleted={reloadData}
              onOpenAddModal={() => setIsBiomarkerModalOpen(true)}
            />
          </div>
        )}

        {page === 'trends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>
                Longitudinal Health Trends
              </h1>
              <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
                Inspect multi-variate trends across 7D, 30D, 90D, and 1Y ranges with strict zero vs missing data tracking.
              </p>
            </div>
            <TrendChart biomarkers={biomarkers} habits={habits} />
          </div>
        )}

        {page === 'settings' && (
          <SettingsView
            db={db}
            profile={profile}
            onProfileUpdated={reloadData}
            onDataPurged={reloadData}
          />
        )}
      </main>

      {/* Manual Biomarker Ingestion Modal */}
      <BiomarkerModal
        db={db}
        isOpen={isBiomarkerModalOpen}
        onClose={() => setIsBiomarkerModalOpen(false)}
        onSaved={reloadData}
      />
    </>
  );
}
