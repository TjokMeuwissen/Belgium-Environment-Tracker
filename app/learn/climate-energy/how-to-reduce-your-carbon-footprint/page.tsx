'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const TOPIC_COLOR = '#f97316';
const PARIS_TARGET = 2.3;

// ── Baseline data (UCLouvain 2019) ────────────────────────────────────────────
const BASELINE = [
  { key: 'housing',   label: 'Housing',    value: 4.93, color: '#dc2626' },
  { key: 'equipment', label: 'Equipment',  value: 3.66, color: '#f97316' },
  { key: 'transport', label: 'Transport',  value: 3.12, color: '#eab308' },
  { key: 'food',      label: 'Food',       value: 2.35, color: '#22c55e' },
  { key: 'services',  label: 'Services',   value: 1.63, color: '#06b6d4' },
];
const BASELINE_TOTAL = BASELINE.reduce((s, c) => s + c.value, 0); // 15.69

// ── Lifestyle reduction deltas ────────────────────────────────────────────────
const DIET_OPTIONS = [
  { key: 'omnivore',       label: 'Omnivore (baseline)', delta: 0    },
  { key: 'reduce_meat',    label: 'Reduce red meat',     delta: -0.5 },
  { key: 'vegetarian',     label: 'Vegetarian',          delta: -0.8 },
  { key: 'vegan',          label: 'Vegan',               delta: -1.2 },
];

const TRANSPORT_OPTIONS = [
  { key: 'petrol',    label: 'Petrol car (baseline)', delta: 0    },
  { key: 'electric',  label: 'Electric car',          delta: -1.4 },
  { key: 'no_car',    label: 'No car',                delta: -1.9 },
];

const HOUSING_OPTIONS = [
  { key: 'heat_pump',  label: 'Switch gas boiler to heat pump', delta: -1.2 },
  { key: 'solar',      label: 'Install solar panels (3 kWp)',   delta: -0.7 },
  { key: 'insulation', label: 'Improve home insulation',        delta: -0.6 },
];

// ── Flight data (with RFI multiplier ×2, per return flight) ──────────────────
const FLIGHT_TYPES = [
  { key: 'short',  label: 'Short-haul',  sublabel: '< 1,500 km', example: 'e.g. Brussels–Barcelona', tco2: 0.7,  color: '#f97316' },
  { key: 'medium', label: 'Medium-haul', sublabel: '1,500–4,000 km', example: 'e.g. Brussels–Marrakech', tco2: 1.5, color: '#dc2626' },
  { key: 'long',   label: 'Long-haul',   sublabel: '> 4,000 km', example: 'e.g. Brussels–New York', tco2: 3.5,  color: '#7f1d1d' },
];

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',      label: 'Your footprint in context' },
  { id: 'calculator', label: 'Lifestyle calculator'      },
  { id: 'flights',    label: 'The impact of flying'      },
  { id: 'sources',    label: 'Sources & methodology'     },
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

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {[
        { value: '15.7 tCO₂eq', label: 'Belgian average footprint', sub: 'Per person per year (UCLouvain, 2019)', color: '#dc2626' },
        { value: '2.3 tCO₂eq',  label: 'Paris 2030 target',         sub: 'Per person per year to stay within 1.5°C', color: TOPIC_COLOR },
        { value: '6.8×',         label: 'above the Paris target',    sub: 'The reduction needed is dramatic', color: '#7f1d1d' },
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

// ── Stacked bar ───────────────────────────────────────────────────────────────
function StackedBar({ categories, total, label, showParis }: {
  categories: { key: string; label: string; value: number; color: string }[];
  total: number;
  label: string;
  showParis?: boolean;
}) {
  const max = 16;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', width: 90, flexShrink: 0 }}>{label}</span>
        <div style={{ flex: 1, height: 28, borderRadius: 4, overflow: 'hidden', display: 'flex', background: '#f3f4f6' }}>
          {categories.map(c => (
            c.value > 0 ? (
              <div key={c.key} title={`${c.label}: ${c.value.toFixed(2)} tCO₂eq`}
                style={{ width: `${(c.value / max) * 100}%`, background: c.color, transition: 'width 0.4s ease', flexShrink: 0 }} />
            ) : null
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: total > PARIS_TARGET ? '#dc2626' : '#16a34a', width: 54, textAlign: 'right', flexShrink: 0 }}>
          {total.toFixed(1)} t
        </span>
      </div>
      {showParis && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 90, flexShrink: 0 }} />
          <div style={{ flex: 1, position: 'relative', height: 16 }}>
            <div style={{ position: 'absolute', left: `${(PARIS_TARGET / max) * 100}%`, top: 0, bottom: 0, borderLeft: '2px dashed #16a34a', transform: 'translateX(-1px)' }} />
            <span style={{ position: 'absolute', left: `${(PARIS_TARGET / max) * 100}%`, top: 1, fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, paddingLeft: 4, whiteSpace: 'nowrap' }}>
              Paris 2030 target (2.3 t)
            </span>
          </div>
          <span style={{ width: 54 }} />
        </div>
      )}
    </div>
  );
}

