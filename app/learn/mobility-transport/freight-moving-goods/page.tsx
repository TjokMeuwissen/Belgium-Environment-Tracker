'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, LabelList,
} from 'recharts';

const TOPIC_COLOR = '#ec4899';

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',    label: 'Why freight matters'        },
  { id: 'chart',    label: 'Emissions by mode'          },
  { id: 'belgium',  label: 'Belgium\u2019s freight picture' },
  { id: 'why-road', label: 'Why road dominates'         },
  { id: 'shift',    label: 'What can shift this'        },
  { id: 'sources',  label: 'Sources'                    },
];

// ── Data ──────────────────────────────────────────────────────────────────────
// Source: ECTA Guidelines; consistent with EEA 2021 (Fraunhofer ISI / CE Delft)
// Units: g CO2 per tonne-km (well-to-wheel)
const freightData = [
  { name: 'Air cargo',               value: 602, fill: '#dc2626' },
  { name: 'Road \u2014 HGV (diesel)', value: 62,  fill: '#f97316' },
  { name: 'Inland waterway',          value: 26,  fill: '#65a30d' },
  { name: 'Rail freight',             value: 22,  fill: '#16a34a' },
  { name: 'Maritime (container)',      value: 6,   fill: '#059669' },
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
          <span>{item.bold && <strong>{item.bold} </strong>}{item.text}</span>
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
      value: '8%',
      label: 'of global GHG from freight',
      sub: 'Up to 11% including warehouses & ports. Comparable to all of global aviation (IEA 2018)',
      color: '#f97316',
    },
    {
      value: '97\u00d7',
      label: 'Air vs maritime cargo intensity',
      sub: '602 g CO\u2082/tkm for air cargo vs 6 g for container ships (ECTA guidelines)',
      color: '#dc2626',
    },
    {
      value: '75%',
      label: 'of Belgian freight goes by road',
      sub: 'Far above the EU 2030 target of 63.7%. Rail and waterway remain under-used (Eurostat)',
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
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Freight emissions chart with linear / log toggle ──────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const entry = freightData.find(d => d.name === label);
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '10px 14px', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#374151' }}>
        <strong>{entry?.value} g CO&#x2082;</strong> per tonne-km
      </p>
    </div>
  );
};

