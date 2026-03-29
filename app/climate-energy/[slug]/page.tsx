'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter,
  BarChart, Bar,
} from 'recharts';

// ── Slug → indicator name map ─────────────────────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  'total-ghg-emissions':                       'Total GHG Emissions',
  'per-capita-ghg-footprint':                  'Per-capita GHG Footprint',
  'final-energy-consumption':                  'Final Energy Consumption',
  'renewable-electricity-share-of-generation': 'Renewable Electricity Share (% of generation)',
};

// ── Static chart data ─────────────────────────────────────────────────────────
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

// ── GHG bubble chart data (Section 4.1 — Belgium NIR 2024 / IPCC AR5) ────────
const GHG_GAS_DATA = [
  { name: 'CO₂',  x: 1,     y: 84,  mt: 82,  color: '#185FA5' },
  { name: 'CH₄',  x: 29,    y: 7.6, mt: 7.5, color: '#BA7517' },
  { name: 'N₂O',  x: 265,   y: 4.3, mt: 4.2, color: '#3B6D11' },
  { name: 'HFCs', x: 1430,  y: 2.5, mt: 2.5, color: '#993C1D' },
  { name: 'PFCs', x: 8900,  y: 0.4, mt: 0.4, color: '#534AB7' },
  { name: 'SF₆',  x: 23500, y: 0.5, mt: 0.5, color: '#A32D2D' },
];

// ── GHG sector bar chart (Belgium NIR 2024, MtCO₂eq 2023) ────────────────────
const GHG_SECTOR_CHART_DATA = [
  { name: 'Industry',          value: 27.5, pct: 28.3, color: '#dc2626', trend: '-22% since 2005' },
  { name: 'Transport',         value: 24.7, pct: 25.4, color: '#f97316', trend: 'only -1% since 2005' },
  { name: 'Buildings',         value: 17.3, pct: 17.8, color: '#eab308', trend: '-22% since 2005' },
  { name: 'Energy industries', value: 15.6, pct: 16.0, color: '#8b5cf6', trend: '-47% since 2005' },
  { name: 'Agriculture',       value: 11.2, pct: 11.6, color: '#22c55e', trend: 'barely changed since 2005' },
  { name: 'Other & LULUCF',   value: 1.5,  pct: 1.5,  color: '#9ca3af', trend: 'improving' },
];

// ── Lifecycle CO₂ intensity (IPCC AR6 WGIII Ch.6 / NREL / IEA 2024) ──────────
const CO2_INTENSITY = [
  {
    source: 'Offshore wind',
    range: '7–15',
    median: 12,
    keyFactors: 'Foundation type, distance to shore, cable length',
    belgiumNote: 'North Sea installations are established and close to shore → low end of range',
  },
  {
    source: 'Onshore wind',
    range: '7–11',
    median: 9,
    keyFactors: 'Hub height, capacity factor, turbine size, steel manufacturing origin',
    belgiumNote: 'Limited by land constraints — primarily Wallonia and the coast',
  },
  {
    source: 'Solar PV',
    range: '14–73',
    median: 27,
    keyFactors: 'Panel technology, manufacturing grid mix, irradiance at site',
    belgiumNote: 'Low irradiance vs. southern Europe → more panels needed per kWh → higher end of range',
  },
  {
    source: 'Hydro (run-of-river)',
    range: '4–30',
    median: 11,
    keyFactors: 'Reservoir size, water flow variability',
    belgiumNote: 'Belgium uses mainly run-of-river → low end. Very small share of electricity mix (<1%).',
  },
  {
    source: 'Biomass / bioenergy',
    range: '13–230',
    median: 130,
    keyFactors: 'Fuel type (residues vs. crops), transport distance, land use change',
    belgiumNote: '⚠️ EU/UNFCCC counts biomass as zero-emission at combustion — full lifecycle is significantly higher and scientifically disputed',
  },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'  },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'  },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'   },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function rewriteArrows(text: string): string {
  return text
    .replace(
      /EU infringement proceedings\s*→\s*referral to Court of Justice\s*→\s*financial fines/gi,
      'EU infringement proceedings, which can escalate to a referral to the Court of Justice of the EU and ultimately result in significant financial fines imposed on Belgium'
    )
    .replace(
      /infringement\s*→\s*ECJ\s*→\s*lump sum \/ daily fines/gi,
      'infringement proceedings before the Court of Justice, which can result in lump-sum payments or recurring daily fines until Belgium complies'
    )
    .replace(/\s*→\s*/g, ', leading to ');
}

function toSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z🇧"'])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function buildConsequenceBullets(text: string): Array<{ text: string; sub?: string[] }> {
  const sentences = toSentences(rewriteArrows(text));
  const pastKeywords = /already (faced|subject|missed)|court ruling|previous|infringement.*\d{4}|INFR\s*\d{4}/i;
  const pastItems: string[] = [];
  const mainItems: string[] = [];
  sentences.forEach(s => {
    if (pastKeywords.test(s)) pastItems.push(s);
    else mainItems.push(s);
  });
  const result: Array<{ text: string; sub?: string[] }> = mainItems.map(t => ({ text: t }));
  if (pastItems.length > 0) result.push({ text: 'Previous occurrences', sub: pastItems });
  return result;
}

function groupResponsibility(text: string) {
  const sentences = toSentences(text);
  const isFederal  = (s: string) => /\bfederal\b/i.test(s) && !/region|flanders|wallonia|brussels|flemish|walloon/i.test(s);
  const isRegional = (s: string) => /region|flanders|wallonia|brussels|flemish|walloon/i.test(s) && !/\bfederal\b/i.test(s);
  const isShared   = (s: string) =>
    /shared|coordinated|both|all levels|ICE|inter-?federal|inter-?ministerial/i.test(s) ||
    (/\bfederal\b/i.test(s) && /region|flanders|wallonia|brussels/i.test(s));
  const federal: string[] = [], shared: string[] = [], regional: string[] = [];
  sentences.forEach(s => {
    if (isShared(s)) shared.push(s);
    else if (isFederal(s)) federal.push(s);
    else if (isRegional(s)) regional.push(s);
    else shared.push(s);
  });
  return { federal, shared, regional };
}

// ── Shared UI components ──────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-info-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

