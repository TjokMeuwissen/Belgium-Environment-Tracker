'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// ── Topic + tile data (must match learn/page.tsx) ─────────────────────────────
const TOPICS: Record<string, { label: string; color: string; emoji: string }> = {
  'climate-energy':      { label: 'Climate & Energy',     color: '#f97316', emoji: '🌡️' },
  'nature-biodiversity': { label: 'Nature & Biodiversity', color: '#22c55e', emoji: '🌿' },
  'circularity-waste':   { label: 'Circularity & Waste',  color: '#06b6d4', emoji: '♻️' },
  'water-soil':          { label: 'Water & Soil',          color: '#3b82f6', emoji: '💧' },
  'air-quality':         { label: 'Air Quality',           color: '#8b5cf6', emoji: '💨' },
  'mobility-transport':  { label: 'Mobility & Transport',  color: '#ec4899', emoji: '🚗' },
};

const TILES: Record<string, Record<string, string>> = {
  'climate-energy': {
    'climate-change':                     'Climate Change',
    'carbon-footprint':                   'Carbon Footprint',
    'how-to-reduce-your-carbon-footprint':'How to Reduce Your Carbon Footprint',
    'renewables-the-basics':              'Renewables: The Basics',
  },
  'nature-biodiversity': {
    'what-is-biodiversity':               'What is Biodiversity?',
    'why-are-species-disappearing':       'Why Are Species Disappearing?',
    'protected-areas-explained':          'Protected Areas Explained',
    'invasive-species-in-belgium':        'Invasive Species in Belgium',
    'how-farming-shapes-nature':          'How Farming Shapes Nature',
  },
  'circularity-waste': {
    'what-is-a-circular-economy':         'What is a Circular Economy?',
    'belgiums-waste-system-explained':    "Belgium's Waste System Explained",
    'plastic-the-recycling-reality':      'Plastic: The Recycling Reality',
    'from-linear-to-circular':            'From Linear to Circular: How It Works',
  },
  'water-soil': {
    'belgiums-water-challenge':           "Belgium's Water Challenge",
    'nitrates-and-agriculture':           'Nitrates and Agriculture',
    'what-is-soil-sealing':               'What is Soil Sealing?',
    'pfas-the-forever-chemicals':         'PFAS: The Forever Chemicals',
  },
  'air-quality': {
    'what-makes-air-unhealthy':           'What Makes Air Unhealthy?',
    'traffic-and-air-pollution':          'Traffic and Air Pollution',
    'the-invisible-cost-of-wood-burning': 'The Invisible Cost of Wood Burning',
    'how-belgium-compares-in-europe':     'How Belgium Compares in Europe',
  },
  'mobility-transport': {
    'belgiums-car-culture-explained':     "Belgium's Car Culture Explained",
    'the-rise-of-the-electric-car':       'The Rise of the Electric Car',
    'why-public-transport-matters':       'Why Public Transport Matters',
    'freight-the-forgotten-emitter':      'Freight: The Forgotten Emitter',
  },
};

// Sidebar sections — same for every tile (shell)
const SHELL_SECTIONS = [
  { id: 'overview',        label: 'Overview'         },
  { id: 'key-facts',       label: 'Key facts'        },
  { id: 'belgium-context', label: 'Belgium context'  },
  { id: 'further-reading', label: 'Further reading'  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function TileSidebar({ topicColor }: { topicColor: string }) {
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...SHELL_SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(s.id); return; }
      }
      setActive('overview');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    <div className="detail-sidebar" style={{ '--topic-color': topicColor } as React.CSSProperties}>
      <div className="detail-sidebar-title">On this page</div>
      {SHELL_SECTIONS.map(s => (
        <button
          key={s.id}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Placeholder section card ──────────────────────────────────────────────────
function ShellSection({ id, title, icon }: { id: string; title: string; icon: string }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, padding: '24px 24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderRadius: 8, padding: '14px 16px' }}>
        <span style={{ fontSize: '1.2rem' }}>✍️</span>
        <p style={{ fontSize: '0.88rem', color: '#9ca3af', fontStyle: 'italic' }}>Content coming soon — this section is being prepared.</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LearnTilePage() {
  const { topic, tile } = useParams<{ topic: string; tile: string }>();

  const topicData = TOPICS[topic];
  const tileTitle = TILES[topic]?.[tile];

  if (!topicData || !tileTitle) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>Article not found.</p>
        <Link href="/learn" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>← Back to Learn</Link>
      </div>
    );
  }

  const { label: topicLabel, color: topicColor, emoji: topicEmoji } = topicData;

  return (
    <div className="detail-page">

      {/* Dark header */}
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>
            {topicEmoji} {topicLabel}
          </p>
          <h1 className="detail-title">{tileTitle}</h1>
          <div style={{ marginTop: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '4px 14px', fontSize: '0.8rem', color: '#d1d5db' }}>
              ✍️ Content coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        <TileSidebar topicColor={topicColor} />
        <div className="detail-main">
          <ShellSection id="overview"        title="Overview"        icon="📖" />
          <ShellSection id="key-facts"       title="Key Facts"       icon="📋" />
          <ShellSection id="belgium-context" title="Belgium Context" icon="🇧🇪" />
          <ShellSection id="further-reading" title="Further Reading" icon="🔗" />
        </div>
      </div>

    </div>
  );
}
