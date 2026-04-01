'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#ec4899';

const SLUG_MAP: Record<string, string> = {
  'zero-emission-new-car-registrations':     'Zero-Emission New Car Registrations',
  'average-co2-new-passenger-cars':          'Average CO₂ — New Passenger Cars',
  'public-transport-share-rail-bus':         'Public Transport Share — Rail + Bus',
  'road-freight-modal-share-inland':         'Road Freight Modal Share — Inland',
};

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};

// ── Sidebar section defs ──────────────────────────────────────────────────────
const SECTION_DEFS: Record<string, { id: string; label: string }[]> = {
  'zero-emission-new-car-registrations': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
  'average-co2-new-passenger-cars': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'main-chart',     label: 'Lifecycle emissions'      },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
  'public-transport-share-rail-bus': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'main-chart',     label: 'Emissions by mode'        },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
  'road-freight-modal-share-inland': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 1 })}${unit ? ' ' + unit : ''}`;
}

function toSentences(text: string) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z🇧"'])/).map(s => s.trim()).filter(Boolean);
}
function rewriteArrows(t: string) { return t.replace(/\s*→\s*/g, ', leading to '); }

function buildConsequenceBullets(text: string) {
  const sentences = toSentences(rewriteArrows(text));
  const pastKw = /already (faced|subject|missed)|court ruling|infringement.*\d{4}|INFR\s*\d{4}/i;
  const past: string[] = [], main: string[] = [];
  sentences.forEach(s => pastKw.test(s) ? past.push(s) : main.push(s));
  const result: { text: string; sub?: string[] }[] = main.map(t => ({ text: t }));
  if (past.length) result.push({ text: 'Previous occurrences', sub: past });
  return result;
}

function groupResponsibility(text: string) {
  const sentences = toSentences(text);
  const isFed  = (s: string) => /\bfederal\b/i.test(s) && !/region|flanders|wallonia|brussels/i.test(s);
  const isReg  = (s: string) => /region|flanders|wallonia|brussels/i.test(s) && !/\bfederal\b/i.test(s);
  const isSh   = (s: string) =>
    /shared|coordinated|both|all levels|inter-?federal/i.test(s) ||
    (/\bfederal\b/i.test(s) && /region|flanders|wallonia|brussels/i.test(s));
  const fed: string[] = [], sh: string[] = [], reg: string[] = [];
  sentences.forEach(s => isSh(s) ? sh.push(s) : isFed(s) ? fed.push(s) : isReg(s) ? reg.push(s) : sh.push(s));
  return { federal: fed, shared: sh, regional: reg };
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

function DataSourceRow({ source, url }: { source: string; url: string | null }) {
  const sources = source.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean);
  const urls    = url ? url.split(/\s*\|\s*/).map(u => u.trim()).filter(Boolean) : [];
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sources.map((s, i) => (
        <li key={i}>
          {urls[i]
            ? <a href={urls[i]} target="_blank" rel="noopener noreferrer" className="detail-link">{s} ↗</a>
            : <span style={{ fontSize: '0.88rem' }}>{s}</span>}
        </li>
      ))}
    </ul>
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
            <span>{b.text}
              {b.sub && (
                <ul className="consequences-sub-list">
                  {b.sub.map((s, j) => (
                    <li key={j} className="consequences-sub-item">
                      <span className="bullet-dot">–</span><span>{s}</span>
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
  const primaryMatch = text.match(/^(Regional|Federal|Shared)\s*\(primary\)\.\s*/i);
  const primaryLevel = primaryMatch ? primaryMatch[1] : null;
  const cleanText    = primaryMatch ? text.slice(primaryMatch[0].length) : text;
  const { federal, shared, regional } = groupResponsibility(cleanText);
  const pcMap: Record<string, { bg: string; border: string; text: string }> = {
    Regional: { bg: '#f0fdf4', border: '#16a34a', text: '#14532d' },
    Federal:  { bg: '#eff6ff', border: '#2563eb', text: '#1e3a8a' },
    Shared:   { bg: '#fefce8', border: '#ca8a04', text: '#713f12' },
  };
  const pc = primaryLevel ? pcMap[primaryLevel] ?? pcMap.Regional : null;
  const Section = ({ label, cls, items }: { label: string; cls: string; items: string[] }) => {
    if (!items.length) return null;
    return (
      <div className="responsibility-group">
        <span className={`responsibility-tag ${cls}`}>{label}</span>
        <ul className="responsibility-list">
          {items.map((item, i) => (
            <li key={i} className="responsibility-list-item">
              <span className="bullet-dot">•</span><span>{item}</span>
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
      {pc && primaryLevel && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 8, padding: '6px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: pc.text }}>Primary responsibility</span>
          <span style={{ background: pc.border, color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700 }}>{primaryLevel}</span>
        </div>
      )}
      <div className="responsibility-groups">
        <Section label="Federal"  cls="tag-federal"  items={federal}  />
        <Section label="Shared"   cls="tag-shared"   items={shared}   />
        <Section label="Regional" cls="tag-regional" items={regional} />
      </div>
    </div>
  );
}

// ── Hardcoded chart & technical data ─────────────────────────────────────────

// Electricity carbon intensity by country, 2023 (Ember / EEA)
const ELEC_INTENSITY = [
  { country: 'Sweden',      gco2: 41,  color: '#22c55e', note: '90% clean — hydro + nuclear dominant' },
  { country: 'France',      gco2: 56,  color: '#86efac', note: '70% nuclear + growing renewables' },
  { country: 'Belgium',     gco2: 138, color: TOPIC_COLOR, note: 'Nuclear + gas mix; improving fast' },
  { country: 'Netherlands', gco2: 278, color: '#fde68a', note: 'Gas-heavy; wind growing rapidly' },
  { country: 'Germany',     gco2: 371, color: '#f97316', note: '26% coal; large but declining' },
  { country: 'Poland',      gco2: 662, color: '#dc2626', note: '61% coal — highest in EU' },
  { country: 'EU average',  gco2: 242, color: '#94a3b8', note: '2023 EU average (Ember)' },
];

// Lifecycle GHG emissions: petrol car vs BEV (share of total over lifetime)
// Based on ICCT / Transport & Environment lifecycle studies (~150,000 km, EU avg electricity)
const PETROL_LIFECYCLE = [
  { phase: 'Fuel combustion (use)',    value: 66, color: '#dc2626' },
  { phase: 'Fuel production (WTT)',    value: 14, color: '#f97316' },
  { phase: 'Vehicle manufacturing',   value: 14, color: '#78716c' },
  { phase: 'Maintenance & end-of-life', value: 6, color: '#94a3b8' },
];

const BEV_LIFECYCLE = [
  { phase: 'Electricity use (WTT)',   value: 30, color: '#a78bfa' },
  { phase: 'Battery manufacturing',  value: 25, color: '#6366f1' },
  { phase: 'Vehicle manufacturing',  value: 22, color: '#78716c' },
  { phase: 'Maintenance & end-of-life', value: 8, color: '#94a3b8' },
  { phase: 'Charging infrastructure', value: 15, color: '#c4b5fd' },
];

// GHG per passenger-km by transport mode (EEA well-to-wheel, EU average)
const EMISSIONS_BY_MODE = [
  { mode: 'Domestic flight',    gco2: 255, color: '#dc2626'  },
  { mode: 'Petrol car (1 pax)', gco2: 192, color: '#f97316'  },
  { mode: 'Petrol car (1.5 avg)', gco2: 128, color: '#fbbf24' },
  { mode: 'Electric car (EU mix)', gco2: 47, color: '#a78bfa' },
  { mode: 'Coach / long-haul bus', gco2: 29, color: '#22c55e' },
  { mode: 'Rail (EU electric avg)', gco2: 14, color: TOPIC_COLOR },
  { mode: 'Rail (Belgium SNCB)',    gco2: 8,  color: '#ec4899'   },
];

// ── Technical cards ───────────────────────────────────────────────────────────

function ZEVTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>BEV vs PHEV — what is the difference?</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'BEV — Battery Electric Vehicle', color: TOPIC_COLOR, items: [
              'Powered entirely by electricity stored in an onboard battery pack',
              'Zero tailpipe emissions — no direct CO₂ or NOₓ at the point of use',
              'Range: 300–600 km per charge for modern models',
              'Charged from the grid (home charger, public fast charger)',
              'In Belgium (2025): 35% of new registrations — almost all company cars',
            ]},
            { label: 'PHEV — Plug-in Hybrid Electric Vehicle', color: '#a78bfa', items: [
              'Has both an electric motor (battery) AND a petrol or diesel combustion engine',
              'Can run on electricity for short trips (typically 40–80 km range)',
              'Combustion engine activates for longer distances or when battery is empty',
              'Official CO₂ rating (WLTP): ~40 g/km — but only valid if charged regularly',
              'Real-world emissions often 80–120 g/km when owners do not charge',
            ]},
          ].map((col, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `4px solid ${col.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: col.color, marginBottom: 8 }}>{col.label}</div>
              {col.items.map((item, j) => (
                <div key={j} style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 4, paddingLeft: 8 }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Why electricity source matters: the carbon intensity effect</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: '0 0 10px' }}>
          A BEV has zero tailpipe emissions, but generating the electricity to charge it produces CO₂ at the power plant
          — unless the grid is clean. The amount of CO₂ emitted per kWh of electricity (the <strong>carbon
          intensity</strong>) varies enormously across Europe, from Sweden&#39;s near-zero hydro+nuclear mix to
          Poland&#39;s coal-dominated grid. This means the same BEV can have dramatically different real-world
          CO₂ footprints depending on where it is charged.
        </p>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: 4 }}>
            Electricity carbon intensity — selected EU countries (2023, gCO₂/kWh)
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ELEC_INTENSITY} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={[0, 700]} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={95} interval={0} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any, _n: any, props: any) => [`${v} gCO₂/kWh`, props.payload.note]} />
                <Bar dataKey="gco2" radius={[0, 3, 3, 0]}>
                  {ELEC_INTENSITY.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#9ca3af', marginBottom: 10 }}>Source: Ember European Electricity Review 2024; EEA ENER 038. 2023 data.</p>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 8, padding: '10px 14px', border: '1px solid #fde68a', marginBottom: 10 }}>
          <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
            <strong>Example:</strong> A typical BEV consuming 17 kWh/100 km emits approximately:<br />
            🟢 <strong>7 g CO₂/km</strong> in Sweden (41 gCO₂/kWh) — far below any combustion car<br />
            🟡 <strong>23 g CO₂/km</strong> in Belgium (138 gCO₂/kWh) — still 6× better than petrol<br />
            🔴 <strong>113 g CO₂/km</strong> in Poland (662 gCO₂/kWh) — similar to a modern petrol car
          </p>
        </div>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#374151', margin: 0 }}>
          Belgium&#39;s grid at 138 gCO₂/kWh in 2023 (down from ~270 in 2015) is already clean enough to make
          BEVs substantially better than petrol or diesel over their full lifecycle. As Belgium&#39;s nuclear
          fleet is extended and offshore wind capacity grows, this advantage will increase further.
          The chart above compares 2023 electricity carbon intensity across selected EU countries.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Belgium context</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['🏢 89% company cars', 'The overwhelming majority of Belgian BEVs are registered by companies, not private individuals. The 2021 fiscal reform made BEVs 100% tax-deductible for companies while phasing out ICE deductibility to 0% by 2028 — creating a powerful corporate incentive.'],
            ['🔌 Private adoption lagging', 'Private BEV uptake is estimated at only ~13% of new registrations. High upfront purchase cost and the underdeveloped second-hand BEV market remain the main barriers for households.'],
            ['⚡ Charging infrastructure', 'Belgium had ~18,000 public charging points in 2024 — one of the EU\'s lower densities per capita. The government targets 100,000 by 2030. Home charging is common for company car users but inaccessible for apartment dwellers.'],
          ].map(([title, text], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{title}</span>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CO2TechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>What are tailpipe emissions?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          Tailpipe emissions (also called tank-to-wheel or TTW emissions) are the CO₂ and other pollutants
          emitted directly from a vehicle&#39;s exhaust pipe during operation. These are what the EU&#39;s CO₂
          standards for new cars regulate — the <strong>fleet average target of 93.6 g CO₂/km by 2029</strong>
          applies to manufacturers&#39; average tailpipe output across all vehicles sold in the EU.
          Belgium&#39;s current average is improving sharply thanks to the surge in BEV registrations, which
          count as zero g/km in the official fleet calculation.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Tailpipe vs full lifecycle emissions</strong>
        <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#374151', marginBottom: 10 }}>
          Tailpipe emissions only capture the use phase. A full <strong>lifecycle analysis (LCA)</strong> adds
          upstream emissions from fuel production (well-to-tank) plus vehicle manufacturing and end-of-life.
          The comparison below shows how the carbon budget is distributed across a vehicle&#39;s life for a
          petrol car vs a BEV charged on the EU electricity mix (~150,000 km lifetime, ICCT/T&amp;E data).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: 'Petrol car — lifecycle CO₂ share', data: PETROL_LIFECYCLE, total: '~38 tonnes CO₂e' },
            { title: 'BEV (EU electricity) — lifecycle CO₂ share', data: BEV_LIFECYCLE, total: '~12–15 tonnes CO₂e' },
          ].map((panel, i) => (
            <div key={i}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1a1a1a', marginBottom: 4 }}>{panel.title}</div>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                    <Pie data={panel.data} cx="50%" cy="44%" outerRadius={68} dataKey="value" nameKey="phase" labelLine={false}>
                      {panel.data.map((e, j) => <Cell key={j} fill={e.color} stroke="white" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: any, n: any) => [`${v}%`, n]} />
                    <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.7rem', color: '#4b5563' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginTop: 2 }}>
                Total lifetime: {panel.total}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 14px', border: '1px solid #bbf7d0', marginTop: 12 }}>
          <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0, lineHeight: 1.6 }}>
            <strong>Key insight:</strong> A BEV emits roughly 60–70% less CO₂ over its lifetime than a petrol car on
            the current EU electricity mix — even accounting for the larger manufacturing footprint of the battery.
            As grids decarbonise, this advantage grows further. In Belgium specifically, a BEV already cuts
            lifecycle emissions by ~65% vs petrol.
          </p>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
          Sources: ICCT 2021; Transport &amp; Environment 2023; EU average electricity mix ~242 gCO₂/kWh (2023).
          BEV figures assume 150,000 km, average EU electricity; petrol at 7.5 L/100 km.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>WLTP vs NEDC — the measurement methods</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['NEDC (pre-2021)', 'The old lab test cycle was highly unrealistic — cars could be specially tuned, tyres over-inflated and accessories switched off. Real-world emissions were typically 20–40% higher than NEDC figures. Used for EU fleet data 2008–2020.'],
            ['WLTP (from 2021)', 'The Worldwide harmonised Light vehicles Test Procedure is more demanding — it uses more realistic speed profiles, includes climate control, and covers more driving conditions. Still ~10–20% below real-world in practice. Used for all EU fleet data from 2021 onwards.'],
            ['RDE (real driving)', 'On-road Real Driving Emissions tests using portable equipment have been mandatory since 2017 (Euro 6d). Cars must not exceed 1.43× their WLTP NOₓ value in real-world tests — but CO₂ is not yet subject to RDE limits.'],
          ].map(([title, text], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{title}</span>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff7ed', borderRadius: 6, padding: '8px 12px', border: '1px solid #fed7aa', marginTop: 8 }}>
          <p style={{ fontSize: '0.78rem', color: '#9a3412', margin: 0, lineHeight: 1.5 }}>
            <strong>⚠️ Series break warning:</strong> Belgium&#39;s CO₂ average for new cars shows a discontinuity
            between 2020 (NEDC) and 2021 (WLTP). WLTP values are approximately 20–25% higher than NEDC for the
            same cars. Comparisons across this break should be treated with caution.
          </p>
        </div>
      </div>
    </div>
  );
}

function PublicTransportTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Belgium&#39;s public transport network</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { icon: '🚂', label: 'SNCB/NMBS rail', stat: '3,733 km', sub: '3,286 km electrified (88%)', color: TOPIC_COLOR },
            { icon: '🚌', label: 'Bus network', stat: '~18,000 km', sub: 'De Lijn (FL) + TEC (WAL) + STIB (BXL)', color: '#f59e0b' },
            { icon: '🚋', label: 'Tram & metro', stat: '~500 km', sub: 'Brussels, Antwerp, Ghent, Charleroi', color: '#a78bfa' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `4px solid ${item.color}`, textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: item.color, marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: '#1a1a1a', marginBottom: 2 }}>{item.stat}</div>
              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{item.sub}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.65, margin: 0 }}>
          Belgium has one of the <strong>densest rail networks in the EU</strong> relative to its territory
          (3,733 km in a country of 30,528 km²), with 88% of lines electrified. SNCB carried 245 million
          passengers in 2024 — a record. Despite this, the car&#39;s modal share (85%) has remained essentially
          unchanged since 2010, reflecting the dominance of dispersed land-use patterns and commuter culture.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 6 }}>Energy sources &amp; emissions per transport mode</strong>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 4px' }}>
          gCO₂e per passenger-km, well-to-wheel (EU average). Source: EEA 2022; IEA 2023.
        </p>
        <div style={{ width: '100%', height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EMISSIONS_BY_MODE} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v}`} domain={[0, 280]} />
              <YAxis type="category" dataKey="mode" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={140} interval={0} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 11 }}
                formatter={(v: any, _n: any, props: any) => [`${v} gCO₂/pkm`, props.payload.note]} />
              <Bar dataKey="gco2" radius={[0, 3, 3, 0]}>
                {EMISSIONS_BY_MODE.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          {[
            ['🚂 Rail (electric)', 'Belgian SNCB trains run on 100% certified renewable electricity since 2020 — making them among the cleanest in Europe at ~8 gCO₂/pkm well-to-wheel. The 3,000V DC and 25kV AC electrified network covers 88% of the route-km.'],
            ['🚌 Bus & coach', 'Most Belgian urban buses still run on diesel, but De Lijn, TEC and STIB are progressively electrifying their urban fleets. Long-haul coaches (Flixbus, BlaBlaBus) run on diesel but achieve low per-passenger emissions due to high occupancy.'],
            ['🚗 Electric car', 'An electric car charged on the Belgian grid emits ~47 gCO₂/pkm at average occupancy (1.5 pax) — worse than rail and bus but 6× better than a petrol car solo.'],
          ].map(([title, text], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{title}</span>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FreightTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Belgium&#39;s main freight hubs by transport mode</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              icon: '🚛', mode: 'Road', color: '#f97316',
              hubs: ['Brussels (E40/E19/A10 motorway intersection)', 'Antwerp ring (R1 + E313/E34)', 'Liège (E40/E25 crossroads)', 'Ghent (R4 ring, E17/E40)'],
              note: 'Belgium&#39;s dense motorway network (1,747 km) is the backbone of freight. Over 75% of inland freight tonnage moves by truck, driven by Just-In-Time logistics for neighbouring manufacturing centres.',
            },
            {
              icon: '🚂', mode: 'Rail', color: TOPIC_COLOR,
              hubs: ['Port of Antwerp-Bruges — 50% of Belgian rail freight originates here', 'Athus (Luxembourg border) — major intermodal terminal', 'Liège-Renory — Europort logistics cluster', 'Brussels-South marshalling yard (Schaerbeek)'],
              note: 'Rail carries ~17% of Belgian inland freight (tonne-km). The Antwerp–Liège–Luxembourg rail corridor is the key axis. Infrabel and Port of Antwerp target doubling rail freight share to 15% of Antwerp hinterland by 2030.',
            },
            {
              icon: '⛵', mode: 'Inland waterway', color: '#38bdf8',
              hubs: ['Albert Canal (Antwerp–Liège, 129 km) — busiest in Belgium', 'Port of Liège — 3rd largest inland port in Europe', 'Port of Brussels — accessible to sea-going vessels', 'Ghent–Terneuzen Canal — connects Ghent port to North Sea'],
              note: 'Belgium has 2,043 km of navigable waterways, 1,532 km in regular commercial use. Waterways carry ~8% of inland freight — highly efficient for bulk goods (coal, sand, containers). Capacity is constrained by bridge heights on the Albert Canal (limits to 2-layer container stacking).',
            },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', border: `1px solid #f0f0f0`, borderLeft: `4px solid ${item.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: item.color, marginBottom: 6 }}>{item.icon} {item.mode}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                {item.hubs.map((h, j) => (
                  <div key={j} style={{ fontSize: '0.78rem', color: '#374151', paddingLeft: 6, lineHeight: 1.45 }}>• {h}</div>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: item.note }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Plans to increase rail and waterway freight</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['🎯 Rail Roadmap 2030', 'Over 20 Belgian organisations — including Flemish ports, Infrabel and the Belgian Rail Freight Forum — signed the Rail Roadmap 2030, targeting a doubling of rail freight share at the Port of Antwerp from 7% to 15% by 2030. Federal government has endorsed doubling national rail freight volumes.'],
            ['🌊 Albert Canal upgrade', 'The Albert Canal is being upgraded to allow 3-layer container stacking (raising bridges and deepening the canal). This will roughly double its container capacity and make waterway transport competitive with road for a wider range of goods.'],
            ['🇪🇺 Seine-Nord Europe Canal', 'Opening expected ~2030, this 107 km canal connects the Seine and Scheldt rivers — creating a continuous Class Vb waterway from Paris to Antwerp and Rotterdam. Expected to remove ~2.3 million trucks/year from European roads and dramatically increase barge capacity via Belgian ports.'],
            ['🚉 Multimodal terminals', 'Investment in rail-barge-road intermodal terminals at Antwerp, Liège, Ghent and Athus to reduce transshipment costs and improve door-to-door competitiveness of non-road modes.'],
          ].map(([title, text], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{title}</span>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function MobilitySidebar({ slug }: { slug: string }) {
  const [active, setActive] = useState('key-figures');
  const sections = SECTION_DEFS[slug] ?? [];

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(s.id); return; }
      }
      setActive(sections[0]?.id ?? '');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  };

  return (
    <div className="detail-sidebar" style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
      <div className="detail-sidebar-title">On this page</div>
      {sections.map(s => (
        <button key={s.id} className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}>{s.label}</button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MobilityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="loading">Loading…</div>;

  const indicatorName = SLUG_MAP[slug];
  if (!indicatorName) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p style={{ color: '#6b6b6b', marginBottom: 16 }}>Indicator not found.</p>
      <Link href="/?topic=mobility_transport" style={{ color: TOPIC_COLOR, fontWeight: 600 }}>← Back to overview</Link>
    </div>
  );

  const ind = data.topics.mobility_transport?.indicators?.find((i: any) => i.indicator === indicatorName);
  const sc  = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  const trendRaw  = ind?.trend ?? '';
  const trendText = trendRaw.replace(/^[↑↗↓↘→]\s*/, '');
  const trendIcon = trendRaw.match(/^[↑↗↓↘→]/) ? trendRaw[0] : '→';

  const chartNode: Record<string, React.ReactNode> = {
    'zero-emission-new-car-registrations': null,
    'average-co2-new-passenger-cars':      null,
    'public-transport-share-rail-bus':     null,
    'road-freight-modal-share-inland':     null,
  };

  const technicalNode: Record<string, React.ReactNode> = {
    'zero-emission-new-car-registrations': <ZEVTechnicalCard />,
    'average-co2-new-passenger-cars':      <CO2TechnicalCard />,
    'public-transport-share-rail-bus':     <PublicTransportTechnicalCard />,
    'road-freight-modal-share-inland':     <FreightTechnicalCard />,
  };

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/?topic=mobility_transport" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Mobility &amp; Transport</p>
          <h1 className="detail-title">{indicatorName}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge" style={{ color: sc.color, background: sc.bg, padding: '5px 14px' }}>{sc.label}</span>
            {trendText && (
              <span style={{ color: '#b0b0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                {trendIcon} {trendText}
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
        <MobilitySidebar slug={slug} />
        <div className="detail-main">

          <div id="key-figures" className="detail-figures">
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

          {chartNode[slug] && <div id="main-chart" className="detail-charts">{chartNode[slug]}</div>}

          <div className="detail-info">
            <div id="technical-info">{technicalNode[slug]}</div>
            <div id="consequences">{ind?.consequences && <ConsequencesCard text={ind.consequences} />}</div>
            <div id="responsibility">{ind?.responsible && <ResponsibilityCard text={ind.responsible} />}</div>
            <div id="policy">{ind?.policy && (
              <InfoRow label="Policy / Legal basis">
                <DataSourceRow source={ind.policy} url={ind.policy_url ?? null} />
              </InfoRow>
            )}</div>
            <div id="data-source">{ind?.data_source && (
              <InfoRow label="Data source">
                <DataSourceRow source={ind.data_source} url={ind.data_source_url ?? null} />
              </InfoRow>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