function ConsequencesCard({ text }: { text: string }) {
  const bullets = buildConsequenceBullets(text);
  return (
    <div className="detail-consequences-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">⚠️</span>
        <span className="detail-section-title">Consequences if Target is Missed</span>
      </div>
      <ul className="consequences-list">
        {bullets.map((b, i) => (
          <li key={i} className="consequences-item">
            <span className="bullet-dot">•</span>
            <span>
              {b.text}
              {b.sub && (
                <ul className="consequences-sub-list">
                  {b.sub.map((s, j) => (
                    <li key={j} className="consequences-sub-item">
                      <span className="bullet-dot">–</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResponsibilityCard({ text }: { text: string }) {
  const { federal, shared, regional } = groupResponsibility(text);
  const Section = ({ label, cls, items }: { label: string; cls: string; items: string[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="responsibility-group">
        <span className={`responsibility-tag ${cls}`}>{label}</span>
        <ul className="responsibility-list">
          {items.map((item, i) => (
            <li key={i} className="responsibility-list-item">
              <span className="bullet-dot">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div className="detail-responsibility-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">🏛️</span>
        <span className="detail-section-title">Government Responsibility</span>
      </div>
      <div className="responsibility-groups">
        <Section label="Federal"  cls="tag-federal"  items={federal}  />
        <Section label="Shared"   cls="tag-shared"   items={shared}   />
        <Section label="Regional" cls="tag-regional" items={regional} />
      </div>
    </div>
  );
}

function DataSourceRow({ source, url, description }: {
  source: string;
  url: string | null;
  description?: string | null;
}) {
  const sources = source.split(/\s*[/|]\s*/).map(s => s.trim()).filter(Boolean);
  const urls = url ? url.split(/\s*\|\s*/).map(u => u.trim()).filter(Boolean) : [];
  return (
    <div>
      {description && (
        <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.55 }}>
          {description}
        </p>
      )}
      {sources.length === 1 && urls.length === 1 ? (
        <a href={urls[0]} target="_blank" rel="noopener noreferrer" className="detail-link">{sources[0]} ↗</a>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sources.map((s, i) => (
            <li key={i} style={{ fontSize: '0.88rem' }}>
              {urls[i]
                ? <a href={urls[i]} target="_blank" rel="noopener noreferrer" className="detail-link">{s} ↗</a>
                : <span>{s}</span>}
            </li>
          ))}
        </ul>
      )}
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

// ── Chart components ──────────────────────────────────────────────────────────

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
            label={{ value: '🎯 2030 target: 64.3 MtCO₂eq', position: 'insideTopRight', fontSize: 11, fill: '#f97316', fontWeight: 600 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: National Climate Commission / indicators.be</p>
    </div>
  );
}

// ── New Technical Information components ──────────────────────────────────────

function GHGBubbleChart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">GHG gases — global warming potential vs Belgian emission share</div>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 }}>
        X axis (log scale): GWP₁₀₀ — how many times more warming than CO₂ over 100 years.
        Y axis: share of Belgian total emissions (%). Bubble size: absolute MtCO₂eq.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            scale="log"
            domain={[0.5, 80000]}
            ticks={[1, 10, 100, 1000, 10000]}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            label={{ value: 'GWP₁₀₀ (log scale)', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#6b7280' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[-4, 92]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={42}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.name}</div>
                  <div style={{ color: '#4b5563' }}>GWP₁₀₀: <strong>{d.x.toLocaleString()}</strong></div>
                  <div style={{ color: '#4b5563' }}>Belgian share: <strong>{d.y}%</strong></div>
                  <div style={{ color: '#4b5563' }}>Absolute total: <strong>{d.mt} MtCO₂eq</strong></div>
                </div>
              );
            }}
          />
          <Scatter
            data={GHG_GAS_DATA}
            shape={(props: any) => {
              const { cx, cy, payload } = props;
              const r = Math.max(8, Math.cbrt(payload.mt) * 5.5);
              return (
                <g>
                  <circle cx={cx} cy={cy} r={r} fill={payload.color} fillOpacity={0.7} stroke={payload.color} strokeWidth={1.5} />
                  <text x={cx} y={cy - r - 5} textAnchor="middle" fontSize={10} fill="#374151" fontWeight={600}>
                    {payload.name}
                  </text>
                </g>
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4, justifyContent: 'center' }}>
        {GHG_GAS_DATA.map(g => (
          <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#4b5563' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, opacity: 0.8 }} />
            <span>{g.name}: {g.y}% share · GWP {g.x.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="detail-chart-source">Source: Belgium NIR 2024 (UNFCCC / klimaat.be) — GWP₁₀₀ values from IPCC AR5</p>
    </div>
  );
}

function GHGSectorBarChart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">GHG emissions by sector — Belgium 2023 (MtCO₂eq)</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={GHG_SECTOR_CHART_DATA} layout="vertical" margin={{ top: 4, right: 60, left: 120, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} unit=" Mt" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#4b5563' }} tickLine={false} axisLine={false} width={120} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13 }}
            formatter={(v: any, _: any, props: any) => [
              `${v} MtCO₂eq (${props.payload.pct}%) — ${props.payload.trend}`,
              'Emissions',
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {GHG_SECTOR_CHART_DATA.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: National Climate Commission (2025) / indicators.be — sectoral totals 2023</p>
    </div>
  );
}

function PieChartExplanationCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Understanding the two accounting methods</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
        <div style={{ background: '#eff6ff', borderRadius: 8, padding: '14px 16px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.88rem', color: '#1e3a5f' }}>Territorial (production-based)</div>
          <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
            Counts emissions physically released on Belgian territory — the same 8.3 t figure reported in the national inventory.
            Does not count emissions from goods Belgium imports but does not produce.
          </p>
          <div style={{ marginTop: 10, fontSize: '0.78rem', fontWeight: 700, color: '#185FA5' }}>
            8.3 t/cap · Year: 2023
          </div>
        </div>
        <div style={{ background: '#fff7ed', borderRadius: 8, padding: '14px 16px', borderLeft: '4px solid #f97316' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.88rem', color: '#431407' }}>Consumption-based (lifestyle)</div>
          <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
            Follows demand rather than where production happens — includes emissions from all goods and services Belgians consume,
            wherever they were produced. Higher total because Belgium imports many emission-intensive goods.
          </p>
          <div style={{ marginTop: 10, fontSize: '0.78rem', fontWeight: 700, color: '#c2410c' }}>
            ~15.7 t/cap · Year: 2019 (UCLouvain)
          </div>
        </div>
      </div>
      <p style={{ fontSize: '0.79rem', color: '#6b7280', lineHeight: 1.55, margin: 0 }}>
        The two figures use different methodologies and reference years and cannot be added together or directly compared.
        The gap (8.3 vs 15.7 t) reflects Belgium's position as a net importer of embodied emissions —
        emissions happen elsewhere in the world to produce goods consumed here.
      </p>
    </div>
  );
}

function FinalEnergySectorChart({ sectors }: { sectors: any[] }) {
  if (!sectors || sectors.length === 0) return null;
  const displaySectors = sectors.filter((s: any) => s.sector !== 'TOTAL');
  const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4'];
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Final energy consumption by sector (%, 2022)</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={displaySectors} layout="vertical" margin={{ top: 4, right: 60, left: 100, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} unit="%" domain={[0, 40]} />
          <YAxis type="category" dataKey="sector" tick={{ fontSize: 11, fill: '#4b5563' }} tickLine={false} axisLine={false} width={100} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13 }}
            formatter={(v: any, _: any, props: any) => [
              `${v}% (${props.payload.mtoe} Mtoe)`,
              'Share of FEC',
            ]}
          />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {displaySectors.map((_: any, i: number) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: Eurostat (nrg_bal_c), Belgium 2022. Total = 30 Mtoe.</p>
    </div>
  );
}

function MtoeConverter() {
  const [value, setValue] = useState(30);
  const twh     = +(value * 11.63).toFixed(1);
  const carBkm  = +(value * 18.2).toFixed(1);
  const homesM  = +(value * 5.3).toFixed(1);
  const flightM = +(value * 1.4).toFixed(1);

  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">🔢</span>
        <span className="detail-section-title">Unit converter — what does 1 Mtoe actually mean?</span>
      </div>
      <p style={{ fontSize: '0.83rem', color: '#4b5563', marginBottom: 14, lineHeight: 1.5 }}>
        Mtoe (million tonnes of oil equivalent) is the standard unit for comparing energy from different sources.
        Drag the slider to explore real-world equivalents.
      </p>
      <div style={{ marginBottom: 16 }}>
        <input
          type="range" min={1} max={50} value={value}
          onChange={e => setValue(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <p style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', margin: '6px 0 0' }}>
          {value} Mtoe
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { icon: '⚡', label: 'Electricity equivalent', val: `${twh} TWh` },
          { icon: '🚗', label: 'Billions of km by car', val: `${carBkm}B km` },
          { icon: '🏠', label: 'Million homes heated (1 year)', val: `${homesM}M homes` },
          { icon: '✈️', label: 'Million return flights BRU–NYC', val: `${flightM}M flights` },
        ].map(item => (
          <div key={item.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, lineHeight: 1.3 }}>{item.label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a' }}>{item.val}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 10, lineHeight: 1.5 }}>
        Approximate equivalents. Car: average 7 L/100 km petrol. Homes: gas heating ~2.2 MWh/year per household.
        Flights: economy seat, return BRU–NYC per person.
      </p>
    </div>
  );
}

function CO2IntensityTable() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">♻️</span>
        <span className="detail-section-title">Lifecycle CO₂ intensity per renewable source (g CO₂-eq./kWh)</span>
      </div>
      <p style={{ fontSize: '0.83rem', color: '#4b5563', marginBottom: 12, lineHeight: 1.5 }}>
        Full lifecycle emissions including manufacturing, installation, operation and decommissioning.
        Global ranges from IPCC AR6 — Belgian-specific notes below the table.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151' }}>Source</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>Range</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700, color: '#374151' }}>Median</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#374151' }}>Key determining factors</th>
            </tr>
          </thead>
          <tbody>
            {CO2_INTENSITY.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a1a1a' }}>{row.source}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'monospace', color: '#374151' }}>{row.range}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{row.median}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '0.79rem', lineHeight: 1.4 }}>{row.keyFactors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Belgium-specific notes
        </div>
        {CO2_INTENSITY.map((row, i) => (
          <div key={i} style={{ fontSize: '0.8rem', color: '#4b5563', display: 'flex', gap: 8, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, flexShrink: 0 }}>{row.source}:</span>
            <span>{row.belgiumNote}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 12 }}>
        Source: IPCC AR6 WGIII Chapter 6 (2022); NREL Harmonization Project; IEA Upstream Lifecycle Emission Factors (2024).
      </p>
    </div>
  );
}

function LimitationsSection({ limitations }: { limitations: any[] }) {
  if (!limitations || limitations.length === 0) return null;
  const severityBg:   Record<string, string> = { Important: '#fee2e2', Moderate: '#fef3c7', Minor: '#f0fdf4' };
  const severityText: Record<string, string> = { Important: '#7f1d1d', Moderate: '#78350f', Minor: '#14532d' };
  return (
    <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <div className="detail-section-header">
        <span className="detail-section-icon">🔍</span>
        <span className="detail-section-title">Limitations & Methodology Notes</span>
      </div>
      <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: 14, lineHeight: 1.5 }}>
        Important caveats for interpreting this indicator correctly.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {limitations.map((l: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: '#ffffff', borderRadius: 8, border: '1px solid #f3f4f6' }}>
            <span style={{
              flexShrink: 0, padding: '2px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
              background: severityBg[l.severity] ?? '#f3f4f6',
              color: severityText[l.severity] ?? '#374151',
              alignSelf: 'center', whiteSpace: 'nowrap',
            }}>{l.severity}</span>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>
                {l.limitation_type}
              </span>
              <p style={{ fontSize: '0.85rem', color: '#374151', margin: '3px 0 0', lineHeight: 1.55 }}>
                {l.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

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
      <Link href="/?topic=climate_energy">← Back to overview</Link>
    </div>
  );

  const ind = data.topics.climate_energy?.indicators?.find(
    (i: any) => i.indicator === indicatorName
  );

  const historicalGHG: { year: number; value: number }[] =
    data.historical?.climate_energy?.series?.['Total GHG Emissions']?.map(
      (d: any) => ({ year: d.year, value: d.value })
    ) ?? [];

  // New supplementary sections from JSON
  const fecSectors: any[]      = data.climate_energy_supplementary?.final_energy_by_sector ?? [];
  const allLimitations: any[]  = data.climate_energy_supplementary?.limitations ?? [];
  const indicatorLimitations   = allLimitations.filter((l: any) => l.indicator === indicatorName);

  const sc = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  // ── Main chart (above Technical Information) ──────────────────────────────
  let chartNode: React.ReactNode = null;
  if (slug === 'total-ghg-emissions') {
    chartNode = <LineChartBlock data={historicalGHG} />;
  } else if (slug === 'per-capita-ghg-footprint') {
    chartNode = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <PieChartBlock
          data={FOOTPRINT_CATEGORIES}
          title="Consumption-based footprint by lifestyle category (~15.7 t/cap, 2019)"
          source="Source: UCLouvain (2021) — ⚠️ 2019 data, single study"
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
  } else if (slug === 'renewable-electricity-share-of-generation') {
    chartNode = (
      <PieChartBlock
        data={RENEWABLES_MIX}
        title="Renewables breakdown — % of total renewable energy (2023)"
        source="Source: IRENA Belgium Profile / Eurostat SHARES"
      />
    );
  }

  // ── Technical Information (slug-specific) ─────────────────────────────────
  let technicalNode: React.ReactNode = null;
  if (slug === 'total-ghg-emissions') {
    technicalNode = (
      <>
        {ind?.notes && <TechnicalInfoCard text={ind.notes} />}
        <GHGBubbleChart />
        <GHGSectorBarChart />
      </>
    );
  } else if (slug === 'per-capita-ghg-footprint') {
    technicalNode = (
      <>
        <PieChartExplanationCard />
        {ind?.notes && <TechnicalInfoCard text={ind.notes} />}
      </>
    );
  } else if (slug === 'final-energy-consumption') {
    technicalNode = (
      <>
        {ind?.notes && <TechnicalInfoCard text={ind.notes} />}
        <FinalEnergySectorChart sectors={fecSectors} />
        <MtoeConverter />
      </>
    );
  } else if (slug === 'renewable-electricity-share-of-generation') {
    technicalNode = (
      <>
        {ind?.notes && <TechnicalInfoCard text={ind.notes} />}
        <CO2IntensityTable />
      </>
    );
  }

  return (
    <div className="detail-page">

      {/* Header */}
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/?topic=climate_energy" className="back-link">← Back to overview</Link>
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

        {/* Main chart */}
        {chartNode && <div className="detail-charts">{chartNode}</div>}

        {/* Detail sections */}
        <div className="detail-info">

          {/* Technical Information — slug-specific content */}
          {technicalNode}

          {ind?.consequences && <ConsequencesCard text={ind.consequences} />}
          {ind?.responsible   && <ResponsibilityCard text={ind.responsible} />}

          {ind?.policy && (
            <InfoRow label="Policy / Legal basis">
              {ind.policy_url
                ? <a href={ind.policy_url} target="_blank" rel="noopener noreferrer" className="detail-link">{ind.policy} ↗</a>
                : ind.policy}
            </InfoRow>
          )}

          {ind?.data_source && (
            <InfoRow label="Data source">
              <DataSourceRow
                source={ind.data_source}
                url={ind.data_source_url}
                description={ind.data_source_description}
              />
            </InfoRow>
          )}

          {/* Limitations — always last */}
          <LimitationsSection limitations={indicatorLimitations} />

        </div>
      </div>
    </div>
  );
}
