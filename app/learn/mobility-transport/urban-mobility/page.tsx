'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine, LabelList,
  LineChart, Line,
} from 'recharts';

const TOPIC_COLOR = '#ec4899';

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',    label: 'Car dependency in Belgium'    },
  { id: 'cost',     label: 'The cost of the car city'     },
  { id: 'lez',      label: 'Low Emission Zones'           },
  { id: 'ghent',    label: 'The Ghent example'            },
  { id: 'shift',    label: 'What moves the needle'        },
  { id: 'action',   label: 'What you can do'              },
  { id: 'sources',  label: 'Sources'                      },
];

// ── Data ──────────────────────────────────────────────────────────────────────
// Source: Eurostat tran_hv_psmod, 2021. Car + bus + rail don't sum to 100 because
// tram, metro, and other modes are tracked separately. 'other' fills the remainder.
const modalData = [
  { country: 'Belgium',     car: 85,   bus: 7,    rail: 8,   other: 0   },
  { country: 'EU average',  car: 70.6, bus: 10.2, rail: 8.5, other: 10.7 },
  { country: 'Netherlands', car: 75,   bus: 4,    rail: 10,  other: 11  },
  { country: 'Germany',     car: 80,   bus: 7,    rail: 9,   other: 4   },
  { country: 'France',      car: 83,   bus: 6,    rail: 10,  other: 1   },
  { country: 'Denmark',     car: 78,   bus: 9,    rail: 10,  other: 3   },
];

// Brussels NO2 reduction since LEZ (2018)
// Source: Brussels Environment LEZ Report 2024 / lez.brussels
const no2Data = [
  { year: '2018', no2: 56 },
  { year: '2019', no2: 50 },
  { year: '2020', no2: 44 },
  { year: '2021', no2: 41 },
  { year: '2022', no2: 38 },
  { year: '2023', no2: 31 },
  { year: '2024', no2: 29 },
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
          <span>{item.bold && <strong>{item.bold}{' '}</strong>}{item.text}</span>
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
      value: '85%',
      label: 'of Belgian passenger-km by car',
      sub: 'vs 70.6% EU average. 14 percentage points above the EU norm (Eurostat tran_hv_psmod, 2021)',
      color: '#ef4444',
    },
    {
      value: '104h',
      label: 'lost in Brussels traffic per year',
      sub: 'Average motorist in 2023. Brussels ranks 5th most congested city in Europe (TomTom 2023)',
      color: '#f97316',
    },
    {
      value: '34%',
      label: 'of Ghent trips now by bike',
      sub: 'Up from 22% in 2012. The city hit its 2030 cycling target 13 years early (City of Ghent)',
      color: '#16a34a',
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
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Modal split chart ─────────────────────────────────────────────────────────
// cursor is the hovered bar segment — Recharts passes dataKey as payload[i].dataKey
// We only render the single entry whose dataKey matches the hovered segment.
const ModalTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  // Find the segment the cursor is actually over (last in payload = topmost hovered)
  const hovered = payload[payload.length - 1];
  if (!hovered || hovered.dataKey === 'other') return null; // don't show 'other' tooltip
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{label}</p>
      <p style={{ color: hovered.fill || hovered.color, margin: 0 }}>
        {hovered.name}: <strong>{hovered.value}%</strong>
      </p>
    </div>
  );
};

function ModalSplitChart() {
  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={modalData}
          layout="vertical"
          margin={{ top: 4, right: 64, left: 0, bottom: 4 }}
          barSize={16}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#374151' }}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="country"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={90}
          />
          <Tooltip content={<ModalTooltip />} />
          <Bar dataKey="car" name="Car" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]}>
            <LabelList
              dataKey="car"
              position="right"
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 11, fontWeight: 700, fill: '#ef4444' }}
            />
          </Bar>
          <Bar dataKey="bus" name="Bus & coach" stackId="a" fill="#f97316" />
          <Bar dataKey="rail" name="Rail" stackId="a" fill="#16a34a" />
          <Bar dataKey="other" name="Tram / metro / other" stackId="a" fill="#d1d5db" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' as const }}>
        {[
          { color: '#ef4444', label: 'Car' },
          { color: '#f97316', label: 'Bus & coach' },
          { color: '#16a34a', label: 'Rail' },
          { color: '#d1d5db', label: 'Tram / metro / other' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: 'inline-block' }} />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem', color: '#374151' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif', marginTop: 8, lineHeight: 1.4 }}>
        Source: Eurostat tran_hv_psmod (inland passenger modal split), 2021.
        Note: tram and metro are excluded from the Eurostat series, which slightly overstates
        the car share in dense urban areas. Values for Netherlands, Germany, France and Denmark
        are approximate.
      </p>
    </>
  );
}

