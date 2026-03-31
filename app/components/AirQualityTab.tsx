'use client';

import React from 'react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#8b5cf6';

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};
const TREND_ICON: Record<string, string> = { Improving: '↑', Stable: '→', Worsening: '↓' };

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── IndicatorLeft ─────────────────────────────────────────────────────────────
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
      <Link href={`/air-quality/${slug}`} className="read-more-btn"
        style={{ '--btn-color': TOPIC_COLOR } as React.CSSProperties}>
        Read more →
      </Link>
    </div>
  );
}

// ── Emission source pie chart ─────────────────────────────────────────────────
function EmissionSourcePie({
  title, subtitle, data, source,
}: {
  title: string;
  subtitle: string;
  data: { name: string; value: number; color: string }[];
  source: string;
}) {
  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 3 }}>{title}</div>
        <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            outerRadius={78}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any, n: any) => [`${v}%`, n]}
            contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
          />
          <Legend
            iconType="circle"
            iconSize={9}
            formatter={(v) => <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: 0 }}>{source}</p>
    </div>
  );
}

// ── Emission source data ──────────────────────────────────────────────────────
const PM25_SOURCES = [
  { name: 'Residential heating', value: 33, color: '#f97316' },
  { name: 'Industry',            value: 22, color: '#6366f1' },
  { name: 'Agriculture',         value: 17, color: '#22c55e' },
  { name: 'Road transport',      value: 13, color: '#3b82f6' },
  { name: 'Other',               value: 15, color: '#94a3b8' },
];

const NOX_SOURCES = [
  { name: 'Road transport',        value: 47, color: '#3b82f6' },
  { name: 'Energy industries',     value: 18, color: '#f59e0b' },
  { name: 'Industry',              value: 18, color: '#6366f1' },
  { name: 'Non-road machinery',    value: 12, color: '#f97316' },
  { name: 'Other',                 value:  5, color: '#94a3b8' },
];

const NH3_SOURCES = [
  { name: 'Agriculture',  value: 92, color: '#22c55e' },
  { name: 'Transport',    value:  5, color: '#3b82f6' },
  { name: 'Other',        value:  3, color: '#94a3b8' },
];

