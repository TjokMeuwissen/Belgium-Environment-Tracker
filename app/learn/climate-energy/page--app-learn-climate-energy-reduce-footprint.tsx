'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Cell, LabelList, Tooltip,
} from 'recharts';

const TOPIC_COLOR = '#f97316';
const PARIS_TARGET = 2.3;

// ── Baseline data (UCLouvain 2019) ────────────────────────────────────────────
const BASELINE = [
  { key: 'housing',   label: 'Housing',   value: 4.93, color: '#dc2626' },
  { key: 'equipment', label: 'Equipment', value: 3.66, color: '#f97316' },
  { key: 'transport', label: 'Transport', value: 3.12, color: '#eab308' },
  { key: 'food',      label: 'Food',      value: 2.35, color: '#22c55e' },
  { key: 'services',  label: 'Services',  value: 1.63, color: '#06b6d4' },
];
const BASELINE_TOTAL = BASELINE.reduce((s, c) => s + c.value, 0); // 15.69

// ── Lifestyle options ─────────────────────────────────────────────────────────
const DIET_OPTIONS = [
  { key: 'omnivore',    label: 'Omnivore',    delta: 0    },
  { key: 'reduce_meat', label: 'Reduce red meat', delta: -0.5 },
  { key: 'vegetarian',  label: 'Vegetarian',  delta: -0.8 },
  { key: 'vegan',       label: 'Vegan',       delta: -1.2 },
];

const TRANSPORT_OPTIONS = [
  { key: 'petrol',   label: 'Petrol car', delta: 0    },
  { key: 'electric', label: 'Electric car', delta: -1.4 },
  { key: 'no_car',   label: 'No car',     delta: -1.9 },
];

const CHECKBOX_OPTIONS = [
  { key: 'heat_pump',   label: 'Switch gas boiler to heat pump',        delta: -1.2, category: 'housing'   },
  { key: 'solar',       label: 'Install solar panels (3 kWp)',           delta: -0.7, category: 'housing'   },
  { key: 'insulation',  label: 'Improve home insulation',                delta: -0.6, category: 'housing'   },
  { key: 'secondhand',  label: 'Buy second-hand & extend product lifetimes', delta: -0.9, category: 'equipment' },
];

