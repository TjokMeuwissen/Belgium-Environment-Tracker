'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const TOPIC_COLOR = '#f97316';

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'what-is-carbon-footprint', label: 'What is a carbon footprint?' },
  { id: 'lca',                      label: 'Life Cycle Assessment'        },
  { id: 'who-performs',             label: 'Who performs footprints?'     },
  { id: 'ghg-protocol',             label: 'The GHG Protocol'             },
  { id: 'sbti',                     label: 'Science-Based Targets'        },
  { id: 'further-reading',          label: 'Further reading'              },
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

  // Stage box width as a percentage for positioning the cradle-to-gate outline
  // 5 stages, 4 arrows. Each stage ~ flex:1. Gate covers first 2 stages → ~38% of row.

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px 20px 20px', marginBottom: 16, overflowX: 'auto' }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        Life cycle stages &amp; system boundaries
      </p>

      {/* Outer wrapper — relative so we can layer the outline boxes */}
      <div style={{ position: 'relative', minWidth: 540 }}>

        {/* Cradle-to-grave outline box — larger, encompasses everything */}
        <div style={{
          position: 'absolute', inset: '-14px -10px -24px -10px',
          border: '2.5px solid #1a1a1a', borderRadius: 14, pointerEvents: 'none',
        }} />
        {/* Cradle-to-grave label — bottom-right */}
        <div style={{
          position: 'absolute', bottom: -22, right: 6,
          fontSize: '0.72rem', fontWeight: 700, color: '#1a1a1a',
          background: '#f9fafb', padding: '0 6px',
        }}>
          Cradle-to-grave (full LCA)
        </div>

        {/* Cradle-to-gate outline box — smaller, sits inside cradle-to-grave */}
        <div style={{
          position: 'absolute', inset: '-6px auto -16px -2px',
          width: 'calc(38% + 2px)',
          border: `2px solid ${TOPIC_COLOR}`, borderRadius: 10, pointerEvents: 'none',
        }} />
        {/* Cradle-to-gate label — bottom-left */}
        <div style={{
          position: 'absolute', bottom: -14, left: 6,
          fontSize: '0.72rem', fontWeight: 700, color: TOPIC_COLOR,
          background: '#f9fafb', padding: '0 6px',
        }}>
          Cradle-to-gate
        </div>

        {/* Stage boxes row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                flex: 1, textAlign: 'center', background: '#fff', border: '1.5px solid #e5e7eb',
                borderRadius: 8, padding: '10px 4px 8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '1.625rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{s.label}</div>
              </div>
              {i < stages.length - 1 && (
                <div style={{ width: 20, textAlign: 'center', color: '#9ca3af', fontSize: '1rem', flexShrink: 0 }}>&#x2192;</div>
              )}
            </div>
          ))}
        </div>

        {/* Spacer to make room for the bottom label */}
        <div style={{ height: 22 }} />
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CarbonFootprintPage() {
  return (
    <div className="detail-page">

      {/* Dark header */}
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">← Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>🌡️  Climate &amp; Energy</p>
            <h1 className="detail-title">Carbon Footprint</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/carbon-footprint.jpg" alt="Carbon Footprint" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — What is a carbon footprint */}
          <SectionCard id="what-is-carbon-footprint">
            <SectionTitle>What is a carbon footprint?</SectionTitle>
            <Para>
              A carbon footprint is a measure of the total greenhouse gas emissions caused, directly and indirectly,
              by a person, organisation, product or activity. It is expressed per weight of CO&#x2082; equivalent
              — typically in kilograms or tonnes of CO&#x2082;eq (tCO&#x2082;eq) — a unit that converts all greenhouse
              gases into a single number using their Global Warming Potential, so one tonne of methane, for example,
              counts as approximately 30 tCO&#x2082;eq.
            </Para>
          </SectionCard>

          {/* 2 — LCA */}
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

          {/* 3 — Who performs */}
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

          {/* 4 — GHG Protocol */}
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

          {/* 5 — SBTi */}
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

          {/* 6 — Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'GHG Protocol — Corporate Standard',           url: 'https://ghgprotocol.org/corporate-standard' },
                { label: 'Science Based Targets initiative (SBTi)',      url: 'https://sciencebasedtargets.org' },
                { label: 'ISO 14067 — Product Carbon Footprint',         url: 'https://www.iso.org/standard/71206.html' },
                { label: 'ISO 14040/14044 — LCA Standards',              url: 'https://www.iso.org/standard/37456.html' },
                { label: 'EU CSRD — Corporate Sustainability Reporting',  url: 'https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en' },
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
