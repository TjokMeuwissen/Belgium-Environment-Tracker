'use client';

import React from 'react';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#ec4899';

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
  // If status is Off track and latest < target → higher-is-better indicator (e.g. ZEV registrations)
  // Progress = how far along toward the target we are: l/t
  if ((status === 'Off track' || status === 'On track') && l < t) {
    return Math.min(100, (l / t) * 100);
  }
  // Lower-is-better (e.g. CO₂, freight road share): progress = how close to target from above
  if (l <= t) return 100; // already at or below target
  return Math.min(100, (t / l) * 100);
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
  const trendRaw = ind?.trend ?? '';
  const trendText = trendRaw.replace(/^[↑↗↓↘→]\s*/, '');
  const trendIcon = trendRaw.match(/^[↑↗↓↘→]/) ? trendRaw[0] : (TREND_ICON[trendText] ?? '→');

  return (
    <div className="wide-card-left">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="status-badge" style={{ color: sc.color, background: sc.bg, fontSize: '0.75rem', padding: '3px 10px' }}>{sc.label}</span>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
          {trendIcon} {trendText}
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
      <Link href={`/mobility-transport/${slug}`} className="read-more-btn"
        style={{ '--btn-color': TOPIC_COLOR } as React.CSSProperties}>
        Read more →
      </Link>
    </div>
  );
}

// ── Panel: BEV + PHEV historical chart ───────────────────────────────────────
const BEV_HISTORY_FALLBACK = [
  { year: '2018', BEV: 1.1,  PHEV: 2.4,  Combined: 3.5  },
  { year: '2019', BEV: 1.2,  PHEV: 3.5,  Combined: 4.7  },
  { year: '2020', BEV: 2.8,  PHEV: 8.7,  Combined: 11.5 },
  { year: '2021', BEV: 7.2,  PHEV: 19.8, Combined: 27.0 },
  { year: '2022', BEV: 9.1,  PHEV: 16.3, Combined: 25.4 },
  { year: '2023', BEV: 19.6, PHEV: 19.6, Combined: 39.2 },
  { year: '2024', BEV: 28.5, PHEV: 15.0, Combined: 43.5 },
  { year: '2025', BEV: 35.0, PHEV: 9.0,  Combined: 44.0 },
];

function BEVPanel({ history }: { history: any[] }) {
  const chartData = (history.length > 0 ? history : BEV_HISTORY_FALLBACK).map(h => ({
    year:     h.year ? String(h.year) : h.year,
    BEV:      h.bev_share ?? h.BEV,
    PHEV:     h.phev_share ?? h.PHEV,
    Combined: h.combined_share ?? h.Combined ?? ((h.bev_share ?? h.BEV ?? 0) + (h.phev_share ?? h.PHEV ?? 0)),
  }));

  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          BEV &amp; PHEV share of new car registrations — Belgium 2018–2025
        </div>
      </div>
      <div style={{ width: '100%', height: 190 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
            width={34} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any, n: any) => [`${v}%`, n]} />
          <ReferenceLine y={100} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 2035: 100% ZEV', position: 'insideTopRight', fontSize: 10, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <Line type="monotone" dataKey="Combined" stroke="#1a1a1a" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#1a1a1a' }} />
          <Line type="monotone" dataKey="BEV" stroke={TOPIC_COLOR} strokeWidth={1.8} dot={false} activeDot={{ r: 4, fill: TOPIC_COLOR }} strokeDasharray="5 3" />
          <Line type="monotone" dataKey="PHEV" stroke="#a78bfa" strokeWidth={1.8} dot={false} activeDot={{ r: 4, fill: '#a78bfa' }} strokeDasharray="5 3" />
          <Legend iconType="circle" iconSize={9} formatter={v => <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>{v}</span>} />
        </LineChart>
      </ResponsiveContainer>
      </div>
      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>
        Source: EAFO; EV Belgium; Statbel. The 2021 company car tax reform (100% BEV deductibility, ICE phasing to 0% by 2028) drove the surge from 2023. 89% of BEVs are company cars.
      </p>
    </div>
  );
}