// ── Category legend ───────────────────────────────────────────────────────────
function CategoryLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
      {BASELINE.map(c => (
        <span key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#374151' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
          {c.label}
        </span>
      ))}
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
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(o => {
          const active = value === o.key;
          return (
            <button key={o.key} onClick={() => onChange(o.key)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: active ? 700 : 500,
              border: `1.5px solid ${active ? TOPIC_COLOR : '#e5e7eb'}`,
              background: active ? TOPIC_COLOR : '#fff',
              color: active ? '#fff' : '#374151',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {o.label}
              {o.delta < 0 && <span style={{ marginLeft: 5, opacity: 0.85, fontSize: '0.72rem' }}>{o.delta.toFixed(1)} t</span>}
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
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map(o => {
          const active = values.has(o.key);
          return (
            <button key={o.key} onClick={() => onChange(o.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8,
              border: `1.5px solid ${active ? TOPIC_COLOR : '#e5e7eb'}`,
              background: active ? '#fff7ed' : '#fff',
              color: '#374151', cursor: 'pointer', fontSize: '0.82rem', fontWeight: active ? 600 : 400,
              textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4, border: `2px solid ${active ? TOPIC_COLOR : '#d1d5db'}`,
                background: active ? TOPIC_COLOR : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && <span style={{ color: '#fff', fontSize: 10, fontWeight: 900 }}>✓</span>}
              </span>
              {o.label}
              <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>{o.delta.toFixed(1)} t</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Flight counter ────────────────────────────────────────────────────────────
function FlightCounter({ type, count, onChange }: {
  type: typeof FLIGHT_TYPES[0];
  count: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a' }}>{type.label} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#6b7280' }}>{type.sublabel}</span></div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 1 }}>{type.example} · {type.tco2} tCO₂eq per return flight (incl. RFI ×2)</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={() => onChange(Math.max(0, count - 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1a1a', minWidth: 20, textAlign: 'center' }}>{count}</span>
        <button onClick={() => onChange(Math.min(10, count + 1))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
      <div style={{ minWidth: 56, textAlign: 'right', fontWeight: 800, fontSize: '0.88rem', color: count > 0 ? type.color : '#9ca3af' }}>
        {(count * type.tco2).toFixed(1)} t
      </div>
    </div>
  );
}

// ── Flight bar chart ──────────────────────────────────────────────────────────
function FlightBar({ total }: { total: number }) {
  const max = Math.max(total + 1, PARIS_TARGET + 0.5, 5);
  const parisPct = (PARIS_TARGET / max) * 100;
  const totalPct = Math.min((total / max) * 100, 100);

  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        Your annual flight emissions vs Paris target
      </div>
      <div style={{ position: 'relative', height: 36, background: '#f3f4f6', borderRadius: 6, overflow: 'visible' }}>
        {/* flight bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: `${totalPct}%`,
          background: total > PARIS_TARGET ? '#dc2626' : '#16a34a',
          borderRadius: 6, transition: 'width 0.4s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
        }}>
          {total > 0 && <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.82rem' }}>{total.toFixed(1)} t</span>}
        </div>
        {/* Paris line */}
        <div style={{ position: 'absolute', top: -6, bottom: -6, left: `${parisPct}%`, borderLeft: '2px dashed #16a34a', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: -22, left: `${parisPct}%`, fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, paddingLeft: 4, whiteSpace: 'nowrap' }}>
          Paris 2030 target (2.3 t total)
        </div>
      </div>
      {total > 0 && total > PARIS_TARGET && (
        <p style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600, marginTop: 10 }}>
          ⚠️ Your flights alone ({total.toFixed(1)} tCO₂eq) exceed the entire Paris 2030 per capita budget of 2.3 tCO₂eq.
        </p>
      )}
      {total === 0 && (
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 8 }}>Add flights above to see your aviation footprint.</p>
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
export default function ReduceFootprintPage() {
  const [diet, setDiet]               = useState('omnivore');
  const [transport, setTransport]     = useState('petrol');
  const [housing, setHousing]         = useState<Set<string>>(new Set());
  const [flights, setFlights]         = useState({ short: 0, medium: 0, long: 0 });

  const toggleHousing = (k: string) => {
    setHousing(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  };

  const setFlight = (k: keyof typeof flights, n: number) =>
    setFlights(prev => ({ ...prev, [k]: n }));

  // Calculate deltas
  const dietDelta      = DIET_OPTIONS.find(o => o.key === diet)?.delta ?? 0;
  const transportDelta = TRANSPORT_OPTIONS.find(o => o.key === transport)?.delta ?? 0;
  const housingDelta   = HOUSING_OPTIONS.filter(o => housing.has(o.key)).reduce((s, o) => s + o.delta, 0);
  const totalDelta     = dietDelta + transportDelta + housingDelta;
  const newTotal       = Math.max(0, BASELINE_TOTAL + totalDelta);
  const totalFlights   = flights.short * 0.7 + flights.medium * 1.5 + flights.long * 3.5;

  // Build adjusted categories for stacked bar
  const adjustedCategories = BASELINE.map(c => {
    let adjusted = c.value;
    if (c.key === 'food')      adjusted = Math.max(0, c.value + dietDelta);
    if (c.key === 'transport') adjusted = Math.max(0, c.value + transportDelta);
    if (c.key === 'housing')   adjusted = Math.max(0, c.value + housingDelta);
    return { ...c, value: adjusted };
  });

  const saving = BASELINE_TOTAL - newTotal;
  const gapToTarget = newTotal - PARIS_TARGET;

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
              This footprint is spread across five major categories: housing (the largest contributor),
              equipment, transport, food, and public and commercial services.
            </Para>
            <Para>
              Not all of these categories are equally within your control. Services such as public
              infrastructure, healthcare and education are largely fixed regardless of individual behaviour.
              But housing, transport and food together account for over{' '}
              <strong>70% of the footprint</strong> — and each offers meaningful levers for reduction.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The calculator below shows how major lifestyle changes shift your estimated footprint,
              using the UCLouvain (2019) Belgian baseline and emission reduction estimates consistent
              with the ADEME Bilan Carbone&#xAE; methodology.
            </Para>
          </SectionCard>

          {/* 2 — Calculator */}
          <SectionCard id="calculator">
            <SectionTitle>Lifestyle calculator</SectionTitle>

            {/* Bars */}
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 16px 12px', marginBottom: 20 }}>
              <StackedBar
                categories={BASELINE}
                total={BASELINE_TOTAL}
                label="Baseline"
                showParis
              />
              {totalDelta !== 0 && (
                <StackedBar
                  categories={adjustedCategories}
                  total={newTotal}
                  label="Your choices"
                />
              )}
              <CategoryLegend />

              {/* Summary */}
              {totalDelta !== 0 && (
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: `1.5px solid ${gapToTarget > 0 ? '#fde68a' : '#bbf7d0'}` }}>
                  {saving > 0 && (
                    <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, margin: '0 0 4px' }}>
                      &#x2713; Your choices save an estimated <strong>{saving.toFixed(1)} tCO&#x2082;eq/year</strong>
                    </p>
                  )}
                  {gapToTarget > 0 ? (
                    <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0 }}>
                      Still <strong>{gapToTarget.toFixed(1)} t</strong> above the Paris 2030 target — structural and systemic change is also required.
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600, margin: 0 }}>
                      &#x1F389; Your estimated footprint is at or below the Paris 2030 target!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <RadioGroup title="&#x1F957; Diet" options={DIET_OPTIONS} value={diet} onChange={setDiet} />
                <RadioGroup title="&#x1F697; Transport" options={TRANSPORT_OPTIONS} value={transport} onChange={setTransport} />
              </div>
              <div>
                <CheckboxGroup title="&#x1F3E0; Housing" options={HOUSING_OPTIONS} values={housing} onChange={toggleHousing} />
              </div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0 }}>
                <strong>Note:</strong> This calculator shows indicative estimates for an average Belgian household.
                Reductions are applied to the relevant UCLouvain category. Individual circumstances vary significantly.
                Flying is shown separately below and is not included in the baseline transport figure above.
              </p>
            </div>
          </SectionCard>

          {/* 3 — Flights */}
          <SectionCard id="flights">
            <SectionTitle>The impact of flying</SectionTitle>
            <Para>
              Flying is one of the most carbon-intensive individual activities, yet it is often
              underestimated because tickets feel affordable and flights feel routine. A single long-haul
              return flight can equal or exceed the <em>entire annual Paris-compatible carbon budget</em> of
              2.3 tCO&#x2082;eq per person.
            </Para>
            <Para>
              The values below include a radiative forcing multiplier of &#xD7;2, as recommended by agencies
              including ADEME. This accounts for the additional warming effect of contrails and other
              non-CO&#x2082; emissions at altitude, beyond the direct CO&#x2082; from burning kerosene.
            </Para>

            {FLIGHT_TYPES.map(t => (
              <FlightCounter key={t.key} type={t} count={flights[t.key as keyof typeof flights]} onChange={n => setFlight(t.key as keyof typeof flights, n)} />
            ))}

            <FlightBar total={totalFlights} />

            <Para style={{ marginTop: 16, marginBottom: 0, fontSize: '0.82rem', color: '#6b7280' }}>
              Flight categories: short-haul (&lt;1,500 km), medium-haul (1,500–4,000 km),
              long-haul (&gt;4,000 km). Representative routes are return trips from Brussels.
              Seat class assumed: economy. Emissions based on ADEME / Walloon GIEC methodology.
            </Para>
          </SectionCard>

          {/* 4 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; methodology</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