// ── Flight chart data (return flight, RFI ×2) ─────────────────────────────────
const FLIGHT_DATA = [
  { name: 'Short-haul', sub: '< 1,500 km', example: 'e.g. Brussels–Barcelona', value: 0.7,  color: '#f97316' },
  { name: 'Medium-haul',sub: '1,500–4,000 km', example: 'e.g. Brussels–Marrakech', value: 1.5, color: '#dc2626' },
  { name: 'Long-haul',  sub: '> 4,000 km', example: 'e.g. Brussels–New York', value: 3.5,  color: '#7f1d1d' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',      label: 'Your footprint in context' },
  { id: 'calculator', label: 'Lifestyle calculator'      },
  { id: 'flights',    label: 'The impact of flying'      },
  { id: 'sources',    label: 'Sources & methodology'     },
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

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {[
        { value: '15.7 tCO\u2082eq', label: 'Belgian average footprint', sub: 'Per person per year (UCLouvain, 2019)', color: '#dc2626' },
        { value: '2.3 tCO\u2082eq',  label: 'Paris 2030 target',         sub: 'Per person per year to stay within 1.5\u00b0C', color: TOPIC_COLOR },
        { value: '6.8\u00d7',         label: 'above the Paris target',    sub: 'The scale of reduction needed is dramatic', color: '#7f1d1d' },
      ].map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginTop: 6 }}>{f.label}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Single adaptive stacked bar ───────────────────────────────────────────────
function FootprintBar({ categories, total }: {
  categories: { key: string; label: string; value: number; color: string }[];
  total: number;
}) {
  const MAX = 16;
  const parisPct = (PARIS_TARGET / MAX) * 100;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ height: 36, borderRadius: 6, overflow: 'hidden', display: 'flex', background: '#f3f4f6' }}>
            {categories.map(c => (
              c.value > 0 ? (
                <div key={c.key}
                  title={`${c.label}: ${c.value.toFixed(2)} tCO\u2082eq`}
                  style={{ width: `${(c.value / MAX) * 100}%`, background: c.color, transition: 'width 0.4s ease', flexShrink: 0 }}
                />
              ) : null
            ))}
          </div>
          {/* Paris line */}
          <div style={{ position: 'absolute', top: -4, bottom: -4, left: `${parisPct}%`, borderLeft: '2px dashed #16a34a', zIndex: 2 }} />
        </div>
        <div style={{ minWidth: 60, textAlign: 'right' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.3rem', fontWeight: 900, color: total > PARIS_TARGET ? '#dc2626' : '#16a34a' }}>
            {total.toFixed(1)} t
          </span>
        </div>
      </div>

      {/* Paris label */}
      <div style={{ position: 'relative', height: 16, marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: `${parisPct}%`, fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, paddingLeft: 4, whiteSpace: 'nowrap' }}>
          &#x25C6; Paris 2030 target (2.3 t)
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {BASELINE.map(c => (
          <span key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#374151' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Radio group ───────────────────────────────────────────────────────────────
function RadioGroup({ title, options, value, onChange }: {
  title: string;
  options: { key: string; label: string; delta: number }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(o => {
          const active = value === o.key;
          return (
            <button key={o.key} onClick={() => onChange(o.key)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: active ? 700 : 500,
              border: `1.5px solid ${active ? TOPIC_COLOR : '#e5e7eb'}`,
              background: active ? TOPIC_COLOR : '#fff',
              color: active ? '#fff' : '#374151',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Checkbox group ────────────────────────────────────────────────────────────
function CheckboxGroup({ title, options, values, onChange }: {
  title: string;
  options: { key: string; label: string; delta: number }[];
  values: Set<string>;
  onChange: (k: string) => void;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map(o => {
          const active = values.has(o.key);
          return (
            <button key={o.key} onClick={() => onChange(o.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
              border: `1.5px solid ${active ? TOPIC_COLOR : '#e5e7eb'}`,
              background: active ? '#fff7ed' : '#fff',
              color: '#374151', cursor: 'pointer', fontSize: '0.82rem',
              fontWeight: active ? 600 : 400, textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4, border: `2px solid ${active ? TOPIC_COLOR : '#d1d5db'}`,
                background: active ? TOPIC_COLOR : '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && <span style={{ color: '#fff', fontSize: 10, fontWeight: 900 }}>&#x2713;</span>}
              </span>
              {o.label}
              <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                {o.delta.toFixed(1)} t
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Flight bar chart (static) ─────────────────────────────────────────────────
const CustomFlightTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{d?.name} <span style={{ fontWeight: 400, color: '#6b7280' }}>{d?.sub}</span></p>
      <p style={{ color: '#dc2626', marginBottom: 2 }}>{d?.value} tCO&#x2082;eq per return flight</p>
      <p style={{ color: '#9ca3af', fontSize: 11 }}>{d?.example}</p>
    </div>
  );
};

function FlightChart() {
  return (
    <div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={FLIGHT_DATA} layout="vertical" margin={{ top: 16, right: 80, left: 8, bottom: 8 }}>
            <XAxis type="number" domain={[0, 4.5]} tick={{ fontSize: 10, fill: '#4b5563' }} tickLine={false} axisLine={false}
              label={{ value: 'tCO\u2082eq per return flight (incl. RFI \u00d72)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#4b5563' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} width={100} />
            <Tooltip content={<CustomFlightTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <ReferenceLine x={PARIS_TARGET} stroke="#16a34a" strokeDasharray="5 4" strokeWidth={2}
              label={{ value: 'Paris 2030 target', position: 'top', fontSize: 10, fill: '#16a34a', fontWeight: 700 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {FLIGHT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              <LabelList dataKey="value" position="right" formatter={(v: number) => `${v} t`}
                style={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 4 }}>
        Values include a radiative forcing multiplier of &#xd7;2, as recommended by agencies including ADEME, to account for the warming effect of contrails and other non-CO&#x2082; emissions at cruise altitude. Assumes economy class, return trip from Brussels.
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReduceFootprintPage() {
  const [diet, setDiet]           = useState('omnivore');
  const [transport, setTransport] = useState('petrol');
  const [checks, setChecks]       = useState<Set<string>>(new Set());

  const toggleCheck = (k: string) => setChecks(prev => {
    const next = new Set(prev);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  });

  const dietDelta      = DIET_OPTIONS.find(o => o.key === diet)?.delta ?? 0;
  const transportDelta = TRANSPORT_OPTIONS.find(o => o.key === transport)?.delta ?? 0;
  const checkDelta     = CHECKBOX_OPTIONS.filter(o => checks.has(o.key)).reduce((s, o) => s + o.delta, 0);
  const totalDelta     = dietDelta + transportDelta + checkDelta;
  const newTotal       = Math.max(0, BASELINE_TOTAL + totalDelta);
  const saving         = BASELINE_TOTAL - newTotal;
  const gapToTarget    = newTotal - PARIS_TARGET;

  const adjustedCategories = BASELINE.map(c => {
    let v = c.value;
    if (c.key === 'food')      v = Math.max(0, c.value + dietDelta);
    if (c.key === 'transport') v = Math.max(0, c.value + transportDelta);
    if (c.key === 'housing')   v = Math.max(0, c.value + CHECKBOX_OPTIONS.filter(o => checks.has(o.key) && o.category === 'housing').reduce((s, o) => s + o.delta, 0));
    if (c.key === 'equipment') v = Math.max(0, c.value + CHECKBOX_OPTIONS.filter(o => checks.has(o.key) && o.category === 'equipment').reduce((s, o) => s + o.delta, 0));
    return { ...c, value: v };
  });

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F321;&#xFE0F;  Climate &amp; Energy</p>
            <h1 className="detail-title">How to Reduce Your Carbon Footprint</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/tips.jpg" alt="Reduce your carbon footprint" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>Your footprint in context</SectionTitle>
            <Para>
              The average Belgian&apos;s consumption-based carbon footprint is approximately{' '}
              <strong>15.7 tCO&#x2082;eq per person per year</strong> — nearly seven times higher than the
              Paris-compatible budget of 2.3 tCO&#x2082;eq needed by 2030 to limit warming to 1.5&#x00B0;C.
              This footprint is spread across five major categories: housing (the largest contributor at 4.9 t),
              equipment (3.7 t), transport (3.1 t), food (2.4 t), and public and commercial services (1.6 t).
            </Para>
            <Para>
              Not all of these categories are equally within your control. Services such as public
              infrastructure, healthcare and education are largely fixed regardless of individual behaviour.
              But housing, transport, food and equipment together account for over{' '}
              <strong>75% of the footprint</strong> and each offers meaningful levers for reduction.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The calculator below shows how major lifestyle changes shift your estimated footprint,
              using the UCLouvain (2019) Belgian baseline and reduction estimates consistent
              with the ADEME Bilan Carbone&#xAE; methodology.
            </Para>
          </SectionCard>

          {/* 2 — Calculator */}
          <SectionCard id="calculator">
            <SectionTitle>Lifestyle calculator</SectionTitle>

            <FootprintBar categories={adjustedCategories} total={newTotal} />

            {/* Summary pill */}
            {totalDelta !== 0 && (
              <div style={{
                background: gapToTarget > 0 ? '#fffbeb' : '#f0fdf4',
                border: `1.5px solid ${gapToTarget > 0 ? '#fde68a' : '#bbf7d0'}`,
                borderRadius: 8, padding: '10px 14px', marginBottom: 20,
              }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, margin: 0, color: gapToTarget > 0 ? '#92400e' : '#065f46' }}>
                  {saving > 0 && <>&#x2713; Your choices save an estimated <strong>{saving.toFixed(1)} tCO&#x2082;eq/year</strong>. </>}
                  {gapToTarget > 0
                    ? <>Still <strong>{gapToTarget.toFixed(1)} t</strong> above the Paris 2030 target — systemic change is also required.</>
                    : <>&#x1F389; Your estimated footprint is at or below the Paris 2030 target!</>}
                </p>
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <RadioGroup title="&#x1F957; Diet" options={DIET_OPTIONS} value={diet} onChange={setDiet} />
                <RadioGroup title="&#x1F697; Transport" options={TRANSPORT_OPTIONS} value={transport} onChange={setTransport} />
              </div>
              <div>
                <CheckboxGroup
                  title="&#x1F3E0; Housing &amp; Equipment"
                  options={CHECKBOX_OPTIONS}
                  values={checks}
                  onChange={toggleCheck}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 8, marginBottom: 0 }}>
              Indicative estimates for an average Belgian household based on UCLouvain (2019) and ADEME methodology.
              Individual circumstances vary. Flying is shown separately below.
            </p>
          </SectionCard>

          {/* 3 — Flights (static chart) */}
          <SectionCard id="flights">
            <SectionTitle>The impact of flying</SectionTitle>
            <Para>
              Flying is one of the most carbon-intensive individual activities. A single long-haul
              return flight can equal or exceed the <em>entire annual Paris-compatible carbon budget</em> of
              2.3 tCO&#x2082;eq per person — illustrated by the dotted green line in the chart below.
            </Para>
            <Para>
              Short-haul flights are less impactful per trip, but remain significant: a return flight
              to Barcelona already represents almost a third of the Paris annual budget.
            </Para>
            <FlightChart />
          </SectionCard>

          {/* 4 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; methodology</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'UCLouvain (2021) — Belgian carbon footprint baseline (15.69 tCO₂eq, 2019)', url: 'https://dial.uclouvain.be/memoire/ucl/en/object/thesis:46878' },
                { label: 'ADEME Base Empreinte® — Emission factors (Bilan Carbone® methodology)', url: 'https://base-empreinte.ademe.fr' },
                { label: 'Plateforme Wallonne pour le GIEC — Belgian lifestyle footprint context', url: 'https://plateforme-wallonne-giec.be/Lettre9.pdf' },
                { label: 'ICCT (2025) — EV lifecycle emissions, EU context', url: 'https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/' },
                { label: 'Scarborough et al. (2023) — Diet and carbon footprint, Oxford', url: 'https://www.nature.com/articles/s43016-023-00795-w' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.85rem', fontWeight: 500 }}
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
