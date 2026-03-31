'use client';

import React from 'react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};
const TREND_ICON: Record<string, string> = { Improving: '↑', Stable: '→', Worsening: '↓' };
const TOPIC_COLOR = '#06b6d4';

function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 1 })}${unit ? ' ' + unit : ''}`;
}

function getProgress(latest: number | null, target: number | null, status?: string | null) {
  if (latest == null || target == null) return null;
  if (status === 'Achieved') return 100;
  const l = +latest, t = +target;
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  return Math.min(100, l < t ? (l / t) * 100 : (t / l) * 100);
}

function progressColor(p: number) {
  if (p >= 100) return '#166534';
  if (p >= 80)  return '#16a34a';
  if (p >= 60)  return '#86efac';
  if (p >= 40)  return '#f97316';
  return '#ef4444';
}

// ── Shared left panel for all wide-cards ─────────────────────────────────────
function IndicatorLeft({ ind, slug }: { ind: any; slug: string }) {
  const sc = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];
  const p  = getProgress(ind?.latest_value, ind?.target_value, ind?.status);
  return (
    <div className="wide-card-left">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="status-badge" style={{ color: sc.color, background: sc.bg, fontSize: '0.75rem', padding: '3px 10px' }}>{sc.label}</span>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
          {TREND_ICON[ind?.trend ?? ''] ?? '—'} {ind?.trend ?? '—'}
        </span>
      </div>
      <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', margin: 0, lineHeight: 1.3 }}>
        {ind?.indicator}
      </h3>
      {ind?.short_description && (
        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {ind.short_description}
        </p>
      )}
      <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>Latest</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{fmt(ind?.latest_value, ind?.unit)}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{ind?.latest_value_year}</div>
        </div>
        {ind?.target_value != null && (
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2 }}>Target</div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{fmt(ind?.target_value, ind?.unit)}</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>by {ind?.target_year}</div>
          </div>
        )}
      </div>
      {p != null && (
        <div>
          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
            <div style={{ height: '100%', width: `${p}%`, background: progressColor(p), borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{p.toFixed(0)}% of the way to target</div>
        </div>
      )}
      <Link
        href={`/circularity-waste/${slug}`}
        className="read-more-btn"
        style={{ '--btn-color': TOPIC_COLOR } as React.CSSProperties}
      >
        Read more →
      </Link>
    </div>
  );
}

// ── Chart 1: MSW Recycling Rate — historical line ────────────────────────────
function MSWRecyclingChart({ series }: { series: any[] }) {
  if (!series.length) return <div style={{ padding: 20, color: '#9ca3af', fontSize: '0.85rem' }}>No historical data available.</div>;
  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
        Historical trend — Municipal Solid Waste Recycling Rate
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.4 }}>
        Belgium 2016–2023. Includes material recycling (34%) + composting/fermentation (22%). Series break in 2020 — new EU harmonised definition.
      </p>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={series} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[40, 70]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any) => [`${v}%`, 'Recycling rate']}
          />
          <ReferenceLine y={55} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 2025 target: 55%', position: 'insideTopRight', fontSize: 11, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>Source: Statbel / Eurostat (env_wasmun). ⚠️ Series break at 2020 — new EU definition.</div>
    </div>
  );
}

// ── Chart 2: Packaging Recycling by Material — bar + per-bar target lines ────
const MATERIAL_COLORS: Record<string, string> = {
  'Paper & Cardboard': '#3b82f6',
  'Glass':             '#06b6d4',
  'Plastic':           '#f97316',
  'Wood':              '#22c55e',
  'Metal':             '#8b5cf6',
};

const BAR_SIZE = 28; // px — narrower bars

// Custom shape: renders the actual bar + a short target-line segment above it
const BarWithTarget = (props: any) => {
  const { x, y, width, height, recycling_rate, target_2030, index, fill } = props;
  if (width <= 0) return null;
  // target line: full bar width + 5% padding each side
  const pad = width * 0.05;
  const tx1 = x - pad;
  const tx2 = x + width + pad;
  // convert target_2030 value to y-coordinate using the same scale
  // We use a data-driven approach: calculate from the chart's yAxis
  // Since we pass targetY directly via the data, use the provided targetY
  const ty = props.targetY;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={3} />
      {ty !== undefined && (
        <line
          x1={tx1} y1={ty} x2={tx2} y2={ty}
          stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3"
        />
      )}
    </g>
  );
};

function PackagingChart({ packaging }: { packaging: any[] }) {
  if (!packaging.length) return <div style={{ padding: 20, color: '#9ca3af', fontSize: '0.85rem' }}>No data available.</div>;

  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
        Packaging recycling rate by material — Belgium 2023
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.4 }}>
        Dashed red lines show EU 2030 target per material. Source: IVCIE / Statbel.
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={packaging.map(p => ({ ...p, name: p.material === 'Paper & Cardboard' ? 'Paper' : p.material }))}
          margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
          barSize={BAR_SIZE}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any, _: any, props: any) => [
              `${v}% recycled — 2030 target: ${props.payload.target_2030}%`,
              props.payload.name,
            ]}
          />
          <Bar dataKey="recycling_rate" shape={(props: any) => {
            const fill = MATERIAL_COLORS[props.material] ?? '#94a3b8';
            // Calculate target y-coordinate from the viewBox
            const { x, y, width, height, value, background } = props;
            const chartHeight = background?.height ?? 210;
            const chartY = background?.y ?? 0;
            const domainMax = 105;
            const domainMin = 0;
            const target = props.target_2030;
            const targetY = chartY + chartHeight * (1 - (target - domainMin) / (domainMax - domainMin));
            return <BarWithTarget {...props} fill={fill} targetY={targetY} />;
          }}>
            {packaging.map((p, i) => (
              <Cell key={i} fill={MATERIAL_COLORS[p.material] ?? '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
        {packaging.map((p, i) => (
          <div key={i} style={{ fontSize: '0.78rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: MATERIAL_COLORS[p.material] ?? '#94a3b8', flexShrink: 0 }} />
            {p.material === 'Paper & Cardboard' ? 'Paper' : p.material}
          </div>
        ))}
        <div style={{ fontSize: '0.78rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="16" height="10"><line x1="0" y1="5" x2="16" y2="5" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3"/></svg>
          EU 2030 target
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>
        Source: IVCIE / Statbel / Eurostat env_waspac (2023).
      </div>
    </div>
  );
}

// ── Chart 3: Municipal Waste Treatment Breakdown — pie chart (climate style) ──
const TREATMENT_DATA = [
  { name: 'Incinerated (energy recovery)', color: '#f97316' },
  { name: 'Material recycling',            color: '#06b6d4' },
  { name: 'Composted / fermented',         color: '#22c55e' },
  { name: 'Landfill',                      color: '#94a3b8' },
];

function TreatmentPieChart({ treatment }: { treatment: any[] }) {
  if (!treatment.length) return <div style={{ padding: 20, color: '#9ca3af', fontSize: '0.85rem' }}>No data available.</div>;

  const data = treatment.map((t, i) => ({
    name:  t.method,
    value: t.pct_2023,
    color: TREATMENT_DATA[i]?.color ?? '#94a3b8',
  }));

  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
        Municipal waste treatment breakdown — Belgium 2023
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px', lineHeight: 1.4 }}>
        Belgium has near-zero landfill (0.1%) — all incineration uses energy recovery.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="45%" outerRadius={90} dataKey="value" labelLine={false}>
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
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>Source: Statbel — municipal waste statistics 2023.</div>
    </div>
  );
}

// ── Chart 4: CMUR — historical line ─────────────────────────────────────────
function CMURChart({ series }: { series: any[] }) {
  if (!series.length) return <div style={{ padding: 20, color: '#9ca3af', fontSize: '0.85rem' }}>No historical data available.</div>;
  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
        Historical trend — Circular Material Use Rate (CMUR)
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.4 }}>
        Belgium 2010–2022. CMUR = share of recycled materials in total material consumption.
        EU average ~11.5% (2022). Belgium at 22.2% is one of the highest in the EU.
      </p>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={series} margin={{ top: 4, right: 20, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} interval={1} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[14, 28]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any) => [`${v}%`, 'CMUR']}
          />
          <ReferenceLine y={24} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 2030 target: 24%', position: 'insideTopRight', fontSize: 11, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>Source: Eurostat (cei_srm030). 2022 latest available; odd years are estimates.</div>
    </div>
  );
}

// ── Main tab component ────────────────────────────────────────────────────────
interface Props {
  indicators: any[];
  historicalMSW:   any[];
  historicalCMUR:  any[];
  historicalWaste: any[];
  packaging:       any[];
  treatment:       any[];
}

export default function CircularityWasteTab({
  indicators, historicalMSW, historicalCMUR, historicalWaste, packaging, treatment,
}: Props) {
  const get = (name: string) => indicators.find(i => i.indicator === name);

  const msw     = get('Municipal Solid Waste Recycling Rate');
  const pkgWaste = get('Packaging Waste Recycling Rate');
  const mwCap   = get('Municipal Waste Generation per Capita');
  const cmur    = get('Circular Material Use Rate (CMUR)');

  

  const GROUPS = [
    {
      id: 'waste-management', label: 'Waste Management', emoji: '🗑️',
      items: [
        { id: 'msw-recycling',    label: 'MSW Recycling Rate'    },
        { id: 'packaging',        label: 'Packaging Recycling'    },
        { id: 'waste-per-capita', label: 'Waste per Capita'       },
      ],
    },
    {
      id: 'circular-economy', label: 'Circular Economy', emoji: '🔄',
      items: [
        { id: 'cmur', label: 'Circular Material Use Rate' },
      ],
    },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="climate-tab" style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
      {/* Sidebar */}
      <div className="climate-sidebar">
        {GROUPS.map((group, gi) => (
          <div key={group.id}>
            {gi > 0 && <div className="sidebar-divider" />}
            <div className="sidebar-group-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {group.emoji} {group.label}
            </div>
            {group.items.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="sidebar-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Epilogue, sans-serif' }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
      {/* Group header: Waste Management */}
      <div id="waste-management" className="group-header" style={{ marginTop: 0 }}>
        <div className="group-header-inner">
          <span className="group-emoji">🗑️</span>
          <div>
            <div className="group-title">Waste Management</div>
            <div className="group-subtitle">Municipal waste recycling, packaging and generation per capita</div>
          </div>
        </div>
      </div>
      <div id="msw-recycling" className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={msw} slug="municipal-solid-waste-recycling-rate" />
        <div className="wide-card-right">
          <MSWRecyclingChart series={historicalMSW} />
        </div>
      </div>

      <div id="packaging" className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={pkgWaste} slug="packaging-waste-recycling-rate" />
        <div className="wide-card-right">
          <PackagingChart packaging={packaging} />
        </div>
      </div>

      <div id="waste-per-capita" className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={mwCap} slug="municipal-waste-generation-per-capita" />
        <div className="wide-card-right">
          <TreatmentPieChart treatment={treatment} />
        </div>
      </div>


      {/* Group header: Circular Economy */}
      <div id="circular-economy" className="group-header">
        <div className="group-header-inner">
          <span className="group-emoji">🔄</span>
          <div>
            <div className="group-title">Circular Economy</div>
            <div className="group-subtitle">Circular material use rate — share of recycled materials in total consumption</div>
          </div>
        </div>
      </div>
      <div id="cmur" className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={cmur} slug="circular-material-use-rate-cmur" />
        <div className="wide-card-right">
          <CMURChart series={historicalCMUR} />
        </div>
      </div>
      </div>
    </div>
  );
}