// ── Ozone pathway SVG diagram ─────────────────────────────────────────────────
function OzonePathwayDiagram() {
  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 3 }}>
          How ground-level ozone forms
        </div>
        <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Ozone (O₃) is not emitted directly — it is formed by chemical reactions between nitrogen oxides (NOₓ)
          and volatile organic compounds (VOCs) in the presence of sunlight.
        </p>
      </div>

      <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafafa' }}>
        <defs>
          <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6"/>
          </marker>
          <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f97316"/>
          </marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#16a34a"/>
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#dc2626"/>
          </marker>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/>
          </marker>
        </defs>

        {/* ── Source boxes at top ── */}
        {/* NOx source */}
        <rect x="20" y="16" width="110" height="38" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="75" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#78350f" fontFamily="sans-serif">NOₓ sources</text>
        <text x="75" y="45" textAnchor="middle" fontSize="9" fill="#92400e" fontFamily="sans-serif">transport · industry</text>

        {/* VOC source */}
        <rect x="175" y="16" width="110" height="38" rx="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5"/>
        <text x="230" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#78350f" fontFamily="sans-serif">VOC sources</text>
        <text x="230" y="45" textAnchor="middle" fontSize="9" fill="#92400e" fontFamily="sans-serif">solvents · fuel · vegetation</text>

        {/* Sunlight */}
        <rect x="340" y="16" width="110" height="38" rx="6" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5"/>
        <text x="395" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#713f12" fontFamily="sans-serif">☀️ Sunlight (UV)</text>
        <text x="395" y="45" textAnchor="middle" fontSize="9" fill="#92400e" fontFamily="sans-serif">photolysis catalyst</text>

        {/* ── Step 1: NO2 photolysis ── */}
        {/* Arrow: NOx → NO2 box */}
        <line x1="75" y1="54" x2="75" y2="96" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrowOrange)"/>

        {/* Sunlight arrow → NO2 */}
        <line x1="340" y1="35" x2="240" y2="100" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowOrange)"/>

        {/* NO2 box */}
        <rect x="20" y="98" width="130" height="38" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5"/>
        <text x="85" y="113" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3730a3" fontFamily="sans-serif">NO₂ + UV light</text>
        <text x="85" y="127" textAnchor="middle" fontSize="9" fill="#4338ca" fontFamily="sans-serif">→ NO + O (atomic)</text>

        {/* ── Step 2: O + O2 → O3 ── */}
        <line x1="85" y1="136" x2="85" y2="175" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowPurple)"/>

        <rect x="20" y="177" width="130" height="38" rx="6" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5"/>
        <text x="85" y="192" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b21b6" fontFamily="sans-serif">O + O₂ → O₃</text>
        <text x="85" y="206" textAnchor="middle" fontSize="9" fill="#6d28d9" fontFamily="sans-serif">ozone formed</text>

        {/* ── VOC pathway ── */}
        <line x1="230" y1="54" x2="230" y2="96" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrowOrange)"/>

        <rect x="170" y="98" width="130" height="38" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
        <text x="235" y="113" textAnchor="middle" fontSize="10" fontWeight="700" fill="#14532d" fontFamily="sans-serif">VOCs + OH radical</text>
        <text x="235" y="127" textAnchor="middle" fontSize="9" fill="#166534" fontFamily="sans-serif">→ peroxy radicals (RO₂)</text>

        {/* RO2 converts NO to NO2 faster → more O3 */}
        <line x1="235" y1="136" x2="235" y2="175" stroke="#16a34a" strokeWidth="1.5" markerEnd="url(#arrowGreen)"/>

        <rect x="170" y="177" width="130" height="38" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
        <text x="235" y="192" textAnchor="middle" fontSize="10" fontWeight="700" fill="#14532d" fontFamily="sans-serif">RO₂ + NO → NO₂</text>
        <text x="235" y="206" textAnchor="middle" fontSize="9" fill="#166534" fontFamily="sans-serif">amplifies O₃ production</text>

        {/* ── Both pathways feed into O3 accumulation ── */}
        <line x1="150" y1="196" x2="330" y2="248" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrowPurple)"/>
        <line x1="300" y1="196" x2="350" y2="248" stroke="#16a34a" strokeWidth="1.5" markerEnd="url(#arrowGreen)"/>

        {/* Final O3 box */}
        <rect x="330" y="250" width="130" height="40" rx="8" fill="#f3e8ff" stroke="#8b5cf6" strokeWidth="2"/>
        <text x="395" y="267" textAnchor="middle" fontSize="11" fontWeight="900" fill="#5b21b6" fontFamily="sans-serif">O₃ accumulates</text>
        <text x="395" y="281" textAnchor="middle" fontSize="9" fill="#6d28d9" fontFamily="sans-serif">ground-level ozone</text>

        {/* ── NO titration (scavenging) ── */}
        <rect x="340" y="120" width="120" height="48" rx="6" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5"/>
        <text x="400" y="135" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7f1d1d" fontFamily="sans-serif">⚠️ NO titration</text>
        <text x="400" y="149" textAnchor="middle" fontSize="9" fill="#991b1b" fontFamily="sans-serif">O₃ + NO → NO₂ + O₂</text>
        <text x="400" y="162" textAnchor="middle" fontSize="9" fill="#991b1b" fontFamily="sans-serif">scavenges O₃ near roads</text>

        {/* Arrow from O3 box back to NO titration - curved via line */}
        <path d="M395,250 Q440,220 400,168" stroke="#dc2626" strokeWidth="1.2" fill="none" strokeDasharray="4 3" markerEnd="url(#arrowRed)"/>

        {/* ── Legend ── */}
        <rect x="16" y="258" width="300" height="36" rx="4" fill="white" opacity="0.9" stroke="#e5e7eb"/>
        <text x="24" y="270" fontSize="8" fontWeight="700" fill="#374151" fontFamily="sans-serif">Key:</text>
        {[
          ['#f59e0b', 'Primary emission'],
          ['#8b5cf6', 'O₃ formation'],
          ['#16a34a', 'VOC amplification'],
          ['#dc2626', 'O₃ scavenging (near roads)'],
        ].map(([col, lbl], i) => (
          <g key={i} transform={`translate(${16 + i * 74}, 276)`}>
            <rect width="8" height="6" fill={col} rx="1"/>
            <text x="11" y="5.5" fontSize="7.5" fill="#374151" fontFamily="sans-serif">{lbl}</text>
          </g>
        ))}
      </svg>

      <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: 0 }}>
        Ground-level O₃ peaks in summer afternoons when sunlight is strongest. Paradoxically, O₃ concentrations
        can be <em>lower</em> directly at busy roads (where NO scavenges it) and higher in downwind rural areas.
        Source: EEA / EMEP atmospheric chemistry.
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  indicators: any[];
}

