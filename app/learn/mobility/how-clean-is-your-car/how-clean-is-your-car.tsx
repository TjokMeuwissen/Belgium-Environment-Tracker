'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine, LabelList,
  ComposedChart, Line, Legend, ReferenceArea,
} from 'recharts';

const TOPIC_COLOR = '#ec4899';

const SECTIONS = [
  { id: 'intro',       label: 'Fuel types & emissions'     },
  { id: 'lifecycle',   label: 'The full life cycle'        },
  { id: 'nonexhaust',  label: 'Non-exhaust emissions'      },
  { id: 'suveffect',   label: 'Bigger but not cleaner'     },
  { id: 'realworld',   label: 'The real-world gap'         },
  { id: 'sources',     label: 'Sources'                    },
];

// ── Data ──────────────────────────────────────────────────────────────────────

const lciData = [
  { name: 'BEV (390 km range)',  lci: 177, tailpipe: 0,   fill: '#10b981' },
  { name: 'PHEV (130 km range)', lci: 195, tailpipe: 6,   fill: '#6366f1' },
  { name: 'BEV (600 km range)',  lci: 216, tailpipe: 0,   fill: '#34d399' },
  { name: 'Petrol hybrid',       lci: 229, tailpipe: 100, fill: '#f59e0b' },
  { name: 'Petrol',              lci: 240, tailpipe: 113, fill: '#f97316' },
  { name: 'PHEV (65 km range)',  lci: 248, tailpipe: 23,  fill: '#8b5cf6' },
  { name: 'Diesel',              lci: 321, tailpipe: 114, fill: '#ef4444' },
];

// ── Fleet efficiency vs weight data (EU, 2001–2024) ──────────────────────────

const fleetData = [
  { year: 2001, nedc: 170, mass: 1265, suv: 4  },
  { year: 2002, nedc: 167, mass: 1270, suv: 5  },
  { year: 2003, nedc: 164, mass: 1272, suv: 5  },
  { year: 2004, nedc: 163, mass: 1275, suv: 6  },
  { year: 2005, nedc: 161, mass: 1280, suv: 7  },
  { year: 2006, nedc: 159, mass: 1285, suv: 8  },
  { year: 2007, nedc: 158, mass: 1290, suv: 9  },
  { year: 2008, nedc: 154, mass: 1296, suv: 10 },
  { year: 2009, nedc: 145, mass: 1298, suv: 10 },
  { year: 2010, nedc: 140, mass: 1302, suv: 10 },
  { year: 2011, nedc: 136, mass: 1320, suv: 13 },
  { year: 2012, nedc: 132, mass: 1338, suv: 16 },
  { year: 2013, nedc: 127, mass: 1350, suv: 19 },
  { year: 2014, nedc: 123, mass: 1360, suv: 22 },
  { year: 2015, nedc: 120, mass: 1372, suv: 26 },
  { year: 2016, nedc: 118, mass: 1392, suv: 29 },
  { year: 2017, nedc: 119, mass: 1400, suv: 33 },
  { year: 2018, nedc: 120, mass: 1415, suv: 36 },
  { year: 2019, nedc: 122, mass: 1430, suv: 38 },
  { year: 2020, nedc: 107, wltp: 116, mass: 1440, suv: 40 },
  { year: 2021, wltp: 114, mass: 1450, suv: 44 },
  { year: 2022, wltp: 110, mass: 1462, suv: 46 },
  { year: 2023, wltp: 108, mass: 1470, suv: 48 },
  { year: 2024, wltp: 108, mass: 1478, suv: 48 },
];

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f3f4f6' }}>
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
          <span><strong style={{ color: '#1a1a1a' }}>{item.bold}</strong>: {item.text}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Callout box ───────────────────────────────────────────────────────────────

