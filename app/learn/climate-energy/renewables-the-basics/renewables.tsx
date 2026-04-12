'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const TOPIC_COLOR = '#f97316';

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',          label: 'What are renewables?'     },
  { id: 'explore',        label: 'Explore by technology'    },
  { id: 'further-reading',label: 'Further reading'          },
];

// ── Chart data — lifecycle gCO₂eq/kWh (IPCC AR6 / NREL harmonisation) ────────
const CHART_DATA = [
  { name: 'Coal',             median: 820, lo: 740, hi: 910,  fossil: true  },
  { name: 'Natural gas',      median: 490, lo: 410, hi: 650,  fossil: true  },
  { name: 'Biomass (grid)',   median: 230, lo: 100, hi: 500,  fossil: false },
  { name: 'Solar PV',         median: 38,  lo: 22,  hi: 55,   fossil: false },
  { name: 'Heat pumps\n(BE grid)', median: 35, lo: 20, hi: 60, fossil: false },
  { name: 'Offshore wind',    median: 14,  lo: 8,   hi: 23,   fossil: false },
  { name: 'Onshore wind',     median: 11,  lo: 7,   hi: 15,   fossil: false },
  { name: 'Hydropower',       median: 5,   lo: 4,   hi: 30,   fossil: false },
];

// ── Reusable components ───────────────────────────────────────────────────────
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

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0 4px' }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, lineHeight: 1.4 }}>&#x26A0;&#xFE0F;</span>
      <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{children}</p>
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '33%',    label: 'renewable electricity in Belgium', sub: '2023 \u2014 dominated by offshore wind and biomass',              color: TOPIC_COLOR },
    { value: '42.5%',  label: 'EU 2030 renewable target',         sub: 'Share of final energy consumption from renewable sources',       color: '#ef4444'   },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Technology detail data ────────────────────────────────────────────────────
const TECH_DETAIL: Record<string, {
  icon: string;
  title: string;
  paras: React.ReactNode[];
  note?: React.ReactNode;
}> = {
  'Offshore wind': {
    icon: '🌬️',
    title: 'Offshore wind',
    paras: [
      <>Offshore wind turbines are installed at sea, where wind speeds are consistently higher and more stable than on land. Belgium has been an early mover in offshore wind, with its North Sea zone now hosting a cluster of wind farms with a total installed capacity of approximately 2.3 GW in 2024 — making offshore wind Belgium&apos;s single largest source of renewable electricity.</>,
      <>The main advantages are a high capacity factor (typically 40–50%, meaning turbines generate at nearly half their maximum output on average across the year) and the absence of local opposition that often limits onshore development. The main challenges are cost and grid connection — offshore infrastructure is expensive to install and maintain, and Belgium faces grid congestion bottlenecks (the Ventilus and Boucle du Hainaut projects) that limit how quickly additional capacity can be connected.</>,
    ],
  },
  'Onshore wind': {
    icon: '🍃',
    title: 'Onshore wind',
    paras: [
      <>Onshore wind turbines are installed on land, typically in open agricultural areas or near industrial zones. They are significantly cheaper to build and maintain than offshore equivalents. In Belgium, onshore wind has grown steadily but faces increasing site availability constraints — most suitable locations in Flanders are already in use or excluded due to radar, safety and noise regulations. Wallonia still has more potential, particularly in the open plateau regions.</>,
    ],
  },
  'Solar PV': {
    icon: '☀️',
    title: 'Solar PV',
    paras: [
      <>Solar photovoltaic panels convert sunlight directly into electricity through the photoelectric effect — photons striking a semiconductor material (typically silicon) displace electrons, generating direct current. Belgium&apos;s solar PV capacity has grown rapidly thanks to falling panel costs and favourable roof ownership patterns (approximately 60% of Belgian households have private rooftops suitable for installation).</>,
      <>The main limitation of solar PV in Belgium is its capacity factor — typically 10–13%, reflecting the country&apos;s northern latitude and overcast winters. Solar generates the majority of its output in summer afternoons and very little in winter mornings, which does not align well with Belgium&apos;s peak heating demand. This intermittency makes solar most valuable as a complement to other sources rather than a standalone baseload.</>,
    ],
  },
  'Biomass (grid)': {
    icon: '🌿',
    title: 'Biomass & bioenergy',
    paras: [
      <>Biomass refers to organic material — wood, agricultural residues, organic waste and dedicated energy crops — that can be burned to generate heat and electricity, or converted into biogas or liquid biofuels. In Belgium, biomass and bioenergy represent approximately 60% of total renewable energy consumption, making it by far the largest renewable source by volume.</>,
      <>Biomass is often classified as &ldquo;carbon neutral&rdquo; on the basis that the CO₂ released when burned was previously absorbed during plant growth. However, this accounting is contested: the carbon cycle takes decades to complete, wood combustion releases more CO₂ per kWh than natural gas at the point of burning, and lifecycle emissions depend heavily on the origin of the feedstock and the efficiency of combustion. Sustainably sourced biomass from residues and waste can have genuinely low net emissions; imported wood pellets from primary forests do not.</>,
    ],
  },
  'Hydropower': {
    icon: '💧',
    title: 'Hydropower',
    paras: [
      <>Hydropower generates electricity by converting the kinetic and potential energy of flowing or falling water into mechanical energy via a turbine. Belgium&apos;s hydropower capacity is small — approximately 0.14 GW — reflecting the country&apos;s relatively flat topography and modest rivers. The main installations are run-of-river plants on the Meuse and its tributaries in Wallonia.</>,
      <>Hydropower has important operational advantages: it is highly controllable and dispatchable — output can be adjusted within seconds to match grid demand, unlike wind or solar. Its lifecycle carbon footprint is among the lowest of any energy source.</>,
    ],
  },
  'Heat pumps\n(BE grid)': {
    icon: '🌡️',
    title: 'Heat pumps',
    paras: [
      <>Heat pumps are not a generation technology but a conversion technology: they use electricity to move heat from one place to another — typically from outdoor air, ground or water into a building for heating purposes. A heat pump can deliver 2.5–4 units of heat energy for every unit of electricity consumed (coefficient of performance, or COP, of 2.5–4), making them significantly more efficient than gas boilers or direct electric resistance heating.</>,
      <>In practice, a heat pump connected to a coal-powered grid still contributes to Belgium&apos;s renewable energy statistics — because the environmental heat it extracts is renewable regardless of the electricity source. Their effective carbon footprint depends entirely on the carbon intensity of the electricity supplying them: as Belgium&apos;s electricity becomes greener, every heat pump automatically becomes cleaner without any hardware changes.</>,
    ],
    note: <>Under the EU Renewable Energy Directive, heat pumps are partially counted towards national renewable energy targets — but <strong>only the portion of heat extracted from the environment</strong> (outdoor air, ground or groundwater) is classified as renewable. The electricity required to drive the pump is separate and does not itself count as renewable unless certified as such.</>,
  },
};

