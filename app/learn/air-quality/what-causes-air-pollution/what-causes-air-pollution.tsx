'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const TOPIC_COLOR = '#8b5cf6';

const SECTIONS = [
  { id: 'intro',     label: 'Introduction'          },
  { id: 'pm25',      label: 'PM2.5 sources'          },
  { id: 'nox',       label: 'NOx sources'            },
  { id: 'nh3',       label: 'NH\u2083 sources'       },
  { id: 'solutions', label: 'What can be done?'      },
  { id: 'sources',   label: 'Sources'                },
];

// ── Sector colours (consistent across all charts) ─────────────────────────────
const SECTOR_COLORS: Record<string, string> = {
  'Agriculture':           '#10b981',
  'Residential heating':   '#ef4444',
  'Industry':              '#f59e0b',
  'Transport':             '#3b82f6',
  'Energy production':     '#6366f1',
  'Livestock':             '#059669',
  'Other agriculture':     '#6ee7b7',
  'Other':                 '#9ca3af',
};

// ── Data ──────────────────────────────────────────────────────────────────────

const pm25Flanders = [
  { name: 'Agriculture',         value: 43 },
  { name: 'Residential heating', value: 25 },
  { name: 'Industry',            value: 19 },
  { name: 'Transport',           value: 9  },
  { name: 'Other',               value: 4  },
];

const pm25Wallonia = [
  { name: 'Residential heating', value: 35 },
  { name: 'Industry',            value: 23 },
  { name: 'Agriculture',         value: 18 },
  { name: 'Transport',           value: 12 },
  { name: 'Other',               value: 12 },
];

const noxFlanders = [
  { name: 'Transport',           value: 52 },
  { name: 'Residential heating', value: 20 },
  { name: 'Industry',            value: 16 },
  { name: 'Energy production',   value: 7  },
  { name: 'Agriculture',         value: 5  },
];

const noxWallonia = [
  { name: 'Transport',           value: 33 },
  { name: 'Industry',            value: 31 },
  { name: 'Residential heating', value: 22 },
  { name: 'Energy production',   value: 9  },
  { name: 'Agriculture',         value: 5  },
];

const nh3Flanders = [
  { name: 'Livestock',           value: 85 },
  { name: 'Other agriculture',   value: 9  },
  { name: 'Other',               value: 6  },
];

const nh3Wallonia = [
  { name: 'Livestock',           value: 84 },
  { name: 'Other agriculture',   value: 10 },
  { name: 'Other',               value: 6  },
];

// ── Layout components ─────────────────────────────────────────────────────────

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

