import { useState } from 'react';

type Page = 'dashboard' | 'biomarkers' | 'trends' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <>
      <nav className="app-nav" role="navigation" aria-label="Main navigation">
        <span className="app-nav__brand" aria-label="MetaboAge">MetaboAge<span style={{ color: 'var(--color-emerald)' }}>.</span></span>
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
      </nav>

      <main className="app-main" id="main-content">
        {page === 'dashboard' && <DashboardPlaceholder />}
        {page === 'biomarkers' && <PagePlaceholder title="Biomarkers" description="Log and view your metabolic lab results." />}
        {page === 'trends' && <PagePlaceholder title="Trends" description="Longitudinal trend charts are coming in Wave 2." />}
        {page === 'settings' && <PagePlaceholder title="Settings & Privacy" description="Export or permanently delete your health data." />}
      </main>
    </>
  );
}

function DashboardPlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>
          Good evening, Rohit
        </h1>
        <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
          Your metabolic wellness companion is ready.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Resilience Score placeholder */}
        <div className="card card--glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <span className="text-label">Metabolic Resilience Score</span>
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <div className="skeleton" style={{ width: 140, height: 140, borderRadius: '50%', margin: '0 auto' }} />
            <div className="skeleton" style={{ width: 120, height: 18, margin: 'var(--space-4) auto 0' }} />
          </div>
          <p className="disclaimer">
            <span aria-hidden>ⓘ</span>
            Educational wellness index. Not medical advice or a biological-age diagnostic.
          </p>
        </div>

        {/* Trend chart placeholder */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <span className="text-label">Longitudinal Trends</span>
          <div className="skeleton" style={{ flex: 1, minHeight: 200, borderRadius: 'var(--radius-md)' }} />
        </div>

        {/* Habit check-in placeholder */}
        <div className="card card--glass" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-label">Today's Habit Check-In</span>
            <span className="badge badge--neutral">Loading…</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {['Fasting Window', 'Movement', 'Sleep'].map((h) => (
              <div key={h} style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span className="text-caption">{h}</span>
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            ))}
          </div>
          <button className="btn btn--primary btn--lg" id="btn-quick-submit" aria-label="Submit today's habit check-in" disabled>
            Quick Check-In
          </button>
        </div>
      </div>

      <div className="empty-state">
        <div className="empty-state__icon" aria-hidden>🧬</div>
        <p className="empty-state__title">Log your first lab biomarkers</p>
        <p className="empty-state__body">
          Add a metabolic panel to unlock your Resilience Score and start tracking trends over time.
        </p>
        <button className="btn btn--primary" id="btn-add-first-biomarker" aria-label="Add first biomarker reading">
          + Add Lab Results
        </button>
      </div>
    </div>
  );
}

function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)' }}>{title}</h1>
      <div className="card">
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden>🚧</div>
          <p className="empty-state__title">{title} — Coming in Wave 2</p>
          <p className="empty-state__body">{description}</p>
        </div>
      </div>
    </div>
  );
}