// ── Panel: CO₂ bar chart by fuel type ────────────────────────────────────────
const CO2_BY_FUEL = [
  { fuel: 'Petrol (avg)',    co2: 145, color: '#f97316', note: 'Typical medium hatchback' },
  { fuel: 'Diesel (avg)',    co2: 130, color: '#78716c', note: 'Slightly lower due to efficiency' },
  { fuel: 'PHEV (official)', co2:  40, color: '#a78bfa', note: 'WLTP official; real-world often 80–120 g/km when not charged' },
  { fuel: 'CNG / LNG',       co2:  95, color: '#22c55e', note: 'Compressed/liquefied natural gas' },
  { fuel: 'Hydrogen (FCEV)', co2:   0, color: '#38bdf8', note: 'Zero tailpipe; H₂ production matters' },
  { fuel: 'Battery Electric (BEV)', co2: 0, color: TOPIC_COLOR, note: 'Zero tailpipe; upstream emissions depend on electricity mix' },
];

function CO2Panel() {
  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Typical tailpipe CO₂ by fuel type — medium-sized car (WLTP, g/km)
        </div>
        <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: '0 0 6px', lineHeight: 1.5 }}>
          WLTP (Worldwide harmonised Light vehicles Test Procedure) is the EU&#39;s official test cycle since 2021 — more realistic than its predecessor NEDC but still ~10–20% below real-world driving.
        </p>
      </div>
      <div style={{ width: '100%', height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={CO2_BY_FUEL} layout="vertical" margin={{ top: 4, right: 60, left: 10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
            tickFormatter={v => `${v}`} domain={[0, 160]}
            label={{ value: 'g CO₂/km (tailpipe)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#9ca3af' }} />
          <YAxis type="category" dataKey="fuel" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={125} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any, _n: any, props: any) => [`${v} g CO₂/km`, props.payload.note]} />
          <Bar dataKey="co2" radius={[0, 3, 3, 0]}>
            {CO2_BY_FUEL.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
      <div style={{ background: '#fefce8', borderRadius: 6, padding: '8px 12px', border: '1px solid #fde68a' }}>
        <p style={{ fontSize: '0.76rem', color: '#713f12', margin: 0, lineHeight: 1.5 }}>
          <strong>⚠️ PHEV caveat:</strong> Official PHEV emissions (≈40 g/km) assume frequent charging. Real-world studies show that PHEVs driven primarily on petrol emit 80–120 g/km on average — similar to conventional cars. Company PHEVs in Belgium are often not charged regularly.
        </p>
      </div>
      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>
        Sources: ICCT; EEA CO₂ Monitoring Dataset; WLTP.eu. Values are representative mid-range estimates for a 1,400 kg medium passenger car.
      </p>
    </div>
  );
}

// ── Panel: Public Transport modal split ──────────────────────────────────────
const MODAL_COLORS: Record<string, string> = {
  'Passenger car': '#94a3b8',
  'Bus & coach':   '#f59e0b',
  'Rail':          TOPIC_COLOR,
  'Tram & metro':  '#a78bfa',
};

const MODAL_FALLBACK = [
  { name: 'Passenger car', value: 85, color: '#94a3b8' },
  { name: 'Rail',          value: 8,  color: '#ec4899' },
  { name: 'Bus & coach',   value: 7,  color: '#f59e0b' },
];

function PublicTransportPanel({ modalSplit }: { modalSplit: any[] }) {
  const allData = modalSplit.length > 0
    ? modalSplit
        .filter(m => m.mode !== 'TOTAL non-car' && m.share_2021 != null)
        .map(m => ({ name: m.mode, value: m.share_2021, color: MODAL_COLORS[m.mode] ?? '#94a3b8' }))
    : MODAL_FALLBACK;

  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Inland passenger modal split — Belgium 2021
        </div>
        <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: '0 0 4px', lineHeight: 1.5 }}>
          Measured in passenger-kilometres (p-km). Only road and rail modes included per Eurostat methodology.
        </p>
      </div>

      <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <Pie data={allData} cx="50%" cy="44%" outerRadius={72} dataKey="value" labelLine={false}>
            {allData.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any, n: any) => [`${v}%`, n]} />
          <Legend iconType="circle" iconSize={9} formatter={v => <span style={{ fontSize: '0.73rem', color: '#4b5563' }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
      </div>

      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>
        Source: Eurostat tran_hv_psmod; EC DG MOVE European Transport in Figures 2024. EU avg car share: ~71%.
      </p>
    </div>
  );
}

