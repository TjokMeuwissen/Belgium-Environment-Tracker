'use client';

import React from 'react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#3b82f6';

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
      <Link href={`/water-soil/${slug}`} className="read-more-btn"
        style={{ '--btn-color': TOPIC_COLOR } as React.CSSProperties}>
        Read more →
      </Link>
    </div>
  );
}

// ── Right panel: Nitrate sources ─────────────────────────────────────────────
const NITRATE_IMPORTANCE_COLOR: Record<string, string> = {
  'Very high (dominant)': '#dc2626',
  'High':                 '#f97316',
  'Moderate (point source)': '#eab308',
  'Low-moderate':         '#22c55e',
};
const NITRATE_IMPORTANCE_BAR: Record<string, number> = {
  'Very high (dominant)': 95,
  'High':                 70,
  'Moderate (point source)': 40,
  'Low-moderate':         20,
};

function NitrateSourcesPanel({ sources }: { sources: any[] }) {
  // Short descriptions per source — shown instead of the long Excel text
  const SHORT: Record<string, string> = {
    'Animal manure — livestock':              'Manure from pigs, cattle and poultry leaches nitrates into groundwater and runs off into rivers. The dominant source in Flanders. Pig numbers fell from 5.9M to 5.05M (2019→2023), directly linked to recent improvements.',
    'Mineral fertilisers — synthetic nitrogen': 'Synthetic nitrogen applied to arable crops leaches when it exceeds crop uptake or heavy rain follows application. Flanders and Wallonia are both designated Nitrate Vulnerable Zones.',
    'Septic tanks & urban wastewater':         'Poorly maintained septic tanks and older wastewater plants release nitrogen-rich effluent. Improved significantly since Belgium&#39;s 2004 ECJ ruling on wastewater compliance.',
    'Urban stormwater runoff':                 'Rainwater picks up nitrogen from roads and surfaces, entering rivers untreated via storm sewers — a minor but non-trivial diffuse source in Belgium&#39;s heavily built-up landscape.',
  };
  return (
    <div style={{ padding: '14px 18px 14px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Main sources of nitrate pollution — Belgium
        </div>
        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>
          Agriculture (manure + fertilisers) is overwhelmingly dominant. No official % breakdown by source is published.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s, i) => {
          const color = NITRATE_IMPORTANCE_COLOR[s.importance] ?? '#94a3b8';
          const bar   = NITRATE_IMPORTANCE_BAR[s.importance] ?? 20;
          return (
            <div key={i} style={{ background: '#fafafa', borderRadius: 8, padding: '10px 12px', border: '1px solid #f0f0f0', borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{s.source}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: color, background: `${color}18`, padding: '2px 7px', borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{s.importance}</span>
              </div>
              <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${bar}%`, background: color, borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: '0.76rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                {SHORT[s.source] ?? s.mechanism}
              </p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Source: VMM 2024 water quality report; EEA Nitrates Directive reporting.</p>
    </div>
  );
}

// ── Right panel: Phosphate sources ───────────────────────────────────────────
const PHOSPHATE_IMPORTANCE_COLOR: Record<string, string> = {
  'Very high (dominant diffuse source)': '#dc2626',
  'Historically high, now reduced':      '#f97316',
  'Moderate':                            '#eab308',
  'Low':                                 '#22c55e',
  'Moderate (internal load)':            '#8b5cf6',
};
const PHOSPHATE_IMPORTANCE_BAR: Record<string, number> = {
  'Very high (dominant diffuse source)': 95,
  'Historically high, now reduced':      55,
  'Moderate':                            35,
  'Low':                                 15,
  'Moderate (internal load)':            35,
};

function PhosphateSourcesPanel({ sources }: { sources: any[] }) {
  const SHORT: Record<string, string> = {
    'Agriculture — fertiliser & manure runoff': 'Phosphorus from manure and fertiliser binds to soil and washes into rivers during rainfall. Unlike nitrate, it doesn&#39;t leach — it travels via surface runoff. Flanders produces far more manure P than its land can absorb.',
    'Urban wastewater treatment plants (WWTPs)': 'Once the dominant source; now greatly reduced by phosphate-free detergents (EU regulation) and WWTP upgrades. A secondary source where older or under-capacity plants still operate.',
    'Stormwater & combined sewer overflows (CSOs)': 'Urban stormwater and CSO discharges during heavy rain contribute phosphate pulses. Dense Belgian cities with legacy combined sewers are being addressed through sewer separation.',
    'Industrial discharges':                    'Well-regulated point sources — food processing and chemical industry. A minor contribution compared to agriculture.',
    'Legacy sediment phosphorus':               'Decades of pollution have saturated river sediments with phosphorus, which re-dissolves under low oxygen or high temperatures. A structural long-term problem even as external inputs fall (Scheldt basin).',
  };
  return (
    <div style={{ padding: '14px 18px 14px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Main sources of phosphate pollution — Belgium
        </div>
        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5 }}>
          Phosphate binds to soil and moves with surface runoff, not via leaching. Agriculture is dominant; legacy sediment is a structural long-term problem.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s, i) => {
          const color = PHOSPHATE_IMPORTANCE_COLOR[s.importance] ?? '#94a3b8';
          const bar   = PHOSPHATE_IMPORTANCE_BAR[s.importance] ?? 20;
          return (
            <div key={i} style={{ background: '#fafafa', borderRadius: 8, padding: '10px 12px', border: '1px solid #f0f0f0', borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{s.source}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: color, background: `${color}18`, padding: '2px 7px', borderRadius: 4, flexShrink: 0, marginLeft: 8 }}>{s.importance}</span>
              </div>
              <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${bar}%`, background: color, borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: '0.76rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>
                {SHORT[s.source] ?? s.mechanism}
              </p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Sources: VMM; EEA; OECD Belgium water; Lauryssen et al. 2022 (Biogeosciences).</p>
    </div>
  );
}

// ── Right panel: Groundwater + EU drought sensitivity SVG map ────────────────
function GroundwaterPanel() {
  return (
    <div style={{ padding: '14px 18px 14px', display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Belgium in a European water stress context
        </div>
        <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.55 }}>
          At the large river basin scale Belgium appears in the low water stress zone (yellow) —
          the Rhine-Meuse basin has abundant water overall. However this masks critical local
          vulnerabilities: Belgium scores <strong>extreme water stress (&gt;80% WEI)</strong> in the
          WRI Aqueduct country ranking, driven by its exceptionally high population and agricultural
          density relative to its small territory. Flanders in particular faces structural groundwater
          pressure: high abstraction, intensive agriculture, flat topography limiting natural recharge,
          and documented groundwater level drops during the 2022–2023 droughts.
        </p>
      </div>
      <div>
        <img
          src="/images/water_stress_present.png"
          alt="Annual water stress for present climate — Europe (EEA)"
          style={{ width: '100%', borderRadius: 6, border: '1px solid #e5e7eb', display: 'block' }}
        />
        {/* Custom legend matching site style */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {[
            { color: '#ffd900', label: 'Low (0–20%)' },
            { color: '#f58220', label: 'Mild (20–40%)' },
            { color: '#ed1c24', label: 'Severe (>40%)' },
            { color: '#808285', label: 'Outside coverage' },
          ].map((item, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.15)' }} />
              {item.label}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '6px 0 0' }}>
          Source: EEA — Annual water stress, present climate (CC-BY 2.5 DK).
          WEI = ratio of water withdrawn to renewable resources available.
        </p>
      </div>
    </div>
  );
}

// ── Right panel: Drinking Water ───────────────────────────────────────────────
function DrinkingWaterPanel() {
  const facts = [
    { icon: '🏔️', val: '55%', desc: 'of Belgian drinking water comes from groundwater. Wallonia supplies 55% of national needs despite hosting only 37% of the population — Flanders and Brussels depend on Wallonian aquifers.' },
    { icon: '🔬', val: '99.5%', desc: 'compliance rate with EU Drinking Water Directive parameters (microbiological, chemical, radioactivity). This makes Belgian tap water among the safest in the EU.' },
    { icon: '⚠️', val: 'PFAS', desc: 'Emerging concern: PFAS ("forever chemicals") contamination detected in drinking water sources near industrial sites in Flanders (Zwijndrecht / 3M). New EU DWD limits from 2026 will require upgrades.' },
  ];
  return (
    <div style={{ padding: '14px 18px 14px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 2 }}>
        Belgium&#39;s drinking water — key facts
      </div>
      {facts.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: i === 2 ? '#fff7ed' : '#f8fafc', borderRadius: 8, padding: '10px 12px', border: `1px solid ${i === 2 ? '#fed7aa' : '#e5e7eb'}` }}>
          <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>{f.icon}</span>
          <div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: i === 2 ? '#c2410c' : TOPIC_COLOR, marginBottom: 2 }}>{f.val}</div>
            <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        </div>
      ))}
      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Source: De Watergroep / SWDE / Eurostat. PFAS: VMM 2022–2023 monitoring reports.</p>
    </div>
  );
}

// ── Right panel: Soil Sealing — line chart + land use pie + explanation ───────
const LAND_USE_COLORS: Record<string, string> = {
  'Agriculture':        '#22c55e',
  'Forest & woodland':  '#16a34a',
  'Built-up & related': '#f97316',
  'Water bodies':       '#3b82f6',
  'Nature & other':     '#a78bfa',
};

function SoilSealingPanel({ historicalSoil, landUse }: { historicalSoil: any[]; landUse: any[] }) {
  const pieData = landUse.map(l => ({
    name: l.category,
    value: l.pct,
    color: LAND_USE_COLORS[l.category] ?? '#94a3b8',
  }));

  return (
    <div style={{ padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>

      {/* Land use pie chart */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Land use in Belgium — 2022
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
            <Pie data={pieData} cx="50%" cy="45%" outerRadius={80} dataKey="value" labelLine={false}>
              {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
            </Pie>
            <Tooltip
              formatter={(v: any, n: any) => [`${v}%`, n]}
              contentStyle={{ background: '#ffffff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" iconSize={9}
              formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>Source: Statbel / Federal Planning Bureau (FPB), 2022.</p>
      </div>

      {/* 13.7 vs 21.8 explanation */}
      <div style={{ background: '#eff6ff', borderRadius: 8, padding: '12px 14px', borderLeft: `4px solid ${TOPIC_COLOR}` }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', marginBottom: 6 }}>
          Why 13.7% sealed soil vs 21.8% built-up land?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { pct: '13.7%', color: '#dc2626', label: 'Soil sealing rate', desc: 'Copernicus High Resolution Layer — only truly impervious surfaces: building footprints, paved roads, car parks, airports. Rain cannot infiltrate.' },
            { pct: '21.8%', color: '#f97316', label: 'Built-up & related land', desc: 'Statbel/FPB cadastral category — includes all of the above plus gardens, parks and soft landscaping within built-up parcels. These are permeable: rain can still infiltrate.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, fontFamily: 'Roboto, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: item.color, minWidth: 44 }}>{item.pct}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1a1a1a' }}>{item.label}</div>
                <p style={{ fontSize: '0.73rem', color: '#4b5563', margin: '2px 0 0', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '8px 0 0' }}>
          The difference (8.1 pp) is mainly gardens within residential plots — permeable in terms of water flow but
          still counted as "built-up" in the land register.
        </p>
      </div>

    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  indicators:    any[];
  historicalSoil: any[];
  landUse:       any[];
  nitrateSources: any[];
  phosphateSources: any[];
}

export default function WaterSoilTab({ indicators, historicalSoil, landUse, nitrateSources, phosphateSources }: Props) {
  const get = (name: string) => indicators.find(i => i.indicator === name);

  const nitrate       = get('Nitrate Pollution — Groundwater Stations Exceeding 50 mg/L');
  const phosphate     = get('Phosphate Pollution — Rivers Exceeding Good Status Threshold');
  const drinkingWater = get('Drinking Water Quality Compliance');
  const groundwater   = get('Groundwater in Good Chemical Status');
  const soilSealing   = get('Soil Sealing Rate');

  const GROUPS = [
    {
      id: 'water-quality', label: 'Water Quality', emoji: '🌊',
      items: [
        { id: 'nitrate',        label: 'Nitrate Pollution'                },
        { id: 'phosphate',      label: 'Phosphate Pollution'              },
        { id: 'groundwater',    label: 'Groundwater Chemical Status'      },
      ],
    },
    {
      id: 'drinking-soil', label: 'Drinking Water & Soil', emoji: '🚰',
      items: [
        { id: 'drinking-water', label: 'Drinking Water Quality' },
        { id: 'soil-sealing',   label: 'Soil Sealing Rate'      },
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Epilogue, sans-serif' }}>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Group: Water Quality */}
        <div id="water-quality" className="group-header" style={{ marginTop: 0 }}>
          <div className="group-header-inner">
            <span className="group-emoji">🌊</span>
            <div>
              <div className="group-title">Water Quality</div>
              <div className="group-subtitle">Ecological status of surface waters, nitrate &amp; phosphate pollution, and groundwater chemical status</div>
            </div>
          </div>
        </div>

        <div id="nitrate" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={nitrate} slug="nitrate-pollution-groundwater-stations-exceeding-50-mg-l" />
          <div className="wide-card-right"><NitrateSourcesPanel sources={nitrateSources} /></div>
        </div>

        <div id="phosphate" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={phosphate} slug="phosphate-pollution-rivers-exceeding-good-status-threshold" />
          <div className="wide-card-right"><PhosphateSourcesPanel sources={phosphateSources} /></div>
        </div>

        <div id="groundwater" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={groundwater} slug="groundwater-in-good-chemical-status" />
          <div className="wide-card-right"><GroundwaterPanel /></div>
        </div>

        {/* Group: Drinking Water & Soil */}
        <div id="drinking-soil" className="group-header">
          <div className="group-header-inner">
            <span className="group-emoji">🚰</span>
            <div>
              <div className="group-title">Drinking Water &amp; Soil</div>
              <div className="group-subtitle">Drinking water quality compliance and soil sealing — the permanent loss of permeable land</div>
            </div>
          </div>
        </div>

        <div id="drinking-water" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={drinkingWater} slug="drinking-water-quality-compliance" />
          <div className="wide-card-right"><DrinkingWaterPanel /></div>
        </div>

        <div id="soil-sealing" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={soilSealing} slug="soil-sealing-rate" />
          <div className="wide-card-right">
            <SoilSealingPanel historicalSoil={historicalSoil} landUse={landUse} />
          </div>
        </div>

      </div>
    </div>
  );
}
