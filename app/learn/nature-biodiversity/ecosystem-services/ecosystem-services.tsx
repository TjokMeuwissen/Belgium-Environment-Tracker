// → app/learn/nature-biodiversity/ecosystem-services/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

// ── Shared micro-components ──────────────────────────────────────────────────

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '32px 36px', marginBottom: 24 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 20px', paddingBottom: 10, borderBottom: '2px solid #22c55e' }}>
      {children}
    </h2>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#374151', margin: '0 0 14px', ...style }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: { bold?: string; text: string }[] }) {
  return (
    <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 8 }}>
          <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 2 }}>▸</span>
          <span>{item.bold && <strong>{item.bold}:</strong>} {item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '14px 18px', fontSize: 14, lineHeight: 1.65, color: '#78350f', margin: '16px 0' }}>
      {children}
    </div>
  );
}

// ── Carbon Storage Chart ──────────────────────────────────────────────────────

const CARBON_DATA = [
  { name: 'Peat bogs',        value: 600, color: '#78350f', emoji: '🌿' },
  { name: 'Wetlands',         value: 350, color: '#0369a1', emoji: '💧' },
  { name: 'Temperate forest', value: 250, color: '#15803d', emoji: '🌲' },
  { name: 'Heathland',        value: 170, color: '#b45309', emoji: '🌾' },
];

function CarbonTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.emoji} {d.name}</div>
      <div style={{ color: '#86efac' }}>~{d.value} tCO₂eq / ha</div>
    </div>
  );
}

