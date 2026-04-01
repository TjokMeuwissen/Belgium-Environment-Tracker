'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QuickStats {
  total:    number;
  achieved: number;
  onTrack:  number;
  offTrack: number;
}

const SECTIONS = [
  {
    href:  '/indicators',
    emoji: '📊',
    title: 'Indicators',
    desc:  'Track Belgium\'s progress on environmental objectives across 6 topics — from greenhouse gas emissions to biodiversity loss. Switch between national and regional data.',
    cta:   'View indicators →',
    color: '#f97316',
    soon:  false,
  },
  {
    href:  '/learn',
    emoji: '📚',
    title: 'Learn',
    desc:  'Deep dives into the environmental challenges Belgium faces, organised by topic.',
    cta:   'Start learning →',
    color: '#8b5cf6',
    soon:  true,
  },
  {
    href:  '/blog',
    emoji: '✍️',
    title: 'Blog',
    desc:  'Analysis, updates and commentary on Belgium\'s environmental policies and progress.',
    cta:   'Read the blog →',
    color: '#22c55e',
    soon:  true,
  },
];

export default function Home() {
  const [stats, setStats] = useState<QuickStats | null>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json')
      .then(r => r.json())
      .then((data: any) => {
        const all: any[] = Object.values(data.topics).flatMap((t: any) => t.indicators);
        setStats({
          total:    all.length,
          achieved: all.filter(i => i.status === 'Achieved').length,
          onTrack:  all.filter(i => i.status === 'On track').length,
          offTrack: all.filter(i => i.status === 'Off track').length,
        });
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

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
            An independent tracker monitoring Belgium&#39;s progress on a selected set of climate &amp; environment objectives — drawing on data from the EEA, Eurostat, VMM, ISSeP and other official sources.
          </p>
          {stats && (
            <div className="landing-hero-stats">
              <div className="stat-pill achieved">✅ {stats.achieved} Achieved</div>
              <div className="stat-pill ontrack">🟢 {stats.onTrack} On track</div>
              <div className="stat-pill offtrack">🔴 {stats.offTrack} Off track</div>
              <div className="stat-pill nodata">📋 {stats.total} indicators total</div>
            </div>
          )}
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
              <span className="landing-card-cta">{s.cta}</span>
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
