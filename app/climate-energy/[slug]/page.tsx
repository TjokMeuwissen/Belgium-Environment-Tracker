'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Slug → indicator name map ─────────────────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  'total-ghg-emissions':        'Total GHG Emissions',
  'per-capita-ghg-footprint':   'Per-capita GHG Footprint',
  'final-energy-consumption':   'Final Energy Consumption',
  'renewable-electricity-share':'Renewable Electricity Share (% of generation)',
};

// ── Chart data (same as ClimateEnergyTab) ─────────────────────────────────
const ENERGY_MIX = [
  { name: 'Oil & petroleum',     value: 38, color: '#ef4444' },
  { name: 'Natural gas',         value: 23, color: '#f97316' },
  { name: 'Coal & solid fuels',  value: 5,  color: '#78716c' },
  { name: 'Nuclear electricity', value: 7,  color: '#8b5cf6' },
  { name: 'Other electricity',   value: 11, color: '#6366f1' },
  { name: 'Biomass & bioenergy', value: 6,  color: '#22c55e' },
  { name: 'Wind',                value: 4,  color: '#06b6d4' },
  { name: 'Solar PV',            value: 2,  color: '#fbbf24' },
  { name: 'Other',               value: 4,  color: '#d1d5db' },
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

const GHG_SECTORS = [
  { name: 'Industry & construction', value: 28.3, color: '#dc2626' },
  { name: 'Transport',               value: 25.4, color: '#f97316' },
  { name: 'Buildings (heating)',     value: 17.8, color: '#eab308' },
  { name: 'Energy industries',       value: 16.0, color: '#8b5cf6' },
  { name: 'Agriculture',             value: 11.6, color: '#22c55e' },
  { name: 'Other',                   value: 1.9,  color: '#9ca3af' },
];

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'  },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'  },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'   },
};

function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-info-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

