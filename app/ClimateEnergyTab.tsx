
'use client';

import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Supplementary chart data (from Excel Sections 2, 3, 4) ────────────────

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

const TREND_ICON: Record<string, string> = {
  Improving: '↑', Stable: '→', Worsening: '↓',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(v: number | null | undefined, unit: string | null): string {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function progress(latest: number | null, target: number | null): number | null {
  if (latest == null || target == null) return null;
  const l = typeof latest === 'number' ? latest : parseFloat(String(latest));
  const t = typeof target === 'number' ? target : parseFloat(String(target));
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  return Math.min(100, t > l ? (l / t) * 100 : (t / l) * 100);
}

function indicatorSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

// ── Custom tooltip for line chart ──────────────────────────────────────────
const GHGTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a1a', color: '#fff', padding: '8px 12px',
      borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div>{payload[0].value} MtCO₂eq</div>
    </div>
  );
};

// ── Wide indicator card ────────────────────────────────────────────────────
function WideCard({
  ind,
  chart,
  chartTitle,
  chartSource,
  accentColor,
}: {
  ind: Indicator;
  chart: React.ReactNode;
  chartTitle: string;
  chartSource: string;
  accentColor: string;
}) {
  const sc  = STATUS_CFG[ind.status ?? ''] ?? STATUS_CFG['Insufficient data'];
  const pct = progress(ind.latest_value, ind.target_value);

  return (
    <div className="wide-card" style={{ '--topic-color': accentColor } as React.CSSProperties}>
      {/* Accent bar */}
      <div className="wide-card-accent" />

      {/* Left: indicator info */}
      <div className="wide-card-left">
        <div className="card-top">
          <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>
            {sc.label}
          </span>
          <span className="trend">
            {TREND_ICON[ind.trend ?? ''] ?? '—'} {ind.trend ?? '—'}
          </span>
        </div>

        <h3 className="card-title" style={{ marginTop: 10, fontSize: '1.1rem' }}>
          {ind.indicator}
        </h3>

        {ind.description && (
          <p className="card-desc" style={{ WebkitLineClamp: 3 }}>
            {ind.description}
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
            <span className="progress-label">{pct.toFixed(0)}% of the way to target</span>
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

      {/* Right: chart */}
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
      <LineChart data={filtered} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<GHGTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#f97316' }}
        />
        {/* 2030 target reference line — drawn as a separate data point annotation */}
      </LineChart>
    </ResponsiveContainer>
  );
}

function SimplePieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={90}
          dataKey="value"
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: any) => [`${value}%`, name]}
          contentStyle={{
            background: '#1a1a1a', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#4b5563' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Group header ───────────────────────────────────────────────────────────
function GroupHeader({ emoji, title, subtitle }: {
  emoji: string; title: string; subtitle: string;
}) {
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

// ── Main component ─────────────────────────────────────────────────────────
const KEEP = [
  'Total GHG Emissions',
  'Per-capita GHG footprint',
  'Final Energy Consumption',
  'Renewable Electricity Share',
];

const COLOR = '#f97316'; // orange — Climate & Energy accent

export default function ClimateEnergyTab({ indicators, historicalGHG }: Props) {
  const byName = Object.fromEntries(
    indicators
      .filter(i => KEEP.includes(i.indicator))
      .map(i => [i.indicator, i])
  );

  return (
    <div className="climate-tab">

      {/* ── Group 1: Climate ─────────────────────────────────────────── */}
      <GroupHeader
        emoji="🌡️"
        title="Climate Objectives"
        subtitle="Greenhouse gas emissions and Belgium's progress toward Paris Agreement targets"
      />

      {/* Total GHG Emissions + Line chart */}
      {byName['Total GHG Emissions'] && (
        <WideCard
          ind={byName['Total GHG Emissions']}
          accentColor={COLOR}
          chartTitle="GHG Emissions 1990–2023 (MtCO₂eq)"
          chartSource="Source: National Climate Commission / indicators.be"
          chart={<GHGLineChart data={historicalGHG} />}
        />
      )}

      {/* Per-capita GHG + Pie chart (consumption categories) */}
      {byName['Per-capita GHG footprint'] && (
        <WideCard
          ind={byName['Per-capita GHG footprint']}
          accentColor={COLOR}
          chartTitle="Consumption-based footprint by category (~15.7 t/cap, 2019)"
          chartSource="Source: UCLouvain (2021)"
          chart={<SimplePieChart data={FOOTPRINT_CATEGORIES} />}
        />
      )}

      {/* ── Group 2: Energy ──────────────────────────────────────────── */}
      <GroupHeader
        emoji="⚡"
        title="Energy Objectives"
        subtitle="Final energy consumption and progress on renewable electricity generation"
      />

      {/* Final Energy Consumption + Energy mix pie */}
      {byName['Final Energy Consumption'] && (
        <WideCard
          ind={byName['Final Energy Consumption']}
          accentColor={COLOR}
          chartTitle="Energy mix — % of Final Energy Consumption (2022)"
          chartSource="Source: IEA / Eurostat"
          chart={<SimplePieChart data={ENERGY_MIX} />}
        />
      )}

      {/* Renewable Electricity Share + Renewables breakdown pie */}
      {byName['Renewable Electricity Share'] && (
        <WideCard
          ind={byName['Renewable Electricity Share']}
          accentColor={COLOR}
          chartTitle="Renewables breakdown — % of total renewable energy (2023)"
          chartSource="Source: IRENA / Eurostat"
          chart={<SimplePieChart data={RENEWABLES_MIX} />}
        />
      )}

    </div>
  );
}
