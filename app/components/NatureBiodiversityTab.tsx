'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';

export interface Indicator {
  indicator: string;
  description: string | null;
  unit: string | null;
  target_value: number | null;
  target_year: number | null;
  latest_value: number | null;
  latest_value_year: number | null;
  target_context: string | null;
  status: string | null;
  trend: string | null;
  policy: string | null;
  policy_url: string | null;
  data_source: string | null;
  data_source_url: string | null;
  notes: string | null;
  consequences: string | null;
  responsible: string | null;
}

interface HistoricalPoint { year: number; value: number; }
interface InvasiveSpecies {
  common_name: string;
  scientific_name: string;
  origin: string;
  first_recorded: string;
  eu_status: string;
  establishment: string;
  impact: string;
  management: string;
  source: string;
  source_url: string;
}

interface Props {
  indicators: Indicator[];
  historicalOrganic: HistoricalPoint[];
  historicalBirds: HistoricalPoint[];
  invasiveSpecies: InvasiveSpecies[];
}


// ── Habitat examples ───────────────────────────────────────────────────────
const HABITAT_EXAMPLES = [
  { label: 'Heath & Scrub',      icon: '/icons/grassland.svg', pctBad: 100,  note: '100% of assessments rated Bad — complete failure' },
  { label: 'Bogs, Mires & Fens', icon: '/icons/bogs.svg',      pctBad: 100,  note: 'All bog/fen habitats in unfavourable status' },
  { label: 'Vascular Plants',    icon: '/icons/plant.svg',      pctBad: 55.5, note: '55.5% Bad — highest among species groups' },
  { label: 'Fish',               icon: '/icons/fish.svg',       pctBad: 50,   note: '~50% of assessed fish species in Bad status' },
];

// ── Short impact sentences for overview cards ──────────────────────────────
const IAS_SHORT: Record<string, string> = {
  'American Bullfrog': 'Predates native amphibians and spreads chytrid fungus, causing local extinctions in Flanders.',
  'Japanese Knotweed': 'Forms dense monocultures up to 4 m tall, suppressing all native plants and damaging infrastructure.',
  'Asian Hornet':      'Specialist predator of honeybees and native pollinators — a single nest destroys entire colonies.',
  'American Mink':     'Decimates water voles, fish and ground-nesting birds along Belgian rivers and waterways.',
};

const IAS_EMOJI: Record<string, string> = {
  'American Bullfrog': '🐸',
  'Japanese Knotweed': '🌿',
  'Asian Hornet':      '🐝',
  'American Mink':     '🦦',
};

// ── Misc config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'  },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'  },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'   },
};
const TREND_ICON: Record<string, string> = { Improving: '↑', Stable: '→', Worsening: '↓' };
const COLOR = '#22c55e';

const TOOLTIP_STYLE = {
  background: '#fff', color: '#1a1a1a',
  border: '1px solid #e5e3da', borderRadius: 8,
  fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
};