// ── Panel: Road Freight Modal Share ──────────────────────────────────────────
const FREIGHT_MODAL = [
  { mode: 'Road', value: 75, color: '#f97316' },
  { mode: 'Rail', value: 16.8, color: TOPIC_COLOR },
  { mode: 'Inland waterway', value: 8.2, color: '#38bdf8' },
];

function FreightPanel() {
  return (
    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
      {/* Inland modal split donut */}
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>
          Belgium inland freight modal split (tonne-km, 2022)
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <ResponsiveContainer width={160} height={140}>
            <PieChart>
              <Pie data={FREIGHT_MODAL} cx="50%" cy="50%" outerRadius={60} dataKey="value" labelLine={false}>
                {FREIGHT_MODAL.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 11 }}
                formatter={(v: any, n: any) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FREIGHT_MODAL.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>{m.mode}</span>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem', fontWeight: 900, color: m.color }}>{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>
        Source: Eurostat tran_hv_frmod; EC DG MOVE European Transport in Figures 2024. Inland only (excludes maritime).
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  indicators:   any[];
  modalSplit:   any[];
  bevHistory:   any[];
}

export default function MobilityTransportTab({ indicators, modalSplit, bevHistory }: Props) {
  const get = (name: string) => indicators.find(i => i.indicator === name);

  const bevReg    = get('Zero-Emission New Car Registrations');
  const co2Cars   = get('Average CO₂ — New Passenger Cars');
  const pubTrans  = get('Public Transport Share — Rail + Bus');
  const freight   = get('Road Freight Modal Share — Inland');

  const GROUPS = [
    {
      id: 'fleet', label: 'Fleet Decarbonisation', emoji: '⚡',
      items: [
        { id: 'bev-reg',   label: 'Zero-Emission Car Registrations' },
        { id: 'co2-cars',  label: 'Average CO₂ New Cars'            },
      ],
    },
    {
      id: 'modal', label: 'Modal Shift', emoji: '🚆',
      items: [
        { id: 'pub-trans', label: 'Public Transport Share'  },
        { id: 'freight',   label: 'Road Freight Modal Share' },
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

        {/* Group: Fleet Decarbonisation */}
        <div id="fleet" className="group-header" style={{ marginTop: 0 }}>
          <div className="group-header-inner">
            <span className="group-emoji">⚡</span>
            <div>
              <div className="group-title">Fleet Decarbonisation</div>
              <div className="group-subtitle">Electric vehicle uptake and CO₂ performance of new passenger cars</div>
            </div>
          </div>
        </div>

        <div id="bev-reg" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={bevReg} slug="zero-emission-new-car-registrations" />
          <div className="wide-card-right">
            <BEVPanel history={bevHistory} />
          </div>
        </div>

        <div id="co2-cars" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={co2Cars} slug="average-co2-new-passenger-cars" />
          <div className="wide-card-right">
            <CO2Panel />
          </div>
        </div>

        {/* Group: Modal Shift */}
        <div id="modal" className="group-header">
          <div className="group-header-inner">
            <span className="group-emoji">🚆</span>
            <div>
              <div className="group-title">Modal Shift</div>
              <div className="group-subtitle">Passenger transport share by mode and road freight vs rail &amp; waterway</div>
            </div>
          </div>
        </div>

        <div id="pub-trans" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={pubTrans} slug="public-transport-share-rail-bus" />
          <div className="wide-card-right">
            <PublicTransportPanel modalSplit={modalSplit} />
          </div>
        </div>

        <div id="freight" className="wide-card">
          <div className="wide-card-accent" />
          <IndicatorLeft ind={freight} slug="road-freight-modal-share-inland" />
          <div className="wide-card-right">
            <FreightPanel />
          </div>
        </div>

      </div>
    </div>
  );
}
