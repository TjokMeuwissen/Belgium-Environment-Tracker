// → app/learn/nature-biodiversity/what-is-biodiversity/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Shared micro-components ──────────────────────────────────────────────────

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        padding: '32px 36px',
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#1a1a1a',
        margin: '0 0 20px',
        paddingBottom: 10,
        borderBottom: '2px solid #22c55e',
      }}
    >
      {children}
    </h2>
  );
}

function Para({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontSize: 15,
        lineHeight: 1.75,
        color: '#374151',
        margin: '0 0 14px',
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function BulletList({
  items,
}: {
  items: { bold?: string; text: string }[];
}) {
  return (
    <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            fontSize: 15,
            lineHeight: 1.7,
            color: '#374151',
            marginBottom: 8,
          }}
        >
          <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }}>▸</span>
          <span>
            {item.bold && <strong>{item.bold}:</strong>} {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 8,
        padding: '14px 18px',
        fontSize: 14,
        lineHeight: 1.65,
        color: '#78350f',
        margin: '16px 0',
      }}
    >
      {children}
    </div>
  );
}

interface KeyFigure {
  value: string;
  label: string;
  color: string;
  source?: string;
}

function KeyFigures({ figures }: { figures: KeyFigure[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 16,
        margin: '20px 0',
      }}
    >
      {figures.map((f, i) => (
        <div
          key={i}
          style={{
            background: '#f9fafb',
            borderRadius: 10,
            borderTop: `4px solid ${f.color}`,
            padding: '18px 16px',
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#1a1a1a',
              lineHeight: 1.1,
            }}
          >
            {f.value}
          </div>
          <div
            style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.4 }}
          >
            {f.label}
          </div>
          {f.source && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
              {f.source}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Belgian Mammal Biomass Chart ─────────────────────────────────────────────

const C_HUMAN     = '#f97316';
const C_LIVESTOCK = '#eab308';
const C_WILD      = '#16a34a';

const REGIONS = [
  { label: 'Global (ref.)', humans: 36,   livestock: 60,   wild: 4,    wildNote: '4% — includes marine mammals',               source: 'Bar-On, Phillips & Milo (PNAS 2018)',                                             isEstimate: false },
  { label: 'Flanders',      humans: 29,   livestock: 71,   wild: 0.07, wildNote: '<0.1% — INBO Natuurrapport 2020',             source: 'Wild: INBO Natuurrapport 2020. Humans/livestock split: estimated.',               isEstimate: true  },
  { label: 'Wallonia',      humans: 31.4, livestock: 68.3, wild: 0.31, wildNote: '0.31% — Belgium Environment Tracker (2026)', source: 'Belgium Environment Tracker analysis (2026). Statbel 2023, DNF wildlife estimates.', isEstimate: false },
  { label: 'Brussels',      humans: 99.3, livestock: 0.65, wild: 0.05, wildNote: '<0.1% — Belgium Environment Tracker (2026)', source: 'Belgium Environment Tracker analysis (2026). Wild mammals assumed negligible.',       isEstimate: false },
];

function BelgianBiomassChart() {
  const [activeIdx, setActiveIdx] = useState(2); // default: Wallonia
  const r = REGIONS[activeIdx];
  const segments = [
    { label: 'Humans',       pct: r.humans,    color: C_HUMAN    },
    { label: 'Livestock',    pct: r.livestock, color: C_LIVESTOCK },
    { label: 'Wild mammals', pct: r.wild,      color: C_WILD     },
  ];

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', margin: '20px 0' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
        Who dominates mammal biomass?
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
        Share of total mammal biomass — select a region
      </div>

      {/* Region switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 20 }}>
        {REGIONS.map((reg, i) => (
          <button key={reg.label} onClick={() => setActiveIdx(i)} style={{
            padding: '6px 14px', borderRadius: 24,
            border: `2px solid ${activeIdx === i ? '#22c55e' : '#e5e7eb'}`,
            background: activeIdx === i ? '#22c55e' : '#fff',
            color: activeIdx === i ? '#fff' : '#374151',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {reg.label}
          </button>
        ))}
      </div>

      {/* Stacked bar */}
      <div style={{ height: 48, borderRadius: 8, overflow: 'hidden', display: 'flex', marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {segments.map(s => (
          <div key={s.label}
            style={{ width: `${s.pct}%`, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'width 0.5s ease', minWidth: s.pct > 3 ? undefined : 0 }}
            title={`${s.label}: ${s.pct}%`}
          >
            {s.pct > 8 && (
              <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                {s.pct >= 1 ? `${s.pct.toFixed(s.pct < 10 ? 1 : 0)}%` : ''}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const, marginBottom: 12 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151' }}>
              <strong>{s.label}</strong>{' — '}
              <span style={{ color: s.color, fontWeight: 700 }}>
                {s.pct < 0.1 ? '<0.1%' : `${s.pct.toFixed(s.pct < 1 ? 2 : 1)}%`}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Wild mammals note */}
      <div style={{ background: `${C_WILD}10`, border: `1px solid ${C_WILD}30`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', marginBottom: 8 }}>
        <strong style={{ color: C_WILD }}>Wild mammals:</strong> {r.wildNote}
        {r.isEstimate && <span style={{ color: '#6b7280', marginLeft: 6 }}>(partial estimate — see methodology)</span>}
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 16px' }}>Source: {r.source}</p>

      {/* Blog post callout */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>📊</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#14532d', marginBottom: 3 }}>
            How we calculated the Belgian figures
          </div>
          <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>
            The Flanders, Wallonia and Brussels estimates are original calculations by Belgium Environment Tracker (2026),
            using Statbel agricultural census data, DNF wildlife surveys, and age-stratified human body weight data.
          </div>
          <Link href="/blog/mammal-biomass-wallonia" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#16a34a', color: '#fff', borderRadius: 8,
            padding: '7px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            Read the full methodology →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Biodiversity Levels Diagram ───────────────────────────────────────────────

const LEVELS = [
  {
    id: 'ecosystem',
    label: 'Ecosystem Diversity',
    color: '#f97316',
    textColor: '#fff',
    rx: 220, ry: 90,
    body: 'The range of habitats, biological communities, and ecological processes across a landscape. Belgium alone contains coastal dunes, Ardennes forests, chalk grasslands, river floodplains, and peat bogs — each harbouring entirely distinct communities of life.',
  },
  {
    id: 'species',
    label: 'Species Diversity',
    color: '#eab308',
    textColor: '#fff',
    rx: 155, ry: 63,
    body: 'The variety of different species in an area. This is the most familiar measure — the number of bird species in a forest, or the variety of wildflowers in a meadow. It includes both the number of species (richness) and how evenly they are distributed (evenness).',
  },
  {
    id: 'genetic',
    label: 'Genetic Diversity',
    color: '#22c55e',
    textColor: '#fff',
    rx: 88, ry: 36,
    body: 'The variation in DNA within a species. High genetic diversity means a population can adapt to disease, climate shifts, and environmental stress. A population with low genetic diversity — like a monoculture crop — is far more vulnerable to a single pathogen or weather extreme.',
  },
];

function BiodiversityLevels() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = LEVELS.find(l => l.id === selected);
  const CX = 240, CY = 100;

  return (
    <div style={{ margin: '20px 0' }}>
      {/* SVG diagram */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 480 205" style={{ width: '100%', maxWidth: 440, display: 'block' }} aria-label="Three nested ellipses representing the three levels of biodiversity">
          {LEVELS.map((level) => (
            <g
              key={level.id}
              onClick={() => setSelected(selected === level.id ? null : level.id)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={level.label}
            >
              <ellipse
                cx={CX} cy={CY}
                rx={level.rx} ry={level.ry}
                fill={level.color}
                opacity={selected && selected !== level.id ? 0.55 : 1}
                style={{ transition: 'opacity 0.2s' }}
              />
            </g>
          ))}
          {/* Labels rendered on top of all ellipses */}
          {LEVELS.map((level, i) => (
            <text
              key={level.id}
              x={CX}
              y={i === 0 ? CY + level.ry - 14 : i === 1 ? CY + level.ry - 12 : CY + 6}
              textAnchor="middle"
              fontSize={i === 0 ? 13 : i === 1 ? 12 : 11}
              fontWeight="700"
              fill={level.textColor}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {level.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Click hint */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: '4px 0 16px' }}>
        Click a level to learn more
      </p>

      {/* Detail panel */}
      {detail ? (
        <div style={{
          background: `${detail.color}14`,
          border: `2px solid ${detail.color}`,
          borderRadius: 10,
          padding: '16px 20px',
          transition: 'all 0.2s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{detail.label}</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 13, padding: '2px 6px' }} aria-label="Close">✕</button>
          </div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{detail.body}</p>
        </div>
      ) : (
        <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
          Select a level above to see details
        </div>
      )}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'intro',        label: 'Introduction' },
  { id: 'three-levels', label: 'The Three Levels' },
  { id: 'belgium',      label: 'Biodiversity in Belgium' },
  { id: 'red-list',     label: 'The Belgian Red List' },
  { id: 'biomass',      label: 'The Biomass Picture' },
  { id: 'sources',      label: 'Sources' },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-title">On this page</div>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(s.id);
            if (el)
              window.scrollTo({
                top: el.getBoundingClientRect().top + window.scrollY - 80,
                behavior: 'smooth',
              });
          }}
        >
          {s.label}
        </a>
      ))}
    </aside>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function WhatIsBiodiversityPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handler = () => {
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const current = offsets.filter((o) => o.top <= 120).at(-1);
      if (current) setActiveSection(current.id);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="detail-page">

      {/* ── Header ── */}
      <div
        className="detail-header"
        style={{
          background:
            'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)',
        }}
      >
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">
            ← Back to Learn
          </Link>
          <div className="header-eyebrow" style={{ color: '#86efac' }}>
            🌿 Nature &amp; Biodiversity
          </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              margin: '8px 0 12px',
              lineHeight: 1.2,
            }}
          >
            What is Biodiversity?
          </h1>
          <p
            style={{
              fontSize: 16,
              color: '#bbf7d0',
              maxWidth: 600,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            From genes to entire ecosystems — why the variety of life on Earth
            is the foundation of everything we depend on.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <Sidebar active={activeSection} />
        <div className="detail-main">

          {/* Introduction */}
          <SectionCard id="intro">
            <SectionTitle>Introduction</SectionTitle>
            <Para>
              <strong>Biodiversity</strong> — short for{' '}
              <em>biological diversity</em> — refers to the variety of life on
              Earth. It encompasses every living organism: plants, animals,
              fungi, and microorganisms, as well as the genetic differences
              within species and the ecosystems they form together.
            </Para>
            <Para>
              It is not simply a count of species. Biodiversity describes the
              richness, variety, and balance of life at every scale — from the
              genetic code inside a single cell to the intricate interactions
              between thousands of species in a Wallonian forest or a Flemish
              polder.
            </Para>
            <NoteBox>
              ⚠️ Biodiversity is declining faster today than at any point in
              human history. The current rate of species extinction is estimated
              to be 100–1,000 times higher than natural background rates —
              driven almost entirely by human activity.
            </NoteBox>
          </SectionCard>

          {/* Three Levels */}
          <SectionCard id="three-levels">
            <SectionTitle>The Three Levels of Biodiversity</SectionTitle>
            <Para>
              Scientists and policymakers recognise three interlocking levels of
              biodiversity. Each level depends on the others — a loss at any one
              ripples through the rest.
            </Para>
            <BiodiversityLevels />
          </SectionCard>

          {/* Belgium */}
          <SectionCard id="belgium">
            <SectionTitle>Biodiversity in Belgium</SectionTitle>
            <Para>
              Despite its small size (30,688 km²) and one of the highest
              population densities in Europe, Belgium hosts a remarkable variety
              of habitats and species — a legacy of its position at the
              crossroads of Atlantic, continental, and sub-montane climate
              zones.
            </Para>
            <KeyFigures
              figures={[
                {
                  value: '~60,000',
                  label: 'Species recorded in Belgium',
                  color: '#22c55e',
                  source: 'Belgian Biodiversity Platform',
                },
                {
                  value: '1,800+',
                  label: 'Native vascular plant species',
                  color: '#16a34a',
                  source: 'INBO',
                },
                {
                  value: '215',
                  label: 'Breeding bird species',
                  color: '#15803d',
                  source: 'Natuurpunt / Aves',
                },
                {
                  value: '~60%',
                  label: 'Habitats in unfavourable conservation status',
                  color: '#dc2626',
                  source: 'Belgian State of Nature Report',
                },
              ]}
            />
            <Para>
              Key habitat types include the Ardennes upland forests, the Hautes
              Fagnes peat bogs, chalk grasslands in Wallonia, polders and
              coastal dunes along the North Sea coast, and the Sonian Forest on
              the edge of Brussels — one of the largest beech forests in Western
              Europe and a UNESCO World Heritage Site.
            </Para>
            <NoteBox>
              🌿 Nature policy in Belgium is fully regionalised. Flanders (INBO
              / Agentschap Natuur en Bos), Wallonia (Département de la Nature
              et des Forêts / SPW), and Brussels (Bruxelles Environnement) each
              set their own biodiversity targets, manage their own protected
              area networks, and report separately to the EU.
            </NoteBox>
          </SectionCard>

          {/* Red List */}
          <SectionCard id="red-list">
            <SectionTitle>The Belgian Red List</SectionTitle>
            <Para>
              Red Lists classify species by their extinction risk — from Least
              Concern through Vulnerable and Endangered to Extinct. Belgium
              maintains separate regional Red Lists for Flanders, Wallonia, and
              Brussels, each compiled by taxon (birds, plants, mammals, insects,
              and so on). The picture they paint is sobering.
            </Para>

            {/* Birds */}
            <div style={{ borderLeft: '4px solid #0369a1', background: '#e0f2fe', borderRadius: '0 10px 10px 0', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: 120, flexShrink: 0, alignSelf: 'stretch' }}>
                  <img src="/images/learn/corn-bunting.jpg" alt="Corn bunting (Emberiza calandra)" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                </div>
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0369a1', marginBottom: 6 }}>🐦 Birds</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    Farmland birds have suffered the steepest declines. The corn bunting (<em>Emberiza calandra</em>, pictured left), Eurasian curlew (<em>Numenius arquata</em>), and grey partridge (<em>Perdix perdix</em>) have collapsed across Flanders and Wallonia over the past 40 years, largely due to agricultural intensification. The curlew no longer breeds in Flanders at all. Around one in three breeding bird species in Belgium is now on a regional Red List.
                  </p>
                </div>
              </div>
            </div>

            {/* Mammals */}
            <div style={{ borderLeft: '4px solid #7c3aed', background: '#ede9fe', borderRadius: '0 10px 10px 0', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: 120, flexShrink: 0, alignSelf: 'stretch' }}>
                  <img src="/images/learn/hamster.jpg" alt="European hamster (Cricetus cricetus)" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                </div>
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#7c3aed', marginBottom: 6 }}>🦇 Mammals</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    Several bat species — including the greater mouse-eared bat (<em>Myotis myotis</em>) and the barbastelle (<em>Barbastella barbastellus</em>) — are listed as Endangered in Flanders. The European hamster (<em>Cricetus cricetus</em>, pictured left) is Critically Endangered in Wallonia, with only a handful of individuals remaining in the Hesbaye region. The wolf (<em>Canis lupus</em>) returned to Flanders in 2018 after an absence of over a century, but remains highly vulnerable.
                  </p>
                </div>
              </div>
            </div>

            {/* Vascular plants */}
            <div style={{ borderLeft: '4px solid #be185d', background: '#fce7f3', borderRadius: '0 10px 10px 0', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: 120, flexShrink: 0, alignSelf: 'stretch' }}>
                  <img src="/images/learn/hondskruid.jpg" alt="Anacamptis morio — chalk grassland orchid" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                </div>
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#be185d', marginBottom: 6 }}>🌸 Vascular plants</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    Roughly 28% of native vascular plant species are on the Red List in Flanders — close to one in three. Species of nutrient-poor, traditionally managed habitats have declined most sharply. The hondskruid (<em>Anacamptis morio</em>, pictured left) is a characteristic orchid of chalk grasslands in Wallonia — one of the most threatened habitat types in Belgium, having shrunk dramatically under modern land use.
                  </p>
                </div>
              </div>
            </div>

            {/* Butterflies & dragonflies */}
            <div style={{ borderLeft: '4px solid #b45309', background: '#fef3c7', borderRadius: '0 10px 10px 0', marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: 120, flexShrink: 0, alignSelf: 'stretch' }}>
                  <img src="/images/learn/marsh-fritilarry.jpg" alt="Marsh fritillary (Euphydryas aurinia)" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                </div>
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#b45309', marginBottom: 6 }}>🦋 Butterflies &amp; dragonflies</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    Belgium has lost around a quarter of its butterfly species from parts of its territory since the mid-20th century. The marsh fritillary (<em>Euphydryas aurinia</em>, pictured left) depends on wet, unimproved grasslands and is among the most threatened butterfly species in Belgium. Several dragonfly species tied to clean, unpolluted water bodies are also listed as Endangered.
                  </p>
                </div>
              </div>
            </div>

            <Para style={{ fontWeight: 600, marginBottom: 8, marginTop: 8 }}>Already gone</Para>
            <Para>
              A number of species are now regionally extinct in (parts of)
              Belgium: the white-tailed eagle (<em>Haliaeetus albicilla</em>) as
              a breeding bird — though now slowly re-establishing — the black
              stork (<em>Ciconia nigra</em>) in Flanders, and the freshwater
              pearl mussel (<em>Margaritifera margaritifera</em>), which has not
              been found alive in Belgian rivers for decades.
            </Para>
            <NoteBox>
              ⚠️ Regional extinction does not mean a species is gone from the
              world — but it signals the complete unravelling of the ecological
              conditions that once supported it locally. Reversing that is far
              harder than preventing it.
            </NoteBox>
          </SectionCard>

          {/* Biomass */}
          <SectionCard id="biomass">
            <SectionTitle>How Dominant Are We? The Mammal Biomass Picture</SectionTitle>
            <Para>
              One of the most striking ways to grasp the scale of human impact
              on biodiversity is to look at the distribution of mammal biomass.
              A landmark 2018 study by Bar-On et al. (<em>PNAS</em>)
              quantified the total biomass of all life on the planet — and the
              numbers for mammals are startling. Belgium Environment Tracker
              has extended this analysis to Belgium's three regions, using
              Statbel agricultural census data and official wildlife surveys.
            </Para>

            <BelgianBiomassChart />

            <Para>
              This is not a historical anomaly. As recently as 10,000 years ago,
              wild mammals dominated. The ratio has inverted almost entirely
              within the span of agricultural civilisation — and most
              dramatically in the last two centuries.
            </Para>
            <Para>
              The same study found that wild birds represent only about 30% of
              total bird biomass; the remaining 70% is poultry. This single
              figure captures something that species counts alone cannot: the
              sheer physical displacement of nature by human systems.
              Biodiversity loss is not just about species disappearing from
              lists — it is about the living world being progressively replaced.
            </Para>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