// ── Interactive carbon chart ───────────────────────────────────────────────────
function InteractiveChart() {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = selected ? TECH_DETAIL[selected] : null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: 2 }}>{d?.name?.replace('\n', ' ')}</p>
        <p style={{ color: d?.fossil ? '#6b7280' : TOPIC_COLOR }}>Median: {d?.median} gCO₂eq/kWh</p>
        <p style={{ color: '#9ca3af', fontSize: 11 }}>Range: {d?.lo}–{d?.hi} gCO₂eq/kWh</p>
      </div>
    );
  };

  return (
    <div>
      {/* Click prompt */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        border: `2px solid ${TOPIC_COLOR}`,
        borderRadius: 8,
        padding: '8px 16px',
        marginBottom: 16,
        fontSize: '0.88rem',
        fontWeight: 700,
        color: TOPIC_COLOR,
        fontFamily: 'Roboto, sans-serif',
      }}>
        <span style={{ fontSize: '1rem' }}>👆</span>
        Click on any bar to explore that technology in depth.
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={CHART_DATA}
            layout="vertical"
            margin={{ top: 4, right: 90, left: 8, bottom: 20 }}
            onClick={(e) => {
              if (e?.activePayload?.[0]) {
                const name = e.activePayload[0].payload.name;
                if (!e.activePayload[0].payload.fossil) {
                  setSelected(selected === name ? null : name);
                }
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <XAxis type="number" domain={[0, 900]} tick={{ fontSize: 10, fill: '#4b5563' }} tickLine={false} axisLine={false}
              label={{ value: 'gCO₂eq / kWh (lifecycle)', position: 'insideBottom', offset: -14, fontSize: 10, fill: '#4b5563' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} width={100} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="median" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {CHART_DATA.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.fossil ? '#9ca3af' : TOPIC_COLOR}
                  opacity={selected && selected !== d.name ? 0.35 : 1}
                  stroke={selected === d.name ? '#c2410c' : 'none'}
                  strokeWidth={selected === d.name ? 1.5 : 0}
                />
              ))}
              <LabelList dataKey="median" position="right" formatter={(v: number) => `${v}`}
                style={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' as const }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#6b7280' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: TOPIC_COLOR, display: 'inline-block' }} />
          Renewable / low-carbon
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#6b7280' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#9ca3af', display: 'inline-block' }} />
          Fossil fuels (for reference)
        </span>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 8 }}>
        Median lifecycle values. Source: IPCC AR6 (2022) / NREL LCA harmonisation. Biomass range is wide due to feedstock variability (residues vs. imported wood pellets). Heat pump value assumes Belgian grid mix (~230 gCO₂eq/kWh, 2023) and COP of 3.
      </p>

      {/* Detail panel */}
      {detail ? (
        <div style={{
          marginTop: 20,
          background: '#fff7ed',
          border: `1px solid ${TOPIC_COLOR}44`,
          borderLeft: `4px solid ${TOPIC_COLOR}`,
          borderRadius: 10,
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a1a1a' }}>
              {detail.icon} {detail.title}
            </div>
            <button
              onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#9ca3af', padding: '2px 6px' }}
              aria-label="Close"
            >✕</button>
          </div>
          {detail.paras.map((p, i) => (
            <p key={i} style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, marginBottom: 10 }}>{p}</p>
          ))}
          {detail.note && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 10 }}>
              <span style={{ fontSize: '1rem', flexShrink: 0, lineHeight: 1.4 }}>⚠️</span>
              <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{detail.note}</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          marginTop: 20,
          background: '#f9fafb',
          borderRadius: 10,
          padding: '14px 18px',
          fontSize: '0.82rem',
          color: '#9ca3af',
          textAlign: 'center',
        }}>
          Select a renewable source above to see details
        </div>
      )}
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
export default function RenewablesBasicsPage() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F321;&#xFE0F;  Climate &amp; Energy</p>
            <h1 className="detail-title">Renewables: The Basics</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/renewables.jpg" alt="Renewable energy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>What are renewable energy sources?</SectionTitle>
            <Para>
              Renewable energy sources — sunlight, wind, flowing water and biological material — are naturally
              replenished on a human timescale, unlike fossil fuels which took hundreds of millions of years to form.
              Three differences define why the transition to renewables matters.
            </Para>
            <Para>
              <strong>Climate impact.</strong> Fossil fuels release CO&#x2082; locked underground for geological
              timescales. Renewables produce little or no emissions during operation — their carbon footprint comes
              almost entirely from manufacturing and construction. The gap in lifecycle emissions is not marginal;
              it spans one to two orders of magnitude, as the chart below shows.
            </Para>
            <Para>
              <strong>Energy security.</strong> Belgium imports virtually all of its fossil fuels, exposing
              households and industry to price shocks and supply disruptions set by geopolitical events beyond
              Belgian control. The 2022 Russian invasion of Ukraine triggered a European gas crisis that sent
              household energy bills to record highs. More recently, tensions in the Middle East regularly move
              global oil prices regardless of Belgian demand or policy. Renewable energy is produced domestically
              — once the infrastructure is built, the fuel cannot be embargoed, priced by a cartel, or disrupted
              by a distant conflict.
            </Para>
            <Para>
              <strong>Intermittency.</strong> Renewables depend on the weather: a turbine generates when the wind
              blows, a panel when the sun shines. Fossil fuel plants can be ramped up or down on demand. Managing
              intermittency requires grid interconnections, storage and flexible demand — meaning a fully renewable
              system requires more grid investment than an equivalent fossil-fuel system.
            </Para>
          </SectionCard>

          {/* 2 — Interactive chart */}
          <SectionCard id="explore">
            <SectionTitle>Carbon footprint per kWh — explore by technology</SectionTitle>
            <InteractiveChart />
          </SectionCard>

          {/* 9 — Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'IPCC AR6 Chapter 6 — Energy Systems',                        url: 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-6/' },
                { label: 'Elia — Belgian electricity system operator',                  url: 'https://www.elia.be' },
                { label: 'NREL LCA Harmonisation — lifecycle emissions by technology',  url: 'https://www.nrel.gov/analysis/life-cycle-assessment.html' },
                { label: 'EU Renewable Energy Directive (RED III)',                     url: 'https://energy.ec.europa.eu/topics/renewable-energy/renewable-energy-directive-targets-and-rules/renewable-energy-directive_en' },
                { label: 'Belgian NECP 2024 — national energy and climate plan',        url: 'https://energy.ec.europa.eu/document/download/964eb6f7-b8b8-4a36-9b54-a4c62c4dcac8_en' },
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
