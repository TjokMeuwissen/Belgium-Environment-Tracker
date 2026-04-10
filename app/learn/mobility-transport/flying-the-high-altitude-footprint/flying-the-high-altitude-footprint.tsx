'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, LabelList,
} from 'recharts';

const TOPIC_COLOR = '#ec4899';

const SECTIONS = [
  { id: 'intro',      label: 'Why aviation stands apart'   },
  { id: 'chart',      label: 'Emissions by mode'           },
  { id: 'multiplier', label: 'The non-CO\u2082 multiplier' },
  { id: 'shorthaul',  label: 'Short-haul: worst per km'   },
  { id: 'belgium',    label: 'Belgium & aviation'          },
  { id: 'action',     label: 'What you can do'             },
  { id: 'sources',    label: 'Sources'                     },
];

// Data from Our World in Data (Hannah Ritchie, 2023), underlying source:
// UK Government DESNZ Greenhouse Gas Conversion Factors 2022.
// Aviation figures include a multiplier of 1.9 for non-CO2 radiative forcing.
const emissionsData = [
  { name: 'Domestic flight',           value: 246, fill: '#dc2626' },
  { name: 'Petrol car (driver only)',  value: 170, fill: '#ea580c' },
  { name: 'Short-haul intl. flight',  value: 154, fill: '#f97316' },
  { name: 'National / regional rail', value: 41,  fill: '#65a30d' },
  { name: 'Coach / bus',              value: 27,  fill: '#16a34a' },
  { name: 'Eurostar (high-speed)',    value: 4,   fill: '#059669' },
];

// ── Layout helpers ─────────────────────────────────────────────────────────────
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{
      background: '#fff', borderRadius: 12,
      padding: '24px 28px 22px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem',
      color: '#1a1a1a', marginBottom: 14, paddingBottom: 10,
      borderBottom: '2px solid #f3f4f6',
    }}>
      {children}
    </h2>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: 'Roboto, sans-serif', fontSize: '0.93rem',
      color: '#374151', lineHeight: 1.75, marginBottom: 14, ...style,
    }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: { bold?: string; text: string }[] }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 14 }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: 'flex', gap: 10, marginBottom: 10,
          fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem',
          color: '#374151', lineHeight: 1.65,
        }}>
          <span style={{ color: TOPIC_COLOR, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>&#x2022;</span>
          <span>
            {item.bold && <strong>{item.bold} </strong>}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ color = TOPIC_COLOR, title, children }: {
  color?: string; title?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: `${color}12`, borderLeft: `4px solid ${color}`,
      borderRadius: '0 8px 8px 0', padding: '14px 18px',
      marginBottom: 16, fontFamily: 'Roboto, sans-serif',
      fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.65,
    }}>
      {title && <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>}
      {children}
    </div>
  );
}

