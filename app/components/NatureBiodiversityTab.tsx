'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  LineChart, Line, ResponsiveContainer, Cell, LabelList,
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

// ── EU protected land data (EEA 2025) sorted descending ───────────────────
const EU_COMPARISON = [
  { country: 'Luxembourg',  total: 40.6, status: 'Achieved'  },
  { country: 'Slovenia',    total: 40.6, status: 'Achieved'  },
  { country: 'Poland',      total: 39.6, status: 'Achieved'  },
  { country: 'Germany',     total: 38.5, status: 'Achieved'  },
  { country: 'Bulgaria',    total: 38.4, status: 'Achieved'  },
  { country: 'Croatia',     total: 37.2, status: 'Achieved'  },
  { country: 'Slovakia',    total: 35.7, status: 'Achieved'  },
  { country: 'Greece',      total: 33.8, status: 'Achieved'  },
  { country: 'Cyprus',      total: 31.2, status: 'Achieved'  },
  { country: 'Romania',     total: 27.9, status: 'Close'     },
  { country: 'Spain',       total: 27.6, status: 'Close'     },
  { country: 'Hungary',     total: 26.9, status: 'Close'     },
  { country: 'Italy',       total: 27.0, status: 'Close'     },
  { country: 'Austria',     total: 26.5, status: 'Close'     },
  { country: 'EU-27 avg',   total: 26.4, status: 'Close'     },
  { country: 'France',      total: 25.5, status: 'Close'     },
  { country: 'Portugal',    total: 24.8, status: 'Close'     },
  { country: 'Lithuania',   total: 22.2, status: 'Close'     },
  { country: 'Czechia',     total: 21.8, status: 'Close'     },
  { country: 'Estonia',     total: 21.8, status: 'Close'     },
  { country: 'Ireland',     total: 20.4, status: 'Close'     },
  { country: 'Netherlands', total: 19.8, status: 'Off track' },
  { country: 'Latvia',      total: 19.0, status: 'Off track' },
  { country: 'Malta',       total: 17.8, status: 'Off track' },
  { country: 'Sweden',      total: 15.0, status: 'Off track' },
  { country: 'Belgium',     total: 14.7, status: 'Belgium'   },
  { country: 'Finland',     total: 13.4, status: 'Off track' },
  { country: 'Denmark',     total:  8.7, status: 'Off track' },
].sort((a, b) => b.total - a.total);

const BAR_COLOR: Record<string, string> = {
  Achieved:  '#bbf7d0',
  Close:     '#fef08a',
  'Off track': '#fecaca',
  Belgium:   '#b91c1c',
};

// Custom Y-axis tick — Belgium in bold
const BoldTick = (props: any) => {
  const { x, y, payload } = props;
  const isBE = payload.value === 'Belgium';
  return (
    <text
      x={x} y={y} dy={4}
      textAnchor="end"
      fontSize={isBE ? 12 : 11}
      fontWeight={isBE ? 700 : 400}
      fill={isBE ? '#b91c1c' : '#4b5563'}
    >
      {payload.value}
    </text>
  );
};

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

