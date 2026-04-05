'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

const TOPIC_COLOR = '#06b6d4';

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'scale',        label: 'The scale of the problem'      },
  { id: 'types',        label: 'Types of plastic pollution'    },
  { id: 'micro-sources',label: 'Sources of microplastics'      },
  { id: 'macro-sources',label: 'Macroplastics in the ocean'    },
  { id: 'impacts',      label: 'Impacts on health & wildlife'  },
  { id: 'solutions',    label: 'What is being done'            },
  { id: 'sources',      label: 'Sources & further reading'     },
];

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

// ── Sidebar component ─────────────────────────────────────────────────────────
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

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '400M t',  label: 'plastic produced per year',     sub: 'Global production in 2023 — doubled since 2000 and on track to triple by 2060', color: TOPIC_COLOR },
    { value: '~11M t',  label: 'enter the ocean annually',      sub: 'Equivalent to dumping a garbage truck of plastic into the sea every minute', color: '#ef4444' },
    { value: '5T+',     label: 'pieces in the ocean today',     sub: 'Estimated pieces of plastic currently floating in the world\'s oceans', color: '#dc2626' },
    { value: '<10%',    label: 'of all plastic ever recycled',  sub: 'The vast majority is landfilled, incinerated or leaks into the environment', color: '#f97316' },
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