function Callout({ icon, title, children, color }: {
  icon: string; title: string; children: React.ReactNode; color?: string;
}) {
  const c = color ?? TOPIC_COLOR;
  return (
    <div style={{ background: `${c}10`, border: `1px solid ${c}30`, borderLeft: `4px solid ${c}`, borderRadius: 8, padding: '14px 16px', margin: '16px 0' }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', marginBottom: 6 }}>{icon} {title}</div>
      <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

// ── LCI explainer ─────────────────────────────────────────────────────────────

function LCIExplainer() {
  const pillars = [
    { icon: '&#x1F30D;', label: 'Climate change', detail: 'Greenhouse gas emissions over the full lifecycle \u2014 from factory to scrapyard', color: '#3b82f6' },
    { icon: '&#x1F9E0;', label: 'Human health', detail: 'Smog formation, fine particle emissions, and non-carcinogenic toxicity affecting people', color: '#ec4899' },
    { icon: '&#x1F333;', label: 'Ecosystems', detail: 'Acidification, ecotoxicity, and eutrophication damaging soils, rivers, and habitats', color: '#10b981' },
  ];
  const phases = [
    { icon: '&#x1F3ED;', label: 'Vehicle production', detail: 'Body, engine, interior, battery \u2014 including recycled material content' },
    { icon: '&#x26FD;', label: 'Fuel & energy chain', detail: 'Oil refining, electricity generation, hydrogen production \u2014 before the fuel reaches the tank' },
    { icon: '&#x1F697;', label: 'Driving (200,000 km)', detail: 'All exhaust emissions over the assumed lifetime of the vehicle' },
  ];
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '18px 20px', margin: '16px 0' }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
        What goes into the Life Cycle Impact score
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 18 }}>
        <div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: 8 }}>Three environmental dimensions</p>
          {pillars.map(p => (
            <div key={p.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ background: p.color, color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }} dangerouslySetInnerHTML={{ __html: p.label }} />
              <span style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.45 }}>{p.detail}</span>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: 8 }}>Three lifecycle phases</p>
          {phases.map(p => (
            <div key={p.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }} dangerouslySetInnerHTML={{ __html: p.icon }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#1a1a1a' }}>{p.label}</strong>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}> &mdash; {p.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: `${TOPIC_COLOR}15`, borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: '#374151', lineHeight: 1.55 }}>
        <strong>Result: one composite score per car.</strong> The lower the score, the lower the total environmental impact.
        The score is <strong>not</strong> a carbon footprint and should not be read as grams of CO&#x2082; per kilometre.
        It is a weighted combination of all three environmental dimensions, using the EU&apos;s Environmental Footprint methodology.
      </div>
    </div>
  );
}

// ── LCI chart ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = lciData.find(r => r.name === label);
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#374151', marginBottom: 2 }}>Life Cycle Impact: <strong>{d?.lci}</strong></p>
      <p style={{ color: '#6b7280' }}>Tailpipe CO&#x2082;: <strong>{d?.tailpipe} g/km</strong> (official)</p>
    </div>
  );
};