// ── Pie chart component ───────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; value: number;
}) {
  if (value < 7) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${value}%`}
    </text>
  );
}

function RegionPie({ title, data, note }: {
  title: string;
  data: { name: string; value: number }[];
  note: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, textAlign: 'center' }}>
        {title}
      </p>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={78}
            dataKey="value"
            labelLine={false}
            label={renderLabel as any}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={SECTOR_COLORS[entry.name] ?? '#9ca3af'} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ fontSize: '0.82rem' }} />
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: '0.78rem', paddingTop: 4 }}
            formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 4, textAlign: 'center', lineHeight: 1.4 }}>{note}</p>
    </div>
  );
}

function DualPie({ left, right, caption }: {
  left: React.ReactNode;
  right: React.ReactNode;
  caption: string;
}) {
  return (
    <div style={{ margin: '16px 0 8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {left}
        {right}
      </div>
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 6, lineHeight: 1.4 }}>{caption}</p>
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────

function KeyFigures() {
  const figs = [
    { value: '43%', label: 'of PM2.5 concentrations in Flanders', sub: 'Attributed to agriculture — mainly ammonia from livestock (Luchtbeleidsplan 2030)', color: TOPIC_COLOR },
    { value: '94%', label: 'of NH\u2083 emissions', sub: 'Come from agriculture in both Flanders and Wallonia, primarily livestock manure', color: '#10b981' },
    { value: '33\u201352%', label: 'of NOx from transport', sub: 'Road traffic is the dominant NOx source in both regions, with industry also significant in Wallonia', color: '#3b82f6' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
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

export default function WhatCausesAirPollution() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F32C;&#xFE0F;  Air Quality</p>
            <h1 className="detail-title">What Causes Air Pollution?</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/vehicle-exhaust.PNG" alt="Vehicle exhaust" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>Where does air pollution come from?</SectionTitle>
            <Para>
              Air pollution is not one thing — it is a mix of particles, gases, and chemical precursors produced
              by many different human activities. The relative importance of each source varies significantly by
              pollutant and by region. In Belgium, Flanders and Wallonia have quite different emission profiles,
              shaped by differences in land use, industrial history, and population density.
            </Para>
            <Para>
              This article focuses on three pollutants that drive the largest health and environmental burdens
              in Belgium: fine particulate matter (PM2.5), nitrogen oxides (NOx), and ammonia (NH&#x2083;).
              Understanding where each comes from is the starting point for designing effective policy responses.
            </Para>
          </SectionCard>

          {/* 2 — PM2.5 */}
          <SectionCard id="pm25">
            <SectionTitle>Fine particulate matter (PM2.5)</SectionTitle>
            <Para>
              PM2.5 reaches the air through two very different pathways. <strong>Primary PM2.5</strong> is
              emitted directly — most importantly from the incomplete combustion of wood in household stoves
              and open fireplaces, followed by diesel exhaust and industrial processes. <strong>Secondary
              PM2.5</strong> forms in the atmosphere when precursor gases react chemically: ammonia (NH&#x2083;)
              from agriculture, nitrogen oxides from combustion, and sulphur dioxide from industry combine with
              other compounds to produce fine inorganic aerosols. It is this secondary pathway that makes
              agriculture such a disproportionately large contributor to PM2.5 concentrations in Flanders,
              even though farms emit no particles directly.
            </Para>
            <Para>
              It is also worth noting that roughly three quarters of the PM2.5 attributed to road traffic in
              Belgium is now <strong>non-exhaust</strong> — tyre wear, brake dust, and road abrasion — meaning
              that switching to electric vehicles reduces but does not eliminate traffic&apos;s particle burden.
            </Para>
            <DualPie
              left={
                <RegionPie
                  title="Flanders — contribution to PM2.5 concentrations"
                  data={pm25Flanders}
                  note="Source: Luchtbeleidsplan 2030 (VMM). Agriculture 43% and industry 19% are directly sourced; remaining sectors estimated from qualitative descriptions in the plan."
                />
              }
              right={
                <RegionPie
                  title="Wallonia — share of PM2.5 emissions"
                  data={pm25Wallonia}
                  note="Source: \u00c9tat de l&apos;environnement wallon / SPW-AwAC (2020). Industry 23% and transport 12% are directly sourced; remaining sectors estimated."
                />
              }
              caption="Note: Flanders shows concentration contributions (including secondary PM2.5 from agricultural NH\u2083); Wallonia shows direct emission shares. Methodologies differ and charts should not be directly compared."
            />
            <Para>
              The contrast between the two regions is striking. In Flanders, the dense livestock sector drives
              enormous secondary PM2.5 formation via ammonia, making agriculture the single largest contributor
              to air quality degradation despite not being a direct particle emitter. In Wallonia, the legacy
              heavy industrial base &mdash; glass, cement, steel, and quarrying &mdash; and widespread
              residential wood burning share the leading roles, with agriculture playing a smaller but still
              significant part.
            </Para>
          </SectionCard>

          {/* 3 — NOx */}
          <SectionCard id="nox">
            <SectionTitle>Nitrogen oxides (NOx)</SectionTitle>
            <Para>
              NOx &mdash; mainly nitric oxide (NO) and nitrogen dioxide (NO&#x2082;) &mdash; forms whenever
              fuel is burned at high temperatures: the nitrogen in air reacts with oxygen inside combustion
              chambers. Road traffic is the dominant source in both regions, because engines cycle rapidly
              through high-temperature combustion millions of times a day across a dense road network.
              Diesel engines are particularly problematic: they run hotter and leaner than petrol engines,
              producing several times more NOx per kilometre.
            </Para>
            <Para>
              Beyond traffic, large industrial combustion installations &mdash; power plants, cement kilns,
              glass furnaces, chemical plants &mdash; contribute substantially, especially in Wallonia where
              heavy industry has a much larger footprint than in Flanders. Residential gas boilers and
              wood stoves also contribute to the buildings sector share. NOx matters not only as a
              direct pollutant but as a precursor to both secondary PM2.5 and ground-level ozone.
            </Para>
            <DualPie
              left={
                <RegionPie
                  title="Flanders — NOx emission shares"
                  data={noxFlanders}
                  note="Source: Luchtbeleidsplan 2030 (VMM). Industry 16% directly sourced; transport dominant status confirmed; other sectors estimated proportionally."
                />
              }
              right={
                <RegionPie
                  title="Wallonia — NOx emission shares"
                  data={noxWallonia}
                  note="Source: \u00c9tat de l&apos;environnement wallon / SPW-AwAC (2020). Transport 33% and industry 31% directly sourced; remaining sectors estimated."
                />
              }
              caption="The most notable regional contrast: in Wallonia, industry contributes nearly as much NOx as road transport (31% vs 33%), reflecting the region's heavier industrial base. In Flanders, transport is the dominant source by a wider margin."
            />
            <Para>
              The progress on NOx has been substantial but uneven. Between 1990 and 2022, Belgian NOx
              emissions fell by 69%, driven mainly by successive Euro emission standards for vehicles.
              However, diesel cars in &ldquo;real-world&rdquo; driving conditions consistently emit far
              more NOx than laboratory tests suggest &mdash; a problem known as the
              &ldquo;dieselgate&rdquo; gap that has slowed expected reductions.
            </Para>
          </SectionCard>

          {/* 4 — NH3 */}
          <SectionCard id="nh3">
            <SectionTitle>Ammonia (NH&#x2083;)</SectionTitle>
            <Para>
              Ammonia is agriculture&apos;s most damaging air pollutant. It does not cause direct health harm
              by inhalation at ambient concentrations, but it plays a pivotal role in secondary PM2.5 formation
              by reacting in the atmosphere with nitrogen oxides and sulphur dioxide to produce fine ammonium
              nitrate and ammonium sulphate aerosols &mdash; particles small enough to reach deep into the lungs.
              Agriculture is responsible for around 94% of all NH&#x2083; emissions in both Flanders and
              Wallonia, and the vast majority of that comes from livestock: the decomposition of urine and
              manure in stables, during storage, and when slurry is spread on fields.
            </Para>
            <Para>
              Flanders, with one of the highest livestock densities in Europe, faces a particularly acute
              ammonia challenge. The nitrogen deposited from NH&#x2083; also damages ecosystems, contributing
              to the acidification and eutrophication of natural habitats. In 2021, the Flemish government
              adopted the controversial stikstofdecreet (nitrogen decree) to address this,
              setting binding 2030 reduction targets for NH&#x2083; emissions.
            </Para>
            <DualPie
              left={
                <RegionPie
                  title="Flanders — NH\u2083 emission shares"
                  data={nh3Flanders}
                  note="Source: 2nd Progress Report, Vlaams Luchtbeleidsplan 2030 (VMM, 2023). Agriculture 94% directly sourced; livestock share 90% of agricultural total."
                />
              }
              right={
                <RegionPie
                  title="Wallonia — NH\u2083 emission shares"
                  data={nh3Wallonia}
                  note="Source: \u00c9tat de l&apos;environnement wallon / SPW-AwAC. Agriculture ~94% consistent with national and EU data; breakdown between livestock and other agriculture estimated."
                />
              }
              caption="NH\u2083 sources are nearly identical across both regions: agriculture overwhelmingly dominates, with livestock manure management accounting for the vast majority of emissions. The distribution looks the same because the underlying chemistry and farm practices are similar."
            />
          </SectionCard>

          {/* 5 — Solutions */}
          <SectionCard id="solutions">
            <SectionTitle>What can be done?</SectionTitle>
            <Para>
              Reducing air pollution requires action across all major source sectors. Belgium has made
              significant progress, but meeting WHO guidelines will require both stronger policy and
              individual behaviour change.
            </Para>

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '16px 0 8px' }}>
              &#x1F697; Transport: Low Emission Zones and Euro standards
            </p>
            <BulletList items={[
              {
                bold: 'Low Emission Zones (LEZ)',
                text: 'Brussels, Antwerp, and Ghent have introduced LEZs that progressively ban older, more polluting vehicles. Brussels\u2019 LEZ has contributed to a near-47% drop in NO\u2082 concentrations between 2006 and 2022. Evidence shows cities with LEZs achieve faster NO\u2082 reductions than those without.',
              },
              {
                bold: 'Euro emission standards',
                text: 'Each new Euro standard (currently Euro 6d for cars) significantly cuts NOx and particle emissions per kilometre. The upcoming Euro 7 standard extends stricter limits to non-exhaust emissions (tyres, brakes) for the first time. The key challenge remains the slow fleet turnover: standards only apply to new vehicles.',
              },
              {
                bold: 'Electrification',
                text: 'Electric vehicles eliminate exhaust NOx and black carbon entirely, and significantly reduce fine particles, though non-exhaust emissions from tyre and brake wear remain. Belgium\u2019s company car fiscal regime has historically favoured diesel; the shift toward mandatory zero-emission company cars from 2026 will accelerate fleet electrification.',
              },
            ]} />

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>
              &#x1F6E0; Industry and energy
            </p>
            <BulletList items={[
              {
                bold: 'Industrial emission limits',
                text: 'The EU Industrial Emissions Directive (IED) sets binding Best Available Technique (BAT) limits for large installations. VLAREM in Flanders and equivalent Walloon legislation tighten standards for SO\u2082, NOx, and PM2.5 from combustion and process emissions.',
              },
              {
                bold: 'Phase-out of coal and fossil fuel combustion',
                text: 'Belgium\u2019s last coal-fired power station closed in 2016. Continued decarbonisation of industrial heat \u2014 replacing gas boilers and furnaces with electrification or green hydrogen \u2014 will further reduce NOx and SO\u2082.',
              },
            ]} />

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>
              &#x1F33F; Agriculture: tackling NH&#x2083;
            </p>
            <BulletList items={[
              {
                bold: 'Low-emission manure application',
                text: 'Injecting slurry directly into the soil rather than surface-spreading dramatically reduces the ammonia that volatilises into the air. Belgium has made this technique mandatory for most applications, but enforcement and coverage remain incomplete.',
              },
              {
                bold: 'Air scrubbers on stables',
                text: 'Flanders requires air scrubbers on pig and poultry stables above certain size thresholds, removing NH\u2083 before it leaves the building. An electronic monitoring system is being introduced to improve compliance.',
              },
              {
                bold: 'Livestock density reduction',
                text: 'The Flemish nitrogen decree (stikstofdecreet) sets binding emission targets for 2030 that will require some farms to reduce herd sizes or close, recognising that technical measures alone cannot achieve the needed reductions given current livestock numbers.',
              },
            ]} />

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>
              &#x1F3E0; Households: wood burning
            </p>
            <BulletList items={[
              {
                bold: 'Green Deal on residential wood combustion (Flanders)',
                text: 'A voluntary agreement between the Flemish government, manufacturers, and retailers aims to phase out old, highly polluting wood stoves and open fireplaces and replace them with certified low-emission models. Open fireplaces are among the dirtiest sources of primary PM2.5.',
              },
              {
                bold: 'Practical guidance for users',
                text: 'Much of the particulate impact of wood burning depends on behaviour: dry wood (below 20% moisture) burns far more cleanly than green or damp wood. Many Belgian municipalities issue smog advisories during winter temperature inversions asking residents to avoid burning solid fuels.',
              },
            ]} />

            <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', margin: '20px 0 8px' }}>
              &#x1F6B6; Individual actions with the most impact
            </p>
            <BulletList items={[
              { bold: 'Switch travel modes', text: 'Replacing short car trips with cycling, walking, or public transport reduces your contribution to NOx and particle pollution in densely populated areas where the health impact of road emissions is highest.' },
              { bold: 'Avoid burning solid fuels', text: 'If you have a wood stove, use only certified dry wood and a high-efficiency certified stove. Avoid burning treated wood, waste, or damp fuel.' },
              { bold: 'Reduce meat and dairy consumption', text: 'Livestock farming drives the vast majority of Belgian NH\u2083 emissions. Reducing demand for animal products is one of the most direct individual levers on ammonia pollution.' },
              { bold: 'Check daily air quality', text: 'IRCEL-CELINE publishes real-time air quality maps and forecasts at irceline.be. On high-pollution days \u2014 especially during winter temperature inversions or spring NH\u2083 peaks \u2014 reducing outdoor exercise protects your health.' },
            ]} />
          </SectionCard>

          {/* 6 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'VMM \u2014 Vlaams Luchtbeleidsplan 2030',                                                     url: 'https://omgeving.vlaanderen.be/sites/default/files/2021-12/Luchtbeleidsplan%202030.pdf' },
                { label: 'VMM \u2014 2nd Progress Report, Vlaams Luchtbeleidsplan 2030 (2023)',                         url: 'https://vmm.vlaanderen.be/publicaties/vlaams-luchtbeleidsplan-2030-voortgangsrapport-2023/@@download/attachment' },
                { label: 'VMM \u2014 Industrie: uitstoot van luchtverontreinigende stoffen',                            url: 'https://vmm.vlaanderen.be/feiten-cijfers/lucht/vanwaar-komt-de-luchtverontreiniging/bedrijven/uitstoot-van-luchtverontreinigende-stoffen' },
                { label: '\u00c9tat de l\u2019environnement wallon \u2014 \u00c9missions de particules (SPW-AwAC)',     url: 'https://etat.environnement.wallonie.be/contents/indicatorsheets/AIR%204.html' },
                { label: '\u00c9tat de l\u2019environnement wallon \u2014 \u00c9missions de pr\u00e9curseurs d\u2019ozone (SPW-AwAC)', url: 'https://etat.environnement.wallonie.be/contents/indicatorsheets/AIR%203.html' },
                { label: '\u00c9tat de l\u2019environnement wallon \u2014 \u00c9missions de polluants acidifiants',      url: 'https://etat.environnement.wallonie.be/contents/indicatorsheets/AIR%202.html' },
                { label: '\u00c9tat de l\u2019environnement wallon \u2014 \u00c9missions atmosph\u00e9riques de l\u2019industrie', url: 'http://etat.environnement.wallonie.be/contents/indicatorsheets/INDUS%202.html' },
                { label: 'indicators.be \u2014 Nitrogen oxide emissions (IRCEL-CELINE / FPB, 2024)',                    url: 'https://www.indicators.be/en/i/G11_NOX/Nitrogen_oxide_emissions_(i53)' },
                { label: 'Healthy Belgium / Sciensano \u2014 Air quality indicator sheet, 2024',                        url: 'https://www.healthybelgium.be/en/health-status/determinants-of-health/air-quality' },
                { label: 'City of Brussels \u2014 Air quality & Low Emission Zone',                                     url: 'https://www.brussels.be/air-quality' },
                { label: 'IRCEL-CELINE \u2014 National Emission Ceilings Directive reporting',                          url: 'https://www.irceline.be/en/air-quality/emissions' },
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