// Splits long text into bullet points at sentence boundaries
function toBullets(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z🇧])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Detects federal/regional split and formats responsibility text
function ResponsibilityCard({ text }: { text: string }) {
  const lines = toBullets(text);
  const isFederal   = (s: string) => /federal/i.test(s);
  const isRegional  = (s: string) => /region|flanders|wallonia|brussels|flemish|walloon/i.test(s);
  const isShared    = (s: string) => /shared|coordinated|both|all levels/i.test(s);

  return (
    <div className="detail-responsibility-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">🏛️</span>
        <span className="detail-section-title">Government Responsibility</span>
      </div>
      <div className="responsibility-bullets">
        {lines.map((line, i) => {
          const tag = isShared(line)   ? { label: 'Shared',   cls: 'tag-shared'   }
                    : isFederal(line)  ? { label: 'Federal',  cls: 'tag-federal'  }
                    : isRegional(line) ? { label: 'Regional', cls: 'tag-regional' }
                    : null;
          return (
            <div key={i} className="responsibility-item">
              {tag && <span className={`responsibility-tag ${tag.cls}`}>{tag.label}</span>}
              <span className="responsibility-text">{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsequencesCard({ text }: { text: string }) {
  const bullets = toBullets(text);
  return (
    <div className="detail-consequences-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">⚠️</span>
        <span className="detail-section-title">Consequences if Target is Missed</span>
      </div>
      <ul className="consequences-list">
        {bullets.map((b, i) => (
          <li key={i} className="consequences-item">{b}</li>
        ))}
      </ul>
    </div>
  );
}

function TechnicalInfoCard({ text }: { text: string }) {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>
      <p className="technical-text">{text}</p>
    </div>
  );
}

function PieChartBlock({ data, title, source }: {
  data: { name: string; value: number; color: string }[];
  title: string;
  source: string;
}) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} cx="50%" cy="45%" outerRadius={110} dataKey="value" labelLine={false}>
            {data.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
          </Pie>
          <Tooltip
            formatter={(v: any, n: any) => [`${v}%`, n]}
            contentStyle={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" iconSize={9}
            formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">{source}</p>
    </div>
  );
}

function LineChartBlock({ data }: { data: { year: number; value: number }[] }) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Total GHG Emissions — Belgium 1990–2023 (MtCO₂eq)</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} domain={[0, 160]} />
          <Tooltip
            contentStyle={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            formatter={(v: any) => [`${v} MtCO₂eq`, 'GHG Emissions']}
            labelStyle={{ fontWeight: 700 }}
          />
          <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
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
      <p className="detail-chart-source">Source: National Climate Commission / indicators.be</p>
    </div>
  );
}

export default function ClimateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="loading">Loading…</div>;

  const indicatorName = SLUG_MAP[slug];
  if (!indicatorName) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Indicator not found.</p>
      <Link href="/">← Back to overview</Link>
    </div>
  );

  const ind = data.topics.climate_energy?.indicators?.find(
    (i: any) => i.indicator === indicatorName
  );

  const historicalGHG: { year: number; value: number }[] =
    data.historical?.climate_energy?.series?.['Total GHG Emissions']?.map(
      (d: any) => ({ year: d.year, value: d.value })
    ) ?? [];

  const sc = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  // Which chart to show
  let chartNode: React.ReactNode = null;
  if (slug === 'total-ghg-emissions') {
    chartNode = <LineChartBlock data={historicalGHG} />;
  } else if (slug === 'per-capita-ghg-footprint') {
    chartNode = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
        <PieChartBlock
          data={FOOTPRINT_CATEGORIES}
          title="Consumption-based footprint by lifestyle category (~15.7 t/cap, 2019)"
          source="Source: UCLouvain (2021)"
        />
        <PieChartBlock
          data={GHG_SECTORS}
          title="Territorial emissions by sector (% of 97.9 MtCO₂eq, 2023)"
          source="Source: National Climate Commission (2025)"
        />
      </div>
    );
  } else if (slug === 'final-energy-consumption') {
    chartNode = (
      <PieChartBlock
        data={ENERGY_MIX}
        title="Energy mix — % of Final Energy Consumption (2022)"
        source="Source: IEA World Energy Balances / Eurostat"
      />
    );
  } else if (slug === 'renewable-electricity-share') {
    chartNode = (
      <PieChartBlock
        data={RENEWABLES_MIX}
        title="Renewables breakdown — % of total renewable energy (2023)"
        source="Source: IRENA Belgium Profile / Eurostat SHARES"
      />
    );
  }

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Climate & Energy</p>
          <h1 className="detail-title">{indicatorName}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge" style={{ color: sc.color, background: sc.bg, padding: '5px 14px' }}>
              {sc.label}
            </span>
            {ind?.trend && (
              <span style={{ color: '#b0b0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                {ind.trend === 'Improving' ? '↑' : ind.trend === 'Worsening' ? '↓' : '→'} {ind.trend}
              </span>
            )}
          </div>
          {/* Description shown directly below header */}
          {ind?.description && (
            <p style={{ color: '#d1d5db', fontSize: '0.95rem', marginTop: 14, maxWidth: 680, lineHeight: 1.6 }}>
              {ind.description}
            </p>
          )}
        </div>
      </div>

      <div className="detail-body">

        {/* Key figures */}
        <div className="detail-figures">
          <div className="figure-card">
            <div className="figure-label">Latest value</div>
            <div className="figure-number">{fmt(ind?.latest_value, ind?.unit)}</div>
            <div className="figure-year">{ind?.latest_value_year}</div>
          </div>
          {ind?.target_value != null && (
            <div className="figure-card">
              <div className="figure-label">Target</div>
              <div className="figure-number">{fmt(ind?.target_value, ind?.unit)}</div>
              <div className="figure-year">by {ind?.target_year}</div>
            </div>
          )}
          {ind?.target_context && (
            <div className="figure-card figure-card-wide">
              <div className="figure-label">Target context</div>
              <div className="figure-text">{ind.target_context}</div>
            </div>
          )}
        </div>

        {/* Charts */}
        {chartNode && <div className="detail-charts">{chartNode}</div>}

        {/* Detail information */}
        <div className="detail-info">
          {ind?.notes && <TechnicalInfoCard text={ind.notes} />}
          {ind?.consequences && <ConsequencesCard text={ind.consequences} />}
          {ind?.responsible && <ResponsibilityCard text={ind.responsible} />}
          {ind?.policy && (
            <InfoRow label="Policy / Legal basis">
              {ind.policy_url
                ? <a href={ind.policy_url} target="_blank" rel="noopener noreferrer" className="detail-link">{ind.policy} ↗</a>
                : ind.policy}
            </InfoRow>
          )}
          {ind?.data_source && (
            <InfoRow label="Data source">
              {ind.data_source_url
                ? <a href={ind.data_source_url} target="_blank" rel="noopener noreferrer" className="detail-link">{ind.data_source} ↗</a>
                : ind.data_source}
            </InfoRow>
          )}
        </div>

      </div>
    </div>
  );
}