function pct(latest: number | null, target: number | null): number | null {
  if (latest == null || target == null) return null;
  const l = typeof latest === 'number' ? latest : parseFloat(String(latest));
  const t = typeof target === 'number' ? target : parseFloat(String(target));
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  return Math.min(100, t > l ? (l / t) * 100 : (t / l) * 100);
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
  const p  = pct(ind.latest_value, ind.target_value);

  return (
    <div id={id} className="wide-card" style={{ '--topic-color': accentColor } as React.CSSProperties}>
      <div className="wide-card-accent" />
      <div className="wide-card-left">
        <div className="card-top">
          <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
          <span className="trend">{TREND_ICON[ind.trend ?? ''] ?? '—'} {ind.trend ?? '—'}</span>
        </div>
        <h3 className="card-title" style={{ marginTop: 8, fontSize: '1.05rem' }}>{ind.indicator}</h3>
        {ind.description && <p className="card-desc">{ind.description}</p>}
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
              <div className="progress-fill" style={{ width: `${p}%`, background: accentColor }} />
            </div>
            <span className="progress-label">{p.toFixed(0)}% of the way to target</span>
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

function EUBarChart() {
  // Height calculated to fit all 28 rows at ~20px each
  return (
    <ResponsiveContainer width="100%" height={620}>
      <BarChart
        data={EU_COMPARISON}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 90, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis
          type="number" domain={[0, 50]}
          tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false}
          label={{ value: '% of land area', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: '#9ca3af' }}
        />
        <YAxis
          type="category" dataKey="country" width={88}
          tick={<BoldTick />} tickLine={false} axisLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: any, n: any, props: any) => [`${v}%`, props.payload.country]}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <ReferenceLine
          x={30} stroke="#f97316" strokeDasharray="4 2" strokeWidth={1.5}
          label={{ value: '30% target', position: 'insideTopRight', fontSize: 10, fill: '#f97316' }}
        />
        <Bar dataKey="total" radius={[0, 3, 3, 0]}>
          {EU_COMPARISON.map((e, i) => (
            <Cell key={i} fill={BAR_COLOR[e.status] ?? '#e5e7eb'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function NatureLineChart({ data, color, unit }: { data: HistoricalPoint[]; color: string; unit: string; }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b6b6b' }} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 12, fill: '#6b6b6b' }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(v: any) => [`${v}${unit ? ' ' + unit : ''}`, '']}
          labelStyle={{ fontWeight: 700 }}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color }} />
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

function MarinePlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#9ca3af', fontSize: 13, fontStyle: 'italic', border: '2px dashed #e5e3da', borderRadius: 8, margin: '8px 0' }}>
      Additional data visualisation coming soon
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
  'Protected land area (terrestrial)',
  'Marine protected areas',
  'Species & habitats in favourable conservation status',
  'Organic farming share',
  'Pollinator decline reversal (farmland bird index proxy)',
  'Invasive alien species threatening red-listed species',
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

  const birds = byName['Pollinator decline reversal (farmland bird index proxy)'];
  const birdsDisplay = birds ? { ...birds, indicator: 'Farmland Bird Population Index' } : null;

  return (
    <div className="climate-tab">
      <Sidebar activeId={activeId} />
      <div className="climate-main">

        <GroupHeader emoji="🌍" title="Land & Habitat Protection" subtitle="Protecting Belgium's terrestrial and marine ecosystems against biodiversity loss" />

        {byName['Protected land area (terrestrial)'] && (
          <WideCard
            id="protected-land-area-terrestrial"
            ind={byName['Protected land area (terrestrial)']}
            accentColor={COLOR}
            chartTitle="Protected land area — all EU member states (% of land area, 2023)"
            chartSource="Source: EEA — Designated terrestrial protected areas in Europe (2025)"
            chart={<EUBarChart />}
            slug="protected-land-area-terrestrial"
          />
        )}

        {byName['Marine protected areas'] && (
          <WideCard
            id="marine-protected-areas"
            ind={byName['Marine protected areas']}
            accentColor={COLOR}
            chartTitle="Marine protected areas"
            chart={<MarinePlaceholder />}
            slug="marine-protected-areas"
          />
        )}

        {byName['Species & habitats in favourable conservation status'] && (
          <WideCard
            id="species-habitats-in-favourable-conservation-status"
            ind={byName['Species & habitats in favourable conservation status']}
            accentColor={COLOR}
            chartTitle="Conservation status — selected habitats & species groups (Belgium, 2019)"
            chartSource="Source: EEA Art. 17 Habitats Directive reporting"
            chart={<HabitatStatusPanel />}
            slug="species-habitats-in-favourable-conservation-status"
          />
        )}

        <GroupHeader emoji="🌱" title="Species & Ecological Health" subtitle="Tracking the health of Belgium's species, agricultural ecosystems and invasive threats" />

        {byName['Organic farming share'] && (
          <WideCard
            id="organic-farming-share"
            ind={byName['Organic farming share']}
            accentColor={COLOR}
            chartTitle="Organic farming share — Belgium 2000–2023 (% of utilised agricultural area)"
            chartSource="Source: Eurostat / Statbel"
            chart={<NatureLineChart data={historicalOrganic} color={COLOR} unit="%" />}
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

        {byName['Invasive alien species threatening red-listed species'] && (
          <WideCard
            id="invasive-alien-species-threatening-red-listed-species"
            ind={byName['Invasive alien species threatening red-listed species']}
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