// ── NO2 chart ─────────────────────────────────────────────────────────────────
const NO2Tooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#3b82f6' }}>NO&#x2082;: <strong>{payload[0].value} &micro;g/m&sup3;</strong></p>
    </div>
  );
};

function NO2Chart() {
  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={no2Data}
          margin={{ top: 16, right: 60, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#374151' }} />
          <YAxis
            domain={[0, 65]}
            tick={{ fontSize: 11, fill: '#374151' }}
            width={36}
            label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', offset: 12, style: { fontSize: 10, fill: '#6b7280' } }}
          />
          <Tooltip content={<NO2Tooltip />} />
          {/* EU limit 40 µg/m³ */}
          <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 3" label={{ value: 'EU limit', position: 'right', fontSize: 10, fill: '#ef4444' }} />
          {/* WHO guideline 10 µg/m³ */}
          <ReferenceLine y={10} stroke="#f97316" strokeDasharray="4 3" label={{ value: 'WHO 10', position: 'right', fontSize: 10, fill: '#f97316' }} />
          <Line
            dataKey="no2"
            name="NO₂ (Arts-Lois)"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            label={{ position: 'top', fontSize: 10, fill: '#374151', formatter: (v: number) => `${v}` }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif', marginTop: 6, lineHeight: 1.4 }}>
        Annual average NO&#x2082; concentration at Arts-Lois measurement station, Brussels
        Capital Region. Source: Brussels Environment / IRCELINE, via LEZ Annual Report 2024.
        The Arts-Lois station is located on one of Brussels&apos; busiest arterial roads.
      </p>
    </>
  );
}

// ── Ghent grouped bar chart ───────────────────────────────────────────────────
const ghentGroupedData = [
  { mode: 'Car',             y2012: 54, y2021: 40 },
  { mode: 'Cycling',         y2012: 22, y2021: 34 },
  { mode: 'Public transport',y2012: 9,  y2021: 13 },
  { mode: 'Walking',         y2012: 14, y2021: 13 },
];

const GhentTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}%</strong>
        </p>
      ))}
    </div>
  );
};