const SIDEBAR_GROUPS = [
  {
    label: '🌍 Land & Habitat',
    items: [
      { id: 'protected-land-area-terrestrial',                       label: 'Protected Land Area' },
      { id: 'marine-protected-areas',                                label: 'Marine Protected Areas' },
      { id: 'species-habitats-in-favourable-conservation-status',    label: 'Species & Habitats Status' },
    ],
  },
  {
    label: '🌱 Species & Health',
    items: [
      { id: 'organic-farming-share',                                          label: 'Organic Farming Share' },
      { id: 'farmland-bird-population-index',                                 label: 'Farmland Bird Index' },
      { id: 'invasive-alien-species-threatening-red-listed-species',          label: 'Invasive Alien Species' },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(v: number | null | undefined, unit: string | null): string {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function pct(latest: number | null, target: number | null, status?: string | null): number | null {
  if (latest == null || target == null) return null;
  const l = typeof latest === 'number' ? latest : parseFloat(String(latest));
  const t = typeof target === 'number' ? target : parseFloat(String(target));
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  if (status === 'Achieved') return 100;
  if (l < t) return Math.min(100, (l / t) * 100);
  return Math.min(100, (t / l) * 100);
}

function progressColor(pct: number): string {
  if (pct >= 100) return '#166534';
  if (pct >= 80)  return '#16a34a';
  if (pct >= 60)  return '#86efac';
  if (pct >= 40)  return '#f97316';
  if (pct >= 20)  return '#ef4444';
  return '#b91c1c';
}

function indSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ activeId }: { activeId: string }) {
  return (
    <aside className="climate-sidebar">
      {SIDEBAR_GROUPS.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="sidebar-divider" />}
          <div className="sidebar-group-label">{group.label}</div>
          {group.items.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`sidebar-link ${activeId === item.id ? 'active' : ''}`}
              style={{ '--topic-color': COLOR } as React.CSSProperties}
            >
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ── Wide card ──────────────────────────────────────────────────────────────
function WideCard({
  id, ind, chart, chartTitle, chartSource, accentColor, slug,
}: {
  id: string; ind: Indicator; chart: React.ReactNode;
  chartTitle: string; chartSource?: string;
  accentColor: string; slug: string;
}) {
  const sc = STATUS_CFG[ind.status ?? ''] ?? STATUS_CFG['Insufficient data'];
  const p  = pct(ind.latest_value, ind.target_value, ind.status);

  return (
    <div id={id} className="wide-card" style={{ '--topic-color': accentColor } as React.CSSProperties}>
      <div className="wide-card-accent" />
      <div className="wide-card-left">
        <div className="card-top">
          <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
          <span className="trend">{TREND_ICON[ind.trend ?? ''] ?? '—'} {ind.trend ?? '—'}</span>
        </div>
        <h3 className="card-title" style={{ marginTop: 8, fontSize: '1.05rem' }}>{ind.indicator}</h3>
        {ind.description && (
          <p className="card-desc">
            {(ind as any).short_description || ind.description}
          </p>
        )}
        <div className="card-values" style={{ marginTop: 8 }}>
          <div className="value-block">
            <span className="value-label">Latest</span>
            <span className="value-num">{fmt(ind.latest_value, ind.unit)}</span>
            {ind.latest_value_year && <span className="value-year">{ind.latest_value_year}</span>}
          </div>
          {ind.target_value != null && (
            <div className="value-block">
              <span className="value-label">Target</span>
              <span className="value-num">{fmt(ind.target_value, ind.unit)}</span>
              {ind.target_year && <span className="value-year">by {ind.target_year}</span>}
            </div>
          )}
        </div>
        {p != null && (
          <div className="progress-wrap" style={{ marginTop: 8 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${p}%`, background: progressColor(p) }} />
            </div>
            <span className="progress-label">{p === 100 ? '100% of the way to target! 🎉' : `${p.toFixed(0)}% of the way to target`}</span>
          </div>
        )}
        <Link href={`/nature-biodiversity/${slug}`} className="read-more-btn" style={{ '--btn-color': accentColor } as React.CSSProperties}>
          Read more →
        </Link>
      </div>
      <div className="wide-card-right">
        <div className="chart-header">
          <span className="chart-title">{chartTitle}</span>
          {chartSource && <span className="chart-source">{chartSource}</span>}
        </div>
        {chart}
      </div>
    </div>
  );
}

// ── Charts ─────────────────────────────────────────────────────────────────

function ProtectedLandGapChart() {
  // Belgium land area: 30,689 km²
  // Current protected: 14.7% = 4,511 km²
  // Target (EU Biodiversity Strategy 2030): 30% = 9,207 km²
  // Gap: 4,696 km²  ≈  657,700 FIFA football pitches (105m × 68m = 0.00714 km²)
  const LAND_KM2   = 30689;
  const CURRENT_PCT = 14.7;
  const TARGET_PCT  = 30;
  const STRICT_PCT  = 10;   // EU sub-target: strictly protected
  const CURRENT_KM2 = Math.round(LAND_KM2 * CURRENT_PCT / 100);
  const TARGET_KM2  = Math.round(LAND_KM2 * TARGET_PCT  / 100);
  const GAP_KM2     = TARGET_KM2 - CURRENT_KM2;
  const PITCH_KM2   = 0.00714;   // FIFA standard 105 × 68 m
  const PITCHES     = Math.round(GAP_KM2 / PITCH_KM2 / 1000) * 1000; // rounded to nearest 1,000

  const bars = [
    { label: 'Currently protected', pct: CURRENT_PCT, km2: CURRENT_KM2, color: '#22c55e' },
    { label: 'Still needed to reach target', pct: TARGET_PCT - CURRENT_PCT, km2: GAP_KM2, color: '#fde68a', pattern: true },
    { label: 'Strictly protected (sub-target)', pct: STRICT_PCT, km2: Math.round(LAND_KM2 * STRICT_PCT / 100), color: '#16a34a' },
  ];

  return (
    <div style={{ padding: '4px 0 0' }}>
      {/* Visual gauge */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Share of Belgian territory under protection
        </div>
        {/* Full bar representing 100% land */}
        <div style={{ position: 'relative', height: 36, borderRadius: 8, background: '#f3f4f6', overflow: 'visible', marginBottom: 6 }}>
          {/* Protected portion */}
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${CURRENT_PCT}%`, background: '#22c55e', borderRadius: '8px 0 0 8px', transition: 'width 0.5s' }} />
          {/* Gap portion */}
          <div style={{ position: 'absolute', left: `${CURRENT_PCT}%`, top: 0, height: '100%', width: `${TARGET_PCT - CURRENT_PCT}%`, background: 'repeating-linear-gradient(45deg, #fef08a, #fef08a 4px, #fde68a 4px, #fde68a 10px)', borderRadius: 0 }} />
          {/* Target tick */}
          <div style={{ position: 'absolute', left: `${TARGET_PCT}%`, top: -6, bottom: -6, width: 2, background: COLOR, borderRadius: 2 }} />
          {/* Current value label */}
          <div style={{ position: 'absolute', left: `${CURRENT_PCT / 2}%`, top: '50%', transform: 'translate(-50%, -50%)', fontSize: 12, fontWeight: 800, color: '#fff' }}>
            {CURRENT_PCT}%
          </div>
        </div>
        {/* Scale labels */}
        <div style={{ position: 'relative', height: 16 }}>
          <span style={{ position: 'absolute', left: 0, fontSize: 10, color: '#9ca3af' }}>0%</span>
          <span style={{ position: 'absolute', left: `${TARGET_PCT}%`, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: COLOR }}>30% target</span>
          <span style={{ position: 'absolute', right: 0, fontSize: 10, color: '#9ca3af' }}>100%</span>
        </div>
      </div>

      {/* Key figures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid #22c55e' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{CURRENT_KM2.toLocaleString('en-BE')} km²</div>
          <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>Currently protected ({CURRENT_PCT}%)</div>
        </div>
        <div style={{ background: '#fefce8', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid #eab308' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#854d0e' }}>{GAP_KM2.toLocaleString('en-BE')} km²</div>
          <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>Still needed to reach 30% by 2030</div>
        </div>
      </div>

      {/* Soccer fields equivalence */}
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.4rem' }}>⚽</span>
        <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
          The missing {GAP_KM2.toLocaleString('en-BE')} km² is equivalent to about{' '}
          <strong style={{ color: '#166534' }}>{(PITCHES / 1000).toFixed(0)},000 football pitches</strong>
          {' '}(FIFA standard 105 × 68 m) that still need protection.
        </span>
      </div>

      {/* Sub-target note */}
      <div style={{ marginTop: 10, fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
        The EU Biodiversity Strategy 2030 also requires that <strong>10% of land</strong> be under <em>strict protection</em> (no human use). Belgium is estimated to have less than 1% under strict protection.
        {' '}Source: EEA — Designated terrestrial protected areas in Europe (2025).
      </div>
    </div>
  );
}

function NatureLineChart({ data, color, unit, target, targetLabel }: { data: HistoricalPoint[]; color: string; unit: string; target?: number; targetLabel?: string; }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b6b6b' }} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 12, fill: '#6b6b6b' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: any) => [`${v}${unit ? ' ' + unit : ''}`, '']}
          labelStyle={{ fontWeight: 700 }}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color }} />
        {target != null && (
          <ReferenceLine
            y={target}
            stroke={color}
            strokeDasharray="6 4"
            strokeWidth={1.8}
            label={{
              value: targetLabel ?? `🎯 Target: ${target}${unit ? ' ' + unit : ''}`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: color,
              fontWeight: 600,
            }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

function HabitatStatusPanel() {
  return (
    <div className="habitat-grid">
      {HABITAT_EXAMPLES.map((h, i) => (
        <div key={i} className="habitat-card">
          <div className="habitat-icon-wrap">
            <Image src={h.icon} alt={h.label} width={34} height={34} />
          </div>
          <div className="habitat-info">
            <div className="habitat-label">{h.label}</div>
            <div className="habitat-bar-wrap">
              <div className="habitat-bar"><div className="habitat-bar-fill" style={{ width: `${h.pctBad}%` }} /></div>
              <span className="habitat-pct">{h.pctBad}% Bad</span>
            </div>
            <div className="habitat-note">{h.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InvasivePanel({ species }: { species: InvasiveSpecies[] }) {
  return (
    <div className="ias-grid">
      {species.map((sp, i) => (
        <div key={i} className="ias-card">
          <div className="ias-emoji">{IAS_EMOJI[sp.common_name] ?? '🦠'}</div>
          <div className="ias-info">
            <div className="ias-name">{sp.common_name}</div>
            <div className="ias-sci">{sp.scientific_name}</div>
            <div className="ias-impact">{IAS_SHORT[sp.common_name] ?? sp.impact.slice(0, 120)}</div>
            <div className="ias-meta">First recorded: {sp.first_recorded}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MarineReservesMap() {
  return (
    <div style={{ margin: '8px 0' }}>
      <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
        <img
          src="/images/indicators/marine-reserves.jpg"
          alt="Belgian North Sea zones including marine protected areas, renewable energy zones, shipping lanes and other designated areas"
          style={{ width: '100%', display: 'block', borderRadius: 8 }}
        />
      </div>
      <p style={{ fontSize: 11, color: '#6b7280', marginTop: 6, lineHeight: 1.5 }}>
        Belgian North Sea spatial planning zones — marine protected areas (green) alongside renewable energy zones, shipping lanes, extraction areas and anchorage zones.
        Source: <a href="https://www.health.belgium.be/nl/nieuws/2026-3-nieuw-marien-ruimtelijk-plan-treedt-werking" target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1' }}>FPS Public Health Belgium — Marine Spatial Plan 2026</a>
      </p>
    </div>
  );
}

function GroupHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="group-header">
      <div className="group-header-inner">
        <span className="group-emoji">{emoji}</span>
        <div><div className="group-title">{title}</div><div className="group-subtitle">{subtitle}</div></div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const SHOWN = [
  'Protected Land Area — terrestrial',
  'Marine Protected Areas',
  'Species & Habitats in Favourable Conservation Status',
  'Organic Farming Share (% of agricultural area)',
  'Farmland Bird Population Index',
  'Invasive Alien Species Threatening Red-Listed Species',
];

export default function NatureBiodiversityTab({ indicators, historicalOrganic, historicalBirds, invasiveSpecies }: Props) {
  const byName = Object.fromEntries(
    indicators.filter(i => SHOWN.includes(i.indicator)).map(i => [i.indicator, i])
  );

  const [activeId, setActiveId] = useState('protected-land-area-terrestrial');

  useEffect(() => {
    const ids = [
      'protected-land-area-terrestrial',
      'marine-protected-areas',
      'species-habitats-in-favourable-conservation-status',
      'organic-farming-share',
      'farmland-bird-population-index',
      'invasive-alien-species-threatening-red-listed-species',
    ];
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActiveId(id); }, { threshold: 0.25 });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const birds = byName['Farmland Bird Population Index'];
  const birdsDisplay = birds ? { ...birds, indicator: 'Farmland Bird Population Index' } : null;

  return (
    <div className="climate-tab">
      <Sidebar activeId={activeId} />
      <div className="climate-main">

        <GroupHeader emoji="🌍" title="Land & Habitat Protection" subtitle="Protecting Belgium's terrestrial and marine ecosystems against biodiversity loss" />

        {byName['Protected Land Area — terrestrial'] && (
          <WideCard
            id="protected-land-area-terrestrial"
            ind={byName['Protected Land Area — terrestrial']}
            accentColor={COLOR}
            chartTitle="Protected land area — Belgium's gap to the 2030 target"
            chartSource="Source: EEA — Designated terrestrial protected areas in Europe (2025)"
            chart={<ProtectedLandGapChart />}
            slug="protected-land-area-terrestrial"
          />
        )}

        {byName['Marine Protected Areas'] && (
          <WideCard
            id="marine-protected-areas"
            ind={byName['Marine Protected Areas']}
            accentColor={COLOR}
            chartTitle="Belgian North Sea — designated zones"
            chartSource="Source: FPS Public Health Belgium — Marine Spatial Plan 2026"
            chart={<MarineReservesMap />}
            slug="marine-protected-areas"
          />
        )}

        {byName['Species & Habitats in Favourable Conservation Status'] && (
          <WideCard
            id="species-habitats-in-favourable-conservation-status"
            ind={byName['Species & Habitats in Favourable Conservation Status']}
            accentColor={COLOR}
            chartTitle="Conservation status — selected habitats & species groups (Belgium, 2019)"
            chartSource="Source: EEA Art. 17 Habitats Directive reporting"
            chart={<HabitatStatusPanel />}
            slug="species-habitats-in-favourable-conservation-status"
          />
        )}

        <GroupHeader emoji="🌱" title="Species & Ecological Health" subtitle="Tracking the health of Belgium's species, agricultural ecosystems and invasive threats" />

        {byName['Organic Farming Share (% of agricultural area)'] && (
          <WideCard
            id="organic-farming-share"
            ind={byName['Organic Farming Share (% of agricultural area)']}
            accentColor={COLOR}
            chartTitle="Organic farming share — Belgium 2000–2023 (% of utilised agricultural area)"
            chartSource="Source: Eurostat / Statbel"
            chart={<NatureLineChart data={historicalOrganic} color={COLOR} unit="%" target={25} targetLabel="🎯 2030 target: 25%" />}
            slug="organic-farming-share"
          />
        )}

        {birdsDisplay && (
          <WideCard
            id="farmland-bird-population-index"
            ind={birdsDisplay}
            accentColor={COLOR}
            chartTitle="Farmland bird population index — Belgium 1990–2023 (1990 = 100)"
            chartSource="Source: INBO / Natagora / indicators.be"
            chart={<NatureLineChart data={historicalBirds} color="#f97316" unit="" />}
            slug="farmland-bird-population-index"
          />
        )}

        {byName['Invasive Alien Species Threatening Red-Listed Species'] && (
          <WideCard
            id="invasive-alien-species-threatening-red-listed-species"
            ind={byName['Invasive Alien Species Threatening Red-Listed Species']}
            accentColor={COLOR}
            chartTitle="Four key invasive alien species threatening Belgian biodiversity"
            chartSource="Source: INBO / Belgian Forum on Invasive Species"
            chart={<InvasivePanel species={invasiveSpecies} />}
            slug="invasive-alien-species-threatening-red-listed-species"
          />
        )}

      </div>
    </div>
  );
}
