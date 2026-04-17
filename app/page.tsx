'use client';

import Link from 'next/link';

const SECTIONS = [
  {
    href:  '/indicators',
    emoji: '📊',
    title: 'Indicators',
    desc:  'Track Belgium\'s progress on environmental objectives — national and regional data across 6 topics including climate, air quality, biodiversity and mobility.',
    color: '#f97316',
    tag:   'Data & tracking',
  },
  {
    href:  '/learn',
    emoji: '📚',
    title: 'Learn',
    desc:  'Deep dives into the environmental challenges Belgium faces — from plastic pollution and air quality to biodiversity loss and the energy transition.',
    color: '#8b5cf6',
    tag:   'Articles & explainers',
  },
  {
    href:  '/calculator',
    emoji: '🧮',
    title: 'Calculators',
    desc:  'Two interactive tools: estimate your personal yearly CO₂ footprint, and discover which critical raw materials are embedded in your everyday devices.',
    color: '#0ea5e9',
    tag:   'Interactive tools',
  },
  {
    href:  '/blog',
    emoji: '✍️',
    title: 'Blog',
    desc:  'Analysis, updates and commentary on Belgium\'s environmental policies, data releases and progress against targets.',
    color: '#22c55e',
    tag:   'Analysis & updates',
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #f4f4f2)' }}>

      {/* ── Hero ── */}
      <div className="landing-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />

        {/* Decorative background pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(249,115,22,0.08) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)',
        }} />

        <div className="landing-hero-inner" style={{ position: 'relative', zIndex: 1, paddingBottom: 48 }}>
          <p className="landing-eyebrow">Belgium</p>

          <h1 className="landing-title" style={{ marginBottom: 16 }}>Environment Tracker</h1>

          <p className="landing-desc" style={{ maxWidth: 560, marginBottom: 0 }}>
            An independent tracker monitoring Belgium&apos;s progress on climate &amp; environment objectives —
            verified data, clear context, no spin.
          </p>
        </div>
      </div>

      {/* ── Section cards ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>

        <p style={{
          fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20,
        }}>
          Explore the tracker
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SECTIONS.map(s => (
            <Link
              key={s.href}
              href={s.href}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#fff',
                borderRadius: 14,
                padding: '22px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                borderLeft: `4px solid ${s.color}`,
                transition: 'box-shadow 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
              }}
              >
                {/* Emoji icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: `${s.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                }}>
                  {s.emoji}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1a1a' }}>{s.title}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: s.color,
                      background: `${s.color}15`, borderRadius: 20,
                      padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {s.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.87rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>

                {/* Arrow */}
                <div style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                  border: `1.5px solid ${s.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.color, fontSize: '0.9rem', fontWeight: 700,
                }}>
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