function LCIChart() {
  return (
    <>
      <Para>
        The chart below shows the Life Cycle Impact score for a typical small family car
        (e.g. a Volkswagen Golf or Citro&euml;n C4) by powertrain, sorted from best to worst.
        The official tailpipe CO&#x2082; figure is shown in brackets for comparison &mdash; note how
        poorly it predicts the overall environmental ranking.
      </Para>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={lciData}
          layout="vertical"
          margin={{ top: 8, right: 60, left: 120, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" domain={[0, 360]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={118} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="lci" radius={[0, 4, 4, 0]} name="Life Cycle Impact">
            {lciData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            <LabelList dataKey="lci" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4, lineHeight: 1.4 }}>
        Source: VITO/EnergyVille &amp; VUB, Life Cycle Impact (January 2026), commissioned by Belgium&apos;s three regions.
        Scores cover climate change, human health, and ecosystem impacts across the full vehicle lifecycle (200,000 km).
        The score is not gCO&#x2082;/km.
      </p>
    </>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────

function KeyFigures() {
  const figs = [
    { value: '177 \u2192 321', label: 'Life Cycle Impact range', sub: 'From the best BEV to a diesel car in the same segment \u2014 diesel scores nearly twice as badly (VITO, 2026)', color: TOPIC_COLOR },
    { value: '77%', label: 'of road transport PM10 is non-exhaust', sub: 'Tyre wear, brake dust, and road abrasion now dominate particle emissions from traffic (EEA, 2023)', color: '#f59e0b' },
    { value: '26%', label: 'of km driven electrically by Belgian PHEVs', sub: 'Real-world Belgian data: the remaining 74% are driven on the petrol engine (VITO, 2026)', color: '#6366f1' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── SUV / weight paradox chart ────────────────────────────────────────────────

const FleetTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = fleetData.find(r => r.year === label);
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</p>
      {d?.nedc  && <p style={{ color: '#f97316', marginBottom: 2 }}>CO&#x2082; (NEDC): <strong>{d.nedc} g/km</strong></p>}
      {d?.wltp  && <p style={{ color: '#ec4899', marginBottom: 2 }}>CO&#x2082; (WLTP): <strong>{d.wltp} g/km</strong></p>}
      <p style={{ color: '#6b7280', marginBottom: 2 }}>Avg mass: <strong>{d?.mass?.toLocaleString()} kg</strong></p>
      <p style={{ color: '#94a3b8' }}>SUV share: <strong>{d?.suv}%</strong></p>
    </div>
  );
};

function SUVEffectChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={fleetData} margin={{ top: 16, right: 52, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={3} />
        <YAxis yAxisId="co2" domain={[90, 180]} tick={{ fontSize: 11 }} label={{ value: 'CO\u2082 (g/km)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' } }} />
        <YAxis yAxisId="mass" orientation="right" domain={[1200, 1550]} tick={{ fontSize: 11 }} label={{ value: 'Mass (kg)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' } }} />
        <Tooltip content={<FleetTooltip />} />
        <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />

        {/* Shaded reversal zone 2015–2019 */}
        <ReferenceArea yAxisId="co2" x1={2015} x2={2019} fill="#fef3c7" fillOpacity={0.6} />

        {/* Series break line at 2020 */}
        <ReferenceLine yAxisId="co2" x={2020} stroke="#9ca3af" strokeDasharray="4 3"
          label={{ value: 'NEDC\u2192WLTP', position: 'top', fontSize: 9, fill: '#9ca3af' }} />

        {/* Mass bars */}
        <Bar yAxisId="mass" dataKey="mass" name="Avg mass (kg)" fill="#e2e8f0" radius={[2, 2, 0, 0]} />

        {/* CO2 lines */}
        <Line yAxisId="co2" type="monotone" dataKey="nedc" name="CO\u2082 NEDC (g/km)" stroke="#f97316" strokeWidth={2.5} dot={false} connectNulls={false} />
        <Line yAxisId="co2" type="monotone" dataKey="wltp" name="CO\u2082 WLTP (g/km)" stroke="#ec4899" strokeWidth={2.5} strokeDasharray="5 3" dot={false} connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HowCleanIsYourCar() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F697;  Mobility</p>
            <h1 className="detail-title">How Clean Is Your Car?</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/how-clean-is-your-car.jpg" alt="Car emissions" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Fuel types & emissions */}
          <SectionCard id="intro">
            <SectionTitle>Fuel types and what they emit</SectionTitle>
            <Para>
              The question &ldquo;how clean is your car?&rdquo; depends entirely on what you choose to measure,
              and over which part of the vehicle&apos;s life. Most people think first of the exhaust pipe.
              But tailpipe emissions are only part of the story &mdash; and for some powertrains, not even
              the most important part.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>The main powertrain types on Belgian roads today</p>
            <BulletList items={[
              { bold: 'Petrol (ICEV)', text: 'The most common powertrain for new private cars in Belgium in 2025, with almost two in three new private cars running on petrol. Emits CO\u2082, NOx, and fine particles from the exhaust. Fuel is refined from crude oil, adding upstream emissions before it even reaches the tank.' },
              { bold: 'Diesel (ICEV)', text: 'Slightly more fuel-efficient than petrol in CO\u2082 terms per km, but emits significantly more nitrogen dioxide and fine particles per km driven. Belgium\u2019s historically high diesel share in the car fleet is one reason NO\u2082 concentrations in Belgian cities have been slow to fall.' },
              { bold: 'Mild hybrid / full hybrid (HEV)', text: 'Uses a small battery to recover braking energy and assist the petrol engine, but cannot be plugged in and cannot drive on electricity alone. Reduces fuel consumption and exhaust emissions meaningfully compared to conventional petrol, without the complexity of plug-in charging.' },
              { bold: 'Plug-in hybrid (PHEV)', text: 'Has a larger battery that can be charged from the grid, allowing short trips to be driven on electricity only. Official CO\u2082 figures are very low, but real-world emissions are highly dependent on how often the car is actually charged \u2014 see the real-world gap section below.' },
              { bold: 'Battery electric (BEV)', text: 'Zero tailpipe emissions. Emits no exhaust CO\u2082, NOx, or particulates during use. The environmental case depends on the carbon intensity of the electricity used for charging and the emissions embedded in vehicle manufacturing, especially the battery.' },
            ]} />

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>Two types of emission during driving</p>
            <Para>
              When a car moves, it produces two distinct categories of particle emissions, regardless of
              powertrain:
            </Para>
            <BulletList items={[
              { bold: 'Exhaust (tailpipe) emissions', text: 'CO\u2082, NOx, fine particles, and black carbon produced by burning fuel. These have declined dramatically over decades thanks to Euro emission standards and catalytic converters. BEVs produce none.' },
              { bold: 'Non-exhaust emissions', text: 'Particles released by the wear of tyres, brakes, and road surfaces. These are not regulated by Euro standards (until the new Euro 7) and have not declined in line with exhaust emissions. Every car \u2014 including a BEV \u2014 produces them.' },
            ]} />
            <Para>
              Beyond what happens during driving, a car&apos;s environmental impact also includes the emissions
              involved in <strong>manufacturing the vehicle</strong> (especially the battery for electrified
              cars), <strong>producing the fuel or electricity</strong> it runs on, and <strong>end-of-life
              processing</strong>. Together these phases make up the full lifecycle &mdash; the subject of
              the next section.
            </Para>
          </SectionCard>

          {/* 2 — Life cycle */}
          <SectionCard id="lifecycle">
            <SectionTitle>The full life cycle: beyond the tailpipe</SectionTitle>
            <Para>
              Comparing cars on tailpipe CO&#x2082; alone gives a deeply misleading picture. A plug-in hybrid
              might show an official figure of 23 g CO&#x2082;/km &mdash; better than any petrol car &mdash;
              while its real-world total environmental impact is worse than a conventional petrol engine.
              A battery electric car shows zero at the tailpipe but carries significant emissions from
              battery manufacturing and electricity production. To make a fair comparison, you need to look
              at the <strong>full lifecycle</strong>.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 4px' }}>
              Introducing the Life Cycle Impact
            </p>
            <Para>
              In January 2026, Belgium&apos;s three regions launched the <strong>Life Cycle Impact</strong>
              &mdash; a new environmental score developed by VITO/EnergyVille and VUB, commissioned by the
              Flemish, Walloon, and Brussels governments. It condenses the total environmental burden of a
              car into a single number covering its entire life from factory to scrapyard, assuming
              200,000 km of use.
            </Para>
            <Para>
              <strong>Important: the Life Cycle Impact is not a carbon footprint.</strong> It does not
              measure only CO&#x2082;, and its unit is not grams per kilometre. It is a composite environmental
              score that combines three distinct dimensions of harm. A car that scores well on climate
              change but badly on air quality will not score well overall &mdash; which is exactly why
              diesel performs so poorly despite its CO&#x2082; figures being broadly similar to petrol.
            </Para>

            <LCIExplainer />

            <Callout icon="&#x26A0;&#xFE0F;" title="Why diesel scores so much worse than petrol">
              Both petrol and diesel small family cars have similar official tailpipe CO&#x2082; (113 vs
              114 g/km) &mdash; yet diesel&apos;s Life Cycle Impact is 321 vs petrol&apos;s 240. The gap
              is almost entirely explained by the <strong>human health dimension</strong>: diesel exhaust
              contains significantly more fine particles, black carbon, and nitrogen dioxide per km, which
              carry a heavy penalty in the LCI scoring. Tailpipe CO&#x2082; alone would never reveal this.
            </Callout>

            <Callout icon="&#x26A0;&#xFE0F;" title="The PHEV paradox" color="#6366f1">
              A PHEV with a 65 km electric range has an official tailpipe CO&#x2082; of just 23 g/km &mdash;
              the lowest of any combustion-based car. Yet its Life Cycle Impact (248) is <em>higher than a
              conventional petrol car</em> (240). Why? Because the official figure assumes a high proportion
              of electric driving that does not happen in practice, and because producing a large battery for
              limited real-world electric use adds manufacturing emissions without enough in-use benefit.
              PHEVs with larger batteries (130 km range) fare much better (LCI 195) &mdash; but only when
              regularly charged.
            </Callout>

            <LCIChart />

            <Para style={{ marginTop: 16 }}>
              The ranking has three clear takeaways. First, within the same car segment, a BEV is always
              the best environmental choice &mdash; even the large-battery, heavier 600 km-range BEV (LCI 216)
              outperforms every combustion option. Second, diesel is always the worst, by a substantial
              margin. Third, the order of petrol, petrol hybrid, and PHEV depends heavily on battery size
              and real-world charging behaviour.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>
              What about size? Private vs company cars in Belgium
            </p>
            <Para>
              VITO&apos;s analysis of Belgian new car registrations in 2025 reveals a striking contrast.
              The top 10 new private cars were predominantly petrol-powered and averaged an LCI of
              <strong> 258</strong> at a mass of 1,323 kg. The top 10 new company cars were <em>all</em>
              fully electric, weighed on average 786 kg <em>more</em> at 2,109 kg, yet averaged an
              LCI of <strong>220</strong> &mdash; 15% better despite being substantially heavier.
              Tax incentives that pushed company car buyers toward BEVs have, as a side effect, produced
              a measurably cleaner company fleet than the private market.
            </Para>
            <Para>
              You can look up the Life Cycle Impact score for any car on sale in Belgium &mdash; by model
              or using your own vehicle&apos;s VIN number &mdash; at{' '}
              <a href="https://www.lifecycleimpact.be" target="_blank" rel="noopener noreferrer" style={{ color: TOPIC_COLOR, fontWeight: 600 }}>
                www.lifecycleimpact.be
              </a>.
            </Para>
          </SectionCard>

          {/* 3 — Non-exhaust */}
          <SectionCard id="nonexhaust">
            <SectionTitle>Non-exhaust emissions: the invisible remainder</SectionTitle>
            <Para>
              Decades of progressively stricter Euro emission standards have dramatically reduced exhaust
              particles from road traffic. But a parallel category of particle emissions &mdash; one that
              Euro standards have until recently ignored entirely &mdash; has been quietly increasing in
              relative importance: <strong>non-exhaust emissions</strong>.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>Three sources, no exhaust pipe required</p>
            <BulletList items={[
              { bold: 'Tyre wear', text: 'As rubber abrades against road surfaces, microscopic particles are released. Tyre wear particles are a complex mixture of rubber polymers, mineral particles from the road, and chemical additives including zinc compounds and polycyclic aromatic hydrocarbons. Tyre wear is also the largest source of microplastic emissions in the environment.' },
              { bold: 'Brake wear', text: 'Each time a driver brakes, friction between brake pads and discs releases particles containing iron, copper, and other metals into the air. In urban environments with frequent braking, brake wear can contribute up to 55% of all non-exhaust traffic-related PM10.' },
              { bold: 'Road surface abrasion', text: 'Heavy vehicles progressively break down road surfaces, releasing mineral particles and bitumen fragments. This source is particularly significant for heavy goods vehicles and buses.' },
            ]} />

            <Para style={{ marginTop: 12 }}>
              In 2023, non-exhaust emissions accounted for <strong>77% of PM10</strong> and <strong>60%
              of PM2.5</strong> from road transport across the EU (EEA). In Belgium specifically, roughly
              three quarters of the PM2.5 attributed to road traffic is already non-exhaust in origin.
              As exhaust emissions continue to fall, non-exhaust will become an even larger share.
            </Para>

            <Callout icon="&#x26A1;" title="Do electric cars solve the non-exhaust problem?">
              Partly, but not fully. BEVs produce <strong>zero exhaust particles</strong>. However, they
              are typically heavier than equivalent petrol cars &mdash; by roughly 260 to 310 kg &mdash;
              which increases tyre wear by around 7 to 10%. On the other hand, BEVs use
              <strong> regenerative braking</strong> to recover energy when slowing down, which
              significantly reduces the use of friction brakes and therefore brake wear particles.
              The net effect is that BEVs produce somewhat fewer non-exhaust particles overall than
              equivalent petrol cars, but the difference is far smaller than for exhaust emissions.
            </Callout>

            <Para>
              The newly adopted <strong>Euro 7 regulation</strong> is the first to set limits on
              non-exhaust emissions from tyres and brakes, marking a recognition that the particle
              problem cannot be solved by exhaust standards alone. The limits will apply to new car
              models from 2026 onwards.
            </Para>
          </SectionCard>

          {/* 4 — SUV effect */}
          <SectionCard id="suveffect">
            <SectionTitle>Bigger but not cleaner: the size paradox</SectionTitle>
            <Para>
              Engine technology has improved dramatically over the past 25 years. Direct injection,
              turbocharging, start-stop systems, and electrified drivetrains mean a modern 1.0-litre
              turbocharged engine produces more power with less fuel than the 1.6-litre engines it
              replaced. Measured by engine efficiency alone, today&apos;s cars should emit far less CO&#x2082;
              per kilometre than those sold in 2000. The data tells a more complicated story.
            </Para>

            <Para>
              The chart below shows EU average new car CO&#x2082; (official test values) alongside average
              vehicle mass from 2001 to 2024. The yellow band highlights a telling period: between 2015
              and 2019, with no binding CO&#x2082; targets in force, official fleet CO&#x2082;
              <strong> increased for four consecutive years</strong> &mdash; from 118 to 122 g/km &mdash;
              despite continuing advances in engine efficiency. Rising vehicle mass and the rapid
              growth of SUVs cancelled out every gain made under the bonnet.
            </Para>

            <SUVEffectChart />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6, lineHeight: 1.4 }}>
              Source: EEA CO&#x2082; Monitoring Dataset; ICCT EU Vehicle Market Statistics Pocketbooks
              2016&ndash;2025/26; JATO Dynamics / best-selling-cars.com (SUV share).
              NEDC and WLTP are different test protocols &mdash; values are not directly comparable
              across the 2020 break. The yellow band marks the 2015&ndash;2019 period when CO&#x2082;
              rose despite engine improvements. Gray bars show average new car mass (right axis).
            </p>

            <Para style={{ marginTop: 16 }}>
              Since 2020, official CO&#x2082; has fallen steeply &mdash; but this is almost entirely
              explained by the rapid rise in battery electric and plug-in hybrid registrations, not by
              further improvement in conventional engine efficiency. ICE-only vehicles showed
              essentially zero CO&#x2082; improvement between 2021 and 2024.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>
              How much does size matter? Belgian evidence
            </p>
            <Para>
              The VITO Life Cycle Impact data for Belgium makes the size effect concrete. Within the
              same fuel type, a heavier vehicle always scores worse. Comparing two petrol cars among
              the top-selling private models in 2025: the Renault Clio (1,181 kg, LCI 243) and the
              Audi Q3 (1,577 kg, LCI 309) &mdash; same fuel, but a <strong>27% higher
              environmental impact</strong> for the larger car, almost entirely driven by weight and
              the energy needed to move it. The lightest car in Belgium&apos;s top sellers, the
              Dacia Spring BEV at 1,041 kg, scores just 103 &mdash; the best of any car on the
              Belgian market.
            </Para>

            <Callout icon="&#x1F4CA;" title="The implication for individual choices">
              Choosing a smaller car within your preferred powertrain is one of the most impactful
              decisions available to a buyer. Electrification matters enormously &mdash; but so does
              resisting the consistent commercial pressure toward ever-larger vehicles. A compact BEV
              will always outperform a large BEV on total environmental impact, just as a small
              petrol car beats a large one. The SUV premium in environmental terms is real and
              substantial.
            </Callout>
          </SectionCard>

          {/* 5 — Real-world gap */}
          <SectionCard id="realworld">
            <SectionTitle>The real-world gap</SectionTitle>
            <Para>
              Official emission figures for new cars are measured in laboratory conditions under a
              standardised test cycle (WLTP). These figures determine the tax treatment of vehicles, appear
              in advertising, and form the basis of EU fleet CO&#x2082; targets. They also, systematically,
              understate what cars actually emit on the road.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>Petrol and diesel: the persistent gap</p>
            <Para>
              For conventional petrol and diesel cars, on-board fuel consumption monitoring (OBFCM)
              data collected from around 7.7 million vehicles across Europe between 2021 and 2023 showed
              average real-world CO&#x2082; emissions of approximately <strong>171 g/km</strong> &mdash;
              versus a WLTP fleet average of around 107 g/km. The real-world figure is roughly 60%
              higher than the official one. This gap arises from factors the laboratory test cannot
              capture: traffic congestion, motorway driving at higher speeds, air conditioning use,
              cold starts in winter, and individual driving style.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>PHEVs: the largest gap of all</p>
            <Para>
              Plug-in hybrids present the most extreme case of laboratory versus reality divergence.
              The official WLTP test assumes that PHEVs are driven predominantly on electricity,
              which produces a very flattering official CO&#x2082; figure &mdash; sometimes below
              30 g/km. In reality, charging behaviour determines everything.
            </Para>
            <Para>
              Belgian real-world data collected by VITO shows that <strong>on average only 26% of
              kilometres driven by Belgian PHEVs use the electric motor</strong> &mdash; the remaining
              74% run on the petrol engine. The European Commission has found that across the EU,
              real-world PHEV CO&#x2082; emissions are on average <strong>3.5 times higher</strong>
              than official laboratory values. For company car drivers &mdash; who tend to charge
              their PHEVs less frequently &mdash; the gap is even larger.
            </Para>

            <Callout icon="&#x1F4CB;" title="Why PHEVs are being reformed from 2027" color="#6366f1">
              From 2027, the official CO&#x2082; calculation method for PHEVs will be revised to
              use real-world driving data rather than assumed electric utilisation rates. This will
              make official PHEV figures significantly less flattering &mdash; and more honest.
              Belgium&apos;s Life Cycle Impact score already applies this more realistic approach
              rather than the current official figures.
            </Callout>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>Diesel and NOx: lessons from dieselgate</p>
            <Para>
              The most notorious real-world gap was revealed by the dieselgate scandal in 2015,
              when it emerged that diesel cars from multiple manufacturers emitted NOx at rates
              5 to 7 times above Euro 6 standards in real driving conditions, while passing
              laboratory tests through defeat device software. The scandal led to the introduction
              of <strong>Real Driving Emissions (RDE)</strong> testing, in which cars are now also
              tested on public roads with portable measurement equipment. The latest Euro 6d
              generation of diesel cars has significantly narrowed the NOx gap as a result,
              though real-world emissions generally remain somewhat above laboratory values.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>Closing the gap: on-board monitoring</p>
            <Para>
              Since 2021, new cars sold in the EU must be equipped with <strong>On-Board Fuel
              Consumption Monitors (OBFCM)</strong>, which record actual fuel and energy consumption
              throughout a vehicle&apos;s life. Manufacturers must report this data to regulators,
              and it is increasingly being used to update official emission factors and identify
              vehicles with abnormally high real-world consumption. Over time, this data stream
              should make the gap between official and real-world figures much harder to sustain.
            </Para>
          </SectionCard>

          {/* 6 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'VITO/EnergyVille & VUB \u2014 Life Cycle Impact: Belgium\u2019s new comprehensive environmental label for cars (January 2026)', url: 'https://vito.be/en/news/three-regions-launch-life-cycle-impact-new-comprehensive-environmental-label-compare-cars' },
                { label: 'www.lifecycleimpact.be \u2014 Look up the Life Cycle Impact of any car in Belgium', url: 'https://www.lifecycleimpact.be' },
                { label: 'ICCT \u2014 Life-cycle greenhouse gas emissions from passenger cars in the EU: a 2025 update (July 2025)', url: 'https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/' },
                { label: 'EEA \u2014 Emissions of air pollutants from transport in Europe (2023)', url: 'https://www.eea.europa.eu/en/analysis/indicators/emissions-of-air-pollutants-from' },
                { label: 'ICCT \u2014 EU Vehicle Market Statistics Pocketbook 2025/26', url: 'https://eupocketbook.org' },
                { label: 'EEA \u2014 Average CO2 emissions from new passenger cars and vans (monitoring dataset)', url: 'https://www.eea.europa.eu/en/analysis/indicators/average-co2-emissions-from-new' },
                { label: 'European Commission \u2014 OBFCM real-world CO2 and fuel consumption data, 2024', url: 'https://www.eea.europa.eu/en/analysis/indicators/co2-performance-of-new-passenger' },
                { label: 'Healthy Belgium / Sciensano \u2014 Air quality indicator sheet: non-exhaust PM share', url: 'https://www.healthybelgium.be/en/health-status/determinants-of-health/air-quality' },
                { label: 'EEA \u2014 Non-exhaust emissions guidebook (tyre & brake wear)', url: 'https://www.eea.europa.eu/publications/emep-eea-guidebook-2023/part-b-sectoral-guidance-chapters/1-energy/1-a-combustion/1-a-3-b-vi' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500 }}
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
