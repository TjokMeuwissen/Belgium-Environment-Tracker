'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const TOPIC_COLOR = '#06b6d4';

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'what-are-crm',     label: 'What are critical raw materials?' },
  { id: 'green-hunger',     label: 'The green transition\'s mineral hunger' },
  { id: 'finite-reserves',  label: 'Finite reserves & concentrated supply' },
  { id: 'geopolitics',      label: 'The geopolitical dimension' },
  { id: 'crma',             label: 'The EU\'s response: CRMA' },
  { id: 'circular-answer',  label: 'The circular economy answer' },
  { id: 'further-reading',  label: 'Further reading' },
];

// ── Reusable layout components ─────────────────────────────────────────────────
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid #f3f4f6` }}>
      {children}
    </h2>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, marginBottom: 12, ...style }}>{children}</p>;
}

function BulletList({ items }: { items: { bold: string; text: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
          <span style={{ color: TOPIC_COLOR, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>&#x25B8;</span>
          <span><strong style={{ color: '#1a1a1a' }}>{item.bold}</strong>{item.text ? ': ' + item.text : ''}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '34',    label: 'Critical Raw Materials', sub: 'on the EU list (2023) — materials deemed economically essential and supply-critical', color: TOPIC_COLOR },
    { value: '17',    label: 'Strategic Raw Materials', sub: 'subset of CRMs that are also critical for green/digital/defence technologies', color: '#0ea5e9' },
    { value: '98%',   label: 'of EU rare earths',       sub: 'imported from a single country — China — making the EU extremely supply-vulnerable', color: '#f97316' },
    { value: '<1%',   label: 'recycling rate',           sub: 'for rare earth elements globally at end-of-life — virtually none recovered today', color: '#ef4444' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4, lineHeight: 1.4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Mineral demand chart ──────────────────────────────────────────────────────
function MineralDemandChart() {
  // Index: minerals needed per EV vs per ICE vehicle (kg), IEA 2021
  const data = [
    { mineral: 'Graphite', ev: 66, ice: 0 },
    { mineral: 'Copper',   ev: 53, ice: 23 },
    { mineral: 'Nickel',   ev: 41, ice: 0  },
    { mineral: 'Manganese',ev: 24, ice: 2  },
    { mineral: 'Lithium',  ev: 9,  ice: 0  },
    { mineral: 'Cobalt',   ev: 14, ice: 0  },
    { mineral: 'Rare earths', ev: 1, ice: 0.5 },
  ];

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Minerals per vehicle (kg) — Electric vs Combustion
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Source: IEA, The Role of Critical Minerals in Clean Energy Transitions (2021)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 11 }} unit=" kg" />
          <YAxis type="category" dataKey="mineral" tick={{ fontSize: 12 }} width={80} />
          <Tooltip formatter={(v: number, name: string) => [`${v} kg`, name === 'ev' ? 'Electric vehicle' : 'Combustion engine']} />
          <Bar dataKey="ev" name="ev" fill={TOPIC_COLOR} radius={[0, 4, 4, 0]}>
            <LabelList dataKey="ev" position="right" style={{ fontSize: 11, fill: '#374151' }} formatter={(v: number) => v > 0 ? v : ''} />
          </Bar>
          <Bar dataKey="ice" name="ice" fill="#d1d5db" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="ice" position="right" style={{ fontSize: 11, fill: '#6b7280' }} formatter={(v: number) => v > 0 ? v : ''} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {[{ color: TOPIC_COLOR, label: 'Electric vehicle' }, { color: '#d1d5db', label: 'Combustion engine' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#6b7280' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />{l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Green tech CRM image ──────────────────────────────────────────────────────
function GreenTechCRMImage() {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Concentration of critical materials used in selected clean energy technologies vs traditional
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 12 }}>
        Source: EY — <a href="https://www.ey.com/en_bg/insights/energy-resources/critical-raw-materials-for-energy-transition" target="_blank" rel="noopener noreferrer" style={{ color: TOPIC_COLOR }}>Critical raw materials for the energy transition</a>
      </p>
      <img
        src="/images/learn/CRM-renewable.webp"
        alt="Critical raw materials used in selected clean energy technologies compared to traditional energy"
        style={{ width: '100%', borderRadius: 8, display: 'block' }}
      />
    </div>
  );
}

// ── Mini pie chart helper ─────────────────────────────────────────────────────
function MiniPie({ share, color, size = 38 }: { share: number; color: string; size?: number }) {
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const pct = Math.min(share / 100, 0.9999);
  const angle = pct * 2 * Math.PI;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const large = pct > 0.5 ? 1 : 0;
  const slicePath = `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y} Z`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="#d1d5db" />
      <path d={slicePath} fill={color} />
    </svg>
  );
}

// ── Supply concentration chart ────────────────────────────────────────────────
function SupplyConcentrationChart() {
  const data = [
    { material: 'Indium',    country: 'China',     share: 57, reserveYears: 15,  color: '#ef4444', note: 'By-product of zinc smelting; limited primary production pathways' },
    { material: 'Cobalt',    country: 'DRC',       share: 70, reserveYears: 25,  color: '#f97316', note: 'Demand ×20 projected by 2040 (IEA net-zero); rapidly tightening' },
    { material: 'Gallium',   country: 'China',     share: 80, reserveYears: 40,  color: '#ef4444', note: 'By-product of aluminium smelting; export controls imposed July 2023' },
    { material: 'Nickel',    country: 'Indonesia', share: 37, reserveYears: 40,  color: '#8b5cf6', note: 'Indonesia banned raw ore exports in 2020; now dominant global supplier' },
    { material: 'Lithium',   country: 'Australia', share: 47, reserveYears: 50,  color: '#3b82f6', note: 'Demand ×40 by 2040 (IEA); large brine deposits extend static estimate' },
    { material: 'REE',       country: 'China',     share: 60, reserveYears: 200, color: '#ef4444', note: 'China controls 60% of mining and ~85% of refining; demand rising fast' },
    { material: 'Graphite',  country: 'China',     share: 65, reserveYears: 230, color: '#ef4444', note: 'Natural graphite; synthetic graphite from petroleum coke also growing' },
    { material: 'Magnesium', country: 'China',     share: 87, reserveYears: 999, color: '#ef4444', note: 'Abundant in seawater and dolomite; reserve limit is not the main risk' },
  ].sort((a, b) => a.reserveYears - b.reserveYears);

  const maxYears = 300; // cap for bar width; Magnesium shown as "∞"

  const countries = [...new Set(data.map(d => d.country))];
  const countryColors: Record<string, string> = {
    China: '#ef4444', DRC: '#f97316', Australia: '#3b82f6',
    Indonesia: '#8b5cf6',
  };

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Reserve life (years) — with top producer's share of global supply
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Reserve life = known economic reserves ÷ current annual production (USGS 2024 static index — does not account for demand growth or new discoveries).
        Pie charts show top producer share; grey = rest of world.
        Source: USGS Mineral Commodity Summaries 2024; EC Critical Raw Materials study 2023.
      </p>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 52px 130px', gap: 8, alignItems: 'center', marginBottom: 6, padding: '0 2px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Material</div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>Reserve life (years)</div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', textAlign: 'center' }}>Top producer share</div>
        <div />
      </div>

      {data.map(d => {
        const barWidth = d.reserveYears >= 999 ? 100 : Math.round((d.reserveYears / maxYears) * 100);
        const label = d.reserveYears >= 999 ? '∞ (abundant)' : `${d.reserveYears} yrs`;
        return (
          <div key={d.material} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 52px 130px', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            {/* Material name */}
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1a1a' }}>{d.material}</div>

            {/* Reserve years bar */}
            <div>
              <div style={{ background: '#e5e7eb', borderRadius: 4, height: 20, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: '100%',
                  background: d.reserveYears < 30 ? '#ef4444' : d.reserveYears < 60 ? '#f97316' : '#22c55e',
                  borderRadius: '4px 0 0 4px',
                  transition: 'width 0.3s',
                }} />
                <span style={{ position: 'absolute', left: `${Math.min(barWidth, 85)}%`, top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', fontWeight: 700, color: '#374151', paddingLeft: 4, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>{d.note}</div>
            </div>

            {/* Mini pie */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <MiniPie share={d.share} color={d.color} size={38} />
            </div>

            {/* Country + share label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span><strong>{d.country}</strong> {d.share}%</span>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
        {countries.map(c => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6b7280' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: countryColors[c] }} />{c}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6b7280' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#d1d5db' }} />Others
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {[{ color: '#ef4444', label: '< 30 yrs' }, { color: '#f97316', label: '30–60 yrs' }, { color: '#22c55e', label: '> 60 yrs' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6b7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Recycling rates chart ─────────────────────────────────────────────────────
function RecyclingRatesChart() {
  const data = [
    { material: 'Aluminium',   rate: 70, color: '#22c55e' },
    { material: 'Copper',      rate: 50, color: '#22c55e' },
    { material: 'Nickel',      rate: 57, color: '#22c55e' },
    { material: 'Cobalt',      rate: 15, color: '#f97316' },
    { material: 'Lithium',     rate: 1,  color: '#ef4444' },
    { material: 'REEs',        rate: 1,  color: '#ef4444' },
    { material: 'Indium',      rate: 1,  color: '#ef4444' },
    { material: 'Gallium',     rate: 1,  color: '#ef4444' },
  ].sort((a, b) => b.rate - a.rate);

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        End-of-life recycling rates (%) — global average
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Source: UNEP Global Metal Flows Working Group / IEA Critical Minerals 2023
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="material" tick={{ fontSize: 12 }} width={80} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'End-of-life recycling rate']} />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            <LabelList dataKey="rate" position="right" style={{ fontSize: 11, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {[{ color: '#22c55e', label: 'Good (>50%)' }, { color: '#f97316', label: 'Low (10–50%)' }, { color: '#ef4444', label: 'Critical (<5%)' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#6b7280' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />{l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CRMA targets visual ───────────────────────────────────────────────────────
function CRMATargets() {
  const targets = [
    { label: 'Domestic extraction',    target: '10%', desc: 'of EU annual consumption sourced from EU mines by 2030', icon: '⛏️' },
    { label: 'Domestic processing',    target: '40%', desc: 'of EU annual consumption processed within the EU by 2030', icon: '🏭' },
    { label: 'Recycled content',       target: '25%', desc: 'of EU annual consumption sourced from EU recycled material by 2030', icon: '♻️' },
    { label: 'Single-country cap',     target: '65%', desc: 'maximum share from any single third country for each strategic raw material', icon: '🌍' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {targets.map(t => (
        <div key={t.label} style={{ background: '#f0fdfe', border: `1px solid ${TOPIC_COLOR}30`, borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: TOPIC_COLOR }}>{t.target}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 4 }}>{t.label}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{t.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(s.id); return; }
      }
      setActive(SECTIONS[0].id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    <div className="detail-sidebar" style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
      <div className="detail-sidebar-title">On this page</div>
      {SECTIONS.map(s => (
        <button key={s.id} className={`detail-sidebar-link${active === s.id ? ' active' : ''}`} onClick={() => scrollTo(s.id)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CriticalRawMaterialsPage() {
  return (
    <div className="detail-page">

      {/* Dark header */}
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #164e63 0%, #0e7490 60%, #06b6d4 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">← Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>♻️  Circularity &amp; Waste</p>
            <h1 className="detail-title">Critical Raw Materials</h1>
            <p style={{ color: '#b0b0b0', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              The green transition runs on metals. Many of them are finite, geopolitically concentrated, and barely recycled.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/raw-material.jpg" alt="Critical Raw Materials" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* Body — sidebar BEFORE detail-main */}
      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — What are CRMs */}
          <SectionCard id="what-are-crm">
            <SectionTitle>What are critical raw materials?</SectionTitle>
            <Para>
              A <strong>critical raw material (CRM)</strong> is a material that is both economically important — meaning
              large parts of the economy depend on it — and subject to significant supply risk, meaning reliable access
              cannot be taken for granted. The European Commission formally assesses criticality every three years,
              evaluating each material against two axes: its economic importance across EU manufacturing sectors, and
              its supply risk score based on concentration of production, geopolitical stability of producing countries,
              and the availability of substitutes.
            </Para>
            <Para>
              The 2023 EU Critical Raw Materials list includes <strong>34 materials</strong>, up from 30 in 2020 and
              just 14 in 2011 — a sign of how rapidly industrial dependencies have grown. Within this list, a subset
              of <strong>17 strategic raw materials</strong> has been identified as particularly critical for the green
              and digital transitions: these are materials where demand is projected to grow fastest and where supply
              constraints could directly threaten EU industrial policy goals.
            </Para>
            <Para>
              What makes a material end up on the list? Two factors combine:
            </Para>
            <BulletList items={[
              { bold: 'Economic importance', text: 'the material is used across many high-value sectors — batteries, permanent magnets, semiconductors, clean energy, defence — and cannot easily be substituted' },
              { bold: 'Supply risk',          text: 'production is geographically concentrated in a small number of countries, often with high geopolitical risk scores, and recycling rates are low, meaning primary mining cannot easily be replaced by secondary supply' },
            ]} />
            <Para style={{ marginTop: 14 }}>
              The strategic raw materials list includes: lithium, cobalt, nickel, manganese, graphite, silicon metal,
              tungsten, boron, titanium, tantalum, strontium, arsenic, helium, copper, and all <strong>rare earth
              elements (REEs)</strong> — a group of 17 metallic elements that are chemically similar and almost always
              found together in the same ores. Despite their name, most REEs are not particularly rare in the Earth&apos;s
              crust — but they are extremely difficult to extract and process economically, and current production is
              almost entirely located in China.
            </Para>
          </SectionCard>

          {/* 2 — Green transition mineral hunger */}
          <SectionCard id="green-hunger">
            <SectionTitle>The green transition&apos;s mineral hunger</SectionTitle>
            <Para>
              Replacing fossil fuels with clean energy sounds like a move away from resource extraction. In practice,
              the opposite is true. A gas-fired power plant runs primarily on fuel — relatively little metal is embedded
              in the hardware. Solar panels, wind turbines and electric vehicles are the reverse: they run on almost no
              fuel, but embed <strong>far more minerals per unit of energy</strong> than any technology they replace.
              Beyond transport, solar PV modules require indium, tellurium, selenium and silver; wind turbines use
              neodymium and dysprosium for their permanent magnets; hydrogen electrolysers need platinum-group metals;
              and the power electronics controlling all of these technologies depend on gallium, germanium and tantalum.
              The green transition is, at its material foundation, a massive reorientation of global mining and metallurgy.
            </Para>
            <GreenTechCRMImage />
            <Para>
              The IEA estimates that a typical electric vehicle contains about <strong>six times more minerals</strong> than
              a conventional combustion car. An offshore wind turbine requires roughly <strong>eight times more minerals
              per megawatt</strong> than a natural gas plant. As the world scales these technologies from millions to
              billions of units, demand for critical minerals is set to explode. The IEA projects that lithium demand
              will increase by a factor of <strong>40 by 2040</strong> in a net-zero scenario; cobalt by 20×;
              nickel and graphite by 25×; and rare earth elements by 7×.
            </Para>
            <MineralDemandChart />
            <Para>
              The chart above shows the key minerals embedded in a single electric vehicle battery pack versus a
              conventional combustion vehicle. The contrast is stark: lithium, cobalt, nickel, graphite and manganese
              are largely absent from combustion drivetrains but form the core of every EV battery. Copper, already in
              high demand for electrical wiring, more than doubles per vehicle. Rare earth elements — used in the
              permanent magnets of EV motors and wind turbine generators — have virtually no equivalent in combustion
              technology.
            </Para>
          </SectionCard>

          {/* 3 — Finite reserves */}
          <SectionCard id="finite-reserves">
            <SectionTitle>Finite reserves and dangerously concentrated supply</SectionTitle>
            <Para>
              Two separate problems compound each other for critical raw materials: the physical finiteness of reserves
              in the ground, and the extreme geographic concentration of where those reserves are currently being mined
              and processed.
            </Para>
            <Para>
              Unlike fossil fuels — where decades of known reserves exist and the problem is emissions from burning them,
              not running out — several critical minerals face genuine medium-term scarcity questions. Known economic
              reserves of cobalt, lithium and rare earth elements, at projected demand growth rates, suggest supply
              constraints emerging within <strong>20 to 40 years</strong> without significant new discoveries, recycling
              scale-up, or substitution. The situation is made more acute because expanding a mine from exploration to
              production takes <strong>15 to 20 years on average</strong> — far too slow to respond to demand surges
              driven by rapid clean energy deployment.
            </Para>
            <SupplyConcentrationChart />
            <Para>
              The chart above illustrates the geographic concentration problem. China dominates across multiple dimensions
              simultaneously: it controls approximately 60% of global rare earth mining, 85% of rare earth refining and
              processing, 65% of natural graphite production, 87% of global magnesium production, and 80% of gallium
              output. The Democratic Republic of Congo — a country facing persistent governance challenges — supplies
              roughly 70% of the world&apos;s cobalt. Australia is the leading lithium producer (47%), followed by
              Chile (26%), with China controlling much of the downstream processing even for minerals mined elsewhere.
            </Para>
            <Para>
              What this means in practice is that the EU&apos;s clean energy transition is currently structured around
              supply chains that run through a handful of countries — countries with which geopolitical relationships
              are, in several cases, increasingly strained. This is not a hypothetical risk. It is already materialising.
            </Para>
          </SectionCard>

          {/* 4 — Geopolitics */}
          <SectionCard id="geopolitics">
            <SectionTitle>The geopolitical dimension</SectionTitle>
            <Para>
              Critical raw materials have become a central instrument of geopolitical competition. Several events in
              recent years have made the vulnerability of import-dependent economies vividly clear:
            </Para>
            <BulletList items={[
              { bold: 'China gallium and germanium restrictions (2023)', text: 'In July 2023, China introduced export licensing controls on gallium and germanium — two metals essential for semiconductors, radar systems and solar cells. China produces roughly 80% of global gallium and 60% of germanium. The move was widely interpreted as retaliation for US and Dutch restrictions on semiconductor equipment exports to China' },
              { bold: 'Indonesia nickel export ban (2020)',              text: 'Indonesia, holder of the world\'s largest nickel reserves, banned exports of raw nickel ore in 2020 to force processing within its own borders. The decision disrupted European stainless steel supply chains and triggered a WTO dispute. Indonesia is now the dominant global nickel supplier — and has signalled similar moves for bauxite and copper' },
              { bold: 'China rare earth embargo precedent (2010)',       text: 'China temporarily halted rare earth exports to Japan during a maritime territorial dispute in 2010 — a move that sent shockwaves through Japanese electronics and automotive manufacturers. Though the embargo lasted only weeks, it demonstrated that resource access could be weaponised in political disputes' },
              { bold: 'Russia and neon/palladium (2022)',               text: 'Russia\'s invasion of Ukraine disrupted supplies of neon gas (used in chip lithography and largely produced as a byproduct of Ukrainian steel plants) and palladium (Russia supplies roughly 40% of global palladium used in automotive catalytic converters and electronics)' },
            ]} />
            <Para style={{ marginTop: 14 }}>
              The pattern is clear: a growing number of countries are treating their mineral resources as strategic
              assets to be leveraged in diplomatic and economic competition, rather than commodities freely available
              on global markets. For the EU — which has among the lowest levels of domestic critical mineral production
              of any major industrial bloc — this represents a profound structural vulnerability at precisely the moment
              when clean energy investment is accelerating.
            </Para>
            <Para>
              A 2023 European Commission study found that the EU imports <strong>100% of its lithium and borates</strong>{' '}
              from third countries, <strong>98% of its rare earths</strong> from China alone, and more than 90% of
              silicon metal and cobalt. For the EU to be strategically autonomous in clean energy, this import dependency
              must be substantially reduced — or the clean energy transition itself becomes a new form of geopolitical
              vulnerability.
            </Para>
          </SectionCard>

          {/* 5 — CRMA */}
          <SectionCard id="crma">
            <SectionTitle>The EU&apos;s response: the Critical Raw Materials Act</SectionTitle>
            <Para>
              Adopted in March 2024, the <strong>EU Critical Raw Materials Act (CRMA)</strong> is the EU&apos;s primary
              legislative response to strategic mineral vulnerability. It establishes binding benchmarks for domestic
              production, processing and recycling, and introduces a permitting acceleration framework to speed up new
              European mining and processing projects — currently among the slowest in the world due to fragmented
              national approval processes.
            </Para>
            <CRMATargets />
            <Para>
              The CRMA&apos;s architecture rests on three pillars. First, it aims to <strong>diversify supply</strong>{' '}
              by requiring the EU to negotiate Strategic Partnerships with resource-rich countries — particularly in
              Africa, Latin America and Canada — to secure long-term offtake agreements and invest in local processing
              capacity, rather than extracting raw ores and processing them in China.
            </Para>
            <Para>
              Second, it seeks to <strong>accelerate European extraction and processing</strong> by designating
              &quot;Strategic Projects&quot; that receive streamlined permitting (decisions within 27 months), access to
              blended public finance, and priority status in national planning. Several Belgian and European projects
              in lithium, tungsten and rare earth processing have already been designated under this framework.
            </Para>
            <Para>
              Third — and most relevant to the circular economy — the CRMA places <strong>recycling at the heart</strong>{' '}
              of EU supply strategy. The 25% recycled content target by 2030 is ambitious given current recovery rates
              for most critical minerals are below 5%. Achieving it will require not only better collection of
              electronic waste, batteries and other end-of-life products, but significant investment in advanced
              hydrometallurgical and pyrometallurgical processing technologies. Belgium is unusually well-positioned
              here: Umicore, headquartered in Brussels, operates one of the world&apos;s most advanced battery material
              recycling facilities.
            </Para>
          </SectionCard>

          {/* 6 — Circular economy answer */}
          <SectionCard id="circular-answer">
            <SectionTitle>The circular economy as the only sustainable answer</SectionTitle>
            <Para>
              Even the most optimistic projections for new mining cannot fully close the gap between projected critical
              mineral demand and supply. Recycling is not just a sustainability aspiration — it is a physical necessity
              if the green transition is to be completed at the required scale and speed. And yet, current end-of-life
              recycling rates for most critical minerals are shockingly low.
            </Para>
            <RecyclingRatesChart />
            <Para>
              The chart tells a stark story. Well-established commodity metals — aluminium, copper, nickel — are
              recovered at rates of 50–70% at end of life, thanks to decades of investment in collection and
              reprocessing infrastructure. But the materials most urgently needed for the green transition — lithium,
              rare earth elements, indium, gallium — are recovered at rates below 1%. For every tonne of rare earth
              embedded in discarded electronics and motors, less than 10 kg is actually recovered.
            </Para>
            <Para>
              Why are rates so low for critical minerals? Several factors compound:
            </Para>
            <BulletList items={[
              { bold: 'Design for disassembly is absent', text: 'smartphones, laptops and other electronics are assembled using adhesives, micro-soldering and proprietary connectors that make manual disassembly uneconomic at scale' },
              { bold: 'Material quantities are tiny', text: 'a smartphone contains just 0.03 g of neodymium. Even at scale, concentrating and refining these trace quantities requires specialised hydrometallurgical processes that few facilities outside China operate' },
              { bold: 'Collection systems are incomplete', text: 'only a fraction of end-of-life electronics reach formal recycling channels. In Europe, an estimated 5 kg of e-waste is generated per person per year, but collection rates under the WEEE directive average around 50% — and much of the collected material is exported rather than processed in Europe' },
              { bold: 'Economic incentives are misaligned', text: 'low commodity prices for some critical minerals — relative to the processing cost of recovery — have historically made recycling uneconomic without policy intervention' },
            ]} />
            <Para style={{ marginTop: 14 }}>
              <strong>Umicore — advanced battery recycling</strong><br />
              Belgium has built a genuine European competitive advantage in this space. <strong>Umicore</strong>&apos;s
              Battery Recycling Campus in Hoboken (Antwerp) uses a combination of smelting and hydrometallurgy to
              recover lithium, cobalt, nickel and manganese from spent EV batteries and consumer electronics at
              commercial scale — one of only a handful of facilities in the world capable of doing this. Umicore
              processes material sourced from across Europe and beyond.
            </Para>
            <Para>
              <strong>The Recupel system — Belgium&apos;s e-waste collection network</strong><br />
              The <strong>Recupel</strong> system — Belgium&apos;s producer responsibility organisation for electrical
              and electronic equipment — provides the front-end of this chain. Recupel collection points are located
              across Belgium, and retailers are legally required to accept old appliances. Recupel consistently
              achieves collection rates well above the EU average. But collection
              alone is not enough: what happens after collection — which processor receives the material, what
              technologies they apply, and how much is actually recovered — determines the real circular economy impact.
            </Para>
            <Para>
              <strong>The urban mine — secondary resources embedded in cities</strong><br />
              The concept of the <strong>&quot;urban mine&quot;</strong> — the stock of metals embedded in existing
              products, infrastructure and waste stockpiles in cities — is gaining traction as a policy framework.
              European cities contain billions of smartphones, laptops, solar panels, wind turbines and EV batteries
              that will reach end of life over the coming decade. This stock represents a major secondary resource base,
              if the right collection, sorting and processing infrastructure is in place to harvest it.
            </Para>

            {/* CTA box */}
            <div style={{ background: `${TOPIC_COLOR}12`, border: `1px solid ${TOPIC_COLOR}40`, borderRadius: 10, padding: '18px 20px', marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: 8 }}>
                ⚙️ What can you do?
              </div>
              <BulletList items={[
                { bold: 'Keep devices longer',       text: 'every extra year of use delays the mining demand for a new device and reduces your personal material footprint' },
                { bold: 'Bring to Recupel',          text: 'never discard electronics in the residual bin — bring them to a Recupel point (most supermarkets, post offices and electronics retailers) where materials can be professionally recovered' },
                { bold: 'Choose repairable devices', text: 'the EU\'s Right to Repair regulation (2024) requires manufacturers to provide spare parts and repair information — choose brands that already do' },
                { bold: 'Buy refurbished',           text: 'a refurbished smartphone uses significantly less primary material than a new one — and increasingly comes with warranty coverage comparable to new devices' },
              ]} />
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
                <Link href="/crm-calculator"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: TOPIC_COLOR, color: '#fff', padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700 }}>
                  ⚙️ Calculate the critical materials in your devices →
                </Link>
              </div>
            </div>
          </SectionCard>

          {/* 7 — Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'EU Critical Raw Materials Act — official text',                               url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1252' },
                { label: 'European Commission — Critical Raw Materials list 2023',                      url: 'https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials_en' },
                { label: 'IEA — The Role of Critical Minerals in Clean Energy Transitions (2021)',      url: 'https://www.iea.org/reports/the-role-of-critical-minerals-in-clean-energy-transitions' },
                { label: 'IEA — Critical Minerals Market Review 2023',                                 url: 'https://www.iea.org/reports/critical-minerals-market-review-2023' },
                { label: 'USGS Mineral Commodity Summaries 2024',                                      url: 'https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries' },
                { label: 'Umicore Battery Recycling — Hoboken facility',                               url: 'https://www.umicore.com/en/industries/battery-recycling/' },
                { label: 'Recupel — WEEE collection in Belgium',                                       url: 'https://www.recupel.be/en/' },
                { label: 'UNEP — Recycling Rates of Metals (Global Metal Flows Working Group)',        url: 'https://www.resourcepanel.org/reports/recycling-rates-metals' },
                { label: 'EU Right to Repair Regulation (2024)',                                       url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024L1799' },
                { label: 'EY — Critical raw materials for the energy transition',                        url: 'https://www.ey.com/en_bg/insights/energy-resources/critical-raw-materials-for-energy-transition' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                >
                  <span style={{ color: TOPIC_COLOR, fontWeight: 700, fontSize: '0.75rem' }}>&#x2197;</span>
                  {link.label}
                </a>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>

    </div>
  );
}