function KeyFigures() {
  const figs = [
    {
      value: '246 g',
      label: 'CO\u2082e per km by domestic flight',
      sub: 'vs 4 g for the Eurostar \u2014 61 times higher (UK Gov 2022 / OWID)',
      color: '#dc2626',
    },
    {
      value: '1.9\u00d7',
      label: 'Minimum warming multiplier for aviation',
      sub: 'Non-CO\u2082 effects at altitude \u2014 contrails, NOx and water vapour (UK Gov methodology)',
      color: '#f97316',
    },
    {
      value: '<750 km',
      label: 'Where the train almost always wins',
      sub: 'European routes under 750 km are generally faster or comparable city-to-city by rail',
      color: TOPIC_COLOR,
    },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 16, marginBottom: 24,
    }}>
      {figs.map(f => (
        <div key={f.value} style={{
          background: '#fff', borderRadius: 12, padding: '20px 20px 16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}`,
        }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.6rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Emissions chart ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#374151' }}>
        <strong>{payload[0].value} g CO&#x2082;e</strong> per passenger-km
      </p>
    </div>
  );
};

function EmissionsChart() {
  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={emissionsData}
          layout="vertical"
          margin={{ top: 8, right: 64, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 280]}
            tick={{ fontSize: 11, fill: '#374151' }}
            tickFormatter={v => `${v}`}
            label={{ value: 'g CO\u2082e per passenger-km', position: 'insideBottom', offset: -2, style: { fontSize: 10, fill: '#4b5563' } }}
          />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} width={172} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Emissions">
            {emissionsData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
              formatter={(v: number) => `${v} g`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>
        Source: Our World in Data (Hannah Ritchie, 2023), underlying data: UK Government DESNZ
        Greenhouse Gas Conversion Factors 2022. Aviation figures include a multiplier of 1.9
        for non-CO&#x2082; radiative forcing effects. Petrol car figure assumes a single occupant.
      </p>
    </>
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
        <button key={s.id}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FlyingHighAltitudeFootprint() {
  return (
    <div className="detail-page">

      <div
        className="detail-header"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)',
          '--topic-color': TOPIC_COLOR,
        } as React.CSSProperties}
      >
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x2708;&#xFE0F;&nbsp; Mobility</p>
            <h1 className="detail-title">Flying: the high-altitude footprint</h1>
            <p className="header-sub" style={{ marginTop: 10 }}>
              A single return flight can produce more CO&#x2082; than months of daily car travel.
              Why aviation has an outsized climate impact, and where the alternatives work best.
            </p>
          </div>
          <img
            src="/images/learn/airplane.PNG"
            alt="Airplane in flight"
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 */}
          <SectionCard id="intro">
            <SectionTitle>Why aviation stands apart</SectionTitle>
            <Para>
              Transport accounts for roughly a quarter of global CO&#x2082; emissions, but not all
              transport is equal. Flying is distinctive in two ways: it is the single highest-impact
              activity most individuals ever do voluntarily, and it is extremely unequally distributed.
              Globally, around 80% of people have never been on a plane. Among those who do fly,
              a small fraction of frequent flyers accounts for the overwhelming majority of aviation
              emissions.
            </Para>
            <Para>
              Belgium sits in an interesting position. It has one of the highest per-capita incomes
              in the world, a large population of internationally mobile workers, and Brussels Airport
              at the heart of a dense European flight network. For a typical Belgian who flies,
              aviation is very likely to be the single largest item in their personal carbon footprint.
            </Para>
            <Callout title="How much does a single flight emit?">
              A return flight from Brussels to Barcelona (roughly 1,800 km each way) emits around
              275 kg CO&#x2082;e per passenger when the non-CO&#x2082; warming effects are included.
              That is comparable to driving a petrol car for over 1,600 km &mdash; or roughly six
              weeks of an average Belgian&apos;s daily car commute.
            </Callout>
          </SectionCard>

          {/* 2 */}
          <SectionCard id="chart">
            <SectionTitle>Emissions by transport mode</SectionTitle>
            <Para>
              The chart below compares greenhouse gas emissions per passenger-kilometre across the
              main modes of transport. All figures come from the UK Government&apos;s official
              greenhouse gas conversion factors (2022) as compiled by Our World in Data, and include
              the full well-to-wheel (or well-to-wake for aviation) lifecycle. Aviation figures
              include a multiplier of 1.9 to account for non-CO&#x2082; warming effects
              at altitude &mdash; explained in the next section.
            </Para>
            <EmissionsChart />
            <Para style={{ marginTop: 16 }}>
              A few results stand out. The Eurostar emits just 4 g CO&#x2082;e per passenger-km
              &mdash; 61 times less than a domestic flight and 38 times less than a short-haul
              international flight. Perhaps more surprisingly, driving a petrol car alone is
              actually <em>worse</em> per kilometre than a short-haul international flight
              (170 g vs 154 g). This is because aircraft carry far more passengers per unit of
              fuel than a single-occupant car, so the per-person share drops. The moral is
              not that flying is fine &mdash; it is that driving alone is also very high-carbon.
            </Para>
          </SectionCard>

          {/* 3 */}
          <SectionCard id="multiplier">
            <SectionTitle>The non-CO&#x2082; multiplier: why altitude matters</SectionTitle>
            <Para>
              When a plane burns jet fuel at cruising altitude (typically 10&ndash;12 km), the
              climate impact goes beyond the CO&#x2082; released. Three additional effects amplify
              the warming:
            </Para>
            <BulletList items={[
              {
                bold: 'Contrails (condensation trails).',
                text: 'When hot exhaust mixes with cold, humid air at altitude, ice crystals form and create the white streaks visible behind planes. These act as a blanket, trapping heat from the Earth\'s surface. Contrail warming can be significant, particularly at night when there is no offsetting daytime cooling from reflecting sunlight.',
              },
              {
                bold: 'NOx emissions.',
                text: 'Nitrogen oxides released at altitude trigger chemical reactions that create ozone \u2014 a potent greenhouse gas in the upper atmosphere. The same NOx also destroys methane, which partially offsets the ozone effect, making the net impact complex to quantify.',
              },
              {
                bold: 'Water vapour.',
                text: 'Water released at high altitude can persist longer than at ground level and contributes to warming, particularly in regions with low natural humidity.',
              },
            ]} />
            <Para>
              The UK Government&apos;s official methodology applies a multiplier of{' '}
              <strong>1.9</strong>{' '}to aviation CO&#x2082; to account for these effects &mdash;
              meaning the real warming impact is roughly twice the CO&#x2082; figure alone.
              Some researchers argue the true multiplier is higher. The landmark Lee et al. (2020)
              study, published in <em>Atmospheric Environment</em>,{' '}estimated that aviation is
              responsible for around 3.5% of human-caused warming globally, despite accounting
              for only 2.5% of CO&#x2082; emissions &mdash; implying a de facto multiplier closer
              to <strong>1.4</strong>{' '}when measured in terms of long-run temperature impact.
              Other analyses using different accounting frameworks suggest multipliers of 2&ndash;4.
            </Para>
            <Callout color="#6b7280" title="What this means in practice">
              The exact multiplier is genuinely uncertain and depends on accounting choices.
              What is not uncertain is the direction: the true climate impact of flying is
              meaningfully higher than its CO&#x2082; alone would suggest. The figures in this
              article use the UK Government&apos;s 1.9 multiplier, which is on the conservative
              end of current scientific estimates.
            </Callout>
          </SectionCard>

          {/* 4 */}
          <SectionCard id="shorthaul">
            <SectionTitle>Short-haul: the worst per kilometre</SectionTitle>
            <Para>
              A counterintuitive but well-established finding is that short flights have a
              <em> higher</em> carbon intensity per kilometre than longer ones. A domestic
              flight emits 246 g CO&#x2082;e/km; a short-haul international flight 154 g/km.
              The reason is simple physics: take-off and climb to cruising altitude consume
              a disproportionate amount of fuel. On a 200 km hop, this energy-intensive phase
              represents the majority of the flight. On a 5,000 km transatlantic crossing, it
              is a small fraction of total fuel burn.
            </Para>
            <Para>
              This has a direct implication for where switching to rail makes the biggest
              difference. The shortest flights &mdash; Brussels to Amsterdam, London, Paris,
              Cologne &mdash; are both the most polluting per kilometre and the most
              substitutable by train. Thalys and Eurostar already connect these city pairs
              in under two hours centre-to-centre, often faster than flying when airport
              check-in and transit time are included.
            </Para>
            <Para>
              These three European routes illustrate where the train wins on both time
              and carbon &mdash; not as a trade-off, but on every dimension simultaneously.
              CO&#x2082; figures are for a <strong>return trip</strong>{' '}per passenger.
            </Para>

            {/* Route comparison cards */}
            {[
              {
                route: 'Brussels \u2013 Paris',
                dist: 310,
                trainTime: '1h 22m',
                planeTime: '3h 30m',
                trainCO2: 4,
                planeCO2: 96,
              },
              {
                route: 'Brussels \u2013 London',
                dist: 370,
                trainTime: '1h 51m',
                planeTime: '3h 45m',
                trainCO2: 4,
                planeCO2: 114,
              },
              {
                route: 'Brussels \u2013 Amsterdam',
                dist: 210,
                trainTime: '1h 49m',
                planeTime: '3h 15m',
                trainCO2: 3,
                planeCO2: 65,
              },
            ].map(r => {
              const saving = Math.round((1 - r.trainCO2 / r.planeCO2) * 100);
              return (
                <div key={r.route} style={{
                  background: '#f9fafb', borderRadius: 10, padding: '16px 18px',
                  marginBottom: 12, border: '1px solid #e5e7eb',
                }}>
                  <p style={{
                    fontFamily: 'Roboto, sans-serif', fontWeight: 800,
                    fontSize: '0.95rem', color: '#1a1a1a', marginBottom: 12,
                  }}>
                    {r.route}
                    <span style={{
                      marginLeft: 10, fontSize: '0.72rem', fontWeight: 600,
                      color: '#fff', background: '#16a34a',
                      borderRadius: 20, padding: '2px 8px',
                    }}>
                      {saving}% less CO&#x2082; by train
                    </span>
                  </p>

                  {[
                    { label: '&#x1F686; Train', time: r.trainTime, co2: r.trainCO2, color: '#16a34a', maxCO2: r.planeCO2 },
                    { label: '&#x2708;&#xFE0F; Plane', time: r.planeTime, co2: r.planeCO2, color: '#ef4444', maxCO2: r.planeCO2 },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
                    }}>
                      <div style={{ width: 130, flexShrink: 0 }}>
                        <span style={{
                          fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem',
                          fontWeight: 700, color: '#374151',
                        }}
                          dangerouslySetInnerHTML={{ __html: row.label }}
                        />
                        <span style={{
                          fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem',
                          color: '#4b5563', marginLeft: 8,
                        }}>
                          {row.time}
                        </span>
                      </div>
                      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 4, height: 18, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(row.co2 / row.maxCO2) * 100}%`,
                          minWidth: 4,
                          background: row.color,
                          height: '100%',
                          borderRadius: 4,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{
                        width: 52, flexShrink: 0, textAlign: 'right',
                        fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem',
                        fontWeight: 700, color: row.color,
                      }}>
                        {row.co2} kg
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}

            <p style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif', marginBottom: 14, lineHeight: 1.4 }}>
              All figures are return trip, per passenger. Plane times are door-to-door estimates
              including 90 min check-in, security, and airport transit at both ends.
              Train times are city-centre to city-centre (Thalys / Eurostar 2025).
              CO&#x2082; figures: train at 4&ndash;6 g CO&#x2082;e/pkm (Eurostar / international
              high-speed); flight at 154 g CO&#x2082;e/pkm (short-haul international, OWID / UK Gov 2022,
              includes 1.9&times; non-CO&#x2082; multiplier).
            </p>
          </SectionCard>

          {/* 5 */}
          <SectionCard id="belgium">
            <SectionTitle>Belgium &amp; aviation</SectionTitle>
            <Para>
              Brussels Airport is Belgium&apos;s main international hub and one of the busiest
              airports in Europe, handling around 19&ndash;20 million passengers per year
              (2023 figures). Alongside Brussels Airport, Brussels South Charleroi Airport
              serves primarily low-cost carriers and adds several million more passengers.
              Together, they make Belgium one of the more aviation-intensive countries in Europe
              relative to its population.
            </Para>
            <Para>
              Aviation is structurally difficult to decarbonise. Unlike road or rail transport,
              where electric alternatives exist today, commercial aviation has no mature
              zero-carbon technology at scale. Sustainable aviation fuels (SAFs) exist but
              currently cost two to five times more than conventional jet fuel and represent
              a tiny fraction of total consumption. Hydrogen-powered and electric aircraft
              are in development but remain years or decades away from commercial long-haul use.
            </Para>
            <Para>
              This means that for the foreseeable future, the most effective climate action
              related to aviation is flying less &mdash; particularly replacing short-haul
              flights with rail where alternatives exist.
            </Para>
            <Callout color="#f97316" title="A striking asymmetry">
              Aviation accounts for a small share of the trips Belgians make, but a very large
              share of their transport-related emissions. Frequent flyers &mdash; typically
              higher-income individuals &mdash; are responsible for a disproportionate share
              of those emissions. A single long-haul return flight can easily exceed all of
              a person&apos;s other annual transport emissions combined.
            </Callout>
          </SectionCard>

          {/* 6 */}
          <SectionCard id="action">
            <SectionTitle>What you can do</SectionTitle>
            <Para>
              The evidence is clear on which individual actions make the biggest difference.
            </Para>
            <BulletList items={[
              {
                bold: 'Take the train for European distances.',
                text: 'For destinations within roughly 750 km, high-speed rail is typically competitive in total journey time and emits a fraction of the CO\u2082. Brussels to Paris (22 min), London (1h 51m), Amsterdam (1h 49m) are all faster or comparable by train once airport time is included.',
              },
              {
                bold: 'Fly less, not just less often.',
                text: 'The biggest lever is whether you fly at all on a given trip, not whether you choose a more efficient airline. One fewer long-haul return flight saves more emissions than all other individual transport choices combined in most years.',
              },
              {
                bold: 'Choose direct over connecting.',
                text: 'Each take-off is the most fuel-intensive part of the journey. A connecting flight via a hub adds an extra take-off and landing cycle, significantly increasing total emissions per trip.',
              },
              {
                bold: 'Fly economy, not business or first class.',
                text: 'Business class seats take up two to four times the cabin space of economy seats. Since emissions are allocated by space, a business class passenger has a carbon footprint two to four times higher than an economy passenger on the same flight.',
              },
              {
                bold: 'If you must fly, consider high-quality offsets.',
                text: 'Offsetting does not eliminate the warming effects of flying (contrails cannot be offset retrospectively), but well-verified carbon removal projects can partially compensate for the CO\u2082 component. This is a last resort, not a justification for flying more.',
              },
            ]} />
          </SectionCard>

          {/* 7 */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Our World in Data \u2014 Which form of transport has the smallest carbon footprint? (Hannah Ritchie, 2023)', url: 'https://ourworldindata.org/travel-carbon-footprint' },
                { label: 'UK Government DESNZ \u2014 Greenhouse Gas Reporting: Conversion Factors 2022', url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2022' },
                { label: 'Lee et al. (2020) \u2014 The contribution of global aviation to anthropogenic climate forcing for 2000 to 2018. Atmospheric Environment.', url: 'https://doi.org/10.1016/j.atmosenv.2020.117834' },
                { label: 'ICCT \u2014 CO\u2082 Emissions from Commercial Aviation (2018)', url: 'https://theicct.org/sites/default/files/publications/ICCT_CO2-commercl-aviation-2018_20190918.pdf' },
                { label: 'Back on Track \u2014 New comparison from EEA on trains versus planes', url: 'https://back-on-track.eu/new-comparison-from-european-environmental-agency-eea-on-trains-versus-planes/' },
                { label: 'Brussels Airport \u2014 Traffic statistics 2023', url: 'https://www.brusselsairport.be/en/our-airport/brussels-airport-company/press/traffic-statistics' },
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

        </div>{/* detail-main */}
      </div>{/* detail-body */}

      <footer>
        <p>Data sourced from Our World in Data, UK Government DESNZ, and official aviation statistics. Last updated April 2026.</p>
      </footer>
    </div>
  );
}
