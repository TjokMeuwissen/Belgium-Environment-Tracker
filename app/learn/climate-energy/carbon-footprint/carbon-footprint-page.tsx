'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const TOPIC_COLOR = '#f97316';

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'what-is-carbon-footprint', label: 'What is a carbon footprint?' },
  { id: 'production-vs-consumption', label: 'Production vs consumption'  },
  { id: 'lca',                      label: 'Life Cycle Assessment'        },
  { id: 'who-performs',             label: 'Who performs footprints?'     },
  { id: 'ghg-protocol',             label: 'The GHG Protocol'             },
  { id: 'sbti',                     label: 'Science-Based Targets'        },
  { id: 'further-reading',          label: 'Sources'                      },
];

// ── Reusable layout components ────────────────────────────────────────────────
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

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '15.7 tCO\u2082eq', label: 'per person per year', sub: 'Belgian consumption-based footprint (2019, UCLouvain) — nearly double the EU average', color: '#f97316' },
    { value: '2.3 tCO\u2082eq',  label: 'Paris-compatible target', sub: 'What each person needs to reach by 2030 to stay within 1.5\u00b0C', color: '#ef4444' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.9rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── LCA diagram ───────────────────────────────────────────────────────────────
function LCADiagram() {
  const stages = [
    { label: 'Raw\nmaterials', icon: '⛏️' },
    { label: 'Production',   icon: '🏭' },
    { label: 'Distribution', icon: '🚚' },
    { label: 'Use',          icon: '🔌' },
    { label: 'End of life',  icon: '♻️' },
  ];

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px 20px 20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        Life cycle stages &amp; system boundaries
      </p>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: '-14px -10px -24px -10px',
          border: '2.5px solid #1a1a1a', borderRadius: 14, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -22, right: 6,
          fontSize: '0.72rem', fontWeight: 700, color: '#1a1a1a',
          background: '#f9fafb', padding: '0 6px',
        }}>
          Cradle-to-grave (full LCA)
        </div>

        <div style={{
          position: 'absolute', inset: '-6px auto -16px -2px',
          width: 'calc(38% + 2px)',
          border: `2px solid ${TOPIC_COLOR}`, borderRadius: 10, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -14, left: 6,
          fontSize: '0.72rem', fontWeight: 700, color: TOPIC_COLOR,
          background: '#f9fafb', padding: '0 6px',
        }}>
          Cradle-to-gate
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                flex: 1, textAlign: 'center', background: '#fff', border: '1.5px solid #e5e7eb',
                borderRadius: 8, padding: '10px 4px 8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '1.4rem', lineHeight: 1 }}>{s.icon}</div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: 5, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{s.label}</div>
              </div>
              {i < stages.length - 1 && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0, padding: '0 3px' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Emission factors (from belgium_carbon_calculator_data_v3.xlsx) ────────────
// Petrol car medium: 0.179 kg CO₂eq/km (sheet 03_Transport_Car_SizeType)
// Beef: 14.474 kg CO₂eq/kg (sheet 07_Food_EmissionFactors, Agribalyse 3.2)
// Short-haul flight economy w/ RF: 0.153 kg CO₂eq/km (sheet 04_Transport_Flights)
//   Default 1200 km one-way, return trip × 1.09 detour = 400.2 kg per return flight
// Natural gas heating: 0.202 kg CO₂eq/kWh (sheet 01_Housing_Heating)
//   Medium house 105 m², average insulation 120 kWh/m²/yr → 2,545 kg CO₂eq/yr

const EF = {
  petrol_per_km:        0.179,   // kg CO₂eq/km, medium petrol car
  flight_ef:            0.153,   // kg CO₂eq/km/pax, short-haul w/ RF
  flight_detour:        1.09,
  flight_default_km:    1200,    // one-way km (Brussels–Barcelona range)
  gas_per_kwh:          0.202,   // kg CO₂eq/kWh natural gas
  house_m2:             105,     // medium house
  house_kwh_per_m2:     120,     // avg insulation kWh/m²/yr
};

// Per tonne of CO₂eq:
const PER_TONNE = {
  km_driven:    1000 / EF.petrol_per_km,                                              // ~5,587 km
  flights:      1000 / (EF.flight_default_km * 2 * EF.flight_detour * EF.flight_ef), // ~2.50 return flights
  house_years:  1 / (EF.house_m2 * EF.house_kwh_per_m2 * EF.gas_per_kwh / 1000),    // ~0.393 yr/t
};

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-BE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ── Equivalence slider ────────────────────────────────────────────────────────

// National per-capita averages (tCO₂eq/capita)
// Source: Our World in Data — https://ourworldindata.org/grapher/co-emissions-per-capita
const COUNTRIES = [
  { name: 'Belgium',  flag: '🇧🇪', avg: 8.3,  color: '#f97316', note: 'production-based, EEA 2023' },
  { name: 'USA',      flag: '🇺🇸', avg: 14.2, color: '#3b82f6', note: 'Our World in Data / GCP 2023' },
  { name: 'Kenya',    flag: '🇰🇪', avg: 0.38, color: '#22c55e', note: 'Our World in Data / GCP 2023' },
];
const PARIS_TARGET = 2.3; // tCO₂eq/cap, 1.5°C fair-share budget

function EquivalenceSlider() {
  const [tonnes, setTonnes] = useState(8.3);

  const km      = tonnes * PER_TONNE.km_driven;
  const flights = tonnes * PER_TONNE.flights;
  const houseYr = tonnes * PER_TONNE.house_years;

  const activityCards = [
    {
      icon: '🚗',
      label: 'km driven',
      value: fmt(km),
      sub: 'petrol car, medium size',
      color: '#3b82f6',
    },
    {
      icon: '✈️',
      label: 'return flights',
      value: fmt(flights, 1),
      sub: 'short-haul economy return (e.g. Brussels–Barcelona)',
      color: '#06b6d4',
    },
    {
      icon: '🏠',
      label: 'years of home heating',
      value: fmt(houseYr, 1),
      sub: 'medium house (105 m²), natural gas, average insulation',
      color: '#f97316',
    },
  ];

  return (
    <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 22px', marginTop: 20 }}>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginBottom: 4 }}>
        What does this amount of CO₂ actually represent?
      </div>
      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 18 }}>
        Drag the slider to explore what a given annual carbon footprint equates to in everyday activities.
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.75rem', color: '#9ca3af' }}>
          <span>1 t</span>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: TOPIC_COLOR }}>
            {fmt(tonnes, 1)} t CO₂eq / year
          </span>
          <span>100 t</span>
        </div>
        <input
          type="range"
          min={1} max={100} step={0.1}
          value={tonnes}
          onChange={e => setTonnes(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: TOPIC_COLOR, cursor: 'pointer', height: 6 }}
        />
      </div>

      {/* Row 1 — Activity equivalences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {activityCards.map(ex => (
          <div key={ex.label} style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            borderTop: `3px solid ${ex.color}`, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1.4rem' }}>{ex.icon}</span>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.3 }}>
                {ex.label}
              </div>
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: ex.color, lineHeight: 1 }}>
              {ex.value}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 5, lineHeight: 1.4 }}>{ex.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2 — Country comparison */}
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', marginBottom: 8 }}>
        Equivalent to the annual carbon footprint (production-based) of…
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        {COUNTRIES.map(c => {
          const people = tonnes / c.avg;
          const overUnder = tonnes / PARIS_TARGET;
          const timesTarget = (c.avg / PARIS_TARGET).toFixed(1);
          const parisText = c.avg <= PARIS_TARGET
            ? `${c.name}'s average is already within the 1.5°C budget`
            : `${c.name}'s average is ${timesTarget}× the 1.5°C budget of ${PARIS_TARGET} t`;

          return (
            <div key={c.name} style={{
              background: '#fff', borderRadius: 10, padding: '14px 16px',
              borderTop: `3px solid ${c.color}`, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{c.flag}</span>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#6b7280' }}>
                  {c.name}
                </div>
              </div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '1.6rem', color: c.color, lineHeight: 1 }}>
                {fmt(people, 1)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 5, lineHeight: 1.4 }}>
                people at {c.name}'s average ({c.avg} t/cap)
              </div>
              <div style={{
                marginTop: 10, fontSize: '0.7rem', lineHeight: 1.5,
                color: c.avg <= PARIS_TARGET ? '#15803d' : '#6b7280',
                background: c.avg <= PARIS_TARGET ? '#f0fdf4' : '#f9fafb',
                borderRadius: 6, padding: '6px 8px',
              }}>
                {parisText}
              </div>
            </div>
          );
        })}
      </div>

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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CarbonFootprintPage() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #431407 0%, #c2410c 60%, #f97316 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F321;&#xFE0F;  Climate &amp; Energy</p>
            <h1 className="detail-title">Carbon Footprint</h1>
            <p style={{ color: '#fed7aa', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              From product lifecycle to national accounting &mdash; what carbon footprints measure, how they differ, and why Belgium&apos;s true footprint is nearly double its official figure.
            </p>
          </div>
          <img
            src="/images/learn/carbon-footprint.jpg"
            alt="Carbon footprint"
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — What is a carbon footprint */}
          <SectionCard id="what-is-carbon-footprint">
            <SectionTitle>What is a carbon footprint?</SectionTitle>
            <Para>
              A <strong>carbon footprint</strong> is the total amount of greenhouse gases caused by an individual, organisation, event or product — expressed in tonnes of CO₂-equivalent (tCO₂eq). The CO₂-equivalent unit converts all greenhouse gases into a single number using their global warming potential over 100 years: methane (CH₄) counts as 30 times CO₂, nitrous oxide (N₂O) as 265 times CO₂, and so on.
            </Para>
            <Para>
              The term is widely used but often loosely defined. A rigorous carbon footprint covers all greenhouse gases, traces emissions across the entire supply chain and lifecycle of activities, and applies a consistent accounting boundary. A casual or marketing use of the term may count only direct energy use, ignore supply chain emissions, or exclude certain gases. Understanding what is and is not included is as important as the headline number.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              Carbon footprints can be calculated at every scale: for a single product (a shirt, a litre of milk), for an activity (a flight, a building renovation), for a company, for a city, or for an entire country. The methodology differs at each scale, but the underlying principle is the same — trace and sum all greenhouse gas emissions caused by the subject of the study.
            </Para>
          </SectionCard>

          {/* 2 — Production vs consumption */}
          <SectionCard id="production-vs-consumption">
            <SectionTitle>Production-based vs consumption-based footprint</SectionTitle>
            <Para>
              At the national level, two fundamentally different methods exist for measuring a country&apos;s carbon footprint per person, and they produce very different answers for Belgium.
            </Para>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderTop: `3px solid #f97316`, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#c2410c', marginBottom: 8 }}>
                  🏭 Production-based (territorial)
                </div>
                <p style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, margin: '0 0 8px' }}>
                  Counts only emissions that physically occur within Belgium&apos;s borders — from power plants, factories, vehicles and farms on Belgian territory. This is the method used for official EU and UN reporting.
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f97316' }}>~8.3 tCO₂eq / person (2023)</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>Source: EEA GHG Inventory</div>
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderTop: `3px solid #dc2626`, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#991b1b', marginBottom: 8 }}>
                  🛍️ Consumption-based (footprint)
                </div>
                <p style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, margin: '0 0 8px' }}>
                  Counts all emissions caused by what Belgians consume, regardless of where production happened. When Belgium imports steel, electronics or food, the manufacturing emissions are allocated to Belgian consumers.
                </p>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>~15.7 tCO₂eq / person (2019)</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>Source: UCLouvain (2021)</div>
              </div>
            </div>

            <Para>
              The <strong>gap of roughly 7 tonnes per person</strong> represents Belgium&apos;s <em>imported carbon</em> — the CO₂ embedded in goods manufactured abroad and consumed in Belgium. This gap matters for policy: a country can reduce its territorial emissions simply by offshoring its most carbon-intensive industries, while its true climate impact remains unchanged. Consumption-based accounting closes this loophole.
            </Para>
            <Para>
              For individual behaviour, the consumption-based figure is more relevant — it captures the full impact of purchasing decisions, diet and travel, wherever the emissions physically occur. For intergovernmental targets and legal compliance (EU Effort Sharing Regulation, Paris Agreement national pledges), the territorial figure is used.
            </Para>
            <Para>
              You can explore Belgium&apos;s per-capita GHG footprint in detail, including how it compares to EU neighbours and Paris-compatible targets, on the indicator page:
            </Para>
            <div style={{ marginTop: 4, marginBottom: 4 }}>
              <Link
                href="/indicators/per-capita-ghg-footprint"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: TOPIC_COLOR, color: '#fff', borderRadius: 8,
                  padding: '9px 18px', fontSize: '0.88rem', fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                View Belgium&apos;s GHG footprint indicator &#x2192;
              </Link>
            </div>

            <EquivalenceSlider />
          </SectionCard>

          {/* 3 — LCA */}
          <SectionCard id="lca">
            <SectionTitle>Life Cycle Assessment</SectionTitle>
            <Para>
              The carbon footprint concept is rooted in <strong>Life Cycle Assessment (LCA)</strong> — a standardised
              methodology (ISO 14040/14044) that traces all environmental impacts of a product or service across its
              entire life, from raw material extraction through manufacturing, transport, use, and end-of-life disposal.
              Crucially, a full LCA does not only measure climate impact: it simultaneously quantifies a broad range
              of environmental indicators, including:
            </Para>
            <BulletList items={[
              { bold: 'Climate change',      text: 'greenhouse gas emissions expressed in CO\u2082eq \u2014 this is the carbon footprint' },
              { bold: 'Acidification',       text: 'emissions of SO\u2082 and NO\u2093 that lower the pH of soils and water bodies' },
              { bold: 'Eutrophication',      text: 'excess nitrogen and phosphorus flows that deplete oxygen in water systems' },
              { bold: 'Water use',           text: 'freshwater consumption and scarcity-weighted water depletion' },
              { bold: 'Land use',            text: 'area occupied and transformed, relevant for agriculture and deforestation' },
              { bold: 'Ecotoxicity',         text: 'toxic substances released to soil, water and air' },
              { bold: 'Resource depletion',  text: 'use of fossil fuels, minerals and metals' },
            ]} />
            <Para style={{ marginTop: 14 }}>
              A carbon footprint is therefore a <strong>single-indicator extraction from a full LCA</strong> — focusing
              exclusively on the climate change category while setting aside the other impact categories.
            </Para>
            <LCADiagram />
            <Para>
              Two key boundaries determine the scope of an LCA or carbon footprint study. A <strong>cradle-to-grave</strong>{' '}
              analysis covers the full life cycle from resource extraction to end-of-life — production, distribution,
              consumer use, and final disposal or recycling. A <strong>cradle-to-gate</strong> analysis stops at the
              factory gate, covering only extraction and production. This is common for industrial materials such as
              steel, cement or chemicals, where downstream use varies or lies outside the manufacturer&apos;s control.
            </Para>
          </SectionCard>

          {/* 4 — Who performs */}
          <SectionCard id="who-performs">
            <SectionTitle>Who performs carbon footprints, and at what level?</SectionTitle>
            <Para>Carbon footprinting is applied at several scales:</Para>
            <BulletList items={[
              { bold: 'Products',
                text: 'A product carbon footprint (PCF) quantifies the emissions associated with making, distributing, using and disposing of a single product \u2014 for example, a smartphone, a litre of milk, or a pair of jeans. It follows LCA methodology and is governed by ISO 14067. Product footprints are increasingly required by buyers in supply chains and sometimes displayed on packaging as eco-labels' },
              { bold: 'Projects and activities',
                text: 'Organisations calculate footprints for specific initiatives \u2014 a construction project, an event, a new office building. This is often done to offset residual emissions or to demonstrate environmental due diligence to clients or regulators' },
              { bold: 'Companies and organisations',
                text: 'A corporate carbon footprint covers all emissions associated with an organisation\u2019s operations, divided into three scopes (see GHG Protocol below). Companies report these annually to regulators, investors or voluntary platforms. In Belgium, large companies are subject to mandatory reporting under the EU Corporate Sustainability Reporting Directive (CSRD) from 2024 onwards' },
              { bold: 'Consumers',
                text: 'An individual carbon footprint estimates the annual emissions caused by a person\u2019s lifestyle \u2014 how they travel, what they eat, how they heat their home, and what they buy. The average Belgian\u2019s footprint is approximately 15.7 tCO\u2082eq per year on a consumption basis, including all goods and services regardless of where they were produced' },
            ]} />
          </SectionCard>

          {/* 5 — GHG Protocol */}
          <SectionCard id="ghg-protocol">
            <SectionTitle>The GHG Protocol</SectionTitle>
            <Para>
              The <strong>Greenhouse Gas Protocol (GHG Protocol)</strong> is the most widely used international standard
              for measuring and managing greenhouse gas emissions. Developed jointly by the World Resources Institute
              (WRI) and the World Business Council for Sustainable Development (WBCSD), it provides the accounting
              framework that underpins almost all corporate and national carbon reporting.
            </Para>
            <Para>The GHG Protocol divides corporate emissions into three scopes:</Para>
            <BulletList items={[
              { bold: 'Scope 1',
                text: 'Direct emissions from sources owned or controlled by the company \u2014 for example, fuel combustion in company-owned vehicles or on-site industrial processes' },
              { bold: 'Scope 2',
                text: 'Indirect emissions from purchased electricity, heat or steam consumed by the company' },
              { bold: 'Scope 3',
                text: 'All other indirect emissions in the company\u2019s value chain \u2014 both upstream (suppliers, raw materials, business travel) and downstream (use of sold products, end-of-life treatment). Scope 3 typically represents 70\u201390% of a company\u2019s total footprint, yet is the hardest to measure and reduce' },
            ]} />
          </SectionCard>

          {/* 6 — SBTi */}
          <SectionCard id="sbti">
            <SectionTitle>Science-Based Targets (SBTi)</SectionTitle>
            <Para>
              Measuring a footprint is only the first step. The <strong>Science Based Targets initiative (SBTi)</strong>{' '}
              is a framework that helps companies set emission reduction targets aligned with the level of
              decarbonisation required to limit warming to 1.5&#x00B0;C. Targets are validated independently and
              must cover Scope 1, 2 and — for large companies — material Scope 3 categories.
            </Para>
            <Para>The process for a company typically works as follows:</Para>
            <BulletList items={[
              { bold: 'Measure',
                text: 'Calculate the current GHG inventory across all three scopes using the GHG Protocol' },
              { bold: 'Set',
                text: 'Define a reduction pathway \u2014 for example, a 50% absolute reduction in Scope 1 and 2 emissions by 2030 vs a 2020 baseline, and a Scope 3 target covering at least two-thirds of value chain emissions' },
              { bold: 'Validate',
                text: 'Submit targets to SBTi for independent validation against the 1.5\u00b0C threshold' },
              { bold: 'Report',
                text: 'Disclose progress annually against the approved targets, publicly and to investors' },
            ]} />
            <Para style={{ marginTop: 14 }}>
              Companies with validated SBTi targets commit to no offsetting in lieu of actual reductions — net zero
              under SBTi means reducing emissions to near zero, with only residual unavoidable emissions neutralised.
              This distinguishes SBTi from looser &ldquo;carbon neutral&rdquo; or &ldquo;climate positive&rdquo; claims
              that can be achieved primarily through purchasing carbon credits.
            </Para>
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="further-reading">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'GHG Protocol — Corporate Standard',           url: 'https://ghgprotocol.org/corporate-standard' },
                { label: 'Science Based Targets initiative (SBTi)',      url: 'https://sciencebasedtargets.org' },
                { label: 'ISO 14067 — Product Carbon Footprint',         url: 'https://www.iso.org/standard/71206.html' },
                { label: 'ISO 14040/14044 — LCA Standards',              url: 'https://www.iso.org/standard/37456.html' },
                { label: 'EU CSRD — Corporate Sustainability Reporting',  url: 'https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en' },
                { label: 'Our World in Data — CO₂ emissions per capita (GCP 2023)', url: 'https://ourworldindata.org/grapher/co-emissions-per-capita' },
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