function CarbonStorageChart() {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '24px 20px 16px', margin: '20px 0' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
        Carbon stored per hectare by ecosystem type
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
        Approximate total stock (soil + biomass), tCO₂eq / ha · Temperate European conditions · IPCC / EEA
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={CARBON_DATA}
            layout="vertical"
            margin={{ top: 0, right: 70, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={(v) => `${v}`}
              label={{ value: 'tCO₂eq / ha', position: 'insideBottomRight', offset: -10, fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={145}
              tick={{ fontSize: 13, fill: '#374151' }}
              interval={0}
            />
            <Tooltip content={(props: any) => <CarbonTooltip {...props} />} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              label={{ position: 'right', formatter: (v: number) => `~${v}`, fontSize: 12, fontWeight: 700, fill: '#374151' }}
            >
              {CARBON_DATA.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, lineHeight: 1.5 }}>
        Note: values are central estimates; actual stocks vary significantly with peat depth, management history, and soil type.
        Rivers and lakes are excluded as their carbon function is primarily as conduits rather than long-term stores.
      </div>
    </div>
  );
}

// ── Ecosystem table ───────────────────────────────────────────────────────────

const ECOSYSTEMS = [
  { name: 'Forest',           belgium: '~24%', natural: '~94%', color: '#15803d', emoji: '🌲' },
  { name: 'Heathland & dunes', belgium: '~0.6%', natural: '~2.5%', color: '#b45309', emoji: '🌿' },
  { name: 'Rivers & lakes',   belgium: '~0.6%', natural: '~2.5%', color: '#0369a1', emoji: '💧' },
  { name: 'Wetlands',         belgium: '~0.2%', natural: '~1%',   color: '#0891b2', emoji: '🌾' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'intro',            label: 'Introduction' },
  { id: 'ecosystems',       label: 'Ecosystems in Belgium' },
  { id: 'services',         label: 'The Four Categories' },
  { id: 'value',            label: 'What Nature Is Worth' },
  { id: 'tool',             label: 'Natuurwaardeverkenner' },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-title">On this page</div>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(s.id);
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
          }}
        >
          {s.label}
        </a>
      ))}
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EcosystemServicesPage() {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handler = () => {
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const current = offsets.filter((o) => o.top <= 120).at(-1);
      if (current) setActiveSection(current.id);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="detail-page">

      {/* ── Header ── */}
      <div
        className="detail-header"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}
      >
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <div className="header-eyebrow" style={{ color: '#86efac' }}>🌿 Nature &amp; Biodiversity</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 12px', lineHeight: 1.2 }}>
            Ecosystem Services
          </h1>
          <p style={{ fontSize: 16, color: '#bbf7d0', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            How nature works for us — and what it&#39;s worth.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <Sidebar active={activeSection} />
        <div className="detail-main">

          {/* Introduction */}
          <SectionCard id="intro">
            <SectionTitle>Introduction</SectionTitle>
            <Para>
              An <strong>ecosystem</strong> is a community of living organisms — plants, animals,
              fungi, and microorganisms — interacting with each other and with their physical
              environment as a functioning system. The forest, the river, the peat bog, and the
              urban park are all ecosystems. What holds them together is the web of relationships
              between species and their surroundings: nutrient cycles, food chains, hydrology,
              soil processes.
            </Para>
            <Para>
              <strong>Ecosystem services</strong> are the benefits that humans derive from these
              systems — directly and indirectly. The term sounds technical, but the concept is
              simple: nature does an enormous amount of work for free. It cleans our water,
              regulates our climate, pollinates our crops, and protects us from floods. Ecosystem
              services make that invisible work visible — and in some cases, quantifiable.
            </Para>
          </SectionCard>

          {/* Ecosystems in Belgium */}
          <SectionCard id="ecosystems">
            <SectionTitle>Ecosystems in Belgium</SectionTitle>
            <Para>
              Belgium sits at the crossroads of Atlantic, continental, and sub-montane climate
              zones, giving it a wider range of ecosystem types than its small size might suggest.
              Farmland covers around 55% of the country and urban areas a further 20% — together
              they dominate the landscape but are covered elsewhere on this site. Here we focus on
              Belgium&#39;s natural ecosystems, which together account for roughly a quarter of
              national territory.
            </Para>

            {/* Ecosystem table */}
            <div style={{ overflowX: 'auto', margin: '20px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Ecosystem</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>% of Belgium</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>% of natural area</th>
                  </tr>
                </thead>
                <tbody>
                  {ECOSYSTEMS.map((eco, i) => (
                    <tr key={eco.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: eco.color, flexShrink: 0, display: 'inline-block' }} />
                          {eco.emoji} {eco.name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{eco.belgium}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#374151', borderBottom: '1px solid #f3f4f6' }}>{eco.natural}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <NoteBox>
              ⚠️ Area share is a poor guide to ecological value. Heathlands, peat bogs, and
              wetlands together cover less than 1% of Belgium, yet they store disproportionate
              amounts of carbon, regulate water flow across entire catchments, and harbour species
              found nowhere else in the country. Scarcity makes them both more valuable and more
              vulnerable.
            </NoteBox>

            <Para style={{ fontWeight: 600, marginBottom: 8, marginTop: 8 }}>
              A closer look at each ecosystem
            </Para>

            {[
              {
                emoji: '🌲',
                title: 'Forests',
                color: '#15803d',
                bg: '#f0fdf4',
                text: 'Cover around 700,000 ha nationally, concentrated in the Ardennes. They range from managed production forests (largely spruce and pine) to ancient beech woodland like the Sonian Forest. Only around 15% of Flemish forest qualifies as ancient woodland — continuously forested since the 18th century — and it is this fraction that carries the greatest biodiversity and long-term carbon value. Forest cover varies enormously by region: ~51% in the Province of Luxembourg, just 2.3% in West Flanders.',
              },
              {
                emoji: '🌿',
                title: 'Heathlands & peat bogs',
                color: '#b45309',
                bg: '#fef3c7',
                text: 'Tiny in area but among Belgium\'s most service-rich ecosystems. The Hautes Fagnes plateau hosts the largest remaining raised bog complex in Western Europe. These habitats store centuries of accumulated carbon, buffer peak water flows, and support highly specialised communities of plants, insects, and birds found nowhere else in the country.',
              },
              {
                emoji: '💧',
                title: 'Rivers, streams & lakes',
                color: '#0369a1',
                bg: '#e0f2fe',
                text: 'Form the connective tissue of the landscape, linking terrestrial ecosystems and delivering water regulation, nutrient cycling, and habitat for migratory species. Most Belgian rivers drain to the North Sea via the Scheldt and IJzer, or to the Meuse. Despite their ecological importance, most fail to meet good ecological status under the EU Water Framework Directive.',
              },
              {
                emoji: '🌾',
                title: 'Wetlands',
                color: '#0891b2',
                bg: '#ecfeff',
                text: 'Floodplains, fen meadows, coastal marshes, and tidal areas cover a tiny fraction of Belgium but deliver flood regulation, water purification, and carbon storage services that are among the highest per hectare of any ecosystem type. The Scheldt estuary and its tidal marshes are among the most important wetland systems in the country.',
              },
            ].map((eco) => (
              <div
                key={eco.title}
                style={{ borderLeft: `4px solid ${eco.color}`, background: eco.bg, borderRadius: '0 10px 10px 0', padding: '16px 20px', marginBottom: 12 }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: eco.color, marginBottom: 6 }}>
                  {eco.emoji} {eco.title}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>{eco.text}</p>
              </div>
            ))}

            <Para style={{ marginTop: 16 }}>
              The chart below illustrates one of the most important — and least intuitive — facts
              about these ecosystems: peat bogs and wetlands store far more carbon per hectare than
              forests, despite covering a fraction of the area. This is why their loss is
              disproportionately damaging for the climate, and why restoring them delivers
              outsized returns.
            </Para>

            <CarbonStorageChart />
          </SectionCard>

          {/* Four Categories */}
          <SectionCard id="services">
            <SectionTitle>The Four Categories of Ecosystem Services</SectionTitle>
            <Para>
              Ecosystem services are grouped into four categories, following the framework
              developed by the Millennium Ecosystem Assessment (MEA) and the Economics of
              Ecosystems and Biodiversity (TEEB) initiative.
            </Para>

            {[
              {
                emoji: '🌾',
                title: 'Provisioning services',
                color: '#15803d',
                bg: '#f0fdf4',
                items: [
                  { bold: 'Food', text: "Belgium's farmland, rivers, and North Sea supply food for a population far larger than Belgium itself." },
                  { bold: 'Fresh water', text: 'Natural filtration through soils and wetlands underpins drinking water supply for millions of people.' },
                  { bold: 'Timber & fibre', text: 'Belgian forests supply timber for construction, paper, and energy.' },
                  { bold: 'Medicines', text: 'More than 80% of medicines globally are derived from or inspired by natural compounds.' },
                ],
              },
              {
                emoji: '🌊',
                title: 'Regulating services',
                color: '#0369a1',
                bg: '#e0f2fe',
                items: [
                  { bold: 'Climate regulation', text: "Forests and peatlands absorb and store CO₂. Belgium's protected areas in Flanders alone store more than 34 million tonnes of CO₂." },
                  { bold: 'Water purification', text: "Wetlands and riparian forests filter pollutants from water. Flanders' protected areas purify an estimated 16 million m³ per year." },
                  { bold: 'Flood regulation', text: 'Floodplains, peat bogs, and coastal marshes buffer peak flows. The Sigma Plan along the Scheldt deliberately restores these services as a flood protection strategy.' },
                  { bold: 'Pollination', text: 'Wild bees and other pollinators support roughly one-third of global food production. Their decline directly threatens agricultural yields.' },
                  { bold: 'Air quality', text: 'Urban trees and vegetation remove particulate matter from the air. Protected areas in Flanders eliminate an estimated 4,000–8,000 tonnes of fine dust annually.' },
                ],
              },
              {
                emoji: '🎨',
                title: 'Cultural services',
                color: '#7c3aed',
                bg: '#ede9fe',
                items: [
                  { bold: 'Recreation & mental health', text: "Access to green space consistently improves mental health outcomes. Flanders' protected areas generate an estimated 2,100 additional healthy life years per year through this effect alone." },
                  { bold: 'Tourism', text: 'Nature-based tourism — hiking, birdwatching, cycling — generates significant economic activity in the Ardennes, the Hautes Fagnes, and the coast.' },
                  { bold: 'Scientific & cultural value', text: 'Natural ecosystems underpin research, education, and a sense of place and heritage.' },
                ],
              },
              {
                emoji: '🔄',
                title: 'Supporting services',
                color: '#374151',
                bg: '#f9fafb',
                items: [
                  { bold: 'Soil formation', text: 'Healthy soils are the foundation of all food production. Their formation takes centuries; their degradation can happen in years.' },
                  { bold: 'Nutrient cycling', text: 'The cycling of nitrogen, phosphorus, and carbon through ecosystems makes plant growth — and therefore all food — possible.' },
                  { bold: 'Photosynthesis & the water cycle', text: 'These foundational processes underpin every other service on this list. Without them, life as we know it could not exist.' },
                ],
              },
            ].map((cat) => (
              <div key={cat.title} style={{ borderLeft: `4px solid ${cat.color}`, background: cat.bg, borderRadius: '0 10px 10px 0', padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: cat.color, marginBottom: 10 }}>
                  {cat.emoji} {cat.title}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {cat.items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.7, color: '#374151', marginBottom: 6 }}>
                      <span style={{ color: cat.color, flexShrink: 0, marginTop: 2 }}>▸</span>
                      <span><strong>{item.bold}:</strong> {item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </SectionCard>

          {/* What nature is worth */}
          <SectionCard id="value">
            <SectionTitle>What Nature Is Worth</SectionTitle>
            <Para>
              For most of human history, the services nature provides have been treated as free
              and infinite. Pricing them sounds uncomfortable — nature has value beyond what
              markets can capture — but quantifying ecosystem services has become an important
              tool for making the invisible visible in policy and investment decisions.
            </Para>
            <Para>
              The numbers, when calculated, are striking. A comprehensive assessment of Walloon
              forests found that 14 ecosystem services together generate{' '}
              <strong>€1,455 per hectare per year</strong> in economic value. Three services alone
              — timber production, hunting, and carbon sequestration — account for over €6.5
              billion in total.
            </Para>
            <Para>
              The European Commission, in its impact assessment for the EU Nature Restoration Law,
              concluded that <strong>every €1 invested in nature restoration generates between €8
              and €38 in economic value</strong>. The wide range reflects genuine variation across
              ecosystem types: peatlands and coastal wetlands tend to score highest, due to their
              combined flood protection, carbon storage, and water purification value. Restoring a
              Scheldt salt marsh delivers different services at different scales than restoring a
              hay meadow in the Ardennes.
            </Para>

            {/* ROI highlight card */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 12, padding: '24px 28px', margin: '20px 0', display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}>🌱</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#14532d', lineHeight: 1.1 }}>
                  €8 – €38
                </div>
                <div style={{ fontSize: 14, color: '#166534', fontWeight: 600, margin: '4px 0 8px' }}>
                  returned for every €1 invested in nature restoration
                </div>
                <div style={{ fontSize: 13, color: '#4b7a52', lineHeight: 1.5 }}>
                  European Commission Impact Assessment for the EU Nature Restoration Law, 2022.
                  Depending on ecosystem type — peatlands and wetlands deliver the highest returns.
                </div>
              </div>
            </div>

            <NoteBox>
              ⚠️ The European Central Bank found that around 72% of companies in the Eurozone are
              highly dependent on at least one ecosystem service. More than half of global GDP has
              some dependence on nature and its services. The degradation of ecosystems is not just
              an environmental problem — it is a financial risk.
            </NoteBox>
          </SectionCard>

          {/* Natuurwaardeverkenner */}
          <SectionCard id="tool">
            <SectionTitle>The Natuurwaardeverkenner</SectionTitle>
            <Para>
              For anyone working on a nature project in Flanders — whether a government agency,
              an NGO, a landowner, or a spatial planner — the{' '}
              <strong>Natuurwaardeverkenner</strong> is the practical tool for putting numbers
              on ecosystem services.
            </Para>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 24px', margin: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 6 }}>
                    🧮 What it does
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    Quantifies and monetises the ecosystem services delivered by a piece of land —
                    covering at least 18 services from carbon storage and flood regulation to
                    recreation and air quality.
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 6 }}>
                    🗺️ How to use it
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    Draw your study area and proposed land use changes on a map. The tool
                    automatically calculates the before-and-after value of ecosystem services.
                    No data collection needed — everything is loaded from existing Flemish datasets.
                  </p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 6 }}>
                    📊 What it&#39;s for
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>
                    The results feed directly into a social cost-benefit analysis (MKBA),
                    comparing the value of a nature project with alternative land uses in a
                    common unit — euros. Useful for governments, developers, and nature
                    organisations alike.
                  </p>
                </div>
              </div>
            </div>

            <Para>
              Developed by VITO and the University of Antwerp on behalf of the Flemish government,
              it is free to use at{' '}
              <a
                href="https://www.natuurwaardeverkenner.be"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#16a34a', fontWeight: 600 }}
              >
                natuurwaardeverkenner.be
              </a>
              . It does not replace detailed ecological or economic modelling for large or
              contested projects, but provides a robust first estimate that can anchor
              conversations about the real value of green space.
            </Para>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
