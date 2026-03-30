'use client';

import React, { useState } from 'react';
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
        style={{ marginTop: 'auto', fontSize: '0.78rem', color: TOPIC_COLOR, fontWeight: 600, textDecoration: 'none', paddingTop: 4 }}
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
          <ReferenceLine y={55} stroke="#f97316" strokeDasharray="5 4" strokeWidth={1.5}
            label={{ value: '🎯 2025 target: 55%', position: 'insideTopRight', fontSize: 10, fill: '#f97316', fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={{ r: 3, fill: TOPIC_COLOR }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>Source: Statbel / Eurostat (env_wasmun). ⚠️ Series break at 2020 — new EU definition.</div>
    </div>
  );
}

// ── Chart 2: Packaging Recycling by Material — bar + EU target dotted lines ──
const MATERIAL_COLORS: Record<string, string> = {
  'Paper & Cardboard': '#3b82f6',
  'Glass':             '#06b6d4',
  'Plastic':           '#f97316',
  'Wood':              '#22c55e',
  'Metal':             '#8b5cf6',
};

function PackagingChart({ packaging }: { packaging: any[] }) {
  if (!packaging.length) return <div style={{ padding: 20, color: '#9ca3af', fontSize: '0.85rem' }}>No data available.</div>;

  const CustomBar = (props: any) => {
    const { x, y, width, height, material } = props;
    return <rect x={x} y={y} width={width} height={height} fill={MATERIAL_COLORS[material] ?? '#94a3b8'} rx={3} />;
  };

  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
        Packaging recycling rate by material — Belgium 2023
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.4 }}>
        Dotted lines show EU 2030 targets per material. Source: IVCIE / Statbel.
      </p>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={packaging.map(p => ({ ...p, name: p.material }))}
          margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} tickLine={false}
            tickFormatter={v => v === 'Paper & Cardboard' ? 'Paper' : v} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[0, 105]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any, _: any, props: any) => [
              `${v}% recycled (2030 target: ${props.payload.target_2030}%)`,
              props.payload.material,
            ]}
          />
          <Bar dataKey="recycling_rate" radius={[3, 3, 0, 0]}>
            {packaging.map((p, i) => (
              <Cell key={i} fill={MATERIAL_COLORS[p.material] ?? '#94a3b8'} />
            ))}
          </Bar>
          {/* EU 2030 targets as reference lines per material — approximated as segments */}
          {packaging.map((p, i) => (
            <ReferenceLine
              key={i}
              y={p.target_2030}
              stroke="#dc2626"
              strokeDasharray="4 3"
              strokeWidth={1.2}
              ifOverflow="extendDomain"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
        {packaging.map((p, i) => (
          <div key={i} style={{ fontSize: '0.68rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: MATERIAL_COLORS[p.material] ?? '#94a3b8', flexShrink: 0 }} />
            {p.material}: {p.recycling_rate}% <span style={{ color: '#9ca3af' }}>(target {p.target_2030}%)</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>
        Red dotted lines = EU 2030 targets. Source: IVCIE / Statbel / Eurostat env_waspac (2023).
      </div>
    </>
  );
}

// ── Chart 3: Municipal Waste Treatment Breakdown — pie chart ─────────────────
const TREATMENT_COLORS = ['#f97316', '#06b6d4', '#22c55e', '#94a3b8'];

function TreatmentPieChart({ treatment }: { treatment: any[] }) {
  const [active, setActive] = useState<number | null>(null);
  if (!treatment.length) return <div style={{ padding: 20, color: '#9ca3af', fontSize: '0.85rem' }}>No data available.</div>;

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    if (value < 3) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${value}%`}</text>;
  };

  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
        Municipal waste treatment breakdown — Belgium 2023
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 6px', lineHeight: 1.4 }}>
        Belgium has near-zero landfill (0.1%) — all incineration uses energy recovery.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={treatment.map(t => ({ name: t.method, value: t.pct_2023 }))}
              dataKey="value"
              cx="50%" cy="50%"
              outerRadius={80} innerRadius={30}
              labelLine={false} label={renderLabel}
              onMouseEnter={(_, idx) => setActive(idx)}
              onMouseLeave={() => setActive(null)}
            >
              {treatment.map((_, i) => (
                <Cell
                  key={i}
                  fill={TREATMENT_COLORS[i]}
                  opacity={active === null || active === i ? 1 : 0.5}
                  stroke={active === i ? '#1a1a1a' : 'none'}
                  strokeWidth={active === i ? 1.5 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any, name: string) => [`${v}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {treatment.map((t, i) => (
            <div key={i}
              style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: active === i ? '#f9fafb' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: TREATMENT_COLORS[i], flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: active === i ? 600 : 400 }}>{t.method}</span>
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a1a1a' }}>{t.pct_2023}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 6 }}>Source: Statbel — municipal waste statistics 2023.</div>
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
          <ReferenceLine y={24} stroke="#f97316" strokeDasharray="5 4" strokeWidth={1.5}
            label={{ value: '🎯 2030 target: 24%', position: 'insideTopRight', fontSize: 10, fill: '#f97316', fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={{ r: 3, fill: TOPIC_COLOR }} activeDot={{ r: 5 }} />
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

  const topic_meta = [
    { label: `${indicators.length} indicators tracked` },
    { label: `${indicators.filter(i => i.status === 'Off track').length} off track`, color: '#dc2626' },
    { label: `${indicators.filter(i => i.status === 'On track' || i.status === 'Achieved').length} on track / achieved`, color: '#16a34a' },
  ];

  return (
    <>
      {/* Topic header */}
      <div className="topic-header" style={{ borderColor: TOPIC_COLOR, '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
        <h2>♻️ Circularity &amp; Waste</h2>
        <div className="topic-meta">
          {topic_meta.map((m, i) => (
            <span key={i} style={m.color ? { color: m.color } : undefined}>{m.label}</span>
          ))}
        </div>
      </div>

      {/* Card 1: MSW Recycling Rate + historical line */}
      <div className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={msw} slug="municipal-solid-waste-recycling-rate" />
        <div className="wide-card-right">
          <MSWRecyclingChart series={historicalMSW} />
        </div>
      </div>

      {/* Card 2: Packaging Waste Recycling + material bar chart */}
      <div className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={pkgWaste} slug="packaging-waste-recycling-rate" />
        <div className="wide-card-right">
          <PackagingChart packaging={packaging} />
        </div>
      </div>

      {/* Card 3: Municipal Waste per Capita + treatment pie */}
      <div className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={mwCap} slug="municipal-waste-generation-per-capita" />
        <div className="wide-card-right">
          <TreatmentPieChart treatment={treatment} />
        </div>
      </div>

      {/* Card 4: CMUR + historical line */}
      <div className="wide-card">
        <div className="wide-card-accent" />
        <IndicatorLeft ind={cmur} slug="circular-material-use-rate-cmur" />
        <div className="wide-card-right">
          <CMURChart series={historicalCMUR} />
        </div>
      </div>
    </>
  );
}
