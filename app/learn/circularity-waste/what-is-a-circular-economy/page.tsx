// → app/learn/circularity-waste/what-is-a-circular-economy/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 20px', paddingBottom: 10, borderBottom: '2px solid #06b6d4' }}>
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
          <span style={{ color: '#06b6d4', flexShrink: 0, marginTop: 2 }}>▸</span>
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

// ── Lansink Ladder ────────────────────────────────────────────────────────────

const LANSINK_STEPS = [
  { rank: 1, label: 'Reduce',      color: '#166534', bg: '#dcfce7', desc: 'Consume less — the best waste is waste that is never created.' },
  { rank: 2, label: 'Reuse',       color: '#15803d', bg: '#d1fae5', desc: 'Products or components used again without significant reprocessing.' },
  { rank: 3, label: 'Recycle',     color: '#16a34a', bg: '#bbf7d0', desc: 'Material recovery: raw materials extracted and used in new products.' },
  { rank: 4, label: 'Energy',      color: '#ca8a04', bg: '#fef9c3', desc: 'Energy recovery from waste that cannot be recycled (waste-to-energy).' },
  { rank: 5, label: 'Incineration',color: '#c2410c', bg: '#ffedd5', desc: 'Burning without energy recovery — materials are lost permanently.' },
  { rank: 6, label: 'Landfill',    color: '#991b1b', bg: '#fee2e2', desc: 'The least preferred option — materials buried and lost.' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'intro',          label: 'Linear vs Circular' },
  { id: 'lansink',        label: 'Ladder of Lansink' },
  { id: 'ecodesign',      label: 'Ecodesign Regulation' },
  { id: 'indicators',     label: 'Key Indicators' },
  { id: 'obsolescence',   label: 'Planned Obsolescence' },
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
          style={{ '--topic-color': '#06b6d4' } as React.CSSProperties}
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

export default function CircularEconomyPage() {
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
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #164e63 0%, #0e7490 60%, #06b6d4 100%)' }}>
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <div className="header-eyebrow" style={{ color: '#a5f3fc' }}>♻️ Circularity &amp; Waste</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 12px', lineHeight: 1.2 }}>
            What is a Circular Economy?
          </h1>
          <p style={{ fontSize: 16, color: '#cffafe', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            From take-make-dispose to reduce-reuse-recycle — and why recycling alone is not enough.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <Sidebar active={activeSection} />
        <div className="detail-main">

          {/* Linear vs Circular */}
          <SectionCard id="intro">
            <SectionTitle>Linear vs Circular Economy</SectionTitle>
            <Para>
              For most of industrial history, economies have operated on a <strong>linear model</strong>:
              take raw materials from the earth, make products, and dispose of them when their useful
              life ends. This take-make-dispose system has delivered extraordinary material prosperity
              — and has brought the planet to the edge of several ecological limits simultaneously. It
              generates vast quantities of waste, consumes non-renewable resources at rates the Earth
              cannot replenish, and emits greenhouse gases at every stage of the chain.
            </Para>
            <Para>
              A <strong>circular economy</strong> proposes a fundamentally different logic. Rather
              than treating materials as single-use inputs, a circular economy aims to keep them in
              use for as long as possible — at their highest possible value. Products are designed to
              last, to be repaired, to be reused, and ultimately to be recycled back into new products
              without loss of quality.
            </Para>
            <Para>
              The distinction matters: a circular economy is not simply a more efficient version of
              the linear system. It requires rethinking products at the design stage, restructuring
              business models, and — critically — <strong>reducing the total volume of material flows
              in the first place</strong>. Avoiding overconsumption is just as central to the circular
              economy as recycling.
            </Para>

            {/* Linear vs Circular visual */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '20px 0' }}>
              {[
                {
                  label: '🔴 Linear Economy',
                  color: '#dc2626',
                  bg: '#fef2f2',
                  border: '#fca5a5',
                  steps: ['Extract raw materials', 'Manufacture products', 'Sell & use', 'Discard as waste'],
                },
                {
                  label: '🟢 Circular Economy',
                  color: '#16a34a',
                  bg: '#f0fdf4',
                  border: '#86efac',
                  steps: ['Design for longevity', 'Manufacture efficiently', 'Use & repair', 'Reuse, recycle, recover'],
                },
              ].map((model) => (
                <div key={model.label} style={{ background: model.bg, border: `1px solid ${model.border}`, borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: model.color, marginBottom: 12 }}>{model.label}</div>
                  {model.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: model.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: '#374151' }}>{step}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Ladder of Lansink */}
          <SectionCard id="lansink">
            <SectionTitle>The Ladder of Lansink</SectionTitle>
            <Para>
              The <strong>Ladder of Lansink</strong> was introduced by Dutch politician Ad Lansink in
              1979 as a hierarchy for waste management. Later adopted by the EU as the framework
              underpinning its waste legislation, it ranks treatment options from most to least
              preferable — and remains the most useful tool for understanding what a circular economy
              actually prioritises.
            </Para>

            <Para>The six levels, from most to least preferred:</Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
              {LANSINK_STEPS.map((step) => (
                <div key={step.label} style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${step.bg}` }}>
                  <div style={{ width: 40, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {step.rank}
                  </div>
                  <div style={{ background: step.bg, padding: '10px 14px', flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: step.color }}>{step.label}</span>
                    <span style={{ fontSize: 13, color: '#374151', marginLeft: 8 }}>{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Para style={{ fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Two critical clarifications:</Para>
            <Para>
              First, <strong>incineration and landfill are not part of the circular economy</strong> —
              even energy-from-waste incineration. Once materials are burned, they are gone. The
              circular economy aspires to eliminate these steps, not optimise them.
            </Para>
            <Para>
              Second — and more importantly — <strong>a circular economy does not simply mean
              recycling everything</strong>. Recycling sits at step three of a six-step hierarchy.
              Reduce and Reuse come first. A society that produces and discards vast quantities of
              products but recycles them efficiently is not circular — it is still linear, with a
              recovery step appended at the end. The circular economy challenges overconsumption at
              the source.
            </Para>
            <NoteBox>
              ⚠️ Belgium recycles around 56% of its municipal solid waste — one of the highest
              rates in the EU. But recycling rates say nothing about how much waste is generated in
              the first place. A truly circular system would see far less material reaching the
              recycling stage at all.
            </NoteBox>
          </SectionCard>

          {/* Ecodesign */}
          <SectionCard id="ecodesign">
            <SectionTitle>Ecodesign — Building Circularity into Products</SectionTitle>
            <Para>
              Most of the environmental impact of a product is determined at the <strong>design
              stage</strong> — before any material is extracted, before any factory turns a switch
              on. Yet under the linear economy, products were almost universally designed for function
              and cost, not for longevity, repairability, or end-of-life recovery.
            </Para>
            <Para>
              The EU&#39;s <strong>Ecodesign for Sustainable Products Regulation (ESPR, Regulation
              EU 2024/1781)</strong>, which entered into force in July 2024, changes this
              fundamentally. It establishes a mandatory framework requiring products sold on the EU
              market to meet minimum standards across a range of sustainability dimensions —
              durability, repairability, recyclability, recycled content, and carbon footprint. The
              ESPR extends to virtually all physical goods: textiles, furniture, electronics,
              construction materials, tyres, chemicals, and more.
            </Para>

            <SubTitle>The Digital Product Passport</SubTitle>

            {/* DPP image floated right, 3:2 ratio */}
            <div style={{ float: 'right', width: 240, marginLeft: 24, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
              <Image
                src="/images/learn/digital-product-passport.PNG"
                alt="Hand holding a phone showing the Digital Product Passport of a t-shirt"
                width={360}
                height={240}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <div style={{ background: '#f9fafb', padding: '8px 12px', fontSize: 11, color: '#6b7280', borderTop: '1px solid #e5e7eb' }}>
                Scanning a product&#39;s QR code reveals its full Digital Product Passport.
              </div>
            </div>

            <Para>
              The flagship tool of the ESPR is the <strong>Digital Product Passport (DPP)</strong> —
              a digital identity card attached to every product sold in the EU, accessible by scanning
              a <strong>QR code</strong> on the product or packaging. Imagine buying a t-shirt and
              scanning its label to instantly see where the cotton was grown, how much water was used
              to produce it, what its carbon footprint is, and how to recycle it at end of life. This
              is what the DPP makes possible.
            </Para>
            <Para>
              The DPP will contain, among other things:
            </Para>

            <div style={{ clear: 'both' }} />

            <BulletList items={[
              { bold: 'Material composition', text: 'What the product is made of, including substances of concern and percentage of recycled content.' },
              { bold: 'Carbon footprint', text: 'Lifecycle greenhouse gas emissions from extraction through disposal — the same metric you see in the Climate & Energy section of this site.' },
              { bold: 'Durability and expected lifetime', text: 'How long the product is designed to last under normal use.' },
              { bold: 'Repairability', text: 'Availability of spare parts, access to repair manuals, and whether independent repairers can access the tools and software they need.' },
              { bold: 'Disassembly instructions', text: 'How to take the product apart for repair or recycling.' },
              { bold: 'Recyclability', text: 'How much of the product can be recovered at end of life, and at what quality.' },
            ]} />

            <Para>
              The DPP will be mandatory across product categories on a phased timeline. A central
              registry for the system will be established by July 2026. The first mandatory
              sectors — batteries, selected electronics, textiles, and furniture — will follow from
              2027. By 2030, DPPs will cover a broad range of consumer goods. Every product sold on
              the EU market, whether made in Belgium or imported, will need to carry one.
            </Para>
          </SectionCard>

          {/* Key Indicators */}
          <SectionCard id="indicators">
            <SectionTitle>Key Circularity Indicators</SectionTitle>
            <Para>
              Among the indicators assessed through the Digital Product Passport, two are
              particularly significant for consumers.
            </Para>

            <SubTitle>Repairability score</SubTitle>
            <Para>
              The repairability score ranks products on how easily they can be repaired, on a
              scale from <strong>A to E</strong> — similar to the familiar energy efficiency label.
              It considers the availability and price of spare parts, access to repair manuals and
              diagnostic software, whether the product can be disassembled without specialist tools,
              and whether independent repairers can access the information and parts they need.
            </Para>
            <Para>
              Since June 2025, <strong>smartphones and tablets</strong> sold in the EU must display
              a repairability score on their energy label. Manufacturers must make key spare parts —
              batteries, screens, cameras, charging ports, speakers — available within 5–10 working
              days, for at least <strong>7 years</strong> after the last unit of a model is sold.
              Operating system updates must be provided for at least <strong>5 years</strong> from
              the last sale date.
            </Para>

            <SubTitle>Durability and lifetime extension</SubTitle>
            <Para>
              The ESPR requires that products be designed not to fail prematurely. Extending the
              lifetime of a product by even one year can have a dramatic effect on its total
              environmental impact, since manufacturing typically accounts for 70–80% of a
              product&#39;s lifecycle emissions.
            </Para>

            {/* Smartphone stat card */}
            <div style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '1px solid #a5f3fc', borderRadius: 10, padding: '20px 24px', margin: '16px 0', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 40, lineHeight: 1 }}>📱</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0e7490', lineHeight: 1.1, marginBottom: 6 }}>
                  +1 year lifespan = −2.1 Mt CO₂eq/year
                </div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                  Europe&#39;s 600 million smartphones generate 14 million tonnes of CO₂eq per year,
                  72% of which occurs during manufacturing. The average phone is replaced after just
                  3 years. Extending this by one year would save 2.1 million tonnes of CO₂eq
                  annually by 2030 — equivalent to taking over a million cars off the road.
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Planned Obsolescence */}
          <SectionCard id="obsolescence">
            <SectionTitle>Planned Obsolescence — The Business Model That Breaks Things</SectionTitle>
            <Para>
              If repair is the solution, planned obsolescence is the problem.{' '}
              <strong>Planned obsolescence</strong> is the practice of designing products to fail —
              or become functionally outdated — after a predictable period, driving consumers to
              replace rather than repair.
            </Para>

            <BulletList items={[
              { bold: 'Physical obsolescence', text: 'Components designed with limited durability: batteries that cannot be replaced, screens glued to frames, connectors that corrode quickly.' },
              { bold: 'Software obsolescence', text: 'Manufacturers stop providing operating system updates for older devices, rendering them insecure, incompatible with new apps, or too slow to use. The device is physically intact but functionally dead.' },
              { bold: 'Anti-repair design', text: 'Parts are glued rather than screwed, proprietary tools are required, and "software locks" prevent third-party parts from functioning correctly even if physically installed.' },
              { bold: 'Psychological obsolescence', text: 'Annual product cycles and marketing campaigns create social pressure to upgrade, even when the existing device functions perfectly well.' },
            ]} />

            <SubTitle>Why does it happen?</SubTitle>
            <Para>
              The economic logic is straightforward. In a growth-dependent economic system,
              manufacturers have a structural incentive to maximise sales volume — and longer-lasting
              products mean fewer sales. Companies answer to shareholders who expect continuous
              revenue growth, and the easiest way to guarantee repeat purchases is to ensure that
              existing products stop working or feel inadequate within a few years. This is the
              fundamental tension at the heart of the circular economy: it asks the economy to
              produce more value from fewer products, while the dominant growth model requires
              continuously rising production and sales.
            </Para>
            <Para>
              Electronic products are particularly affected. Software updates slow older hardware.
              Repair is made deliberately difficult. Spare parts are priced to discourage use.
              77% of EU consumers say they would rather repair their devices than buy new ones — but
              barriers built into the products by manufacturers make repair unnecessarily expensive
              or impossible.
            </Para>

            <SubTitle>What is the EU doing?</SubTitle>

            {[
              {
                label: 'ESPR (2024)',
                color: '#0e7490',
                bg: '#ecfeff',
                text: 'Bans design features, software or contractual clauses that obstruct repair. Mandates minimum durability standards and spare part availability across product categories. Introduces the Digital Product Passport to make sustainability data transparent.',
              },
              {
                label: 'Right to Repair Directive (2024)',
                color: '#7c3aed',
                bg: '#f5f3ff',
                text: 'Manufacturers must provide spare parts and tools at a reasonable price and are prohibited from using hardware or software techniques that obstruct repairs. They cannot impede the use of second-hand or 3D-printed spare parts by independent repairers, nor refuse to repair a product solely for economic reasons.',
              },
              {
                label: 'Smartphone Ecodesign Rules (June 2025)',
                color: '#15803d',
                bg: '#f0fdf4',
                text: 'Smartphones must use batteries capable of at least 800 charge cycles while retaining 80% capacity. Key spare parts must be available for 7 years after last sale. Operating system updates required for at least 5 years. A repairability score — A to E — must be displayed on the energy label.',
              },
              {
                label: 'France (2015)',
                color: '#b45309',
                bg: '#fef3c7',
                text: 'The first country to criminalise planned obsolescence — a criminal offence punishable by up to 2 years in prison and a €300,000 fine. The EU\'s ESPR now aims to restrict such practices across all member states.',
              },
            ].map((item) => (
              <div key={item.label} style={{ borderLeft: `4px solid ${item.color}`, background: item.bg, borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: item.color, marginBottom: 5 }}>{item.label}</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0 }}>{item.text}</p>
              </div>
            ))}

            <NoteBox>
              ⚠️ The right to repair and ecodesign rules are a direct challenge to business models
              built on planned obsolescence. But legislation alone is not enough — consumer choices,
              repair culture, and secondhand markets all play a role in making longer product
              lifetimes the norm rather than the exception.
            </NoteBox>
          </SectionCard>

          {/* Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'ESPR — Regulation (EU) 2024/1781 (EUR-Lex)',                         url: 'https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng' },
                { label: 'EU Circular Economy Action Plan (European Commission)',               url: 'https://environment.ec.europa.eu/strategy/circular-economy-action-plan_en' },
                { label: 'Digital Product Passport — European Commission overview',            url: 'https://environment.ec.europa.eu/topics/circular-economy/digital-product-passport_en' },
                { label: 'Right to Repair Directive — European Parliament (2024)',              url: 'https://www.europarl.europa.eu/news/en/press-room/20240419IPR20590/right-to-repair-making-repair-easier-and-more-appealing-to-consumers' },
                { label: 'EU Smartphone Ecodesign Rules — European Commission (June 2025)',    url: 'https://single-market-economy.ec.europa.eu/news/new-eu-rules-durable-energy-efficient-and-repairable-smartphones-and-tablets-start-applying-2025-06-20_en' },
                { label: 'Lansink\'s Ladder — waste hierarchy explained (OVAM)',               url: 'https://www.ovam.be' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                >
                  <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.75rem' }}>↗</span>
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
