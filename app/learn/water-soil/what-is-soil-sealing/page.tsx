'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const TOPIC_COLOR = '#3b82f6';

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',        label: 'Belgium\'s concrete epidemic'  },
  { id: 'why-belgium',  label: 'Why Belgium?'                  },
  { id: 'consequences', label: 'Consequences'                  },
  { id: 'solutions',    label: 'What is being done'            },
  { id: 'sources',      label: 'Sources & further reading'     },
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
          <span style={{ color: TOPIC_COLOR, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>&#x25B8;</span>
          <span><strong style={{ color: '#1a1a1a' }}>{item.bold}</strong>{item.text ? ': ' + item.text : ''}</span>
        </li>
      ))}
    </ul>
  );
}
function FullWidthImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <img src={src} alt={alt} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
      {caption && <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>{caption}</p>}
    </div>
  );
}
function InfoCard({ emoji, title, color, bg, children }: { emoji: string; title: string; color: string; bg: string; children: React.ReactNode }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '16px 18px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color }}>{title}</span>
      </div>
      <div style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    {
      value: '~6 ha/day',
      label: 'sealed in Flanders alone',
      sub: 'Around 8 to 9 soccer fields of open land paved over every single day — a rate that has barely slowed in decades',
      color: '#dc2626',
    },
    {
      value: 'Top 3',
      label: 'most sealed country in the EU',
      sub: 'Belgium has one of the highest soil sealing rates in Europe — roughly 14\u201316% of total land area, versus an EU average of around 4\u20135%',
      color: '#f97316',
    },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4, lineHeight: 1.4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── EU comparison chart ───────────────────────────────────────────────────────
function EUSealingChart() {
  const data = [
    { country: 'Malta',       pct: 24.0, color: '#7f1d1d' },
    { country: 'Belgium',     pct: 15.5, color: '#dc2626' },
    { country: 'Netherlands', pct: 11.8, color: '#ef4444' },
    { country: 'Germany',     pct: 8.0,  color: '#f97316' },
    { country: 'Denmark',     pct: 5.5,  color: '#fbbf24' },
    { country: 'EU average',  pct: 4.5,  color: '#6b7280' },
    { country: 'France',      pct: 4.8,  color: '#fde68a' },
    { country: 'Poland',      pct: 4.2,  color: '#fef9c3' },
    { country: 'Sweden',      pct: 1.3,  color: '#22c55e' },
    { country: 'Finland',     pct: 0.8,  color: '#16a34a' },
  ].sort((a, b) => b.pct - a.pct);

  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Soil sealing as % of total land area — selected EU countries
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Source: European Environment Agency — Urban land use data (Copernicus Land Monitoring Service). Approximate values; methodologies vary slightly between countries.
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 26]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={90} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'Sealed land share']} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color}
                stroke={entry.country === 'Belgium' ? '#7f1d1d' : 'none'}
                strokeWidth={entry.country === 'Belgium' ? 1.5 : 0}
              />
            ))}
            <LabelList dataKey="pct" position="right" style={{ fontSize: 11, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Consequences grid ─────────────────────────────────────────────────────────
function ConsequencesGrid() {
  const items = [
    { emoji: '🌊', title: 'Flooding', color: '#1d4ed8', text: 'Sealed surfaces shed rain instantly into drainage systems and rivers, raising flood peaks. The same sealing that causes winter floods also prevents groundwater recharge, worsening summer droughts.' },
    { emoji: '🌡️', title: 'Urban heat islands', color: '#dc2626', text: 'Asphalt and concrete absorb solar radiation and re-emit it as heat. Belgian cities can be 4\u20137\u00b0C warmer than surrounding countryside during heatwaves \u2014 a growing public health risk.' },
    { emoji: '🐛', title: 'Biodiversity loss', color: '#15803d', text: 'Sealed soil supports no plant roots, no soil organisms, no invertebrates. Roads and hard surfaces fragment remaining habitat, isolating populations and preventing species movement.' },
    { emoji: '💧', title: 'Groundwater depletion', color: '#0ea5e9', text: 'Rain that cannot infiltrate cannot recharge aquifers. Belgian groundwater levels have been declining in many areas, reducing drinking water reserves and summer river baseflows.' },
    { emoji: '🌾', title: 'Agricultural land loss', color: '#ca8a04', text: 'Belgium is permanently losing productive agricultural land to development. Once sealed, land is almost never restored \u2014 a one-way process that reduces domestic food production capacity.' },
    { emoji: '🌳', title: 'Carbon & soil loss', color: '#065f46', text: 'Healthy soil stores carbon in organic matter and hosts billions of microorganisms per handful. Sealing eliminates this biological function permanently, releasing stored carbon during construction.' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {items.map(item => (
        <div key={item.title} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${item.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: item.color }}>{item.title}</span>
          </div>
          <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SoilSealingPage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F4A7;  Water &amp; Soil</p>
            <h1 className="detail-title">What is Soil Sealing?</h1>
            <p style={{ color: '#bfdbfe', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              Belgium paves over the equivalent of 8 to 9 soccer fields every single day. How a century of planning failures turned one of Europe&apos;s most biodiverse regions into its most concreted one.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/soil-sealing.jpg" alt="Aerial view of sealed urban landscape" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>Belgium&apos;s concrete epidemic</SectionTitle>
            <Para>
              <strong>Soil sealing</strong> is the covering of land with impermeable materials — concrete, asphalt, tiles, buildings — that prevent rain from infiltrating, plants from rooting and soil organisms from functioning. Every road, car park, terrace, warehouse and house extension seals the land beneath it permanently.
            </Para>
            <Para>
              In Flanders, approximately <strong>6 hectares of open land are sealed every day</strong> — the equivalent of 8 to 9 standard soccer fields, every single day, year after year. Wallonia seals at a slower rate due to lower population density, but the pattern is similar across both regions. Belgium as a whole has sealed between 14 and 16% of its total land area — placing it consistently among the top two or three most heavily sealed countries in the entire European Union, behind only Malta.
            </Para>

            <EUSealingChart />

            <Para>
              The map below, derived from the Natuurpunt Betonrapport 2024, shows sealed surface in square metres per inhabitant across Flemish municipalities. The variation is striking: some densely urban municipalities have surprisingly manageable per-capita sealing, while many apparently rural communes — with large industrial zones, logistics parks or ribbon development along every road — have extraordinary sealing per resident.
            </Para>

            <div style={{ margin: '20px 0' }}>
              <img
                src="/images/learn/soil-sealing-flanders.png"
                alt="Map of Flanders showing sealed surface in m\u00b2 per inhabitant per municipality"
                style={{ width: '100%', display: 'block', borderRadius: 8 }}
              />
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>
                Sealed surface (m\u00b2 per inhabitant) by municipality in Flanders. Source: Natuurpunt Betonrapport 2024.
              </p>
            </div>

            <Para style={{ marginBottom: 0 }}>
              The EU average sealed land share is around 4 to 5%. Belgium is three to four times above that. To put it another way: if Belgium sealed land at the EU average rate, it would have roughly 1.5 million additional hectares of unsealed soil — an area larger than the entire province of Antwerp. This is not an abstract statistic. It is the landscape Belgians have lost, and are continuing to lose, to concrete and asphalt.
            </Para>
          </SectionCard>

          {/* 2 — Why Belgium */}
          <SectionCard id="why-belgium">
            <SectionTitle>Why Belgium? Population density, ribbon development and planning failures</SectionTitle>
            <Para>
              Belgium&apos;s extreme soil sealing is not simply a function of having many people. The Netherlands is denser than Belgium and seals significantly less per capita. The explanation lies in a combination of settlement pattern and planning history that is distinctly Belgian.
            </Para>

            <Para><strong>Ribbon development — lintbebouwing</strong></Para>
            <Para>
              The most visible driver of Belgian soil sealing is its famously dispersed settlement pattern: <em>lintbebouwing</em>, or ribbon development. Instead of compact villages and market towns separated by open countryside — the pattern typical of France, Germany and most of Western Europe — Belgium strings houses, farms, small businesses and warehouses along virtually every rural road. This pattern requires a vast network of roads, individual driveways, private gardens paved for cars, and connection to utilities — all of which seal land.
            </Para>
            <Para>
              A compact town of 10,000 people uses dramatically less sealed surface per capita than 10,000 people dispersed along 40 kilometres of country roads. Ribbon development is the least land-efficient settlement form possible, and Belgium has practised it for more than a century.
            </Para>

            <FullWidthImage
              src="/images/learn/ribbon-development.jpg"
              alt="Aerial view of Belgian ribbon development along a rural road"
              caption="Ribbon development along a Flemish country road: houses, driveways, small businesses and access roads seal the land in a continuous strip, requiring far more infrastructure per household than compact settlement."
            />

            <Para><strong>20th century planning failures</strong></Para>
            <Para>
              Ribbon development was not accidental — it was enabled and actively encouraged by Belgian planning law. After the Second World War, Belgium needed to rebuild and house a growing population. The response was to draw generous zoning maps — the <em>gewestplannen</em> in Flanders, <em>plans de secteur</em> in Wallonia — that designated vast quantities of land as buildable residential or industrial zone.
            </Para>
            <Para>
              These plans, drawn up in the 1960s and 1970s, designated <strong>three to four times more land as buildable than was actually needed</strong> for the expected population. The overallocation was deliberate: planners worried about undersupply and wanted to give landowners flexibility. The consequence was that land designated as buildable became valuable, was sold and developed parcel by parcel over the following decades — including along every rural road, in every valley bottom and across agricultural land that had been productive for centuries.
            </Para>
            <Para>
              The plans were almost never revised. In Flanders, the gewestplan maps drawn in 1977 remained largely in force for more than four decades. Entire generations of building permits were granted on the basis of zoning designations that bore no relationship to infrastructure capacity, ecological sensitivity or demographic need. Belgium built its way into a sealed landscape one building permit at a time — each individually defensible, collectively catastrophic.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The political consequences of correcting this are significant. Land that was designated as buildable has a market value based on that designation. Rezoning it to agricultural or natural land destroys that value — making it a form of expropriation that requires compensation. The cost of unwinding half a century of over-designation is one reason the Bouwshift (Flanders) has been so politically contentious and progress so slow.
            </Para>
          </SectionCard>

          {/* 3 — Consequences */}
          <SectionCard id="consequences">
            <SectionTitle>What does soil sealing actually do?</SectionTitle>
            <Para>
              Soil sealing is not a single problem. It is a cascade of interconnected impacts that affect hydrology, climate, biodiversity, food security and public health simultaneously.
            </Para>

            <ConsequencesGrid />

            <Para style={{ marginTop: 4 }}>
              These consequences are not independent — they compound each other. A sealed landscape floods harder (no infiltration), heats up more during summer (no evapotranspiration from vegetation), supports fewer species (fragmented, degraded habitat), depletes groundwater (no recharge), and loses agricultural capacity (paved fields cannot grow food). Each consequence makes the others worse.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The flooding connection is particularly direct and well-documented in Belgium. The July 2021 Vesdre valley disaster was caused by exceptional rainfall — but the exceptional severity of its impact was amplified by decades of floodplain sealing. Water that a century ago would have spread across meadows and infiltrated into the soil instead ran off sealed surfaces and converged at terrifying speed in the valley bottom. Understanding soil sealing is inseparable from understanding why Belgian floods are getting worse.
            </Para>
          </SectionCard>

          {/* 4 — Solutions */}
          <SectionCard id="solutions">
            <SectionTitle>What is being done</SectionTitle>
            <Para>
              Belgium has — belatedly — begun to treat soil sealing as the structural emergency it is. The policy responses are most developed in Flanders, but exist in all three regions.
            </Para>

            <InfoCard emoji="&#x1F6D1;" title="Bouwshift / Betonstop (Flanders) — no net new land take by 2040" color="#dc2626" bg="#fef2f2">
              <p style={{ margin: '0 0 10px' }}>
                The most ambitious Belgian response to soil sealing is the Flemish <strong>Bouwshift</strong> (previously called Betonstop when it was first proposed). Its target: reduce new land take to <strong>net zero by 2040</strong> — meaning every new sealed surface must be compensated by an equivalent de-sealing elsewhere. The intermediate target is to halve the daily rate of new land take (from approximately 6 ha/day to 3 ha/day) by 2025.
              </p>
              <p style={{ margin: 0 }}>
                Achieving this requires rezoning land that was designated as buildable back to agricultural or natural use. This is both technically and politically complex: affected landowners are entitled to compensation, and the total cost of rezoning excess buildable land in Flanders has been estimated in the billions of euros. Progress has been slower than the target requires, and the 2025 interim goal has not been met. Nevertheless, the Bouwshift represents the clearest political recognition that Belgium&apos;s planning legacy must be structurally corrected.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x26CF;&#xFE0F;" title="Ontharden — active de-sealing programmes" color="#15803d" bg="#f0fdf4">
              <p style={{ margin: '0 0 10px' }}>
                De-paving (<em>ontharden</em>) is the physical removal of hard surfaces and their replacement with permeable alternatives — soil, vegetation, gravel, water-permeable paving. Flanders runs active subsidy programmes for municipalities, schools and private landowners to de-seal surfaces that no longer need to be hard.
              </p>
              <p style={{ margin: '0 0 10px' }}>
                Real examples across Belgium include: converting school playgrounds from asphalt to permeable surfaces with vegetation (reducing urban heat and runoff simultaneously); removing redundant car parks in town centres and replacing them with planted squares; creating rain gardens and infiltration trenches in residential streets; and opening up culverted (piped) streams that were buried under urban development.
              </p>
              <p style={{ margin: 0 }}>
                Ghent has pioneered &ldquo;klimaatstraten&rdquo; — climate streets — where residents collectively agree to de-pave front gardens, remove fences and create continuous green corridors. Antwerp has systematically converted underused parking spaces into green islands and bioswales. These are small individually, but collectively significant at city scale.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F3D7;&#xFE0F;" title="Blue-green infrastructure in new development" color={TOPIC_COLOR} bg="#eff6ff">
              <p style={{ margin: 0 }}>
                For new construction that does proceed, Belgian building regulations increasingly require <strong>permeable surfaces</strong> for driveways and parking, <strong>green roofs</strong> on flat-roofed buildings, <strong>rainwater cisterns</strong> to capture and reuse roof runoff, and <strong>infiltration trenches or rain gardens</strong> to handle surface water on-site rather than routing it to sewers. The principle is &ldquo;keep rain where it falls&rdquo; — preventing the sealed surface from becoming a direct connection between sky and sewer. Some municipalities require a minimum percentage of permeable surface in all new building permits.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F4CB;" title="Plan de Secteur reform (Wallonia)" color="#7c3aed" bg="#f5f3ff">
              <p style={{ margin: 0 }}>
                Wallonia&apos;s equivalent of the Bouwshift is a reform of the <em>plans de secteur</em> — the zoning maps that designated excessive buildable land in the 1970s. The 2019 Code du D\u00e9veloppement Territorial (CoDT) introduced a requirement to reduce the buildable zone by 9,000 ha over the coming decades and introduced more rigorous assessment of new development applications. Progress is slower than in Flanders and the reform has been repeatedly delayed by political disagreement over compensation mechanisms.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F1EA;&#x1F1FA;" title="EU Soil Strategy 2030 and Soil Monitoring Law" color="#374151" bg="#f9fafb">
              <p style={{ margin: 0 }}>
                The European Commission&apos;s Soil Strategy 2030 sets a target of <strong>no net land degradation by 2030</strong> and full land degradation neutrality by 2050. The proposed EU Soil Monitoring Law (under negotiation) would require member states to assess and report on soil sealing, create national soil health databases, and develop restoration plans for degraded soils. This creates a legal accountability framework that Belgium&apos;s regions will be required to report against — adding external pressure to the domestic Bouwshift process.
              </p>
            </InfoCard>

            <Para style={{ marginTop: 8 }}><strong>What individuals can do</strong></Para>
            <BulletList items={[
              { bold: 'De-pave your driveway or garden', text: 'replace concrete or tiles with gravel, grass pavers or planted beds. Flemish and Walloon municipalities offer subsidies for private de-sealing — check your commune\'s website' },
              { bold: 'Choose a planted front garden', text: 'a single unpaved front garden in a street of 20 houses makes a measurable difference to local runoff and urban heat — and wildflowers require less maintenance than maintaining a hard surface' },
              { bold: 'Install a rainwater barrel or cistern', text: 'intercepts roof runoff before it reaches the sewer, reducing peak flows during storms and providing free water for garden irrigation' },
              { bold: 'Support compact urban development', text: 'dense, well-connected urban housing uses far less sealed land per resident than suburban or rural ribbon development. Supporting urban densification politically and practically reduces pressure on open land' },
            ]} />
          </SectionCard>

          {/* 5 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Natuurpunt Betonrapport 2024 — soil sealing in Flanders by municipality', url: 'https://www.natuurpunt.be/projecten/betonrapport-2024' },
                { label: 'Ruimte Vlaanderen — Bouwshift: doelstellingen en stand van zaken', url: 'https://omgeving.vlaanderen.be/nl/bouwshift' },
                { label: 'VMM — Watertoets en verharding in Vlaanderen', url: 'https://www.vmm.be/water/watertoets' },
                { label: 'EEA — Copernicus Land Monitoring Service — Urban Atlas (soil sealing data)', url: 'https://land.copernicus.eu/pan-european/high-resolution-layers/imperviousness' },
                { label: 'European Commission — Soil Strategy for 2030', url: 'https://environment.ec.europa.eu/strategy/soil-strategy_en' },
                { label: 'European Commission — Proposal for a Soil Monitoring Law (2023)', url: 'https://environment.ec.europa.eu/publications/proposal-directive-soil-monitoring-and-resilience_en' },
                { label: 'Agentschap Onroerend Erfgoed / Ruimte Vlaanderen — Gewestplan historiek', url: 'https://omgeving.vlaanderen.be/nl/gewestplannen' },
                { label: 'Wallonie — Code du D\u00e9veloppement Territorial (CoDT)', url: 'https://developpementterritorial.wallonie.be/codt' },
                { label: 'INBO — Ecosysteemdiensten van bodem en open ruimte in Vlaanderen', url: 'https://www.inbo.be/nl' },
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
