// → app/learn/circularity-waste/plastic-the-recycling-reality/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TOPIC_COLOR = '#06b6d4';

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
    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 20px', paddingBottom: 10, borderBottom: `2px solid ${TOPIC_COLOR}` }}>
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '20px 0 10px' }}>
      {children}
    </h3>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.75, color: '#374151', margin: '0 0 14px', ...style }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: { bold?: string; text: React.ReactNode }[] }) {
  return (
    <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 8 }}>
          <span style={{ color: TOPIC_COLOR, flexShrink: 0, marginTop: 2 }}>▸</span>
          <span>{item.bold && <strong>{item.bold}</strong>}{item.bold ? ' — ' : ''}{item.text}</span>
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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 8, padding: '14px 18px', fontSize: 14, lineHeight: 1.65, color: '#164e63', margin: '16px 0' }}>
      {children}
    </div>
  );
}

// ── Polymer data ──────────────────────────────────────────────────────────────

const POLYMERS = [
  {
    abbr: 'PET',
    name: 'Polyethylene Terephthalate',
    number: '①',
    color: '#0369a1',
    bg: '#eff6ff',
    uses: 'Drink bottles, food trays, polyester fibres',
    recyclability: 'Excellent',
    recycleColor: '#15803d',
    notes: 'One of the best-recycled plastics globally. Bottle-to-bottle recycling is mature. Also recycled into polyester fleece clothing.',
  },
  {
    abbr: 'PE',
    name: 'Polyethylene (HDPE & LDPE)',
    number: '②④',
    color: '#7c3aed',
    bg: '#f5f3ff',
    uses: 'Milk bottles, carrier bags, films, pipes, packaging film',
    recyclability: 'Good (rigid) / Difficult (film)',
    recycleColor: '#ca8a04',
    notes: 'Rigid HDPE (bottles, crates) recycles well. Flexible LDPE films are harder — they clog sorting machines and need separate collection.',
  },
  {
    abbr: 'PP',
    name: 'Polypropylene',
    number: '⑤',
    color: '#b45309',
    bg: '#fef3c7',
    uses: 'Yoghurt pots, bottle caps, food containers, car parts, textiles',
    recyclability: 'Moderate',
    recycleColor: '#ca8a04',
    notes: 'Widely used but often coloured or mixed with other materials. Recycling infrastructure is growing but less mature than PET or HDPE.',
  },
  {
    abbr: 'PS',
    name: 'Polystyrene',
    number: '⑥',
    color: '#be185d',
    bg: '#fce7f3',
    uses: 'Foam cups, food trays, packaging foam, CD cases',
    recyclability: 'Poor',
    recycleColor: '#dc2626',
    notes: 'Expanded PS (foam) is bulky and low-value. Rarely collected separately in Belgium. Chemical recycling (pyrolysis) is more promising than mechanical.',
  },
  {
    abbr: 'PUR',
    name: 'Polyurethane',
    number: '—',
    color: '#15803d',
    bg: '#f0fdf4',
    uses: 'Mattress foam, insulation, adhesives, shoe soles, car seats',
    recyclability: 'Difficult',
    recycleColor: '#dc2626',
    notes: 'A thermoset: once cured, it cannot be melted down. Mechanical recycling produces lower-quality "rebonded" foam. Chemical (solvolysis) routes are emerging.',
  },
  {
    abbr: 'PC/ABS',
    name: 'Polycarbonate / ABS blends',
    number: '⑦',
    color: '#374151',
    bg: '#f9fafb',
    uses: 'Electronics housings, car dashboards, helmets, Lego bricks',
    recyclability: 'Difficult',
    recycleColor: '#dc2626',
    notes: 'Often blended or mixed with metals and other materials. May contain legacy flame retardants or BPA, which contaminate recycled output. Mainly downcycled.',
  },
];

// ── Chemical recycling processes ─────────────────────────────────────────────

