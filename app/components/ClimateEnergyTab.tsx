'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
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

interface HistoricalPoint { year: number; value: number; unit: string; }

interface Props {
  indicators: Indicator[];
  historicalGHG: HistoricalPoint[];
}

// ── Chart data ─────────────────────────────────────────────────────────────
const ENERGY_MIX = [
  { name: 'Oil & petroleum',     value: 38,  color: '#ef4444' },
  { name: 'Natural gas',         value: 23,  color: '#f97316' },
  { name: 'Coal & solid fuels',  value: 5,   color: '#78716c' },
  { name: 'Nuclear electricity', value: 7,   color: '#8b5cf6' },
  { name: 'Other electricity',   value: 11,  color: '#6366f1' },
  { name: 'Biomass & bioenergy', value: 6,   color: '#22c55e' },
  { name: 'Wind',                value: 4,   color: '#06b6d4' },
  { name: 'Solar PV',            value: 2,   color: '#fbbf24' },
  { name: 'Other',               value: 4,   color: '#d1d5db' },
];

const RENEWABLES_MIX = [
  { name: 'Biomass & bioenergy', value: 60, color: '#16a34a' },
  { name: 'Offshore wind',       value: 17, color: '#0369a1' },
  { name: 'Onshore wind',        value: 9,  color: '#38bdf8' },
  { name: 'Solar PV',            value: 9,  color: '#fbbf24' },
  { name: 'Heat pumps',          value: 4,  color: '#f97316' },
  { name: 'Hydro',               value: 1,  color: '#06b6d4' },
];

const FOOTPRINT_CATEGORIES = [
  { name: 'Housing',    value: 31.4, color: '#dc2626' },
  { name: 'Equipment',  value: 23.3, color: '#f97316' },
  { name: 'Transport',  value: 19.9, color: '#eab308' },
  { name: 'Food',       value: 15.0, color: '#22c55e' },
  { name: 'Services',   value: 7.3,  color: '#06b6d4' },
  { name: 'Other',      value: 3.1,  color: '#9ca3af' },
];

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved' },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track' },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'  },
};

const TREND_ICON: Record<string, string> = { Improving: '↑', Stable: '→', Worsening: '↓' };

// ── Sidebar config ─────────────────────────────────────────────────────────
const SIDEBAR_GROUPS = [
  {
    label: '🌡️ Climate',
    items: [
      { id: 'total-ghg-emissions',      label: 'Total GHG Emissions' },
      { id: 'per-capita-ghg-footprint', label: 'Per-capita GHG Footprint' },
    ],
  },
  {
    label: '⚡ Energy',
    items: [
      { id: 'final-energy-consumption',    label: 'Final Energy Consumption' },
      { id: 'renewable-electricity-share', label: 'Renewable Electricity Share' },
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

function progress(latest: number | null, target: number | null, status?: string | null): number | null {
  if (latest == null || target == null) return null;
  const l = typeof latest === 'number' ? latest : parseFloat(String(latest));
  const t = typeof target === 'number' ? target : parseFloat(String(target));
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  if (status === 'Achieved') return 100;
  if (l < t) return Math.min(100, (l / t) * 100);   // higher is better
  return Math.min(100, (t / l) * 100);               // lower is better
}

function indicatorSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

// ── Tooltip styles — white background, readable ────────────────────────────
const TOOLTIP_STYLE = {
  background: '#ffffff',
  color: '#1a1a1a',
  border: '1px solid #e5e3da',
  borderRadius: 8,
  fontSize: 14,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
};

const GHGTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '8px 12px' }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div>{payload[0].value} MtCO₂eq</div>
    </div>
  );
};