// ── River sources chart ───────────────────────────────────────────────────────
function RiverSourcesChart() {
  const data = [
    { river: 'Yangtze (China)',    pct: 35, color: '#ef4444' },
    { river: 'Ganges (India)',     pct: 12, color: '#f97316' },
    { river: 'Yellow R. (China)', pct: 8,  color: '#f97316' },
    { river: 'Hai (China)',        pct: 5,  color: '#fb923c' },
    { river: 'Pearl (China)',      pct: 4,  color: '#fb923c' },
    { river: 'Amur (China/Russia)',pct: 4,  color: '#fbbf24' },
    { river: 'Niger (W. Africa)',  pct: 3,  color: '#fbbf24' },
    { river: 'Mekong (SE Asia)',   pct: 3,  color: '#fbbf24' },
    { river: 'Irrawaddy (Burma)',  pct: 3,  color: '#fde68a' },
    { river: 'All others',         pct: 23, color: '#d1d5db' },
  ];
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Estimated share of ocean-bound plastic by river (% of total)
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Source: Lebreton et al. (2017), Nature Communications. Top 10 rivers carry ~90% of river-to-ocean plastic.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="river" tick={{ fontSize: 11 }} width={115} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'Share of ocean plastic']} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            <LabelList dataKey="pct" position="right" style={{ fontSize: 11, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Microplastic sources chart ────────────────────────────────────────────────
function MicroSourcesChart() {
  const data = [
    { source: 'Tyre wear',          pct: 28, color: '#374151' },
    { source: 'Synthetic textiles',  pct: 22, color: '#8b5cf6' },
    { source: 'Road markings',       pct: 10, color: '#6b7280' },
    { source: 'Marine coatings',     pct: 7,  color: '#0ea5e9' },
    { source: 'Plastic pellets',     pct: 6,  color: '#06b6d4' },
    { source: 'City dust',           pct: 6,  color: '#9ca3af' },
    { source: 'Personal care',       pct: 2,  color: '#ec4899' },
    { source: 'Other sources',       pct: 19, color: '#d1d5db' },
  ];
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Sources of primary microplastic pollution entering the ocean (% of total)
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Source: Boucher & Friot (2017), IUCN — Primary microplastics in the oceans.
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 35]} tick={{ fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="source" tick={{ fontSize: 11 }} width={120} />
          <Tooltip formatter={(v: number) => [`${v}%`, 'Share of microplastic sources']} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            <LabelList dataKey="pct" position="right" style={{ fontSize: 11, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Info card ─────────────────────────────────────────────────────────────────
function InfoCard({ emoji, title, color, children }: { emoji: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 18px', borderLeft: `3px solid ${color}`, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a1a1a' }}>{title}</span>
      </div>
      <div style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PlasticPollutionPage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #164e63 0%, #0e7490 60%, #06b6d4 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x267B;&#xFE0F;  Circularity &amp; Waste</p>
            <h1 className="detail-title">Plastic Pollution</h1>
            <p style={{ color: '#b0b0b0', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              From ocean garbage patches to microplastics in human blood — how plastic became the defining pollutant of our age.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/plastic-pollution.jpg" alt="Plastic pollution in the ocean" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Scale */}
          <SectionCard id="scale">
            <SectionTitle>The scale of the problem</SectionTitle>
            <Para>
              Humanity has produced more than <strong>9 billion tonnes of plastic</strong> since the 1950s — a mass greater than all living humans combined, all blue whales ever born, and every building in Manhattan stacked on top of each other. Less than 10% has ever been recycled. The rest is in landfills, incinerated, or loose in the environment. Plastic does not biodegrade: it fragments into progressively smaller pieces over decades and centuries, but the polymer chains persist.
            </Para>
            <Para>
              Production continues to accelerate. Global plastic output reached roughly 400 million tonnes in 2023 — double the level in 2000. The OECD projects it will triple again by 2060 under current policy trajectories, driven largely by growth in Asia. A global plastic pollution treaty has been under negotiation since 2022 under UN auspices (the INC process), but remains unsigned as of 2025, with deep disagreements between producing and consuming nations over whether it should target production volumes or only waste management.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The problem has two distinct faces that require different responses: <strong>macroplastics</strong> — visible debris from bottles to fishing gear — and <strong>microplastics</strong> — particles smaller than 5 mm that permeate soils, water, air and living organisms. Both are serious. Neither is well controlled.
            </Para>
          </SectionCard>

          {/* 2 — Types */}
          <SectionCard id="types">
            <SectionTitle>Types of plastic pollution</SectionTitle>
            <Para>
              Plastic pollution is divided by size, though the boundary is partly arbitrary: as macroplastic fragments in the environment, it eventually becomes micro- and then nanoplastic.
            </Para>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#14532d', marginBottom: 8 }}>&#x1F4E6; Macroplastics</div>
                <p style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                  Visible plastic items <strong>larger than 5 mm</strong> — bottles, bags, packaging, fishing gear, cigarette filters. The most visible form of pollution and the primary source of ocean garbage accumulation. Also the precursor to all smaller forms: UV radiation and wave action fragment macroplastics into microplastics over years to decades.
                </p>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#92400e', marginBottom: 8 }}>&#x1F52C; Microplastics (&lt; 5 mm)</div>
                <p style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                  Particles too small to see with the naked eye. Split into <strong>primary</strong> microplastics (manufactured at that size: pellets, microbeads, fibres) and <strong>secondary</strong> microplastics (fragments from degrading macro items). Further divided into <strong>nanoplastics</strong> (&lt;1 &#x3BC;m) which can cross cell membranes and the blood-brain barrier.
                </p>
              </div>
            </div>

            <Para style={{ marginBottom: 0 }}>
              A third category worth distinguishing: <strong>abandoned, lost and discarded fishing gear (ALDFG)</strong> — sometimes called ghost gear. This includes fishing nets, longlines and traps that have been lost or dumped at sea. It represents roughly <strong>46% of the mass of the Great Pacific Garbage Patch</strong> by weight and causes disproportionate harm to marine life through entanglement.
            </Para>
          </SectionCard>

          {/* 3 — Microplastic sources */}
          <SectionCard id="micro-sources">
            <SectionTitle>Where do microplastics come from?</SectionTitle>
            <Para>
              Microplastics reach the environment through dozens of pathways. The IUCN estimates that <strong>primary microplastics</strong> (released directly, not from fragmentation) account for roughly 15–30% of total ocean microplastic input. Tyre wear and synthetic textiles together make up more than half of this primary load.
            </Para>

            <MicroSourcesChart />

            <InfoCard emoji="&#x1F697;" title="Tyre wear — the largest overlooked source" color="#374151">
              Every time a car brakes, accelerates or corners, microscopic particles of rubber — which contains synthetic polymers including styrene-butadiene — are abraded from the tyre surface onto the road. Rain washes these particles into storm drains and rivers. A single car generates roughly 4 kg of tyre particle wear per year. Across Belgium&#39;s 6.5 million registered vehicles, this is tens of thousands of tonnes annually. Unlike textile fibres, tyre particles are very difficult to filter and no regulatory framework currently targets them.
            </InfoCard>

            <InfoCard emoji="&#x1F455;" title="Synthetic textiles — washing releases fibres" color="#8b5cf6">
              A single wash of a polyester fleece garment releases an estimated 700,000 to 1.5 million plastic microfibres into the wastewater. Even modern sewage treatment plants only capture 70–80% of these, meaning millions of fibres reach waterways with every wash cycle. Acrylic, polyester and nylon are the main contributors. Fibres are particularly problematic because of their elongated shape, which makes them easier for organisms to ingest and harder to excrete. Some washing machine filters exist that capture fibres, but they are not yet mandatorily required in Belgium or most EU countries.
            </InfoCard>

            <InfoCard emoji="&#x1F6A2;" title="Plastic pellets (nurdles) — industrial spills" color={TOPIC_COLOR}>
              Plastic resin pellets — called nurdles — are the raw material from which virtually all plastic products are made. They are the size of a lentil and manufactured in vast quantities. They enter the ocean through accidental spills at production facilities, during transport (from ships and rail cars) and at ports. Once in the sea, they are easily mistaken for fish eggs by seabirds and marine animals. The 2021 X-Press Pearl container ship disaster off Sri Lanka released an estimated <strong>1,680 tonnes of nurdles</strong> onto beaches across South Asia in a single event. No binding international standard currently governs pellet containment.
            </InfoCard>

            <InfoCard emoji="&#x1F6E3;&#xFE0F;" title="Road markings and city dust" color="#6b7280">
              Thermoplastic road markings (the white and yellow lines painted on roads) erode under traffic and contribute an estimated 10% of primary microplastic inputs. Urban areas generate substantial microplastic dust from construction materials, synthetic sports surfaces (rubber crumbs from artificial turf), street furniture and vehicle components beyond tyres. This urban microplastic load is transported to waterways via runoff during rain events.
            </InfoCard>
          </SectionCard>

          {/* 4 — Macro sources */}
          <SectionCard id="macro-sources">
            <SectionTitle>Macroplastics: ocean gyres, ghost gear and river highways</SectionTitle>
            <Para>
              The ocean&#39;s surface currents form five major rotating systems called gyres. Floating plastic debris drifts into these gyres and accumulates at their centres. The <strong>Great Pacific Garbage Patch</strong> — between Hawaii and California — is the largest, estimated at 1.6 million km&#xB2; (three times the size of France) and containing at least 80,000 tonnes of plastic. Similar accumulation zones exist in the North Atlantic, South Pacific, South Atlantic and Indian Ocean.
            </Para>
            <Para>
              Despite the name, these patches are not solid islands of plastic. Most of the debris is below the surface and invisible from satellite: a soup of microplastics, plastic fragments and larger items. The concentration is perhaps 10–100 times higher than surrounding ocean water, but the patches are not visible from a ship crossing them. What is visible are individual large items — nets, buoys, bottles, containers — mixed with fragments.
            </Para>

            <Para><strong>Ghost gear: the deadliest macroplastic</strong></Para>
            <Para>
              Abandoned fishing gear is the most harmful form of macroplastic by mass and by ecological impact. An estimated <strong>640,000 tonnes of fishing gear</strong> are lost or abandoned in the ocean each year — nets, longlines, fish traps, crab pots and monofilament line. This gear continues to fish indefinitely, a process called ghost fishing: animals become entangled, die, the carcass attracts more animals, and the cycle repeats. A single lost crab pot can ghost fish for years.
            </Para>

            <RiverSourcesChart />

            <Para>
              Rivers are the primary conduit for land-based plastic reaching the ocean. A landmark 2017 study by Lebreton et al. estimated that just <strong>ten rivers</strong> — eight of them in Asia — carry roughly 90% of all riverine plastic input to the sea. The Yangtze alone accounts for an estimated 35% of global river-to-ocean plastic. This concentration reflects not a greater carelessness in Asian countries, but the combination of large river catchment areas, rapid industrialisation outpacing waste infrastructure, high population density along river banks, and inadequate collection systems for the volume of plastic now in circulation.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              European rivers carry a small fraction of global totals, but they are not clean. The Rhine, Danube and Scheldt all transport significant plastic loads. Belgian studies have found plastic debris throughout the Scheldt estuary and its tributaries, originating from litter, combined sewer overflow during heavy rain, and industrial activity around the Antwerp port complex.
            </Para>
          </SectionCard>

          {/* 5 — Impacts */}
          <SectionCard id="impacts">
            <SectionTitle>Impacts on health and wildlife</SectionTitle>
            <Para>
              The consequences of plastic pollution differ substantially between macro and microplastics, and between terrestrial and marine environments.
            </Para>

            <Para><strong>Macroplastics and marine life</strong></Para>
            <BulletList items={[
              { bold: 'Entanglement', text: 'ghost nets, six-pack rings and monofilament line entangle seabirds, turtles, seals, dolphins and whales. Entanglement causes drowning, amputation of limbs, restricted growth and starvation. An estimated 1,000 sea turtles die from plastic entanglement every year in European waters alone' },
              { bold: 'Ingestion', text: 'seabirds mistake floating plastic fragments for food and feed them to chicks. Over 90% of seabird species examined post-mortem contain plastic in their digestive systems. For large whales, the problem is nets and packaging: stomach contents of stranded whales frequently include dozens of kg of plastic bags and film' },
              { bold: 'Habitat damage', text: 'plastic debris smothers coral reefs, blocking light and introducing pathogens. Floating plastic also acts as a raft for invasive species, transporting them to new ecosystems across ocean basins' },
            ]} />

            <Para style={{ marginTop: 8 }}><strong>Microplastics and human health</strong></Para>
            <Para>
              Research on microplastics in the human body accelerated dramatically after 2020. The findings are concerning, though the full health implications are still being established:
            </Para>
            <BulletList items={[
              { bold: 'Ubiquitous human exposure', text: 'microplastics have been detected in human blood (2022, Nature Medicine), breast milk, placentas, lung tissue, liver, kidney and testicular tissue. A 2024 study found microplastics in arterial plaque, and patients with higher plaque concentrations of microplastics had significantly higher rates of heart attack, stroke and death over three years' },
              { bold: 'Ingestion routes', text: 'humans ingest an estimated 5 g of microplastic per week on average — roughly the weight of a credit card — through food, water and air. Seafood, drinking water (tap and bottled), salt, beer and honey have all been found to contain microplastics' },
              { bold: 'Chemical burden', text: 'plastics are not inert. They contain and absorb dozens of chemical additives including phthalates (endocrine disruptors), bisphenol A (BPA), flame retardants and heavy metals. When ingested, these chemicals can leach from the plastic into tissues. Microplastics also adsorb persistent organic pollutants (POPs) from surrounding water, concentrating them and delivering them to organisms that ingest the particles' },
              { bold: 'Nanoplastics', text: 'particles below 1 &#x3BC;m in size can cross cell membranes and the blood-brain barrier. Animal studies have shown inflammatory responses, oxidative stress and disruption of gut microbiome. Human epidemiological data are still sparse but the mechanistic evidence for harm is growing' },
            ]} />

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
              <Para style={{ marginBottom: 0 }}>
                <strong>Scientific consensus note:</strong> The WHO has stated that current evidence does not allow a firm conclusion on whether microplastic exposure at current levels causes clinical harm in humans. Research is accelerating rapidly. What is established is that exposure is universal, that particles accumulate in tissues, and that the chemical additives carried by plastics have known endocrine-disrupting properties. The precautionary principle strongly suggests reducing exposure and environmental release.
              </Para>
            </div>
          </SectionCard>

          {/* 6 — Solutions */}
          <SectionCard id="solutions">
            <SectionTitle>What is being done — and what can you do</SectionTitle>
            <Para>
              Plastic pollution is a solvable problem — unlike CO&#x2082; in the atmosphere, plastic in the ocean is physically retrievable, and most of its sources can be reduced or eliminated. Progress is happening, but slowly relative to the pace of accumulation.
            </Para>

            <Para><strong>Cleaning the ocean: retrieval projects</strong></Para>

            <InfoCard emoji="&#x1F30A;" title="The Ocean Cleanup" color={TOPIC_COLOR}>
              Founded by Dutch inventor Boyan Slat in 2013, The Ocean Cleanup has deployed passive collection systems in the Great Pacific Garbage Patch using U-shaped barriers that concentrate floating debris for retrieval by support ships. By 2024, the project had extracted over 10 million kg of plastic from oceans and rivers. Their Interceptor vessels are deployed in highly polluted rivers in Malaysia, Indonesia, Vietnam, the Dominican Republic and others — targeting the source before it reaches the sea. The scale of ocean plastic (80,000+ tonnes in the GPGP alone) means retrieval can complement but not substitute for reducing inputs.
            </InfoCard>

            <InfoCard emoji="&#x1F3A3;" title="Ghost gear retrieval programmes" color="#22c55e">
              The Global Ghost Gear Initiative (GGGI), backed by the World Animal Protection organisation, coordinates fishermen, governments and NGOs to retrieve abandoned fishing gear and prevent new losses. In Europe, the EMFAF fund (European Maritime, Fisheries and Aquaculture Fund) partially finances ghost gear retrieval. Belgium participates in North Sea ghost gear surveys, and the Port of Zeebrugge has a collection programme for nets brought back by fishermen. The EU&#39;s Single-Use Plastics Directive (2021) requires fishing gear producers to cover costs of collection of abandoned gear.
            </InfoCard>

            <Para style={{ marginTop: 8 }}><strong>Regulatory responses</strong></Para>
            <BulletList items={[
              { bold: 'EU Single-Use Plastics Directive (2021)', text: 'banned the 10 most common single-use plastic items found on European beaches (cotton bud sticks, cutlery, plates, straws, stirrers, balloon sticks, cups, food containers, lightweight bags, wet wipes and tobacco filters with plastic)' },
              { bold: 'UN Global Plastics Treaty (in negotiation)', text: 'the Intergovernmental Negotiating Committee (INC) has met five times since 2022. A final treaty is expected by 2025, though deep divisions remain between petrostate-backed blocs (favouring waste management focus) and ambitious coalitions including the EU (favouring production caps and extended producer responsibility)' },
              { bold: 'EU Packaging and Packaging Waste Regulation (2025)', text: 'sets binding reduction targets for packaging volumes, mandates recyclable packaging by 2030 and introduces deposit-return systems across all EU member states for plastic bottles and metal cans' },
              { bold: 'Microplastic regulations', text: 'the EU REACH regulation was updated in 2023 to restrict intentionally added microplastics in cosmetics, detergents, fertilisers and other products — an estimated 500,000 tonnes reduction over 20 years. Tyre wear and textile fibres remain largely unregulated' },
            ]} />

            <Para style={{ marginTop: 8 }}><strong>What individuals can do</strong></Para>
            <BulletList items={[
              { bold: 'Wash synthetics less, slower and colder', text: 'lower spin speed, shorter cycles and lower temperatures all reduce microfibre shedding. A microfibre filter on your washing machine captures 80–90% of released fibres' },
              { bold: 'Choose natural fibres', text: 'wool, cotton, linen and silk shed far fewer microplastics than polyester, acrylic or nylon. When buying synthetics, prefer tightly woven fabrics' },
              { bold: 'Reduce single-use plastic', text: 'refillable water bottles, reusable bags, avoiding plastic-wrapped produce — the individual volume is small but the signal to producers and retailers is real' },
              { bold: 'Participate in beach and river cleanups', text: 'Surfrider Foundation, World Cleanup Day and local initiatives coordinate volunteer cleanups. In Belgium, Mooimakers (Flanders) and Be WaPP (Wallonia) coordinate litter collection and citizen science monitoring' },
              { bold: 'Support extended producer responsibility', text: 'write to your elected representatives about the UN plastics treaty, Belgian packaging regulation implementation, and tyre particle standards — these systemic levers move faster than individual action' },
            ]} />

            <div style={{ background: `${TOPIC_COLOR}12`, border: `1px solid ${TOPIC_COLOR}40`, borderRadius: 10, padding: '18px 20px', marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: 8 }}>&#x267B;&#xFE0F; Belgian resources</div>
              <BulletList items={[
                { bold: 'Mooimakers.be', text: 'Flanders litter action programme — cleanups, citizen science and policy engagement' },
                { bold: 'Be WaPP', text: 'Wallonia anti-litter platform — coordinates river cleanups and waste monitoring' },
                { bold: 'Recupel', text: 'ensures proper collection of electronic waste to prevent plastic casings and components entering the waste stream informally' },
                { bold: 'Surfrider Foundation Europe', text: 'coordinates North Sea beach cleanups and Ocean Initiatives along the Belgian coast' },
              ]} />
            </div>
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'OECD — Global Plastics Outlook 2022 (production, use, end-of-life, projections)', url: 'https://www.oecd.org/en/publications/oecd-global-plastics-outlook_de747aef-en.html' },
                { label: 'Lebreton et al. (2017) — River plastic emissions to the world\'s oceans, Nature Communications', url: 'https://doi.org/10.1038/ncomms15611' },
                { label: 'Lebreton et al. (2018) — Evidence that the Great Pacific Garbage Patch is rapidly accumulating plastic, Scientific Reports', url: 'https://doi.org/10.1038/s41598-018-22939-w' },
                { label: 'Boucher & Friot (2017) — Primary microplastics in the oceans, IUCN', url: 'https://doi.org/10.2305/IUCN.CH.2017.01.en' },
                { label: 'Leslie et al. (2022) — Discovery and quantification of plastic particle pollution in human blood, Environment International', url: 'https://doi.org/10.1016/j.envint.2022.107199' },
                { label: 'Pirozzi et al. (2024) — Microplastics and nanoplastics in atheromas and cardiovascular events, NEJM', url: 'https://doi.org/10.1056/NEJMoa2309822' },
                { label: 'EU Single-Use Plastics Directive 2019/904/EU', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0904' },
                { label: 'EU REACH restriction on intentionally added microplastics (2023)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R2055' },
                { label: 'The Ocean Cleanup — annual progress reports', url: 'https://theoceancleanup.com/updates/' },
                { label: 'Global Ghost Gear Initiative (World Animal Protection)', url: 'https://www.ghostgear.org' },
                { label: 'WHO (2019) — Microplastics in drinking-water', url: 'https://www.who.int/publications/i/item/9789241516198' },
                { label: 'Mooimakers — Flemish litter action programme', url: 'https://www.mooimakers.be' },
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
