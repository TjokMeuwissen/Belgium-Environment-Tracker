// → app/learn/circularity-waste/belgiums-waste-system-explained/page.tsx
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

// ── Waste stream cards ────────────────────────────────────────────────────────

const STREAMS = [
  {
    color: '#1d4ed8',
    bg: '#eff6ff',
    emoji: '🔵',
    label: 'PMD bag',
    subtitle: 'Plastics · Metals · Drink cartons',
    items: ['Plastic bottles and flasks', 'Yoghurt pots, margarine tubs, trays', 'Metal cans (food, beverages, aerosols)', 'Drink cartons (milk, juice, soup)', 'Aluminium trays and caps'],
    frequency: 'Every 2 weeks',
    destination: 'Sorting centres → material-specific recyclers',
  },
  {
    color: '#374151',
    bg: '#f9fafb',
    emoji: '⚪',
    label: 'Residual waste',
    subtitle: 'Everything that cannot be sorted elsewhere',
    items: ['Soiled packaging', 'Nappies and hygiene products', 'Ceramics and porcelain', 'Composite materials that cannot be separated'],
    frequency: 'Every 1–2 weeks',
    destination: 'Incineration with energy recovery (or landfill)',
  },
  {
    color: '#15803d',
    bg: '#f0fdf4',
    emoji: '🟢',
    label: 'Organic / GFT',
    subtitle: 'Groente, Fruit & Tuinafval — kitchen & garden waste',
    items: ['Vegetable, fruit and food scraps', 'Coffee grounds and tea bags', 'Garden trimmings and leaves', 'Cut flowers'],
    frequency: 'Every 1–2 weeks',
    destination: 'Composting or anaerobic digestion (biogas + digestate)',
  },
  {
    color: '#92400e',
    bg: '#fef3c7',
    emoji: '📄',
    label: 'Paper & cardboard',
    subtitle: 'Collected separately at the door',
    items: ['Newspapers and magazines', 'Cardboard boxes (flattened)', 'Envelopes and office paper', 'Paper bags and wrapping paper'],
    frequency: 'Every 2–4 weeks',
    destination: 'Paper mills → recycled into newsprint, cardboard, tissue',
  },
  {
    color: '#15803d',
    bg: '#dcfce7',
    emoji: '🍾',
    label: 'Glass',
    subtitle: 'Deposited at bottle banks or bring points',
    items: ['Glass bottles (all colours)', 'Glass jars', 'Not: window glass, pyrex, crystal, mirrors'],
    frequency: 'Drop-off at bottle bank (no door collection)',
    destination: 'Glass furnaces → new glass bottles (endlessly recyclable)',
  },
];

// ── EPR schemes ───────────────────────────────────────────────────────────────