export default function AirQualityTab({ indicators }: Props) {
  const get = (name: string) => indicators.find(i => i.indicator === name);

  const pm25   = get('PM2.5 Annual Mean Concentration (population-weighted)');
  const nox    = get('NOₓ Emissions — Reduction vs 2005 Baseline');
  const nh3    = get('NH₃ Emissions — Reduction vs 2005 Baseline');
  const ozone  = get('Ozone — Days Exceeding 120 µg/m³ (3-year average)');

  const GROUPS = [
    {
      id: 'particulates', label: 'Particulate & Reactive Gases', emoji: '🏭',
      items: [
        { id: 'pm25', label: 'PM2.5 Concentration'  },
        { id: 'nox',  label: 'NOₓ Emissions'         },
        { id: 'nh3',  label: 'NH₃ Emissions'          },
      ],
    },
    {
      id: 'ozone-group', label: 'Ozone', emoji: '☀️',
      items: [
        { id: 'ozone', label: 'Ozone Exceedances' },
      ],
    },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Epilogue, sans-serif' }}>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Group: Particulate & Reactive Gases */}
        <div id="particulates" className="group-header" style={{ marginTop: 0 }}>
          <div className="group-header-inner">
            <span className="group-emoji">🏭</span>
            <div>
              <div className="group-title">Particulate &amp; Reactive Gases</div>
              <div className="group-subtitle">PM2.5 concentration, NOₓ and NH₃ emission reductions vs 2005 baseline</div>
            </div>
          </div>
        </div>

        {/* PM2.5 */}
        <div id="pm25" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={pm25} slug="pm2-5-annual-mean-concentration-population-weighted" />
          <div className="wide-card-right">
            <EmissionSourcePie
              title="PM2.5 emission sources — Belgium (~2022)"
              subtitle="Residential wood burning is the dominant source. Agriculture contributes mainly via secondary aerosol from NH₃."
              data={PM25_SOURCES}
              source="Source: IRCEL/CELINE IIR 2024; EEA NEC inventory; klimaat.be. Note: PM2.5 includes both primary emissions and secondary aerosol formation."
            />
          </div>
        </div>

        {/* NOx */}
        <div id="nox" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={nox} slug="nox-emissions-reduction-vs-2005-baseline" />
          <div className="wide-card-right">
            <EmissionSourcePie
              title="NOₓ emission sources — Belgium (~2022)"
              subtitle="Road transport dominates, with diesel vehicles accounting for over 90% of transport-sector NOₓ. Belgium exceeded its NEC ceiling for NOₓ from 2010–2016."
              data={NOX_SOURCES}
              source="Source: IRCEL/CELINE IIR 2024; Belgium NEC reporting to EEA."
            />
          </div>
        </div>

        {/* NH3 */}
        <div id="nh3" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={nh3} slug="nh3-emissions-reduction-vs-2005-baseline" />
          <div className="wide-card-right">
            <EmissionSourcePie
              title="NH₃ emission sources — Belgium (~2022)"
              subtitle="Agriculture is overwhelmingly dominant — livestock manure and fertiliser application account for over 90% of all Belgian ammonia emissions."
              data={NH3_SOURCES}
              source="Source: IRCEL/CELINE IIR 2024; EEA NEC inventory."
            />
          </div>
        </div>

        {/* Group: Ozone */}
        <div id="ozone-group" className="group-header">
          <div className="group-header-inner">
            <span className="group-emoji">☀️</span>
            <div>
              <div className="group-title">Ozone</div>
              <div className="group-subtitle">Ground-level ozone formation from NOₓ and VOC precursors — days exceeding 120 µg/m³ threshold</div>
            </div>
          </div>
        </div>

        {/* Ozone */}
        <div id="ozone" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={ozone} slug="ozone-days-exceeding-120-g-m3-3-year-average" />
          <div className="wide-card-right">
            <OzonePathwayDiagram />
          </div>
        </div>

      </div>
    </div>
  );
}