function FreightChart() {
  const [isLog, setIsLog] = useState(false);

  // For log scale recharts needs a domain that avoids 0
  const yDomain: [number, number] = isLog ? [1, 1000] : [0, 650];
  const ticks = isLog ? [1, 10, 100, 1000] : [0, 100, 200, 300, 400, 500, 600];

  return (
    <div>
      {/* Scale toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem', color: '#6b7280' }}>
          Scale:
        </span>
        {(['Linear', 'Logarithmic'] as const).map(label => {
          const active = (label === 'Logarithmic') === isLog;
          return (
            <button
              key={label}
              onClick={() => setIsLog(label === 'Logarithmic')}
              style={{
                padding: '5px 14px', borderRadius: 20,
                border: `2px solid ${active ? TOPIC_COLOR : '#e5e7eb'}`,
                background: active ? TOPIC_COLOR : '#fff',
                color: active ? '#fff' : '#374151',
                fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          );
        })}
        {isLog && (
          <span style={{
            fontFamily: 'Roboto, sans-serif', fontSize: '0.75rem',
            color: '#6b7280', fontStyle: 'italic',
          }}>
            Each gridline = 10&times; the previous
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={freightData}
          layout="vertical"
          margin={{ top: 4, right: 64, left: 0, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            scale={isLog ? 'log' : 'linear'}
            domain={yDomain}
            ticks={ticks}
            tick={{ fontSize: 11, fill: '#374151' }}
            tickFormatter={v => `${v}`}
            label={{
              value: 'g CO\u2082e per tonne-km',
              position: 'insideBottom', offset: -14,
              style: { fontSize: 10, fill: '#4b5563' },
            }}
            allowDataOverflow={isLog}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={162}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive>
            {freightData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
              formatter={(v: number) => `${v} g`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.45 }}>
        Source: ECTA &mdash; Guidelines for Measuring and Managing CO&#x2082; Emissions from
        Freight Transport Operations; consistent with EEA (2021), Fraunhofer ISI / CE Delft.
        All values are well-to-wheel. Maritime figure is for a laden container ship
        (3&ndash;8 g range; 6 g used here as central estimate).
        {' '}<em>Switch to logarithmic scale to compare all modes at once.</em>
      </p>
    </div>
  );
}

// ── Modal split bar ───────────────────────────────────────────────────────────
function ModalSplitBar() {
  const segments = [
    { label: 'Road', pct: 75, color: '#f97316' },
    { label: 'Rail', pct: 14, color: '#16a34a' },
    { label: 'Waterway', pct: 10, color: '#3b82f6' },
    { label: 'Other', pct: 1,  color: '#d1d5db' },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.82rem',
        color: '#374151', marginBottom: 8,
      }}>
        Belgium inland freight modal split (tonne-km, approx. 2022)
      </p>
      <div style={{
        height: 36, borderRadius: 6, overflow: 'hidden',
        display: 'flex', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}>
        {segments.map(s => (
          <div key={s.label} style={{
            width: `${s.pct}%`, background: s.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {s.pct >= 5 && (
              <span style={{
                color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                fontFamily: 'Roboto, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}>
                {s.label} {s.pct}%
              </span>
            )}
          </div>
        ))}
      </div>
      {/* EU target line */}
      <div style={{ position: 'relative', height: 20, marginTop: 4 }}>
        <div style={{
          position: 'absolute', left: '63.7%', top: 0,
          borderLeft: '2px dashed #1d4ed8', height: '100%',
        }} />
        <span style={{
          position: 'absolute', left: 'calc(63.7% + 4px)', top: 2,
          fontFamily: 'Roboto, sans-serif', fontSize: '0.7rem',
          color: '#1d4ed8', fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          EU 2030 road target: 63.7%
        </span>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif', marginTop: 8 }}>
        Source: Eurostat (tran_hv_frmod). Values are approximate; excludes international maritime.
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
export default function FreightMovingGoods() {
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
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F69A;&nbsp; Mobility</p>
            <h1 className="detail-title">Freight: moving goods</h1>
            <p className="header-sub" style={{ marginTop: 10 }}>
              Freight is responsible for 8% of global greenhouse gas emissions and is one of
              the hardest sectors to decarbonise. Yet the choice of mode makes an enormous
              difference &mdash; container ships emit 97 times less per tonne-km than air cargo.
            </p>
          </div>
          <img
            src="/images/learn/container.jpg"
            alt="Freight containers"
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Why freight matters */}
          <SectionCard id="intro">
            <SectionTitle>Why freight matters</SectionTitle>
            <Para>
              Every product you buy has a transport footprint before it reaches you. The clothes,
              electronics, food, and building materials that make up modern life all move through
              a global logistics network powered almost entirely by fossil fuels. Yet freight
              rarely features in personal carbon footprint conversations, because individuals
              do not directly choose how their goods are shipped &mdash; it happens invisibly,
              upstream in the supply chain.
            </Para>
            <Para>
              The scale is significant. Freight transportation accounts for roughly{' '}
              <strong>8% of global greenhouse gas emissions</strong> &mdash; and up to 11%
              if the energy used in warehouses and ports is included (IEA / MIT Climate Portal).
              That makes it comparable in size to the entire aviation sector, or all of global
              agriculture. Road freight trucks alone account for nearly 30% of all transport
              CO&#x2082; emissions worldwide.
            </Para>
            <Para>
              Unlike passenger transport, where electric alternatives are already scaling
              rapidly, <strong>nearly all freight still runs on oil and diesel</strong>.
              The International Transport Forum projects global freight demand to double by 2050.
              Without a major shift in fuels and transport modes, this would roughly double
              freight&apos;s emissions at the same time as other sectors are cutting theirs &mdash;
              making freight an increasingly large share of remaining global emissions.
            </Para>

            {/* Container ship image — half width, preserving 1000x667 ratio, centered */}
            <div style={{ marginTop: 20, marginBottom: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img
                src="/images/learn/container-ship.jpg"
                alt="Container ship at sea"
                style={{
                  width: '50%',
                  aspectRatio: '1000 / 667',
                  objectFit: 'cover',
                  borderRadius: 8,
                  display: 'block',
                }}
              />
              <p style={{
                fontSize: '0.72rem', color: '#6b7280',
                fontFamily: 'Roboto, sans-serif', marginTop: 6,
                textAlign: 'center', width: '50%',
              }}>
                Container shipping is by far the most carbon-efficient mode of freight transport,
                emitting as little as 3&ndash;8 g CO&#x2082; per tonne-km.
              </p>
            </div>
          </SectionCard>

          {/* 2 — Emissions by mode */}
          <SectionCard id="chart">
            <SectionTitle>Emissions by freight mode</SectionTitle>
            <Para>
              Not all freight is equal. The difference in carbon intensity between modes is
              not a small efficiency gap &mdash; it spans two orders of magnitude. The chart
              below shows grams of CO&#x2082; equivalent emitted per tonne of cargo moved
              one kilometre, on a well-to-wheel basis.
            </Para>

            <FreightChart />

            <Para style={{ marginTop: 16 }}>
              The result that jumps out on the linear scale is air cargo at 602 g/tkm &mdash;
              nearly ten times more than a diesel truck, and almost 100 times more than a
              container ship. Switch to the logarithmic scale to see the full range properly:
              on that view you can see that rail and maritime shipping are clustered together
              at very low intensity, while road sits in the middle, and air cargo is in a
              category of its own.
            </Para>
            <Callout color="#dc2626" title="When does air freight get used?">
              If air cargo is so much more polluting, why does anyone use it? Air freight
              is reserved for goods where speed justifies extreme cost &mdash; fresh flowers,
              pharmaceuticals, electronics components for just-in-time manufacturing, and
              high-value spare parts. It represents less than 1% of global freight by volume
              but a much larger share by value. The climate case for avoiding air freight
              wherever possible is overwhelming.
            </Callout>
          </SectionCard>

          {/* 3 — Belgium */}
          <SectionCard id="belgium">
            <SectionTitle>Belgium&apos;s freight picture: a crossroads problem</SectionTitle>
            <Para>
              Belgium is not a typical freight country. It sits at the geographic heart of
              northwest European trade, hosts the{' '}
              <strong>Port of Antwerp-Bruges</strong> &mdash; the second largest port in
              Europe by cargo volume &mdash; and serves as a road freight hub connecting
              the UK, France, Germany, and the Netherlands. Freight is not peripheral to
              Belgium&apos;s economy; it is central to it.
            </Para>

            <ModalSplitBar />

            <Para>
              Yet despite this strategic position, Belgium&apos;s inland freight modal split
              is dominated by road. Road transport carries approximately <strong>75% of
              Belgian inland freight</strong> measured in tonne-kilometres &mdash; far above
              the EU&apos;s 2030 target of bringing that share down to 63.7%. Rail accounts
              for around 14%, and inland waterways &mdash; despite Belgium&apos;s extensive
              canal network connecting Antwerp to Brussels, Li&egrave;ge, and the Rhine &mdash;
              for roughly 10%.
            </Para>
            <Para>
              This matters because road freight emits 3&ndash;4 times more CO&#x2082; per
              tonne-km than rail or inland waterway. Belgium has the infrastructure for
              alternatives: electrified rail freight lines, the Rhine&ndash;Scheldt waterway
              system, and direct barge connections between Antwerp and major industrial
              centres. The gap between what is available and what is actually used is primarily
              a policy and pricing problem, not an infrastructure one.
            </Para>
          </SectionCard>

          {/* 4 — Why road dominates */}
          <SectionCard id="why-road">
            <SectionTitle>Why road dominates: price signals and flexibility</SectionTitle>
            <Para>
              If rail and waterways are so much more carbon-efficient, why does road carry
              three quarters of Belgian freight? Several structural factors tip the balance.
            </Para>
            <BulletList items={[
              {
                bold: 'Door-to-door flexibility.',
                text: 'Trucks deliver directly from origin to destination without transhipment. Rail and barge require loading at a terminal, transport, and unloading at another terminal \u2014 adding time, cost, and complexity for anything except bulk or long-distance freight. For small consignments or time-sensitive goods, road is often genuinely more practical.',
              },
              {
                bold: 'Road is underpriced.',
                text: 'Road freight does not pay for its full external costs \u2014 road wear, local air pollution, congestion, and carbon. Rail freight, by contrast, pays infrastructure access charges that road does not face in equivalent form. This systematic underpricing of road\u2019s true cost tilts the economics even on routes where rail or waterway would be faster or more efficient on a full-cost basis.',
              },
              {
                bold: 'Rail freight infrastructure is under-invested.',
                text: 'Belgium\u2019s rail network prioritises passenger services. Freight trains run on the same tracks and are routinely delayed to give way to passenger services. Dedicated freight paths and corridor improvements are planned under EU policy, but progress is slow.',
              },
              {
                bold: 'Just-in-time logistics favour speed over efficiency.',
                text: 'Modern supply chains, particularly in retail and manufacturing, are built around frequent, small, fast deliveries. This model inherently favours road freight over modes that require advance booking and fixed schedules.',
              },
            ]} />
            <Callout color="#1d4ed8" title="The inland waterway opportunity">
              Belgium has one of the densest navigable waterway networks in Europe, with
              direct barge connections between Antwerp and Brussels, Li&egrave;ge, Ghent,
              and the Rhine delta. A fully loaded barge can carry the equivalent of 110 trucks
              while emitting a fraction of the CO&#x2082;. Yet waterway&apos;s 10% modal share
              has barely changed in two decades. Digitalising barge scheduling and integrating
              waterway capacity into logistics platforms is one of the most underexploited
              decarbonisation opportunities in Belgian transport.
            </Callout>
          </SectionCard>

          {/* 5 — What can shift this */}
          <SectionCard id="shift">
            <SectionTitle>What can shift this</SectionTitle>
            <Para>
              Decarbonising freight requires action at multiple levels. The most impactful
              levers are structural &mdash; but individual and business choices also matter.
            </Para>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontWeight: 700,
              fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px',
            }}>
              Policy levers
            </p>
            <BulletList items={[
              {
                bold: 'Carbon pricing applied to road freight.',
                text: 'A kilometre charge or carbon price that reflects road freight\u2019s true external costs would shift the economics towards rail and waterway for long-distance freight without requiring regulatory mandates.',
              },
              {
                bold: 'EU rail freight corridor investment.',
                text: 'The Rhine-Alpine corridor passes through Belgium and is a priority under EU transport policy. Expanding freight path capacity, reducing conflicts with passenger services, and standardising cross-border operating rules would reduce cost and journey time for rail freight.',
              },
              {
                bold: 'Inland waterway digitalisation.',
                text: 'Real-time capacity information, digital booking platforms, and integration with logistics management systems would make barge freight competitive with road for a wider range of consignments.',
              },
            ]} />
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontWeight: 700,
              fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px',
            }}>
              For businesses
            </p>
            <Para>
              Modal shift for long-distance, non-time-critical goods from road to rail or
              barge is the single largest lever available to companies. A tonne of goods
              travelling from Antwerp to Lyon by barge emits roughly three times less than
              by truck. Consolidating shipments &mdash; fewer, larger loads rather than
              frequent small ones &mdash; dramatically improves the economics of both rail
              and waterway. Accepting slightly longer delivery windows in return for lower
              carbon intensity is increasingly asked by large corporate buyers under their
              own scope 3 emissions commitments.
            </Para>
            <p style={{
              fontFamily: 'Roboto, sans-serif', fontWeight: 700,
              fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px',
            }}>
              For individuals
            </p>
            <Para>
              The most impactful freight choice available to most people is <strong>pace</strong>
              &mdash; choosing standard delivery over same-day or next-day reduces the
              pressure for individual, inefficient van trips and increases the proportion
              of deliveries made in consolidated loads. Buying locally produced goods reduces
              long-haul freight demand. And reducing overall consumption of manufactured goods
              &mdash; particularly those shipped by air &mdash; matters more than any
              individual logistics choice.
            </Para>
          </SectionCard>

          {/* 6 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'MIT Climate Portal \u2014 Freight Transportation (IEA 2018 data)', url: 'https://climate.mit.edu/explainers/freight-transportation' },
                { label: 'EEA (2021) \u2014 Rail and waterborne: best for low-carbon motorised transport (Fraunhofer ISI / CE Delft)', url: 'https://www.eea.europa.eu/en/analysis/publications/rail-and-waterborne-best-for-low-carbon-motorised-transport' },
                { label: 'ECTA \u2014 Guidelines for Measuring and Managing CO\u2082 Emissions from Freight Transport Operations', url: 'https://www.ecta.com/wp-content/uploads/2021/03/ECTA-CEFIC-GUIDELINE-FOR-MEASURING-AND-MANAGING-CO2-ISSUE-1.pdf' },
                { label: 'Our World in Data \u2014 Cars, planes, trains: where do CO\u2082 emissions from transport come from? (IEA 2018)', url: 'https://ourworldindata.org/co2-emissions-from-transport' },
                { label: 'Eurostat \u2014 Freight transport statistics \u2014 modal split', url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Freight_transport_statistics_-_modal_split' },
                { label: 'European Commission \u2014 Sustainable and Smart Mobility Strategy (2020)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52020DC0789' },
                { label: 'International Transport Forum \u2014 ITF Transport Outlook 2021', url: 'https://www.itf-oecd.org/itf-transport-outlook-2021' },
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
          Data sourced from IEA, EEA, ECTA, Eurostat and other official sources.
          Last updated April 2026.
        </p>
      </footer>
    </div>
  );
}
