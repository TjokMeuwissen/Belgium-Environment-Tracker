// → app/learn/circularity-waste/plastic-the-recycling-reality/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
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
    code: '1', abbr: 'PET', name: 'Polyethylene Terephthalate',
    color: '#0369a1', bg: '#eff6ff',
    uses: 'Drink bottles, food trays, polyester fibres',
    recyclability: 'Excellent', recycleColor: '#15803d',
    notes: 'One of the best-recycled plastics globally. Bottle-to-bottle recycling is mature. Also recycled into polyester fleece clothing.',
  },
  {
    code: '2 & 4', abbr: 'PE', name: 'Polyethylene (HDPE & LDPE)',
    color: '#7c3aed', bg: '#f5f3ff',
    uses: 'Milk bottles, carrier bags, films, pipes, packaging film',
    recyclability: 'Good (rigid) / Difficult (film)', recycleColor: '#ca8a04',
    notes: 'Rigid HDPE (bottles, crates) recycles well. Flexible LDPE films are harder — they clog sorting machines and need separate collection.',
  },
  {
    code: '3', abbr: 'PVC', name: 'Polyvinyl Chloride',
    color: '#0f766e', bg: '#f0fdfa',
    uses: 'Pipes, window frames, flooring, cable insulation',
    recyclability: 'Poor', recycleColor: '#dc2626',
    notes: 'Contains chlorine in its backbone and often phthalate plasticisers — both problematic for recycling. Largely excluded from packaging recycling streams.',
  },
  {
    code: '5', abbr: 'PP', name: 'Polypropylene',
    color: '#b45309', bg: '#fef3c7',
    uses: 'Yoghurt pots, bottle caps, food containers, car parts',
    recyclability: 'Moderate', recycleColor: '#ca8a04',
    notes: 'Widely used but often coloured or mixed with other materials. Recycling infrastructure is growing but less mature than PET or HDPE.',
  },
  {
    code: '6', abbr: 'PS', name: 'Polystyrene',
    color: '#be185d', bg: '#fce7f3',
    uses: 'Foam cups, food trays, packaging foam, CD cases',
    recyclability: 'Poor', recycleColor: '#dc2626',
    notes: 'Expanded PS (foam) is bulky and low-value. Rarely collected separately. Chemical recycling (pyrolysis) is more promising than mechanical.',
  },
  {
    code: '7', abbr: 'Other', name: 'Other (PC, ABS, PUR, blends...)',
    color: '#374151', bg: '#f9fafb',
    uses: 'Electronics housings, car dashboards, helmets, mattress foam',
    recyclability: 'Difficult', recycleColor: '#dc2626',
    notes: 'A catch-all for polymers not covered by codes 1–6 — polycarbonate (PC), ABS, polyurethane (PUR) and multi-material blends. Often contain hazardous additives. Mainly downcycled or landfilled.',
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
              polymers with very different chemical structures, properties and recyclability.
              The resin identification codes (1 to 7) printed on the bottom of plastic products
              identify the polymer type — they are a sorting aid, not a recyclability label.
            </Para>

            {/* Plastic codes image — full width */}
            <div style={{ margin: '20px 0' }}>
              <img
                src="/images/learn/plastic-codes.jpg"
                alt="Plastic resin identification codes 1 to 7 with polymer names and abbreviations"
                style={{ width: '100%', display: 'block', borderRadius: 8 }}
              />
            </div>

            {/* 3-column table */}
            <div style={{ overflowX: 'auto', marginTop: 4 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: TOPIC_COLOR, color: '#fff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Polymer</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Typical uses</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Recyclability</th>
                  </tr>
                </thead>
                <tbody>
                  {POLYMERS.map((p, i) => (
                    <tr key={p.abbr} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: p.color }}>{p.abbr}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Code {p.code}</div>
                        <div style={{ fontSize: 12, color: '#374151', marginTop: 2, fontStyle: 'italic' }}>{p.name}</div>
                      </td>
                      <td style={{ padding: '10px 14px', verticalAlign: 'top', color: '#374151' }}>
                        <div>{p.uses}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>{p.notes}</div>
                      </td>
                      <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                        <span style={{ fontWeight: 700, color: p.recycleColor }}>{p.recyclability}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              processes that break plastic waste down to its molecular building blocks or simpler
              feedstocks. It is <strong>complementary to mechanical recycling</strong>, targeting
              the streams mechanical recycling cannot handle — mixed, contaminated, multilayer or
              difficult-to-sort plastics. However, chemical recycling requires significantly more
              processing steps than mechanical recycling, which means higher energy use, more
              material losses at each stage, and higher costs per tonne of recyclate produced.
            </Para>

            <Para><strong>The four main chemical recycling technologies:</strong></Para>
            <BulletList items={[
              { bold: 'Pyrolysis', text: 'heats plastic waste (300–650\u00b0C) in the absence of oxygen, breaking polymer chains into hydrocarbon oils and gases. Best suited to mixed polyolefins (PE, PP) and polystyrene. Output is pyrolysis oil (pyoil), a crude oil substitute that must enter a refinery before becoming new plastic.' },
              { bold: 'Gasification', text: 'heats any plastic waste at very high temperatures (500\u20131,300\u00b0C) with limited oxygen, producing syngas (hydrogen + carbon monoxide). The most feedstock-flexible technology — handles contaminated or mixed streams that nothing else can. Also the most processing steps to reach new plastic.' },
              { bold: 'Depolymerisation (solvolysis)', text: 'breaks specific polymers back into their original monomer units using solvents, heat or catalysts. Best established for PET (producing TPA and ethylene glycol). The monomers are chemically identical to virgin — making the output suitable for food contact applications. Fewest steps to new product.' },
              { bold: 'Dissolution (solvent-based purification)', text: 'dissolves a target polymer in a solvent, filters out contaminants and additives, then reprecipitates the purified polymer. Does not break the polymer chains — preserves properties. Used for polyolefin films, ABS and PS. Outputs polymer that can be re-pelletised directly.' },
            ]} />

            {/* Chemical recycling image */}
            <div style={{ margin: '20px 0' }}>
              <img
                src="/images/learn/plastic-chemical-recycling.jpg"
                alt="Chemical recycling technologies and pathways from plastic waste to new products"
                style={{ width: '100%', display: 'block', borderRadius: 8 }}
              />
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>
                Source: Plastics Europe — Chemical Recycling.{' '}
                <a href="https://plasticseurope.org/sustainability/circularity/recycling/chemical-recycling/" target="_blank" rel="noopener noreferrer" style={{ color: TOPIC_COLOR }}>
                  plasticseurope.org
                </a>
              </p>
            </div>

            {/* 4-column steps table */}
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Technology</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Input</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Output</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700 }}>Steps to new product</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      tech: 'Depolymerisation (Solvolysis)',
                      color: '#0369a1',
                      input: 'Specific polymers: PET, PU, nylon, polycarbonate',
                      output: 'Monomers (e.g. TPA + ethylene glycol for PET)',
                      steps: 'Monomers \u2192 Polymerisation \u2192 New plastic (1\u20132 steps). Virgin-quality output suitable for food contact.',
                    },
                    {
                      tech: 'Dissolution',
                      color: '#0f766e',
                      input: 'Polyolefin films, ABS, PS (relatively clean)',
                      output: 'Purified polymer solution \u2192 re-pelletised polymer',
                      steps: 'Reprecipitation \u2192 Pelletising \u2192 New product (1\u20132 steps). Polymer chains intact; properties preserved.',
                    },
                    {
                      tech: 'Pyrolysis',
                      color: '#7c3aed',
                      input: 'Mixed polyolefins (PE, PP), polystyrene, mixed plastic waste',
                      output: 'Pyrolysis oil (pyoil) — a crude oil substitute',
                      steps: 'Pyoil \u2192 Refinery/cracker \u2192 Monomers (ethylene, propylene) \u2192 Polymerisation \u2192 New PE/PP (3\u20134 steps).',
                    },
                    {
                      tech: 'Gasification',
                      color: '#b45309',
                      input: 'Any plastic waste including heavily contaminated or mixed streams',
                      output: 'Syngas (H\u2082 + CO)',
                      steps: 'Syngas \u2192 Methanol synthesis \u2192 Methanol-to-olefins \u2192 Polymerisation \u2192 New plastic (4\u20135 steps). Maximum feedstock flexibility, most steps.',
                    },
                  ].map((r, i) => (
                    <tr key={r.tech} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #e5e7eb', verticalAlign: 'top' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 700, color: r.color }}>{r.tech}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151', lineHeight: 1.55 }}>{r.input}</td>
                      <td style={{ padding: '10px 14px', color: '#374151', lineHeight: 1.55 }}>{r.output}</td>
                      <td style={{ padding: '10px 14px', color: '#374151', lineHeight: 1.55 }}>{r.steps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <InfoBox>
              Chemical recycling is still largely at pilot or early commercial scale in Europe. Depolymerisation for PET is scaling fast; pyrolysis has the most operational plants. Gasification at commercial scale for plastics specifically remains rare. Costs are currently higher than mechanical recycling, but chemical routes can produce virgin-quality output usable in food contact &mdash; something mechanical recycling struggles to guarantee for most polymers.
            </InfoBox>
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
                { label: 'PlasticsEurope — Chemical Recycling: technologies and pathways', url: 'https://plasticseurope.org/sustainability/circularity/recycling/chemical-recycling/' },
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