const CHEM_PROCESSES = [
  {
    name: 'Solvolysis / Depolymerisation',
    color: '#0369a1',
    bg: '#eff6ff',
    input: 'Specific polymers: PET, PU, nylon, polycarbonate',
    output: 'Monomers — the original building blocks of the plastic',
    steps: 1,
    stepLabel: '1 step to new plastic',
    stepColor: '#15803d',
    desc: 'Breaks the polymer back into its original monomer units using solvents, heat, or catalysts. The monomers are chemically identical to virgin — making the output suitable for food contact applications. Best-established for PET.',
  },
  {
    name: 'Pyrolysis',
    color: '#7c3aed',
    bg: '#f5f3ff',
    input: 'Mixed polyolefins (PE, PP), polystyrene, mixed plastic waste',
    output: 'Pyrolysis oil (pyoil) — a crude oil substitute',
    steps: 3,
    stepLabel: '3 steps to new plastic',
    stepColor: '#ca8a04',
    desc: 'Heats plastic in the absence of oxygen (300–650°C), breaking polymer chains into a mix of hydrocarbon oils and gases. The pyoil must then enter a refinery cracker and be polymerised before becoming new plastic. Handles contaminated and mixed streams that mechanical recycling cannot.',
  },
  {
    name: 'Gasification',
    color: '#b45309',
    bg: '#fef3c7',
    input: 'Any plastic waste, including heavily contaminated or mixed streams',
    output: 'Syngas (hydrogen + carbon monoxide)',
    steps: 4,
    stepLabel: '4+ steps to new plastic',
    stepColor: '#dc2626',
    desc: 'Heats waste at very high temperatures (500–1300°C) with limited oxygen, breaking everything down to syngas. The syngas can be converted to methanol, then to olefins, then polymerised. Maximum feedstock flexibility, maximum processing steps. Still rare at commercial scale.',
  },
];

// ── Barriers data ─────────────────────────────────────────────────────────────

const BARRIERS = [
  {
    icon: '🔀',
    title: 'Contamination & poor sorting',
    color: '#dc2626',
    bg: '#fef2f2',
    body: 'Food residues, liquids, and sorting errors lower the quality of collected fractions. Even small amounts of the wrong polymer in a bale can make the entire batch unfit for high-quality recycling. Infrared sorting machines at PMD centres have improved significantly, but consumer sorting behaviour remains a major variable.',
  },
  {
    icon: '🧱',
    title: 'Multi-material and multilayer products',
    color: '#7c3aed',
    bg: '#f5f3ff',
    body: 'Many packages combine multiple materials for performance: a snack bag might be PET/aluminium/PE — three materials bonded together that cannot be separated mechanically. A yoghurt pot might have a PP body, a PE film lid, and an aluminium foil seal. Each material is theoretically recyclable alone; bonded together, none of them is. These products are not recyclable under current technology.',
  },
  {
    icon: '⚗️',
    title: 'Hazardous substances in plastics',
    color: '#b45309',
    bg: '#fef3c7',
    body: 'Plastics contain over 13,000 substances — additives, colorants, plasticisers, flame retardants, stabilisers. Some of these are hazardous: certain flame retardants, BPA in polycarbonate, phthalates in PVC, PFAS coatings in food packaging. Once in the polymer, these substances are nearly impossible to remove. Recycled plastic containing them cannot safely be used in food contact or children\'s products, limiting the market for recyclate.',
  },
  {
    icon: '🎨',
    title: 'Colour and opacity',
    color: '#0369a1',
    bg: '#eff6ff',
    body: 'Dark-coloured plastics — especially black — cannot be identified by near-infrared sorting machines, which read the polymer type from reflected light. Black plastic is therefore sorted as residual waste in most systems. Carbon black pigment, widely used in electronics and automotive parts, is the main culprit. Some manufacturers are switching to detectable dark pigments to address this.',
  },
  {
    icon: '📉',
    title: 'Downcycling and quality loss',
    color: '#374151',
    bg: '#f9fafb',
    body: 'Each mechanical recycling cycle degrades polymer chains, reducing strength and clarity. Recycled PET from bottles can go back into bottles once or twice, but eventually becomes unsuitable for food contact and gets downcycled into fibres or lower-grade applications. True closed-loop recycling — bottle back to bottle — is the exception rather than the rule for most polymer types.',
  },
];

// ── EU measures ───────────────────────────────────────────────────────────────