// ── Wide card ──────────────────────────────────────────────────────────────
function WideCard({
  id, ind, chart, chartTitle, chartSource, accentColor,
}: {
  id: string;
  ind: Indicator;
  chart: React.ReactNode;
  chartTitle: string;
  chartSource: string;
  accentColor: string;
}) {
  const sc  = STATUS_CFG[ind.status ?? ''] ?? STATUS_CFG['Insufficient data'];
  const pct = progress(ind.latest_value, ind.target_value, ind.status);

  return (
    <div id={id} className="wide-card" style={{ '--topic-color': accentColor } as React.CSSProperties}>
      <div className="wide-card-accent" />
      <div className="wide-card-left">
        <div className="card-top">
          <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
          <span className="trend">{TREND_ICON[ind.trend ?? ''] ?? '—'} {ind.trend ?? '—'}</span>
        </div>
        <h3 className="card-title" style={{ marginTop: 10, fontSize: '1.1rem' }}>{ind.indicator}</h3>
        {ind.description && (
          <p className="card-desc">
            {(ind as any).short_description || ind.description}
          </p>
        )}
        <div className="card-values" style={{ marginTop: 12 }}>
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
        {pct != null && (
          <div className="progress-wrap" style={{ marginTop: 12 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%`, background: accentColor }} />
            </div>
            <span className="progress-label">{pct === 100 ? '100% of the way to target! 🎉' : `${pct.toFixed(0)}% of the way to target`}</span>
          </div>
        )}
        <Link
          href={`/climate-energy/${indicatorSlug(ind.indicator)}`}
          className="read-more-btn"
          style={{ '--btn-color': accentColor } as React.CSSProperties}
        >
          Read more →
        </Link>
      </div>
      <div className="wide-card-right">
        <div className="chart-header">
          <span className="chart-title">{chartTitle}</span>
          <span className="chart-source">{chartSource}</span>
        </div>
        {chart}
      </div>
    </div>
  );
}

// ── Charts ─────────────────────────────────────────────────────────────────
function GHGLineChart({ data }: { data: HistoricalPoint[] }) {
  const filtered = data.filter(d => d.year >= 1990);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={filtered} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 13, fill: '#6b6b6b' }} tickLine={false} interval={4} />
        <YAxis tick={{ fontSize: 13, fill: '#6b6b6b' }} tickLine={false} axisLine={false} width={44} domain={[0, 160]} />
        <Tooltip content={<GHGTooltip />} />

        {/* Actual historical emissions */}
        <Line
          type="monotone" dataKey="value"
          stroke="#f97316" strokeWidth={2.5}
          dot={false} activeDot={{ r: 5, fill: '#f97316' }}
        />

        {/* Horizontal dotted target line at 64.3 Mt */}
        <ReferenceLine
          y={64.3}
          stroke="#f97316"
          strokeDasharray="6 4"
          strokeWidth={1.8}
          label={{
            value: '🎯 2030 target: 64.3 MtCO₂eq',
            position: 'insideTopRight',
            fontSize: 11,
            fill: '#f97316',
            fontWeight: 600,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SimplePieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="45%" outerRadius={90} dataKey="value" labelLine={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => [`${value}%`, name]}
          contentStyle={TOOLTIP_STYLE}
          itemStyle={{ color: '#1a1a1a' }}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: 13, color: '#4b5563' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Group header ───────────────────────────────────────────────────────────
function GroupHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="group-header">
      <div className="group-header-inner">
        <span className="group-emoji">{emoji}</span>
        <div>
          <div className="group-title">{title}</div>
          <div className="group-subtitle">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

// ── Sticky sidebar ─────────────────────────────────────────────────────────
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
            >
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
const KEEP = [
  'Total GHG Emissions',
  'Per-capita GHG Footprint',
  'Final Energy Consumption',
  'Renewable Electricity Share (% of generation)',
];

const COLOR = '#f97316';

export default function ClimateEnergyTab({ indicators, historicalGHG }: Props) {
  const byName = Object.fromEntries(
    indicators.filter(i => KEEP.includes(i.indicator)).map(i => [i.indicator, i])
  );

  // Track which card is currently in view for the sidebar highlight
  const [activeId, setActiveId] = useState('total-ghg-emissions');

  useEffect(() => {
    const ids = ['total-ghg-emissions', 'per-capita-ghg-footprint', 'final-energy-consumption', 'renewable-electricity-share'];
    const observers: IntersectionObserver[] = [];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div className="climate-tab">

      {/* Sticky sidebar */}
      <Sidebar activeId={activeId} />

      {/* Main content */}
      <div className="climate-main">

        <GroupHeader
          emoji="🌡️"
          title="Climate Objectives"
          subtitle="Greenhouse gas emissions and Belgium's progress toward Paris Agreement targets"
        />

        {byName['Total GHG Emissions'] && (
          <WideCard
            id="total-ghg-emissions"
            ind={byName['Total GHG Emissions']}
            accentColor={COLOR}
            chartTitle="GHG Emissions 1990–2023 (MtCO₂eq)"
            chartSource="Source: National Climate Commission / indicators.be"
            chart={<GHGLineChart data={historicalGHG} />}
          />
        )}

        {byName['Per-capita GHG Footprint'] && (
          <WideCard
            id="per-capita-ghg-footprint"
            ind={byName['Per-capita GHG Footprint']}
            accentColor={COLOR}
            chartTitle="Consumption-based footprint by category (~15.7 t/cap, 2019)"
            chartSource="Source: UCLouvain (2021)"
            chart={<SimplePieChart data={FOOTPRINT_CATEGORIES} />}
          />
        )}

        <GroupHeader
          emoji="⚡"
          title="Energy Objectives"
          subtitle="Final energy consumption and progress on renewable electricity generation"
        />

        {byName['Final Energy Consumption'] && (
          <WideCard
            id="final-energy-consumption"
            ind={byName['Final Energy Consumption']}
            accentColor={COLOR}
            chartTitle="Energy mix — % of Final Energy Consumption (2022)"
            chartSource="Source: IEA / Eurostat"
            chart={<SimplePieChart data={ENERGY_MIX} />}
          />
        )}

        {byName['Renewable Electricity Share (% of generation)'] && (
          <WideCard
            id="renewable-electricity-share"
            ind={byName['Renewable Electricity Share (% of generation)']}
            accentColor={COLOR}
            chartTitle="Renewables breakdown — % of total renewable energy (2023)"
            chartSource="Source: IRENA / Eurostat"
            chart={<SimplePieChart data={RENEWABLES_MIX} />}
          />
        )}

      </div>
    </div>
  );
}
