'use client';

import Link from 'next/link';

const SECTIONS = [
  {
    href:  '/indicators',
    emoji: '📊',
    title: 'Indicators',
    desc:  'Track Belgium\'s progress on environmental objectives — national and regional data across 6 topics.',
    color: '#f97316',
    soon:  false,
  },
  {
    href:  '/learn',
    emoji: '📚',
    title: 'Learn',
    desc:  'Deep dives into the environmental challenges Belgium faces, organised by topic.',
    color: '#8b5cf6',
    soon:  true,
  },
  {
    href:  '/calculator',
    emoji: '🧮',
    title: 'Carbon Footprint Calculator',
    desc:  'Estimate your personal yearly CO₂ footprint in minutes. Visual, easy to use, and calibrated for Belgium.',
    color: '#0ea5e9',
    soon:  false,
  },
  {
    href:  '/blog',
    emoji: '✍️',
    title: 'Blog',
    desc:  'Analysis, updates and commentary on Belgium\'s environmental policies and progress.',
    color: '#22c55e',
    soon:  true,
  },
];

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <div className="landing-hero">
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="landing-hero-inner">
          <p className="landing-eyebrow">🇧🇪 Belgium</p>
          <h1 className="landing-title">Environment Tracker</h1>
          <p className="landing-desc">
            An independent tracker monitoring Belgium&#39;s progress on a selected set of climate &amp; environment objectives.
          </p>
        </div>
      </div>

      {/* ── Section cards ── */}
      <div className="landing-sections">
        <p className="landing-sections-label">Explore the tracker</p>
        <div className="landing-grid">
          {SECTIONS.map(s => (
            <Link
              key={s.href}
              href={s.href}
              className="landing-card"
              style={{ '--lcard-color': s.color } as React.CSSProperties}
            >
              {s.soon && <span className="landing-card-coming">Coming soon</span>}
              <span className="landing-card-emoji">{s.emoji}</span>
              <span className="landing-card-title">{s.title}</span>
              <span className="landing-card-desc">{s.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated March 2026.</p>
      </footer>
    </main>
  );
}