const EU_MEASURES = [
  {
    label: 'PPWR — recyclability by design (2025)',
    color: TOPIC_COLOR,
    bg: '#ecfeff',
    text: 'The Packaging and Packaging Waste Regulation (EU 2025/40) requires all packaging placed on the EU market to be recyclable by 2030. Packaging must be "recyclable at scale" by 2035. Multi-material formats that cannot be separated will effectively be banned. PFAS coatings in food contact packaging are restricted from August 2026.',
  },
  {
    label: 'Minimum recycled content targets (PPWR)',
    color: '#7c3aed',
    bg: '#f5f3ff',
    text: 'From 2030, plastic packaging must contain minimum recycled content: 30% for PET beverage bottles and food-contact PET packaging, 10% for other plastic food packaging, 30% for non-food plastic packaging. These targets rise significantly in 2040. This creates mandatory demand for recyclate — a critical market signal.',
  },
  {
    label: 'ESPR — design for recyclability',
    color: '#15803d',
    bg: '#f0fdf4',
    text: 'The Ecodesign for Sustainable Products Regulation applies to all products, not just packaging. It requires manufacturers to design products so they can be recycled — including restrictions on bonded materials, hazardous substance use, and minimum recyclable content. The Digital Product Passport will disclose material composition and recycling instructions.',
  },
  {
    label: 'REACH & chemicals restrictions',
    color: '#b45309',
    bg: '#fef3c7',
    text: 'The EU\'s REACH regulation restricts the use of hazardous substances in products. By end 2026, ECHA must assess which substances in packaging negatively affect recyclability — this may trigger further REACH restrictions specifically targeted at substances that contaminate recycled streams.',
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'polymers',       label: 'Plastic types' },
  { id: 'mechanical',     label: 'Mechanical recycling' },
  { id: 'chemical',       label: 'Chemical recycling' },
  { id: 'steps',          label: 'From output to product' },
  { id: 'barriers',       label: 'What makes it hard' },
  { id: 'eu-response',    label: 'EU response' },
  { id: 'further-reading',label: 'Further reading' },
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
          style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}
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