const EPR_SCHEMES = [
  {
    org: 'Fost Plus',
    color: '#0e7490',
    bg: '#ecfeff',
    scope: 'Household packaging — PMD, paper/cardboard, glass',
    who: 'Any company that puts packaging on the Belgian market pays a fee to Fost Plus, which finances the collection and sorting infrastructure.',
    founded: '1994',
  },
  {
    org: 'Val-I-Pac',
    color: '#7c3aed',
    bg: '#f5f3ff',
    scope: 'Industrial and commercial packaging',
    who: 'Covers packaging used by businesses (pallets, stretch film, strapping, corrugated boxes) — the industrial counterpart to Fost Plus.',
    founded: '1997',
  },
  {
    org: 'Recupel',
    color: '#1d4ed8',
    bg: '#eff6ff',
    scope: 'Waste electrical and electronic equipment (WEEE)',
    who: 'Producers of electronics pay a visible Recupel contribution on each product sold. Recupel finances collection at container parks and in-store take-back points, and manages recycling. Collected 41 million devices in 2021.',
    founded: '2001',
  },
  {
    org: 'Bebat',
    color: '#15803d',
    bg: '#f0fdf4',
    scope: 'Portable and industrial batteries',
    who: 'Battery producers finance collection via the Bebat contribution. Small Bebat boxes are available in supermarkets, electronics stores, and container parks across Belgium.',
    founded: '1996',
  },
  {
    org: 'Valorfrit',
    color: '#b45309',
    bg: '#fef3c7',
    scope: 'Used cooking oils and fats',
    who: 'Covers both household and professional (catering) used frying oils, which are collected and processed into biodiesel or animal feed.',
    founded: '2002',
  },
  {
    org: 'Valumat',
    color: '#be185d',
    bg: '#fce7f3',
    scope: 'Mattresses (Flanders)',
    who: 'The most recent Belgian EPR scheme, introduced in Flanders. Producers finance the take-back and recycling of old mattresses collected at container parks.',
    founded: '2018',
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'collection',     label: 'Household collection' },
  { id: 'parks',          label: 'Container parks' },
  { id: 'what-happens',   label: 'What happens next' },
  { id: 'epr',            label: 'EPR schemes' },
  { id: 'drs',            label: 'The DRS gap' },
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

export default function BelgiumsWasteSystemPage() {
  const [activeSection, setActiveSection] = useState('collection');

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
            Belgium&#39;s Waste System Explained
          </h1>
          <p style={{ fontSize: 16, color: '#cffafe', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            From the blue PMD bag to the container park — who collects what, what happens to it, and who pays for it all.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <Sidebar active={activeSection} />
        <div className="detail-main">

          {/* 1 — Household collection */}
          <SectionCard id="collection">
            <SectionTitle>Household waste collection</SectionTitle>
            <Para>
              Belgium&#39;s household waste system is built around <strong>source separation</strong>:
              residents sort their waste into distinct streams before collection, rather than
              sorting it centrally afterwards. This approach, introduced from the late 1980s
              onwards, is one of the main reasons Belgium consistently ranks among the highest
              recyclers in the EU.
            </Para>

            <InfoBox>
              🏛️ Waste policy is fully <strong>regionalised</strong> in Belgium. Flanders (OVAM),
              Wallonia (SPW / Département de la Nature et des Forêts), and Brussels (Bruxelles
              Propreté / Bruxelles Environnement) each operate their own systems. Collection
              is then delegated to 28 inter-municipal companies in Flanders, 7 in Wallonia,
              and 1 in Brussels. The rules — which bag, which day, which container — vary
              by municipality.
            </InfoBox>

            <Para style={{ marginTop: 20 }}>The main household waste streams collected at the door:</Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {STREAMS.map((s) => (
                <div key={s.label} style={{ borderRadius: 10, border: `1px solid ${s.bg === '#f9fafb' ? '#e5e7eb' : s.bg}`, overflow: 'hidden' }}>
                  <div style={{ background: s.bg, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${s.bg === '#f9fafb' ? '#e5e7eb' : s.bg}` }}>
                    <span style={{ fontSize: 20 }}>{s.emoji}</span>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{s.label}</span>
                      <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 8 }}>{s.subtitle}</span>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                      🕐 {s.frequency}
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#fff', display: 'flex', gap: 24 }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', flex: 1 }}>
                      {s.items.map((item, i) => (
                        <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4, display: 'flex', gap: 8 }}>
                          <span style={{ color: s.color, flexShrink: 0 }}>·</span>{item}
                        </li>
                      ))}
                    </ul>
                    <div style={{ fontSize: 12, color: '#6b7280', minWidth: 180, borderLeft: '1px solid #f3f4f6', paddingLeft: 16 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, color: '#374151' }}>After collection:</div>
                      {s.destination}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <NoteBox>
              ⚠️ PMD sorting rules were significantly expanded in 2021 with the introduction
              of the new blue bag. Previously only bottles and flasks were accepted; now all
              rigid plastic packaging is included. This added around 8 kg of collectible
              material per person per year.
            </NoteBox>
          </SectionCard>

          {/* 2 — Container parks */}
          <SectionCard id="parks">
            <SectionTitle>Container parks</SectionTitle>
            <Para>
              For waste that cannot or should not go in the doorstep bags, Belgium has an
              extensive network of <strong>container parks</strong> (recyclageparken / parcs à
              conteneurs) — staffed drop-off sites where residents can deposit a wide range of
              materials for free or at low cost. There are over 500 container parks in Flanders
              alone.
            </Para>
            <Para>Container parks typically accept:</Para>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '12px 0' }}>
              {[
                { emoji: '📺', label: 'Electrical & electronic equipment', sub: 'Collected via Recupel' },
                { emoji: '🔋', label: 'Batteries', sub: 'Collected via Bebat' },
                { emoji: '🪵', label: 'Wood and timber', sub: 'Chipped and composted or burned' },
                { emoji: '🧱', label: 'Construction & demolition waste', sub: 'Sorted by type for recycling' },
                { emoji: '🌿', label: 'Garden waste', sub: 'Composted separately from GFT' },
                { emoji: '🛋️', label: 'Bulky items and furniture', sub: 'Sometimes redirected to reuse centres' },
                { emoji: '🛢️', label: 'Hazardous household waste', sub: 'Paint, solvents, chemicals, medicines' },
                { emoji: '🛞', label: 'Tyres', sub: 'Covered by EPR scheme (Febelauto / Recytyre)' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <Para>
              Many container parks are connected to a <strong>reuse centre</strong> (Kringwinkel
              in Flanders, ReSS in Wallonia) where items in good enough condition — furniture,
              clothes, books, electronics — are collected separately, refurbished if needed, and
              resold cheaply. This puts reuse, the second rung of the Lansink ladder, into
              practice for bulky household items.
            </Para>
          </SectionCard>

          {/* 3 — What happens next */}
          <SectionCard id="what-happens">
            <SectionTitle>What happens after collection?</SectionTitle>
            <Para>
              Collection is only the beginning. Each stream follows a distinct processing pathway.
            </Para>

            <SubTitle>PMD → sorting centres → material recyclers</SubTitle>
            <Para>
              Blue PMD bags are transported to one of five major sorting centres in Belgium
              (in Willebroek, Evergem, Couillet, Mons, and Liège). Here, a combination of drum
              sieves, infrared spectroscopy machines, and AI-assisted optical sorting separates
              the mixed contents into individual material streams — PET bottles, HDPE containers,
              metal cans, aluminium, drink cartons, and so on. Each stream is compressed into
              bales and shipped to specialist recyclers in Belgium and abroad, where they are
              washed, shredded, and reprocessed into new raw materials.
            </Para>

            <SubTitle>Paper & cardboard → paper mills</SubTitle>
            <Para>
              Collected paper and cardboard is sorted, pulped, and de-inked at paper mills. The
              resulting pulp is used to produce recycled newsprint, cardboard packaging, tissue
              paper, and office paper. Cardboard can be recycled up to 25 times before the fibres
              become too short to be useful.
            </Para>

            <SubTitle>Glass → glass furnaces</SubTitle>
            <Para>
              Glass collected from bottle banks is crushed into cullet and melted in furnaces to
              produce new glass bottles and jars. Glass is one of the few materials that can be
              recycled indefinitely without any loss of quality. Using cullet also reduces the
              energy needed to melt raw materials.
            </Para>

            <SubTitle>Organic waste → composting or biogas</SubTitle>
            <Para>
              GFT waste follows one of two routes: aerobic composting, which produces compost
              used in agriculture and horticulture; or anaerobic digestion, which produces biogas
              (used for electricity or heat) and digestate (a nutrient-rich fertiliser).
            </Para>

            <SubTitle>Residual waste → incineration with energy recovery</SubTitle>
            <Para>
              What cannot be sorted or recycled ends up in the residual waste stream. In Belgium,
              this is overwhelmingly sent to waste-to-energy incineration plants rather than
              landfill. The heat generated is used to produce electricity and district heating.
              Flanders has an effective landfill ban for combustible waste, making it one of the
              lowest-landfilling regions in Europe. That said, incineration sits at step 4 on the
              Lansink ladder — it is not circular, and the goal remains to reduce the volume of
              residual waste reaching this stage.
            </Para>
          </SectionCard>

          {/* 4 — EPR */}
          <SectionCard id="epr">
            <SectionTitle>Extended Producer Responsibility (EPR)</SectionTitle>
            <Para>
              Belgium&#39;s waste system is financed largely through <strong>Extended Producer
              Responsibility (EPR)</strong> schemes — a policy mechanism that makes the producers
              and importers of goods financially responsible for managing those goods at end of life.
              Rather than the cost of waste collection falling on municipalities (and ultimately
              taxpayers), EPR shifts it to the companies that put products on the market.
            </Para>
            <Para>
              In practice, EPR works through <strong>Producer Responsibility Organisations
              (PROs)</strong> — not-for-profit organisations set up by industry. Companies pay a
              fee to the relevant PRO based on the type and weight of products or packaging they
              sell. The PRO uses these funds to finance collection infrastructure, sorting, and
              recycling. Fees are often <em>eco-modulated</em>: packaging that is harder to recycle
              pays a higher fee, incentivising better design choices.
            </Para>

            <Para style={{ fontWeight: 600, marginBottom: 8 }}>Belgium&#39;s main EPR schemes:</Para>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EPR_SCHEMES.map((scheme) => (
                <div key={scheme.org} style={{ borderLeft: `4px solid ${scheme.color}`, background: scheme.bg, borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: scheme.color }}>{scheme.org}</span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>est. {scheme.founded}</span>
                    <span style={{ fontSize: 13, color: '#374151', marginLeft: 4 }}>— {scheme.scope}</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: '#374151', margin: 0 }}>{scheme.who}</p>
                </div>
              ))}
            </div>

            <InfoBox>
              💡 EPR schemes in Belgium are national in scope — since packaging regulation is a
              federal competence — but implementation is coordinated between the three regions
              through the Interregional Packaging Commission (IVC/IRCP). This means the same
              rules apply whether you live in Ghent, Liège, or Brussels.
            </InfoBox>
          </SectionCard>

          {/* 5 — DRS gap */}
          <SectionCard id="drs">
            <SectionTitle>The DRS gap — Belgium vs its neighbours</SectionTitle>
            <Para>
              One area where Belgium lags behind its neighbours is the absence of a
              <strong> Deposit Return System (DRS)</strong> for single-use plastic bottles and
              cans. A DRS works by charging consumers a small deposit — typically €0.15–€0.25 —
              at the point of purchase, which is refunded when the empty container is returned
              to a collection point, usually a supermarket.
            </Para>

            {/* Comparison table */}
            <div style={{ margin: '20px 0', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ background: '#1a1a1a', padding: '10px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Country</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DRS status</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Return rate</div>
              </div>
              {[
                { country: '🇩🇪 Germany',     status: 'Mandatory since 2003',             rate: '~98%', rateColor: '#15803d' },
                { country: '🇳🇱 Netherlands', status: 'Mandatory since 2006 (expanded 2021–23)', rate: '~95%', rateColor: '#15803d' },
                { country: '🇸🇪 Sweden',      status: 'Since 1984 (oldest in Europe)',     rate: '~87%', rateColor: '#15803d' },
                { country: '🇧🇪 Belgium',     status: 'No national DRS yet',              rate: 'No data', rateColor: '#dc2626' },
                { country: '🇫🇷 France',      status: 'No DRS for single-use containers', rate: 'No data', rateColor: '#dc2626' },
              ].map((row, i) => (
                <div key={row.country} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '10px 16px', background: i % 2 === 0 ? '#fff' : '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{row.country}</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>{row.status}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: row.rateColor }}>{row.rate}</div>
                </div>
              ))}
            </div>

            <Para>
              Belgium has long argued that its high recycling rates through the Fost Plus system
              make a DRS unnecessary. But the picture is more nuanced: PMD collection rates for
              plastic bottles are hard to verify, and litter from cans and bottles remains a
              visible problem. All three Belgian regions have agreed in principle to introduce a
              DRS, but have been divided on how: Flanders has proposed a <strong>digital
              app-based system</strong> (scanning barcodes with a phone to earn credits), while
              Wallonia and Brussels favour a traditional <strong>reverse vending machine</strong>
              approach like Germany and the Netherlands use.
            </Para>
            <Para>
              The debate may soon be resolved by EU law regardless. The new{' '}
              <strong>Packaging and Packaging Waste Regulation (PPWR)</strong> requires all
              member states to separately collect at least <strong>90% of single-use plastic
              bottles and metal cans by 2029</strong>. Belgium cannot reach this target without
              a functioning DRS — making it not a question of whether, but how and when.
            </Para>
            <NoteBox>
              ⚠️ Belgium already has a deposit on reusable glass beer bottles — you pay a few
              cents extra per bottle and get it back when you return the crate. This traditional
              system predates modern DRS legislation and remains popular for domestic beers. The
              debate is about extending the principle to single-use plastic and metal containers.
            </NoteBox>
          </SectionCard>

          {/* Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Fost Plus — sorting guide and EPR overview',                           url: 'https://www.fostplus.be/en' },
                { label: 'Recupel — WEEE collection in Belgium',                                 url: 'https://www.recupel.be/en' },
                { label: 'Bebat — battery collection scheme',                                    url: 'https://www.bebat.be/en' },
                { label: 'OVAM — Public Waste Agency of Flanders',                               url: 'https://www.ovam.be/english' },
                { label: 'Packaging & Packaging Waste Regulation (PPWR) — European Commission', url: 'https://environment.ec.europa.eu/topics/waste-and-recycling/packaging-waste_en' },
                { label: 'Deposit Return Schemes in Europe — TOMRA overview',                    url: 'https://www.tomra.com/reverse-vending/deposit-return-schemes-faq/which-countries-have-deposit-return-scheme' },
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
