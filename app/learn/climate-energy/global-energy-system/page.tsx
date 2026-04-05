'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const TOPIC_COLOR = '#f97316';

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'scale',      label: 'The scale of global energy'     },
  { id: 'chokepoints',label: 'How energy moves — chokepoints' },
  { id: 'fossil',     label: 'Fossil fuels'                   },
  { id: 'nuclear',    label: 'Nuclear energy'                 },
  { id: 'renewables', label: 'Renewables — a new paradigm'   },
  { id: 'hydrogen',   label: 'The hydrogen economy'           },
  { id: 'sources',    label: 'Sources & further reading'      },
];

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

// ── Layout ────────────────────────────────────────────────────────────────────
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      {children}
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f3f4f6' }}>{children}</h2>;
}
function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, marginBottom: 12, ...style }}>{children}</p>;
}
function BulletList({ items }: { items: { bold: string; text: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
          <span style={{ color: TOPIC_COLOR, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>▸</span>
          <span><strong style={{ color: '#1a1a1a' }}>{item.bold}</strong>{item.text ? ': ' + item.text : ''}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '~620 EJ',  label: 'Global primary energy (2023)', sub: 'Exajoules per year — equivalent to burning 145 billion barrels of oil', color: '#f97316' },
    { value: '~80%',     label: 'still from fossil fuels',      sub: 'Oil, gas and coal — despite decades of renewable growth', color: '#dc2626' },
    { value: '20 mb/d',  label: 'through Strait of Hormuz',     sub: 'Million barrels of oil per day — ~20% of global supply through one narrow passage', color: '#b45309' },
    { value: '$2–3T',    label: 'annual fossil fuel subsidies',  sub: 'Explicit and implicit global subsidies (IMF, 2023) — larger than global defence spending', color: '#7f1d1d' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '18px 18px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.7rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginTop: 5, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3, lineHeight: 1.4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Chokepoint cards ──────────────────────────────────────────────────────────
function ChokepointCards() {
  const points = [
    {
      name: 'Strait of Hormuz',
      location: 'Iran / Oman',
      emoji: '🛢️',
      volume: '~20–21 mb/day oil + 17% of global LNG',
      risk: '🔴 Critical',
      riskColor: '#dc2626',
      text: 'The single most important energy chokepoint on Earth. Iran has repeatedly threatened to close Hormuz in response to sanctions or military pressure. With the 2024 escalation of Iran–Israel tensions, Hormuz risk is at its highest in decades. There is no practical bypass: the partial alternative (UAE\'s Habshan–Fujairah pipeline) handles only ~2 mb/day.',
    },
    {
      name: 'Strait of Malacca',
      location: 'Malaysia / Singapore / Indonesia',
      emoji: '⚓',
      volume: '~15 mb/day oil, plus container trade',
      risk: '🟠 Elevated',
      riskColor: '#f97316',
      text: 'The main artery for Middle Eastern oil reaching China, Japan and South Korea — three of the world\'s largest energy importers. A closure would force rerouting around Australia or through the Lombok or Sunda Straits, adding 2–7 days and significant cost. Piracy remains an intermittent risk.',
    },
    {
      name: 'Suez Canal / SUMED Pipeline',
      location: 'Egypt',
      emoji: '🚢',
      volume: '~10% of seaborne oil, significant LNG',
      risk: '🟠 Elevated',
      riskColor: '#f97316',
      text: 'When the Ever Given container ship ran aground in March 2021, it blocked the canal for six days and held up an estimated $9.6 billion in daily trade. More seriously, Houthi drone and missile attacks on Red Sea shipping since late 2023 have caused major diversions around the Cape of Good Hope — adding 10–14 days to Asia–Europe voyages and raising freight rates sharply.',
    },
    {
      name: 'Bab-el-Mandeb',
      location: 'Yemen / Djibouti',
      emoji: '🎯',
      volume: 'Gateway to Suez — ~8 mb/day',
      risk: '🔴 Currently active threat',
      riskColor: '#dc2626',
      text: 'The southern entrance to the Red Sea and the Suez route. Since November 2023, Houthi forces in Yemen have attacked over 50 commercial vessels with drones, missiles and naval mines — the most sustained maritime threat to global shipping since WWII. Major shipping lines including Maersk and MSC rerouted around Africa by early 2024.',
    },
    {
      name: 'Turkish Straits (Bosphorus)',
      location: 'Turkey',
      emoji: '🏛️',
      volume: '~3 mb/day — Russian and Kazakh oil to Mediterranean',
      risk: '🟡 Moderate',
      riskColor: '#eab308',
      text: 'Black Sea oil — largely from Russia and Kazakhstan — passes through Istanbul under the 1936 Montreux Convention, which limits warship transit but allows commercial vessels. Turkey controls access and has periodically used this as diplomatic leverage. Russia\'s invasion of Ukraine in 2022 brought renewed attention to dependency on this route.',
    },
    {
      name: 'Danish Straits',
      location: 'Denmark / Sweden',
      emoji: '🌊',
      volume: '~3 mb/day — Baltic Sea oil exports',
      risk: '🟡 Low-moderate',
      riskColor: '#eab308',
      text: 'The exit route for Russian Baltic oil exports (from Primorsk and Ust-Luga terminals). Following Western sanctions after the Ukraine invasion, these flows have diminished significantly as European buyers shifted suppliers — demonstrating that geopolitical disruption can sometimes reshape flows rather than just blocking them.',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {points.map(p => (
        <div key={p.name} style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 18px', borderLeft: `3px solid ${p.riskColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1a1a1a' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.location}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: p.riskColor, flexShrink: 0, marginLeft: 8, background: `${p.riskColor}15`, padding: '2px 7px', borderRadius: 4 }}>{p.risk}</span>
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 6, background: '#fff', borderRadius: 5, padding: '4px 8px', display: 'inline-block' }}>
            📦 {p.volume}
          </div>
          <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{p.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Nuclear timeline ──────────────────────────────────────────────────────────
function NuclearTimeline() {
  const events = [
    { year: '1954', label: 'First civil nuclear power', type: 'start', text: 'Obninsk, USSR — first grid-connected nuclear power plant (5 MW). The "Atoms for Peace" era begins: nuclear promises cheap, clean, abundant energy.' },
    { year: '1979', label: 'Three Mile Island', type: 'accident', text: 'Partial core meltdown at Three Mile Island, Pennsylvania (USA). No immediate deaths, low radiation release — but a watershed moment for public perception. US nuclear construction effectively halted.' },
    { year: '1986', label: 'Chernobyl', type: 'accident', text: 'Reactor 4 explosion at Chernobyl, Ukraine (then USSR). 31 direct deaths; long-term estimates range from thousands to tens of thousands of cancer-related deaths. 350,000 people permanently evacuated. Triggered nuclear phase-outs across Europe.' },
    { year: '1990s–2000s', label: 'The long decline', type: 'decline', text: 'Plant retirements outpace new builds across the West. Germany, Belgium, Spain and others announce phase-outs. Construction times and costs balloon as safety requirements tighten and experience is lost.' },
    { year: '2011', label: 'Fukushima Daiichi', type: 'accident', text: 'Tsunami triggers three reactor meltdowns in Japan. No direct radiation deaths, but 2,000+ deaths attributed to the chaotic evacuation. Germany accelerates its Atomausstieg (nuclear exit). Japan shuts its entire fleet for years. Global nuclear capacity drops sharply.' },
    { year: '2022–2024', label: 'The nuclear renaissance', type: 'renaissance', text: 'Energy crisis after Russia\'s Ukraine invasion, climate urgency and new SMR technology trigger a reassessment. Belgium extends Doel 4 and Tihange 3 by ten years (to 2035). Netherlands plans two new plants. France orders 6 new EPR2 reactors. EU taxonomy includes nuclear as "green." UK, Poland, Czech Republic, Finland and others plan expansions or new builds.' },
  ];

  const colors: Record<string, string> = {
    start: '#22c55e',
    accident: '#dc2626',
    decline: '#9ca3af',
    renaissance: '#0ea5e9',
  };

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: 60, top: 0, bottom: 0, width: 2, background: '#e5e7eb', zIndex: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20, position: 'relative' }}>
            {/* Year + dot */}
            <div style={{ width: 60, flexShrink: 0, textAlign: 'right', paddingRight: 8 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: colors[ev.type] ?? '#374151', lineHeight: 1.2, marginTop: 2 }}>{ev.year}</div>
            </div>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: colors[ev.type] ?? '#374151', flexShrink: 0, marginTop: 2, zIndex: 1, border: '2px solid #fff', boxShadow: `0 0 0 2px ${colors[ev.type]}` }} />
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${colors[ev.type] ?? '#e5e7eb'}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginBottom: 4 }}>{ev.label}</div>
              <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{ev.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
        {[['#22c55e','Milestone'],['#dc2626','Accident'],['#9ca3af','Decline'],['#0ea5e9','Renaissance']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#6b7280' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />{label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hydrogen types grid ───────────────────────────────────────────────────────
function HydrogenTypes() {
  const types = [
    { name: 'Grey hydrogen',  color: '#9ca3af', bg: '#f3f4f6', emoji: '⬜', source: 'Steam methane reforming (SMR) of natural gas', co2: '~10 kg CO₂ per kg H₂', notes: 'Currently ~95% of global H₂ production. Cheap but high-emissions. CO₂ is vented directly to atmosphere.' },
    { name: 'Brown / Black',  color: '#78350f', bg: '#fef3c7', emoji: '🟫', source: 'Gasification of coal (brown) or lignite (black)', co2: '~20 kg CO₂ per kg H₂', notes: 'Most emissions-intensive H₂. Still produced in China and parts of Asia where coal is cheap.' },
    { name: 'Blue hydrogen',  color: '#1d4ed8', bg: '#eff6ff', emoji: '🔵', source: 'SMR + Carbon Capture and Storage (CCS)', co2: '1–4 kg CO₂ per kg H₂ (captured)', notes: 'Captures ~85–90% of CO₂ from grey H₂ production. Depends on CCS infrastructure maturity and capture rate. Sometimes seen as a transition solution.' },
    { name: 'Green hydrogen', color: '#15803d', bg: '#f0fdf4', emoji: '🟢', source: 'Electrolysis of water powered by renewable electricity', co2: '~0 kg CO₂ per kg H₂', notes: 'The long-term clean option. Currently 3–5× more expensive than grey H₂ but costs are falling rapidly as electrolyser manufacturing scales.' },
    { name: 'Pink hydrogen',  color: '#be185d', bg: '#fdf2f8', emoji: '🩷', source: 'Electrolysis powered by nuclear electricity', co2: '~0 kg CO₂ per kg H₂', notes: 'Low-carbon if nuclear source is included in scope. Cost depends on nuclear electricity price. France and others exploring this route.' },
    { name: 'Turquoise',     color: '#0f766e', bg: '#f0fdfa', emoji: '🩵', source: 'Methane pyrolysis — splits CH₄ into H₂ + solid carbon', co2: 'Near-zero if carbon is stored or used', notes: 'Produces solid carbon (charcoal) rather than CO₂ gas, making storage easier. Technology is early-stage but promising.' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
      {types.map(t => (
        <div key={t.name} style={{ background: t.bg, borderRadius: 10, padding: '14px 14px', border: `1px solid ${t.color}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <span style={{ fontSize: '1.1rem' }}>{t.emoji}</span>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: t.color }}>{t.name}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 5, lineHeight: 1.5 }}><strong>Source:</strong> {t.source}</div>
          <div style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 5 }}><strong>CO₂ intensity:</strong> {t.co2}</div>
          <div style={{ fontSize: '0.77rem', color: '#6b7280', lineHeight: 1.55 }}>{t.notes}</div>
        </div>
      ))}
    </div>
  );
}

// ── H₂ efficiency chain ───────────────────────────────────────────────────────
function H2EfficiencyChain() {
  const steps = [
    { label: 'Wind / Solar', sublabel: 'electricity generated', value: 100, emoji: '💨☀️', color: '#22c55e' },
    { label: 'Electrolysis', sublabel: '→ H₂  (~75% efficient)', value: 75, emoji: '⚡', color: '#0ea5e9', loss: '25% lost as heat' },
    { label: 'Haber-Bosch', sublabel: 'H₂ → NH₃  (~85% efficient)', value: 64, emoji: '🏭', color: '#8b5cf6', loss: '11% lost in conversion' },
    { label: 'Shipping', sublabel: 'refrigerated / pressurised', value: 60, emoji: '🚢', color: '#6b7280', loss: '~6% boil-off & energy' },
    { label: 'Cracking / reforming', sublabel: 'NH₃ → H₂  (~85% efficient)', value: 51, emoji: '🔬', color: '#f97316', loss: '9% lost in reconversion' },
    { label: 'Fuel cell / end use', sublabel: '→ electricity  (~60% efficient)', value: 31, emoji: '🔋', color: '#dc2626', loss: '20% lost in conversion' },
  ];

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Round-trip energy efficiency: Wind/Solar → H₂ → NH₃ → Back to electricity
      </div>
      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 20 }}>
        Compare with direct electricity (e.g. via battery or HVDC grid): ~90% round-trip efficiency
      </div>

      {/* Flow */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, marginBottom: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            {/* Energy bar */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <div style={{ width: 36, height: Math.max(step.value * 1.6, 16), background: step.color, borderRadius: 4, transition: 'height 0.3s' }} />
            </div>
            {/* Value */}
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '0.95rem', color: step.color }}>{step.value}%</div>
            {/* Arrow between */}
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute' }} />
            )}
          </div>
        ))}
      </div>

      {/* X labels */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', paddingTop: 4, borderTop: `2px solid ${step.color}` }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>{step.label}</div>
            <div style={{ fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.4 }}>{step.sublabel}</div>
            {step.loss && (
              <div style={{ fontSize: '0.65rem', color: '#dc2626', marginTop: 3, fontStyle: 'italic' }}>↗ {step.loss}</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
        <strong style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>Key takeaway: </strong>
        <span style={{ fontSize: '0.85rem', color: '#374151' }}>
          Starting with 100 units of renewable electricity, the full chain (wind → electrolysis → NH₃ → shipping → cracking → fuel cell) returns
          only <strong>~31 units</strong> as usable electricity. This is not an argument against green hydrogen — it is an argument for using it
          only where direct electrification is not possible (e.g. shipping fuels, industrial feedstocks, long-distance seasonal storage),
          and for using direct electricity where it is.
        </span>
      </div>
    </div>
  );
}

// ── H₂ existing infrastructure ────────────────────────────────────────────────
function H2Infrastructure() {
  const items = [
    { label: 'Rhine-Ruhr H₂ network',          who: 'Air Liquide / Linde',    detail: '~240 km of dedicated H₂ pipelines serving industrial users in Germany\'s Ruhr valley — the largest existing H₂ pipeline network in the world' },
    { label: 'Antwerp–Rotterdam industrial H₂', who: 'Air Liquide / INEOS',    detail: 'Pipeline connecting major petrochemical and refinery users in the Antwerp–Rotterdam port complex; Belgium is one of Europe\'s largest H₂ consumers today (for refining and chemical feedstocks)' },
    { label: 'Gulf Coast H₂ network',           who: 'Linde / Air Products',   detail: '~900 km across Louisiana and Texas, USA — the world\'s longest existing H₂ pipeline, supplying oil refineries along the Gulf of Mexico' },
    { label: 'EU H₂ Backbone (planned)',         who: 'European TSOs',          detail: '53,000 km network planned by 2040, of which ~69% would be repurposed natural gas pipelines; connects North Sea and North African renewable H₂ production with Central European industrial demand' },
    { label: 'Hydrogen Import Coalition',        who: 'Netherlands / Germany',  detail: 'Joint initiative to import green H₂ / NH₃ from Morocco, Chile, Namibia and Australia via Rotterdam and Hamburg — first large-scale imports expected 2026–2028' },
  ];

  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#14532d', marginBottom: 12 }}>🗺️ Where H₂ infrastructure already exists (or is being built)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', gap: 10, fontSize: '0.85rem', lineHeight: 1.65 }}>
            <span style={{ color: '#15803d', fontWeight: 700, flexShrink: 0 }}>▸</span>
            <span>
              <strong style={{ color: '#1a1a1a' }}>{item.label}</strong>
              <span style={{ color: '#6b7280' }}> ({item.who})</span>
              {': ' + item.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function GlobalEnergySystemPage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">← Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>🌡️  Climate &amp; Energy</p>
            <h1 className="detail-title">Our Global Energy System</h1>
            <p style={{ color: '#b0b0b0', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              Energy powers civilisation — and controls it. Who produces it, how it moves, and who can block it shapes geopolitics, economies and the climate.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/energy-system.jpg" alt="Global energy system" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Scale */}
          <SectionCard id="scale">
            <SectionTitle>The scale of the global energy system</SectionTitle>
            <Para>
              The world consumes roughly <strong>620 exajoules of primary energy per year</strong> — a number so large it is almost impossible to intuit. It is equivalent to burning 145 billion barrels of oil, or running 75,000 nuclear power plants, or covering France 200 times over with solar panels. Despite three decades of renewable growth, approximately <strong>80% of this energy still comes from oil, gas and coal</strong>.
            </Para>
            <Para>
              Energy is not just a physical resource — it is the foundation of economic and political power. Countries that produce it set prices, wield influence and derive enormous rents. Countries that import it are vulnerable to supply disruptions, price shocks and geopolitical coercion. The 1973 Arab oil embargo, the 1979 Iranian Revolution, Russia's 2022 weaponisation of gas supplies to Europe, and ongoing tensions around the Strait of Hormuz all illustrate the same underlying truth: <strong>energy supply is foreign policy</strong>.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              Understanding the global energy system — where energy comes from, how it travels, where it can be disrupted, and where it is going — is essential context for understanding climate policy, geopolitical risk, and the logic of the renewable transition.
            </Para>
          </SectionCard>

          {/* 2 — Chokepoints */}
          <SectionCard id="chokepoints">
            <SectionTitle>How energy moves — and where it can be blocked</SectionTitle>
            <Para>
              Most of the world's fossil fuels are produced far from where they are consumed. Saudi oil reaches European refineries. Australian coal heats Chinese steel plants. US liquefied natural gas powers Japanese electricity. This trade flows primarily by sea — through a handful of narrow straits and canals where an accident, a conflict or a political decision can halt a significant fraction of global energy supply simultaneously.
            </Para>

            {/* EIA map */}
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Daily transit volumes through world maritime oil chokepoints (million barrels/day)
              </div>
              <img
                src="/images/learn/chokepoints-eia.png"
                alt="World maritime oil chokepoints map — EIA"
                style={{ width: '100%', borderRadius: 8, display: 'block', marginBottom: 6 }}
              />
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
                Source: U.S. Energy Information Administration (EIA), based on Lloyd&apos;s List Intelligence, Panama Canal Authority, Eastern Bloc Research, Suez Canal Authority and UNCTAD data.
                Volumes based on 2013 EIA data; current throughput is higher across all chokepoints — Hormuz now handles ~20–21 mb/day — but relative importance is unchanged.
              </p>
            </div>

            <ChokepointCards />

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginTop: 4 }}>
              <Para style={{ marginBottom: 0 }}>
                <strong>The structural lesson:</strong> the concentration of energy flows through a small number of chokepoints means that a disruption to even one of them can propagate price shocks and supply shortages globally within weeks. This is not a marginal risk — it is a design flaw of the fossil fuel system that domestic renewable energy production fundamentally eliminates.
              </Para>
            </div>
          </SectionCard>

          {/* 3 — Fossil fuels */}
          <SectionCard id="fossil">
            <SectionTitle>Fossil fuels — the incumbent system</SectionTitle>
            <Para>
              Oil, gas and coal together supply ~80% of global primary energy and underpin virtually every economy on Earth. Their dominance is not accidental: fossil fuels are energy-dense, relatively easy to store and transport, and the infrastructure to use them — engines, pipelines, refineries, power plants — represents trillions of dollars of sunk investment.
            </Para>

            <Para><strong>Oil</strong></Para>
            <Para>
              Global oil production is approximately 100 million barrels per day. OPEC+ (the Organisation of Petroleum Exporting Countries plus Russia and others) controls roughly <strong>60% of global production</strong> and uses coordinated production quotas to influence price. Saudi Arabia holds the largest spare production capacity and acts as the system's de facto swing producer. Oil prices are set on futures markets but ultimately bounded by OPEC+ decisions — making them inherently political rather than purely market-driven.
            </Para>
            <Para>
              The US shale revolution (2010s) transformed the geopolitics of oil by turning the United States from the world's largest importer to a major exporter — reducing OPEC pricing power and creating a third major pole alongside the Middle East and Russia. However, shale production is expensive and decline rates are high, requiring constant new drilling to maintain output.
            </Para>

            <Para style={{ marginTop: 4 }}><strong>Natural gas</strong></Para>
            <Para>
              Gas is more geographically concentrated than oil and historically harder to trade (pipelines are immovable; LNG terminals require large capital investment). This created deep dependencies: Europe built gas infrastructure predicated on Russian supply for decades, a vulnerability ruthlessly exposed when Russia reduced and then cut gas flows following its 2022 invasion of Ukraine.
            </Para>
            <Para>
              The LNG revolution — liquefying gas for tanker transport at -162°C — has partially globalised the gas market. The US became the world's largest LNG exporter in 2023. But LNG infrastructure takes years to build, and spot LNG prices can spike violently during supply disruptions — as European gas prices demonstrated in 2022 (10× their pre-2021 levels at peak).
            </Para>

            <Para style={{ marginTop: 4 }}><strong>Coal</strong></Para>
            <Para style={{ marginBottom: 0 }}>
              Coal is declining in Europe and North America but still growing in Asia. India and China together consume more than two-thirds of global coal, primarily for electricity generation and steel production. Coal is the most carbon-intensive fossil fuel per unit of energy, and its continued use is the largest single driver of current CO₂ emissions growth in developing economies.
            </Para>
          </SectionCard>

          {/* 4 — Nuclear */}
          <SectionCard id="nuclear">
            <SectionTitle>Nuclear energy — decline and renaissance</SectionTitle>
            <Para>
              Nuclear power generates approximately <strong>10% of global electricity</strong> from around 440 operating reactors in 32 countries. It is a low-carbon, high-density baseload energy source — one kilogram of uranium fuel contains roughly 2–3 million times more energy than a kilogram of coal. Understanding its history requires holding two things simultaneously: the genuine accidents that shaped public perception, and the statistical reality that nuclear power has one of the lowest death rates per unit of energy of any source.
            </Para>

            <NuclearTimeline />

            <Para style={{ marginTop: 8 }}>
              <strong>Arguments for nuclear:</strong> low lifecycle CO₂ emissions (~12 g CO₂/kWh, comparable to wind); high capacity factor (runs ~90% of the time, unlike variable renewables); small land footprint; energy independence from imported fuels; proven at scale; new designs (SMRs, Gen IV) promise faster construction and passive safety.
            </Para>
            <Para>
              <strong>Arguments against:</strong> high upfront capital cost and long construction times (UK's Hinkley Point C: £35+ billion, 17+ years); unresolved long-term waste storage (Onkalo in Finland is the world's first permanent geological repository, opening in the 2020s — the only country to have solved this); proliferation risk; public opposition; insurance liability requires state backing; decommissioning costs are large and often underestimated.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The current reassessment is pragmatic rather than ideological. With the urgency of decarbonisation and the intermittency challenge of renewables becoming more visible, several countries that had planned to exit nuclear are reversing course. Belgium&apos;s decision to extend Doel 4 and Tihange 3 by ten years — reversing its own phase-out law — reflects this recalculation. What is clear is that the debate has shifted from &quot;nuclear vs renewables&quot; to &quot;how much of each in what combination?&quot;
            </Para>
          </SectionCard>

          {/* 5 — Renewables */}
          <SectionCard id="renewables">
            <SectionTitle>Renewables — a fundamentally different paradigm</SectionTitle>
            <Para>
              Solar and wind are now the cheapest sources of new electricity generation in history. Costs have fallen by over 90% since 2010. In 2023, renewables accounted for <strong>30% of global electricity generation</strong> — a proportion that is rising rapidly. For a fuller treatment of how renewable technologies work and their current status, see the{' '}
              <Link href="/learn/climate-energy/renewables-the-basics" style={{ color: TOPIC_COLOR, fontWeight: 600 }}>Renewables: The Basics</Link> article.
            </Para>
            <Para>
              What is important to establish here is the <em>systemic difference</em> between renewable energy and fossil fuels — beyond emissions:
            </Para>
            <BulletList items={[
              { bold: 'No chokepoints', text: 'sunlight and wind cannot be embargoed, blockaded or priced by a cartel. A country with renewable capacity is energy-independent in a way that no fossil-fuel importer can be.' },
              { bold: 'Decentralised production', text: 'unlike oil wells or LNG terminals that concentrate economic and political power in the hands of producers, renewable energy can be generated at the household, community, municipal or national level. This fundamentally redistributes the economics of energy.' },
              { bold: 'Price stability', text: 'once built, renewable plants have near-zero marginal fuel cost. This buffers consumers from the commodity price spikes that fossil fuels routinely generate.' },
              { bold: 'New dependencies: critical raw materials', text: 'solar panels, wind turbines and batteries require lithium, cobalt, neodymium and other critical minerals — creating a new form of supply concentration risk, especially from China. This is explored in the ' },
            ]} />
            <div style={{ marginLeft: 20, marginTop: -4, marginBottom: 12 }}>
              <Link href="/learn/circularity-waste/critical-raw-materials" style={{ color: TOPIC_COLOR, fontWeight: 600, fontSize: '0.9rem' }}>
                → Critical Raw Materials article
              </Link>
            </div>
            <Para style={{ marginBottom: 0 }}>
              The central challenge of a renewable-dominant energy system is <strong>matching supply and demand in time</strong>. Wind and solar generate when conditions allow, not necessarily when demand peaks. This requires storage (batteries, pumped hydro), demand flexibility, grid interconnection and — for longer timescales and harder-to-electrify sectors — energy carriers like hydrogen.
            </Para>
          </SectionCard>

          {/* 6 — Hydrogen */}
          <SectionCard id="hydrogen">
            <SectionTitle>The hydrogen economy — promise, limits and current reality</SectionTitle>
            <Para>
              Hydrogen (H₂) is the most abundant element in the universe and carries a lot of energy per kilogram (~120 MJ/kg, roughly three times more than diesel by weight). It produces only water when burned or used in a fuel cell. On paper, it looks like the perfect clean fuel. In practice, it is more complicated.
            </Para>
            <Para>
              The critical issue is that hydrogen is not a primary energy source — it is an <em>energy carrier</em>. It must be produced from something else, which costs energy. Today, virtually all of it is produced from fossil fuels. This is why the colour coding below matters enormously.
            </Para>

            <HydrogenTypes />

            <Para>
              <strong>Green hydrogen is the destination</strong> — produced by splitting water through electrolysis using renewable electricity, with no CO₂ emissions. Costs have fallen dramatically (from ~$6–7/kg in 2020 to ~$3–5/kg in 2024) and are expected to fall further to $1–2/kg by 2030 in favourable locations (high wind/solar capacity factors, cheap electricity). At that price point, green H₂ becomes competitive with blue H₂ in most applications.
            </Para>

            <Para><strong>What is hydrogen actually for?</strong></Para>
            <BulletList items={[
              { bold: 'Industrial feedstock', text: 'already the dominant use today. Steel (replacing coking coal in direct reduction), ammonia / fertilisers (Haber-Bosch), methanol, and chemical refining all require large quantities of hydrogen. These are hard-to-electrify applications where green H₂ has a clear role.' },
              { bold: 'Long-haul heavy transport', text: 'shipping, aviation and long-distance trucking where battery weight and recharging time make electrification impractical. H₂ fuel cells or H₂-based synthetic fuels (e-methanol, e-ammonia, e-kerosene) are the main contenders for decarbonising these sectors.' },
              { bold: 'Seasonal energy storage', text: 'surplus renewable electricity in summer can be converted to H₂ and stored for winter use — addressing the multi-month storage gap that batteries cannot economically fill at scale.' },
              { bold: 'Grid balancing', text: 'in a high-renewables grid, H₂ electrolysers can act as flexible loads — running when power is cheap and abundant, pausing when demand peaks.' },
            ]} />

            <Para style={{ marginTop: 8 }}><strong>The challenge of transport: energy carriers</strong></Para>
            <Para>
              Hydrogen is difficult to transport. It has very low volumetric energy density — even compressed to 700 bar or liquefied at -253°C, a hydrogen tank stores far less energy per litre than diesel. This has led to interest in converting H₂ into other carriers for long-distance trade:
            </Para>
            <BulletList items={[
              { bold: 'Ammonia (NH₃)', text: 'produced via Haber-Bosch, liquid at -33°C (manageable) or moderate pressure. Already traded globally at scale for fertilisers. Can be cracked back to H₂ at destination or used directly as a marine fuel. Morocco, Chile, Namibia and Australia are developing large-scale green ammonia export projects.' },
              { bold: 'Liquid organic hydrogen carriers (LOHCs)', text: 'hydrogen is chemically bonded to an organic liquid (e.g. dibenzyltoluene) for transport at ambient conditions, then released by heating at destination. Lower energy density than ammonia but easier handling. Japan is pioneering LOHC imports from Brunei.' },
              { bold: 'Liquid H₂', text: 'requires -253°C, extremely energy-intensive to produce and maintain. Primarily used in aerospace. Japan and Australia have a pilot LH₂ carrier project (Suiso Frontier).' },
            ]} />

            <H2EfficiencyChain />

            <Para><strong>Where H₂ pipelines already exist</strong></Para>
            <H2Infrastructure />

            <Para style={{ marginBottom: 0 }}>
              The honest summary: green hydrogen is an essential tool for decarbonising the ~20% of the energy system that cannot easily be electrified directly — industry, long-haul transport, seasonal storage. It is <em>not</em> a substitute for direct electrification in sectors where that is feasible (cars, heating, short-haul transport), because the efficiency losses in the conversion chain are simply too large. The two paths — electrification and green H₂ — are complements, not competitors.
            </Para>
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'IEA — World Energy Outlook 2023 (global energy flows, scenarios)', url: 'https://www.iea.org/reports/world-energy-outlook-2023' },
                { label: 'IEA — Net Zero by 2050 (pathway and critical technologies)', url: 'https://www.iea.org/reports/net-zero-by-2050' },
                { label: 'EIA — World Oil Transit Chokepoints (2017, updated)', url: 'https://www.eia.gov/todayinenergy/detail.php?id=18991' },
                { label: 'IEA — Global Hydrogen Review 2023', url: 'https://www.iea.org/reports/global-hydrogen-review-2023' },
                { label: 'IPCC — Energy supply chapter (AR6, Working Group III, 2022)', url: 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-6/' },
                { label: 'Our World in Data — Energy production and consumption', url: 'https://ourworldindata.org/energy' },
                { label: 'Our World in Data — Nuclear energy (safety, capacity, history)', url: 'https://ourworldindata.org/nuclear-energy' },
                { label: 'Hydrogen Council — Hydrogen Insights 2024', url: 'https://hydrogencouncil.com/en/hydrogen-insights-2024/' },
                { label: 'European Hydrogen Backbone — infrastructure roadmap', url: 'https://ehb.eu/page/european-hydrogen-backbone-maps' },
                { label: 'BloombergNEF — New Energy Outlook 2023 (energy transition scenarios)', url: 'https://about.bnef.com/new-energy-outlook/' },
                { label: 'Ember — Global Electricity Review 2024', url: 'https://ember-energy.org/latest-insights/global-electricity-review-2024/' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.85rem', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                >
                  <span style={{ color: TOPIC_COLOR, fontWeight: 700, fontSize: '0.75rem' }}>↗</span>
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