export default function PlasticRecyclingPage() {
  const [activeSection, setActiveSection] = useState('polymers');

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
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #164e63 0%, #0e7490 60%, #06b6d4 100%)' }}>
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <div className="header-eyebrow" style={{ color: '#a5f3fc' }}>♻️ Circularity &amp; Waste</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 12px', lineHeight: 1.2 }}>
            Plastic: The Recycling Reality
          </h1>
          <p style={{ fontSize: 16, color: '#cffafe', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            Not all plastics are created equal — and not all recycling is equal either.
            Why recycling plastic is harder than it looks, and what the EU is doing about it.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <Sidebar active={activeSection} />
        <div className="detail-main">

          {/* 1 — Polymer types */}
          <SectionCard id="polymers">
            <SectionTitle>Not one material — many</SectionTitle>
            <Para>
              &ldquo;Plastic&rdquo; is not a single material. It is a family of hundreds of distinct
              polymers — long chains of molecules with very different chemical structures,
              properties, and recyclability. The resin identification codes (① to ⑦) printed
              on the bottom of plastic products identify the polymer type; they are not a
              recyclability label. The six most commercially significant polymers are:
            </Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {POLYMERS.map((p) => (
                <div key={p.abbr} style={{ borderRadius: 10, border: `1px solid ${p.bg}`, overflow: 'hidden' }}>
                  <div style={{ background: p.bg, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 52, flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: p.color, lineHeight: 1 }}>{p.abbr}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{p.number}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Uses: {p.uses}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: p.recycleColor, textAlign: 'right', flexShrink: 0 }}>
                      {p.recyclability}
                    </div>
                  </div>
                  <div style={{ padding: '10px 16px 10px 84px', background: '#fff' }}>
                    <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{p.notes}</p>
                  </div>
                </div>
              ))}
            </div>

            <NoteBox>
              ⚠️ PVC (polyvinyl chloride, ③) is not listed above but deserves mention. Widely used
              in pipes, window frames, and flooring, PVC contains chlorine in its backbone and
              often includes phthalate plasticisers — both problematic for recycling and for
              the quality of recyclate. It is largely excluded from packaging recycling streams.
            </NoteBox>
          </SectionCard>

          {/* 2 — Mechanical recycling */}
          <SectionCard id="mechanical">
            <SectionTitle>Mechanical recycling — the workhorse</SectionTitle>
            <Para>
              <strong>Mechanical recycling</strong> is by far the dominant form of plastic
              recycling today. It processes plastic waste without changing its fundamental
              chemical structure — the polymer chains remain intact throughout. The process
              typically follows these steps:
            </Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '16px 0', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              {[
                { step: 1, label: 'Collection & sorting', desc: 'Plastic waste is collected (PMD bags, container parks) and sorted by polymer type using near-infrared spectroscopy and optical sorters.' },
                { step: 2, label: 'Shredding & washing', desc: 'Sorted plastic is shredded into flakes or granules and washed to remove food residues, labels, and adhesives.' },
                { step: 3, label: 'Separation', desc: 'Density separation (floating vs sinking in water) and other techniques further separate different polymers and remove contaminants.' },
                { step: 4, label: 'Extrusion into pellets', desc: 'Clean flakes are melted and extruded into standardised pellets — the secondary raw material that manufacturers buy and process into new products.' },
              ].map((s, i) => (
                <div key={s.step} style={{ display: 'flex', gap: 0, borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 40, background: TOPIC_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Para>
              Mechanical recycling is inexpensive, energy-efficient, and well-established. Its
              limitation is <strong>quality</strong>: each cycle slightly degrades the polymer
              chains, reducing strength and clarity. It also requires relatively clean,
              single-polymer input — mixed or contaminated streams produce lower-quality
              recyclate or cannot be processed at all.
            </Para>
          </SectionCard>

          {/* 3 — Chemical recycling */}
          <SectionCard id="chemical">
            <SectionTitle>Chemical recycling — the complement</SectionTitle>
            <Para>
              <strong>Chemical recycling</strong> is not a single technology but a family of
              processes that break plastic waste down further — into its molecular building
              blocks or simpler chemical feedstocks. It is <strong>complementary to
              mechanical recycling</strong>, not a replacement: it targets the waste streams
              that mechanical recycling cannot handle — mixed, contaminated, multilayer,
              or difficult-to-sort plastics.
            </Para>
            <Para>
              The three main categories of chemical recycling have very different input
              requirements, operating conditions, and outputs:
            </Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {CHEM_PROCESSES.map((p) => (
                <div key={p.name} style={{ borderLeft: `4px solid ${p.color}`, background: p.bg, borderRadius: '0 10px 10px 0', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: p.color }}>{p.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: p.stepColor, background: '#fff', borderRadius: 999, padding: '3px 10px', flexShrink: 0, border: `1px solid ${p.stepColor}` }}>
                      {p.stepLabel}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ fontWeight: 600 }}>Input:</span> {p.input}</div>
                    <div style={{ fontSize: 12, color: '#374151' }}><span style={{ fontWeight: 600 }}>Output:</span> {p.output}</div>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
                </div>
              ))}
            </div>

            <InfoBox>
              💡 Chemical recycling is still largely at pilot or early commercial scale in
              Europe. Pyrolysis has the most operational plants; solvolysis for PET is scaling
              fast. Gasification at commercial scale for plastics specifically remains rare.
              Costs are currently higher than mechanical recycling, but chemical recycling
              can produce virgin-quality output usable in food contact — something mechanical
              recycling struggles to guarantee for most polymers.
            </InfoBox>
          </SectionCard>

          {/* 4 — Steps to new product */}
          <SectionCard id="steps">
            <SectionTitle>From recycling output to new product — how many steps?</SectionTitle>
            <Para>
              One of the less-discussed differences between recycling routes is how many
              processing steps separate the recycling output from a finished product. Fewer
              steps mean lower costs, lower energy use, and less material loss. The contrast
              between the best and worst cases is stark.
            </Para>

            {/* Steps visual */}
            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  route: 'Mechanical recycling: PET bottle → pellets → new bottle',
                  color: '#15803d',
                  steps: [
                    { label: 'Sorted PET flakes', icon: '🔷' },
                    { label: 'Recycled PET pellets', icon: '🟢' },
                    { label: 'New PET bottle', icon: '🍾' },
                  ],
                  note: '1 processing step — the most efficient route. Why PET bottle-to-bottle recycling is the gold standard.',
                },
                {
                  route: 'Solvolysis: PET → monomers → new PET',
                  color: '#0369a1',
                  steps: [
                    { label: 'Contaminated PET', icon: '🔶' },
                    { label: 'Monomers (TPA + EG)', icon: '⚗️' },
                    { label: 'Polymerisation', icon: '🔄' },
                    { label: 'New PET', icon: '🍾' },
                  ],
                  note: '2 processing steps. Produces virgin-quality output suitable for food contact, but more energy-intensive than mechanical.',
                },
                {
                  route: 'Pyrolysis: mixed PE/PP → pyoil → new plastic',
                  color: '#ca8a04',
                  steps: [
                    { label: 'Mixed plastic waste', icon: '🗑️' },
                    { label: 'Pyrolysis oil', icon: '🛢️' },
                    { label: 'Refinery / cracker', icon: '🏭' },
                    { label: 'Monomers (ethylene, propylene)', icon: '⚗️' },
                    { label: 'New PE or PP', icon: '📦' },
                  ],
                  note: '3–4 processing steps. Handles waste streams mechanical recycling cannot. Higher cost and energy use, but the only viable route for contaminated mixed plastics.',
                },
                {
                  route: 'Gasification: any plastic → syngas → new plastic',
                  color: '#dc2626',
                  steps: [
                    { label: 'Any plastic waste', icon: '♻️' },
                    { label: 'Syngas (H₂ + CO)', icon: '💨' },
                    { label: 'Methanol synthesis', icon: '⚗️' },
                    { label: 'Methanol-to-olefins', icon: '🔄' },
                    { label: 'Polymerisation', icon: '🏭' },
                    { label: 'New plastic', icon: '📦' },
                  ],
                  note: '4–5 processing steps. Maximum feedstock flexibility (handles anything), minimum output efficiency. Primarily makes sense for heavily mixed and contaminated waste with no other viable route.',
                },
              ].map((route) => (
                <div key={route.route} style={{ borderRadius: 10, border: `2px solid ${route.color}20`, overflow: 'hidden' }}>
                  <div style={{ background: `${route.color}10`, padding: '10px 16px', borderBottom: `1px solid ${route.color}20` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: route.color }}>{route.route}</div>
                  </div>
                  <div style={{ padding: '16px', background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', marginBottom: 12 }}>
                      {route.steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <div style={{ textAlign: 'center', minWidth: 80 }}>
                            <div style={{ fontSize: 20 }}>{step.icon}</div>
                            <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, lineHeight: 1.3 }}>{step.label}</div>
                          </div>
                          {i < route.steps.length - 1 && (
                            <div style={{ color: route.color, fontWeight: 700, fontSize: 16, padding: '0 4px', marginBottom: 16 }}>→</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', borderRadius: 6, padding: '8px 12px' }}>
                      {route.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 5 — Barriers */}
          <SectionCard id="barriers">
            <SectionTitle>What makes plastic recycling hard?</SectionTitle>
            <Para>
              Even well-designed recycling systems face fundamental technical barriers rooted
              in how plastics are made and used. These are the five most significant.
            </Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {BARRIERS.map((b) => (
                <div key={b.title} style={{ borderLeft: `4px solid ${b.color}`, background: b.bg, borderRadius: '0 10px 10px 0', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{b.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: b.color }}>{b.title}</span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>{b.body}</p>
                </div>
              ))}
            </div>

            <NoteBox>
              ⚠️ Plastics contain over 13,000 substances used as additives, colorants,
              plasticisers and stabilisers. Once incorporated into a polymer, most of these
              cannot be removed during recycling. This is a fundamental argument for
              designing hazardous substances out of products before they are manufactured —
              not trying to extract them from waste afterwards.
            </NoteBox>
          </SectionCard>

          {/* 6 — EU response */}
          <SectionCard id="eu-response">
            <SectionTitle>What is the EU doing about it?</SectionTitle>
            <Para>
              The EU has moved from recycling targets (how much is collected) to recyclability
              requirements (whether products can be recycled at all). The shift to
              <strong> design-led regulation</strong> directly addresses the root causes of
              the barriers above.
            </Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {EU_MEASURES.map((m) => (
                <div key={m.label} style={{ borderLeft: `4px solid ${m.color}`, background: m.bg, borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: m.color, marginBottom: 6 }}>{m.label}</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>{m.text}</p>
                </div>
              ))}
            </div>

            <Para style={{ marginTop: 20 }}>
              Taken together, these regulations create a coherent chain: products must be
              designed to be recyclable (ESPR), packaging must actually be recyclable and
              contain recycled content (PPWR), hazardous substances that impede recycling
              are phased out (REACH/PPWR), and the Digital Product Passport makes material
              composition transparent to recyclers. The ambition is that by 2030–2035, the
              question &ldquo;can this be recycled?&rdquo; has a clear, verifiable answer for
              every product on the EU market.
            </Para>
          </SectionCard>

          {/* Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'PPWR — Packaging and Packaging Waste Regulation (EU 2025/40)',             url: 'https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en' },
                { label: 'EEA — Plastics recycling in Europe: obstacles and options',                url: 'https://www.eea.europa.eu/en/european-zero-pollution-dashboards/indicators/plastics-recycling-in-europe-obstacles-and-options' },
                { label: 'CEFIC — Chemical recycling: making plastics circular',                     url: 'https://cefic.org/solutions-explained/chemical-recycling-making-plastics-circular/' },
                { label: 'European Commission — ESPR and the Digital Product Passport',              url: 'https://environment.ec.europa.eu/topics/circular-economy/digital-product-passport_en' },
                { label: 'Fost Plus — how PMD recycling works in Belgium',                           url: 'https://www.fostplus.be/en/collecting-sorting' },
                { label: 'ECHA — Substances in packaging: Call for Evidence (2025)',                 url: 'https://echa.europa.eu' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500, transition: 'background 0.15s' }}
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