function GhentBar() {
  return (
    <div style={{ marginBottom: 16 }}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={ghentGroupedData}
          margin={{ top: 16, right: 16, left: 0, bottom: 4 }}
          barCategoryGap="25%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="mode" tick={{ fontSize: 11, fill: '#374151' }} />
          <YAxis
            domain={[0, 60]}
            tick={{ fontSize: 11, fill: '#374151' }}
            width={36}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<GhentTooltip />} />
          <Bar dataKey="y2012" name="2012 (before)" fill="#94a3b8" radius={[3, 3, 0, 0]}>
            <LabelList dataKey="y2012" position="top" style={{ fontSize: 10, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
          </Bar>
          <Bar dataKey="y2021" name="2021 (after)" fill={TOPIC_COLOR} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="y2021" position="top" style={{ fontSize: 10, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' as const }}>
        {[
          { color: '#94a3b8', label: '2012 (before)' },
          { color: TOPIC_COLOR, label: '2021 (after)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: l.color, display: 'inline-block' }} />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem', color: '#374151' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif', marginTop: 8, lineHeight: 1.4 }}>
        Source: City of Ghent mobility surveys. Modal split by distance. 2021 is the latest
        available survey year. Cycling data confirmed by Velo-city 2024 and Copenhagenize 2025.
      </p>
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
export default function UrbanMobility() {
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
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F6B4;&nbsp; Mobility</p>
            <h1 className="detail-title">Urban mobility: getting out of the car</h1>
            <p className="header-sub" style={{ marginTop: 10 }}>
              Belgium has one of the highest car shares in Europe &mdash; 85% of all
              passenger-kilometres, well above the EU average of 71%. The cost is
              paid in congestion, air quality, and emissions. Some Belgian cities
              are showing a different way forward.
            </p>
          </div>
          <img
            src="/images/learn/urban-mobility.jpg"
            alt="Urban mobility"
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Car dependency */}
          <SectionCard id="intro">
            <SectionTitle>Car dependency in Belgium</SectionTitle>
            <Para>
              Belgium is one of the most car-dependent countries in Europe.
              In 2021, <strong>85%{' '}</strong>of all inland passenger-kilometres were
              travelled by car &mdash; 14 percentage points above the EU average of 70.6%,
              and higher than France (83%), Germany (80%), Denmark (78%), or the Netherlands (75%).
              Rail and bus together account for just 15% of passenger travel, roughly half the EU
              average of 19%.
            </Para>

            <ModalSplitChart />

            <Para style={{ marginTop: 16 }}>
              This gap is not a recent phenomenon. Belgium&apos;s car share has been broadly
              stable for decades. Several structural factors explain it.
            </Para>
            <BulletList items={[
              {
                bold: 'Ribbon development (lintbebouwing).',
                text: 'Belgium has one of the most dispersed settlement patterns in Europe, with housing strung along roads connecting towns rather than concentrated around urban cores. This makes most dwellings too far from public transport stops to use it conveniently, and too spread out for high-frequency services to be economically viable.',
              },
              {
                bold: 'Historically underinvested public transport.',
                text: 'Belgium\'s rail network is good on major intercity routes but coverage and frequency fall sharply away from those corridors. Bus networks in Flanders and Wallonia have faced repeated budget pressures. Regional fragmentation \u2014 with De Lijn, TEC and STIB operating separately in each region \u2014 makes integrated ticketing and planning difficult.',
              },
              {
                bold: 'Infrastructure built around the car.',
                text: 'Decades of road investment, generous parking provision in city centres and suburban shopping zones, and low fuel taxes relative to some European neighbours have all reinforced car use as the default mode.',
              },
            ]} />
            <Callout color="#6b7280" title="A methodological note">
              The Eurostat modal split series (tran_hv_psmod) covers car, bus and rail only.
              Tram and metro are excluded. Brussels STIB alone carries around 350,000 journeys
              per day and is not captured here. The real car share in dense urban areas is
              therefore somewhat lower than the national 85% figure suggests.
            </Callout>
          </SectionCard>

          {/* 2 — Cost */}
          <SectionCard id="cost">
            <SectionTitle>The cost of the car city</SectionTitle>
            <Para>
              High car dependency is not just a climate problem. The daily costs show up in
              congestion, urban space, air quality and road safety.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>
              Congestion
            </p>
            <Para>
              Brussels is the fifth most congested city in Europe according to TomTom&apos;s
              2023 traffic index, ranking tenth globally. The average motorist in Brussels lost{' '}
              <strong>104 hours{' '}</strong>to traffic jams in 2023 &mdash; more than four
              full days. Average travel speed on Brussels roads is barely 18 km/h, comparable
              to a bicycle or e-scooter. During evening peak hours on Thursdays, it takes
              27 minutes to cover 10 kilometres.
            </Para>
            <Para>
              The cost is not only personal. Congestion wastes fuel, increases emissions per
              kilometre travelled, delays freight, and reduces productivity. Cities that have
              managed to reduce car use report faster average travel times for all remaining
              road users, including commercial vehicles, as a direct result.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>
              Urban space
            </p>
            <Para>
              A parked car requires roughly 12&ndash;15 m&sup2; of public space. A single
              lane of moving traffic occupies 3.5 metres of width per direction. In a dense
              city, the proportion of public space dedicated to cars &mdash; roads, parking,
              ramps &mdash; is typically 30&ndash;50% of total surface area. Space used for
              car storage is space not available for cycling lanes, trees, pavements, outdoor
              seating, play areas, or green infrastructure.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>
              Air quality and health
            </p>
            <Para>
              Road traffic is the dominant source of NO&#x2082; and PM2.5 in Belgian cities.
              According to the European Environment Agency, air pollution caused more than
              5,000 premature deaths in Belgium in 2021. In Brussels specifically, exposure
              to PM2.5, NO&#x2082; and ozone caused an estimated 621 premature deaths in 2024.
              The burden falls disproportionately on lower-income neighbourhoods located near
              arterial roads.
            </Para>
          </SectionCard>

          {/* 3 — LEZ */}
          <SectionCard id="lez">
            <SectionTitle>Low Emission Zones: what they do and don&apos;t do</SectionTitle>
            <Para>
              Both Brussels (since 2018) and Antwerp (since 2017) have Low Emission Zones
              that restrict the most polluting vehicles from entering the city. The Brussels
              LEZ covers all 19 municipalities of the Brussels-Capital Region. Its timetable
              progressively tightens: diesel vehicles will be banned from 2030, petrol vehicles
              from 2035, effectively creating a zero-emission zone.
            </Para>
            <Para>
              The air quality results have been significant. The chart below shows the
              dramatic fall in NO&#x2082; concentrations at the Arts-Lois station &mdash;
              one of Brussels&apos; busiest arterial locations &mdash; since the LEZ launched.
            </Para>

            <NO2Chart />

            <Para style={{ marginTop: 16 }}>
              Since 2018 the Brussels LEZ has contributed to reducing nitrogen oxide (NOx)
              emissions from road transport by <strong>55%,{' '}</strong>PM2.5 by{' '}
              <strong>33%,{' '}</strong>and black carbon by{' '}<strong>62%{' '}</strong>
              (estimates based on constant mileage, Brussels Environment 2024). NO&#x2082;
              concentrations at Arts-Lois fell from 56 &micro;g/m&sup3; in 2018 to
              29 &micro;g/m&sup3; in 2024 &mdash; a reduction of 46%. For the fifth consecutive
              year, all Brussels measurement stations met the EU annual standard of 40 &micro;g/m&sup3;.
            </Para>

            <Callout color="#f97316" title="What LEZs don't do">
              A Low Emission Zone improves the quality of the vehicles on the road,
              but does not necessarily reduce the number of cars. If residents switch
              from an old diesel to a new Euro 6 petrol car, the LEZ registers as a
              success on air quality metrics &mdash; but congestion, parking demand,
              space use, and CO&#x2082; emissions remain largely unchanged.
              Genuinely reducing car use requires positive alternatives to driving,
              not just restrictions on certain vehicle types.
            </Callout>
          </SectionCard>

          {/* 4 — Ghent */}
          <SectionCard id="ghent">
            <SectionTitle>The Ghent example: what a circulation plan can achieve</SectionTitle>
            <Para>
              Ghent provides the most striking Belgian demonstration of what happens when
              a city takes decisive action to reduce through-traffic. In 2017, the city
              implemented its Circulation Plan, dividing the city centre into six zones
              between which car travel requires using the outer ring road. The intervention
              was implemented over a single weekend: 80 streets changed direction and more
              than 2,500 road signs were replaced.
            </Para>
            <Para>
              The motivation was clear: traffic surveys had found that{' '}
              <strong>40%{' '}</strong>of rush-hour car traffic in Ghent city centre
              consisted of vehicles simply passing through &mdash; not starting or ending
              their journey there. Eliminating this through-traffic was the primary goal.
              The effects on cycling were dramatic and largely unexpected in their speed.
            </Para>

            <GhentBar />

            <Para>
              Car use fell from 54% to 40% of trips between 2012 and 2021. Cycling
              rose from 22% to 34% &mdash; the city&apos;s 2030 target, achieved 13 years early.
              In the 2025 Copenhagenize Index, Ghent ranks <strong>3rd globally{' '}</strong>
              for cycling-friendliness, ahead of Amsterdam and behind only Utrecht and Copenhagen.
              Accident rates in the city centre fell by 25% in the years following the plan.
            </Para>
            <Para>
              The lesson from Ghent is not that every city should replicate its exact
              circulation plan &mdash; urban structures differ too much. The lesson is
              that <em>removing the most compelling reason not to cycle</em>
              {' '}(through-traffic making streets hostile) is more powerful than any
              amount of cycling infrastructure investment alone.
            </Para>
            <Callout color={TOPIC_COLOR} title="Ghent in numbers">
              513 km of cycling infrastructure &mdash; 188 km added since 2010. 40% fewer
              cars on bicycle-priority streets than before the circulation plan.
              61% of Ghent residents now choose sustainable modes: cycling, walking,
              or public transport.
            </Callout>
          </SectionCard>

          {/* 5 — What moves the needle */}
          <SectionCard id="shift">
            <SectionTitle>What moves the needle</SectionTitle>
            <Para>
              Evidence from cities across Europe consistently points to a small set of
              interventions that reliably shift modal share away from cars. Not all of
              them are dramatic.
            </Para>
            <BulletList items={[
              {
                bold: 'Frequency and reliability of public transport.',
                text: 'Research consistently shows that frequency matters more than speed. A bus or tram that comes every 8 minutes enables spontaneous travel; one that comes every 25 minutes requires planning a trip around the timetable. Frequency improvements have larger modal share effects per euro invested than network extensions into new areas.',
              },
              {
                bold: 'Safe, continuous cycling infrastructure.',
                text: 'The Ghent example shows that infrastructure quality is decisive. Protected lanes, reduced motor traffic volumes, and continuous routes (no missing links) drive cycling uptake. Belgium\'s cycling highways (fietssnelwegen/voies lentes) connecting cities to suburbs are a strong example of this approach at a regional scale.',
              },
              {
                bold: 'Parking pricing and supply management.',
                text: 'The single strongest predictor of car use in cities is parking cost and availability. Cities that have reduced city-centre parking supply, increased its cost, and removed free parking requirements from new developments consistently see modal shift. This is politically the most difficult lever but technically the most effective.',
              },
              {
                bold: 'Reducing through-traffic (as in Ghent).',
                text: 'Making car journeys through city centres less convenient for non-residents, without blocking access to destinations within the city, is a powerful tool. It removes hostile traffic from residential streets, which in turn makes walking and cycling more attractive, without requiring large capital investment.',
              },
              {
                bold: 'Mobility budgets as an alternative to company cars.',
                text: 'Belgium\'s mobility budget legislation (2018) allows employees to exchange a company car for a cash budget to spend on sustainable transport, housing near work, or other mobility options. Uptake has been slow but the policy direction is right: the company car tax reform from 2026 will accelerate the transition.',
              },
            ]} />
          </SectionCard>

          {/* 6 — What you can do */}
          <SectionCard id="action">
            <SectionTitle>What you can do</SectionTitle>
            <Para>
              Individual choices matter less than policy at the aggregate level, but they
              are not irrelevant &mdash; particularly for higher-income households whose
              transport choices have larger footprints.
            </Para>
            <BulletList items={[
              {
                bold: 'The 5 km threshold.',
                text: 'Most car trips in Belgian cities are under 5 km. This distance is comfortably cyclable for most adults in 15\u201320 minutes, often faster than driving when parking time is included. An e-bike extends this threshold to 10\u201315 km for most people.',
              },
              {
                bold: 'Try the train for intercity commuting.',
                text: 'Belgium has a dense rail network. For commutes of 20\u201360 km, a season ticket (abonnement SNCB) combined with a bike at the station is often cheaper than a car when all costs are accounted for: fuel, parking, insurance, depreciation.',
              },
              {
                bold: 'One less car, not a greener car.',
                text: 'Switching from a petrol car to an electric car reduces direct emissions but does not reduce congestion, parking pressure, or space use. A household that reduces from two cars to one makes a larger practical difference to urban liveability than one that switches both cars to EVs.',
              },
              {
                bold: 'Support policies that price road use fairly.',
                text: 'Brussels is considering a kilometre charge; Antwerp has a long-standing ring-road toll discussion. These measures are politically unpopular but the evidence from cities that have implemented road pricing (London, Stockholm, Milan) is unambiguous: they reduce congestion, improve air quality, and generate revenue that can be reinvested in public transport.',
              },
            ]} />
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Eurostat \u2014 Modal split of inland passenger transport (tran_hv_psmod), 2021', url: 'https://ec.europa.eu/eurostat/databrowser/view/TRAN_HV_PSMOD' },
                { label: 'TomTom Traffic Index 2023 \u2014 Brussels city report', url: 'https://www.tomtom.com/traffic-index/brussels-traffic' },
                { label: 'Brussels Environment \u2014 LEZ Annual Report 2024', url: 'https://lez.brussels/medias/LEZ-Report-2024-EN.pdf' },
                { label: 'lez.brussels \u2014 Impact of the Low Emission Zone (2018\u20132024)', url: 'https://lez.brussels/mytax/en/practical?tab=Impact' },
                { label: 'City of Ghent \u2014 Cycling policy and circulation plan', url: 'https://stad.gent/en/mobility-ghent/cycling-policy' },
                { label: 'Copenhagenize Index 2025 \u2014 Ghent 3rd globally', url: 'https://www.nextmobility.be/en/post/copenhagenize-index-2025-belgian-cities-ghent-antwerp/' },
                { label: 'EEA \u2014 Air quality in Europe 2023 report (premature deaths Belgium)', url: 'https://www.eea.europa.eu/en/analysis/publications/air-quality-in-europe-2023' },
                { label: 'Bicycle Dutch \u2014 Ghent: improved cycling by diverting through traffic (2024)', url: 'https://bicycledutch.wordpress.com/2024/07/03/ghent-belgium-improved-cycling-by-diverting-through-traffic/' },
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
        <p>
          Data sourced from Eurostat, TomTom, Brussels Environment, City of Ghent and other
          official sources. Last updated April 2026.
        </p>
      </footer>
    </div>
  );
}
