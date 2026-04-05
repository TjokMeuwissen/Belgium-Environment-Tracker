'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const TOPIC_COLOR = '#3b82f6';

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'what-are-pfas',  label: 'What are PFAS?'             },
  { id: 'sources',        label: 'Where do they come from?'   },
  { id: 'belgium',        label: 'PFAS in Belgium'            },
  { id: 'health',         label: 'Health impacts'             },
  { id: 'environment',    label: 'Environmental persistence'  },
  { id: 'solutions',      label: 'What is being done'         },
  { id: 'reading',        label: 'Sources & further reading'  },
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
function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '14px 18px', marginBottom: 12, fontSize: '0.87rem', color: '#374151', lineHeight: 1.7 }}>
      {children}
    </div>
  );
}
function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 18px', marginBottom: 12, fontSize: '0.87rem', color: '#374151', lineHeight: 1.7 }}>
      {children}
    </div>
  );
}
function FullWidthImage({ src, alt, caption, sourceLabel, sourceUrl }: { src: string; alt: string; caption?: string; sourceLabel?: string; sourceUrl?: string }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <img src={src} alt={alt} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
      {(caption || sourceLabel) && (
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>
          {caption}{caption && sourceLabel ? ' — ' : ''}
          {sourceLabel && sourceUrl
            ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: TOPIC_COLOR }}>{sourceLabel}</a>
            : sourceLabel}
        </p>
      )}
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '4,700+',   label: 'distinct PFAS substances',   sub: 'The PFAS family contains over 4,700 synthetic chemicals — most have never been individually tested for safety', color: '#dc2626' },
    { value: 'Centuries',label: 'to millennia persistence',   sub: 'Many PFAS compounds are essentially permanent under natural environmental conditions — no known biological or chemical process reliably breaks the C-F bond', color: '#7f1d1d' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '18px 18px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.55rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginTop: 5, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3, lineHeight: 1.4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Source relevance cards ────────────────────────────────────────────────────
function SourceCards() {
  const sources = [
    { emoji: '&#x1F692;', label: 'Firefighting foam (AFFF)', level: 'Major point source', color: '#dc2626', bg: '#fef2f2',
      text: 'Aqueous film-forming foam (AFFF) containing PFOS and PFOA has been used at military airbases, civilian airports and industrial fire training sites since the 1960s. Training exercises routinely discharged large quantities directly onto the ground, creating deep groundwater plumes that spread across wide areas. This is the single most important source of localised PFAS contamination worldwide.' },
    { emoji: '&#x1F3ED;', label: 'Industrial manufacturing', level: 'Major point source', color: '#f97316', bg: '#fff7ed',
      text: 'PFAS manufacturers discharged process chemicals to waterways and air for decades before any regulatory framework existed. At several plants — including 3M in Zwijndrecht — internal company research had identified health risks years before public disclosure. This is now documented in court proceedings.' },
    { emoji: '&#x1F5D1;&#xFE0F;', label: 'Landfill leachate', level: 'Significant diffuse source', color: '#ca8a04', bg: '#fffbeb',
      text: 'PFAS from disposed consumer products — food packaging, coated textiles, non-stick cookware — leach out of landfills dissolved in rainwater percolating through waste. This leachate reaches groundwater and nearby watercourses continuously and is difficult to intercept.' },
    { emoji: '&#x1F6BD;', label: 'Wastewater treatment', level: 'Significant diffuse source', color: '#8b5cf6', bg: '#f5f3ff',
      text: 'Conventional sewage treatment does not remove PFAS. Treatment plants concentrate PFAS from household sources (non-stick pan residues, waterproof clothing washes, cosmetics) and discharge them to rivers. Sewage sludge (biosolids) applied to agricultural land then introduces PFAS directly to soil.' },
    { emoji: '&#x1F455;', label: 'Consumer product runoff', level: 'Widespread low-level source', color: '#6b7280', bg: '#f9fafb',
      text: 'Washing PFAS-treated clothing releases compounds into wastewater with every wash cycle. Stain-resistant carpets, PFAS-coated food packaging, cosmetics containing PFAS (waterproof mascara, foundation, sunscreen) and outdoor clothing treated with DWR (durable water repellent) all shed PFAS into the household waste stream continuously.' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {sources.map(s => (
        <div key={s.label} style={{ background: s.bg, borderLeft: `3px solid ${s.color}`, borderRadius: '0 10px 10px 0', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: s.emoji }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a' }}>{s.label}</span>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, background: '#fff', padding: '2px 8px', borderRadius: 4, flexShrink: 0, marginLeft: 10 }}>{s.level}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65, margin: 0 }}>{s.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PFASPage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F4A7;  Water &amp; Soil</p>
            <h1 className="detail-title">PFAS: The Forever Chemicals</h1>
            <p style={{ color: '#bfdbfe', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              Over 4,700 synthetic chemicals that never break down, accumulate in living organisms, and contaminate drinking water across Europe. Belgium is at the centre of one of the continent&apos;s worst hotspots.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/PFAS.jpg" alt="PFAS contamination" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — What are PFAS */}
          <SectionCard id="what-are-pfas">
            <SectionTitle>What are PFAS — and why are they called forever chemicals?</SectionTitle>
            <Para>
              PFAS stands for <strong>per- and polyfluoroalkyl substances</strong> — a large family of more than 4,700 synthetic chemicals that all share a common structural feature: a chain of carbon atoms bonded to fluorine atoms. The carbon-fluorine bond is the strongest bond in organic chemistry. It is so stable that no naturally occurring biological or environmental process can reliably break it under normal conditions. PFAS released into soil or water are effectively permanent on any timescale that matters for human life or ecosystems — hence the name &ldquo;forever chemicals.&rdquo;
            </Para>
            <Para>
              PFAS were developed from the 1940s onwards, primarily by 3M and DuPont, because their extraordinary chemical stability gave them uniquely useful properties:
            </Para>
            <BulletList items={[
              { bold: 'Non-stick surfaces', text: 'PTFE (Teflon) — the best-known PFAS compound — is the coating on non-stick cookware. Nothing adheres to a surface covered in carbon-fluorine bonds, which is why food slides off cleanly' },
              { bold: 'Water and grease repellence', text: 'PFAS are used in waterproof clothing (Gore-Tex, outdoor gear), food packaging (microwave popcorn bags, pizza boxes, fast food wrappers), carpets and upholstery — anywhere a surface needs to shed liquids or grease' },
              { bold: 'Firefighting foam', text: 'aqueous film-forming foam (AFFF) containing PFAS is extraordinarily effective at suppressing fuel and chemical fires. It spreads instantly across burning liquids, cutting off oxygen. This foam has been used at military airfields, airports and industrial sites for decades and is the single largest source of localised PFAS contamination worldwide' },
              { bold: 'Industrial processes', text: 'PFAS are used in semiconductor manufacturing, photolithography, electroplating, and as surfactants and processing aids in dozens of industrial processes requiring extreme chemical stability' },
            ]} />
            <Para style={{ marginBottom: 0 }}>
              The same chemical stability that makes PFAS so useful in products makes them a permanent contaminant once released. A PFAS molecule released into a river decades ago is still there today — or in the groundwater below, or in the tissue of an organism that absorbed it. Many PFAS compounds also bioaccumulate: concentrations increase at each step up the food chain, so top predators — including humans — receive the most concentrated doses.
            </Para>
          </SectionCard>

          {/* 2 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Where do PFAS come from?</SectionTitle>
            <Para>
              PFAS contamination reaches the environment through several distinct pathways, each with different spatial scales — from localised hotspots around industrial sites to diffuse, widespread contamination from consumer products. The relative importance of each source varies significantly by location and the specific PFAS compound in question.
            </Para>
            <SourceCards />
            <NoteBox>
              <strong>Replacement compounds — the &ldquo;regrettable substitution&rdquo; problem:</strong> when long-chain PFAS like PFOS and PFOA were restricted from the early 2000s, industry substituted shorter-chain PFAS (such as GenX compounds, PFBS, PFBA) marketed as safer alternatives. Later research found these short-chain compounds also persist in the environment and raise health concerns — they are simply less well studied, not less hazardous. This pattern of replacing one problematic PFAS with another has been called &ldquo;regrettable substitution&rdquo; by regulators and researchers, and is one reason why the EU&apos;s current approach targets the entire PFAS class rather than individual compounds.
            </NoteBox>
          </SectionCard>

          {/* 3 — Belgium */}
          <SectionCard id="belgium">
            <SectionTitle>PFAS in Belgium — the 3M Zwijndrecht case</SectionTitle>
            <Para>
              Belgium is home to one of the most significant documented PFAS contamination episodes in Europe. The 3M manufacturing plant in Zwijndrecht, near Antwerp, produced PFAS compounds including PFOS and PFOA from the 1970s. Emissions from the plant contaminated soil, groundwater and surface water across a wide area of the Antwerp region — including agricultural land, residential gardens and nature reserves — for decades before comprehensive monitoring was carried out.
            </Para>

            <WarningBox>
              <strong>&#x1F4CB; Timeline of the Zwijndrecht crisis</strong>
              <ul style={{ margin: '10px 0 0', paddingLeft: 20, lineHeight: 1.9, fontSize: '0.85rem' }}>
                <li><strong>1970s&ndash;2000s:</strong> 3M&apos;s Zwijndrecht plant manufactures PFAS compounds. Emissions to air, soil and water go largely unregulated. Internal 3M research documenting health concerns is not disclosed to regulators.</li>
                <li><strong>2002:</strong> 3M voluntarily phases out PFOS and PFOA production globally, partly in response to US EPA pressure — years before mandatory restrictions.</li>
                <li><strong>May 2021:</strong> The Flemish Environment Agency (VMM) publishes results of comprehensive soil and water testing around the plant. PFAS concentrations in a wide radius around Zwijndrecht far exceed health-based guidance values. The contamination plume extends into agricultural land, residential areas and the Scheldt floodplain.</li>
                <li><strong>June 2021:</strong> The Flemish government issues advice against consuming vegetables grown in home gardens within several kilometres of the plant. Blood sampling of local residents confirms elevated PFAS levels compared to reference populations.</li>
                <li><strong>2021&ndash;2023:</strong> Political and judicial crisis. A Flemish parliamentary inquiry investigates whether the government knew about contamination earlier than officially acknowledged. The affair triggers a broader national conversation about industrial pollution governance.</li>
                <li><strong>2023:</strong> 3M agrees to a &euro;571 million remediation and compensation fund for Flanders — one of the largest environmental settlements in Belgian history. Separately, 3M agreed in the same year to a $10.3 billion global settlement in the USA for contamination of public drinking water supplies.</li>
                <li><strong>Ongoing:</strong> Groundwater remediation at Zwijndrecht will require decades of active treatment. PFAS contamination extends into the Scheldt river system. Full remediation of the wider affected soil area is technically daunting and will take a generation.</li>
              </ul>
            </WarningBox>

            <FullWidthImage
              src="/images/learn/3M-PFAS.jpg"
              alt="3M manufacturing plant in Zwijndrecht near Antwerp, source of major PFAS contamination"
              caption="The 3M plant in Zwijndrecht near Antwerp — one of Europe&apos;s most significant PFAS contamination sites."
            />

            <Para>
              Zwijndrecht is Belgium&apos;s most prominent PFAS case but not the only one. Military airbases at Kleine-Brogel, Florennes and Beauvechain have been identified as significant PFAS sources from decades of AFFF use during fire training exercises. Several Belgian drinking water utilities — including operators drawing from the Scheldt catchment — have had to install additional treatment to meet the new EU drinking water PFAS limits introduced in 2023. PFAS have also been found at elevated levels in the blood of Belgian firefighters, who face occupational exposure through AFFF and through PFAS in protective gear and foam from burning buildings.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              What makes Zwijndrecht particularly important as a case study is that it demonstrated the full arc of the PFAS crisis in concentrated form: industrial production of chemicals whose hazards were known to the manufacturer but not disclosed, decades of contamination below the radar of regulatory monitoring, a public health crisis revealed through environmental testing rather than corporate disclosure, and a decade-long battle over accountability and remediation costs. The same pattern has played out in the Netherlands (Chemours Dordrecht), Germany, Sweden, the UK and the United States.
            </Para>
          </SectionCard>

          {/* 4 — Health */}
          <SectionCard id="health">
            <SectionTitle>Health impacts — what the science shows</SectionTitle>
            <Para>
              PFAS health research has accelerated dramatically since 2015. The picture that has emerged is of a class of compounds with wide-ranging biological effects at surprisingly low doses — doses that a significant fraction of the European population already exceeds through ordinary exposure routes.
            </Para>
            <Para>
              In 2020, the European Food Safety Authority (EFSA) set a <strong>tolerable weekly intake (TWI) of 4.4 nanograms per kilogram of body weight per week</strong> for four priority PFAS combined (PFOS, PFOA, PFNA and PFHxS). This is one of the most restrictive contaminant limits EFSA has ever set. The primary health endpoint used to derive this limit was <strong>immune suppression in children</strong> — specifically, reduced antibody response to childhood vaccines. EFSA estimated that a large proportion of European consumers, and the majority of children, already exceeded this TWI through food and drinking water combined.
            </Para>
            <Para>
              European biomonitoring data — including the large-scale HBM4EU programme that tested thousands of people across EU member states — consistently found PFAS in virtually all participants. Importantly, blood levels of the most regulated compounds (PFOS, PFOA) have been declining since the early 2000s as these substances were phased out. However, total PFAS burden is not declining, because shorter-chain replacement compounds are taking their place in products — and in human blood. These newer compounds are not always captured by standard testing panels, making the true extent of human PFAS burden difficult to quantify.
            </Para>

            <FullWidthImage
              src="/images/learn/PFAS-health.png"
              alt="EEA infographic showing effects of PFAS on human health for men and women, distinguishing higher and lower certainty effects"
              sourceLabel="EEA — Effects of PFAS on human health (2020)"
              sourceUrl="https://www.eea.europa.eu/en/analysis/maps-and-charts/effects-of-pfas-on-human-health"
            />

            <Para>
              The EEA infographic above illustrates the range of documented and suspected health effects, distinguished by level of scientific certainty. The pattern that emerges from the evidence:
            </Para>

            <Para><strong>Higher certainty effects (both sexes)</strong></Para>
            <BulletList items={[
              { bold: 'Immune suppression', text: 'the best-established effect, particularly in children. PFAS interfere with antibody production and immune cell function. Children exposed in utero or through breast milk show measurably reduced responses to standard childhood vaccines' },
              { bold: 'Elevated cholesterol', text: 'multiple large epidemiological studies consistently find higher total and LDL cholesterol in people with higher PFAS blood levels. The mechanism involves PFAS interference with liver-mediated lipid metabolism' },
              { bold: 'Thyroid disruption', text: 'PFAS compete with thyroid hormones for binding sites on transport proteins, altering thyroid hormone levels and signalling. Thyroid hormones regulate metabolism, development and numerous organ systems' },
              { bold: 'Kidney cancer', text: 'established association in occupationally exposed populations and communities near contamination sites. PFAS accumulate in kidney tissue and interfere with cellular function' },
            ]} />

            <Para><strong>Higher certainty, sex-specific effects</strong></Para>
            <BulletList items={[
              { bold: 'Testicular cancer (men)', text: 'one of the strongest cancer associations in PFAS epidemiology, supported by multiple studies across different exposed populations. The testes are particularly sensitive to endocrine-disrupting compounds' },
              { bold: 'Pregnancy complications (women)', text: 'PFAS exposure during pregnancy is associated with pre-eclampsia, gestational hypertension and reduced birth weight. PFAS cross the placenta and have been measured in cord blood and amniotic fluid' },
            ]} />

            <Para><strong>Lower certainty effects (emerging evidence)</strong></Para>
            <BulletList items={[
              { bold: 'Breast cancer (women)', text: 'associations found in several studies but results are inconsistent across populations and compound types' },
              { bold: 'Prostate cancer (men)', text: 'suggested by some occupational studies; evidence not yet sufficient for firm classification' },
              { bold: 'Reduced fertility', text: 'both male sperm quality and female time-to-pregnancy have been associated with PFAS levels in some studies' },
              { bold: 'Neurodevelopmental effects in children', text: 'associations with reduced IQ, attention deficits and behavioural problems in children exposed prenatally; mechanistic plausibility established but epidemiological evidence still accumulating' },
              { bold: 'Liver damage', text: 'elevated liver enzymes and non-alcoholic fatty liver disease have been associated with PFAS in some populations' },
            ]} />

            <NoteBox>
              <strong>Scientific consensus note:</strong> the strength of evidence for PFAS health effects is unusually robust compared to most environmental contaminants — large studies across multiple countries find consistent associations. What remains uncertain is the precise dose-response relationship for newer short-chain PFAS, and which effects are caused by which specific compounds. What is not in scientific dispute is that legacy PFAS (PFOS, PFOA) cause harm at realistic exposure levels, and that the PFAS family as a class warrants precautionary regulation.
            </NoteBox>
          </SectionCard>

          {/* 5 — Environmental persistence */}
          <SectionCard id="environment">
            <SectionTitle>Environmental persistence — why PFAS cannot simply be cleaned up</SectionTitle>
            <Para>
              The environmental challenge of PFAS goes beyond their toxicology. Because they do not degrade, PFAS contamination is effectively permanent on human timescales without active intervention. This creates a fundamentally different management challenge from most other pollutants, which eventually break down.
            </Para>
            <BulletList items={[
              { bold: 'Groundwater contamination is almost irreversible', text: 'once PFAS enter an aquifer, removing them requires either pumping and treating groundwater continuously for decades (pump-and-treat), or using emerging technologies like ion exchange resins or advanced oxidation that are expensive and not yet proven at scale for deep aquifers. The Zwijndrecht groundwater plume will require treatment for decades at minimum' },
              { bold: 'Soil contamination spreads slowly but continuously', text: 'PFAS in contaminated soil leach slowly into groundwater and are taken up by plant roots, continuing to move the contamination long after the original source is eliminated. Excavating and disposing of contaminated soil is feasible in small areas but not across wide contaminated zones' },
              { bold: 'Bioaccumulation concentrates PFAS in food chains', text: 'fish in contaminated rivers and lakes accumulate PFAS in tissue at concentrations far above surrounding water. Predatory fish, birds and mammals at the top of aquatic food chains — including humans who eat contaminated fish — receive the most concentrated doses. This is why fishing bans have been imposed in waterways near Belgian contamination sites' },
              { bold: 'No natural degradation pathway exists', text: 'unlike most organic pollutants, which are eventually mineralised by microorganisms, UV light or chemical reactions, PFAS have no known natural breakdown route under environmental conditions. Emerging destruction technologies — electrochemical oxidation, supercritical water oxidation, and sonochemical methods — can break the C-F bond under extreme laboratory conditions, but none is yet operational at the scale needed for environmental remediation' },
            ]} />
            <Para style={{ marginBottom: 0 }}>
              The implication is stark: every tonne of PFAS released into the environment is, for practical purposes, permanently there. This asymmetry — easy to release, essentially impossible to retrieve — is why prevention (stopping PFAS from entering the environment) is so much more valuable than remediation, and why the EU&apos;s move towards a class-wide restriction is scientifically justified even for compounds not yet individually shown to be hazardous.
            </Para>
          </SectionCard>

          {/* 6 — Solutions */}
          <SectionCard id="solutions">
            <SectionTitle>What is being done</SectionTitle>
            <Para>
              Regulatory responses to PFAS have accelerated significantly since 2020, driven by the combination of rapidly expanding health evidence, high-profile contamination scandals and pressure from environmental organisations and affected communities.
            </Para>

            <InfoCard emoji="&#x1F1EA;&#x1F1FA;" title="EU REACH PFAS restriction — regulating the whole class" color="#dc2626" bg="#fef2f2">
              <p style={{ margin: '0 0 10px' }}>
                In 2023, five EU member state authorities (Germany, Netherlands, Sweden, Denmark and Norway) submitted to the European Chemicals Agency (ECHA) the broadest chemical restriction proposal in EU history: a near-total ban on all PFAS in all uses, with time-limited derogations for applications where no alternatives currently exist. This &ldquo;universal restriction&rdquo; approach treats PFAS as a class — precisely because the history of compound-by-compound restriction has repeatedly allowed manufacturers to substitute one problematic PFAS for another.
              </p>
              <p style={{ margin: 0 }}>
                The restriction is being assessed by ECHA&apos;s scientific committees and is expected to result in a regulation phasing out PFAS across most consumer and industrial uses over a multi-year timeline. Significant industrial opposition has been mounted, particularly from the semiconductor, medical device and defence sectors, which argue that no current alternatives exist for some critical PFAS applications.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F6B0;" title="EU Drinking Water Directive — PFAS limits from 2023" color={TOPIC_COLOR} bg="#eff6ff">
              <p style={{ margin: 0 }}>
                The revised EU Drinking Water Directive (2020/2184), which entered into force progressively from 2023, introduced mandatory PFAS monitoring of drinking water across all member states for the first time. It sets a limit of <strong>0.1 \u03bcg/L for individual PFAS</strong> and <strong>0.5 \u03bcg/L for the sum of all PFAS</strong> in drinking water. Water utilities finding exceedances must investigate the source, inform consumers and remediate. Belgian water companies drawing from the Scheldt catchment and other PFAS-affected sources have had to install activated carbon or ion exchange treatment systems to meet these limits.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F1E7;&#x1F1EA;" title="Belgium — remediation, monitoring and military sites" color="#15803d" bg="#f0fdf4">
              <p style={{ margin: '0 0 10px' }}>
                Following the Zwijndrecht crisis, Flanders significantly expanded PFAS environmental monitoring, including a comprehensive programme covering soil, groundwater, surface water and biota around identified hotspots. The VMM (Vlaamse Milieumaatschappij) now operates one of the most extensive PFAS monitoring networks in Europe.
              </p>
              <p style={{ margin: 0 }}>
                PFAS contamination at Belgian military airbases is under investigation, with surveys confirming elevated concentrations in groundwater around multiple sites. Remediation plans are under development but the process is complex: military land is subject to different legal frameworks, and the scale of contamination at some sites (decades of AFFF use) is large. Belgium has also tightened regulations on PFAS in biosolids applied to agricultural land, and introduced guidance on acceptable PFAS levels in soil used for food production.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F9D1;" title="What individuals can do" color="#374151" bg="#f9fafb">
              <p style={{ margin: '0 0 8px' }}>Individual exposure to PFAS can be meaningfully reduced through a few practical choices:</p>
              <BulletList items={[
                { bold: 'Replace non-stick cookware', text: 'avoid PTFE-coated (Teflon) pans, especially damaged ones. Use stainless steel, cast iron or ceramic cookware instead' },
                { bold: 'Avoid PFAS-treated food packaging', text: 'microwave popcorn bags, fast food wrappers and some pizza boxes are treated with PFAS. Reduce fast food and use microwave-safe ceramic or glass containers' },
                { bold: 'Check outdoor clothing', text: 'DWR (durable water repellent) treatments on waterproof clothing typically contain PFAS. PFAS-free DWR alternatives exist — look for brands that have committed to PFAS-free waterproofing' },
                { bold: 'Filter your drinking water', text: 'activated carbon filters (pitcher filters, under-sink systems) and reverse osmosis systems remove most PFAS from tap water. Standard ceramic or sand filters do not' },
                { bold: 'Avoid PFAS in cosmetics', text: 'PFAS are used in waterproof mascara, foundation, sunscreen and lipstick for long-lasting wear. Check ingredient lists for any compound containing \"fluoro\" or \"perfluoro\"' },
              ]} />
            </InfoCard>
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="reading">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'EFSA (2020) — Risk to human health related to the presence of PFAS in food', url: 'https://www.efsa.europa.eu/en/efsajournal/pub/6223' },
                { label: 'EEA — Effects of PFAS on human health (infographic)', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/effects-of-pfas-on-human-health' },
                { label: 'ECHA — Universal PFAS restriction proposal (2023)', url: 'https://echa.europa.eu/registry-of-restriction-intentions/-/dislist/details/0b0236e18663449b' },
                { label: 'VMM — PFAS monitoring in Flanders: Zwijndrecht and beyond', url: 'https://www.vmm.be/water/waterkwaliteit/pfas' },
                { label: 'EU Drinking Water Directive 2020/2184 — PFAS provisions', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32020L2184' },
                { label: 'HBM4EU — Human biomonitoring for PFAS in Europe', url: 'https://www.hbm4eu.eu/hbm4eu-substances/pfas/' },
                { label: 'IARC — PFOA classified as carcinogenic to humans (Group 1, 2023)', url: 'https://www.iarc.who.int/news-events/iarc-classifies-pfoa-as-carcinogenic-to-humans/' },
                { label: 'Forever Pollution Project — European PFAS contamination map', url: 'https://foreverpollution.eu' },
                { label: 'ChemSec — PFAS in consumer products database', url: 'https://chemsec.org/business-tool/sin-list/pfas/' },
                { label: 'NRDC — PFAS explainer and policy tracker', url: 'https://www.nrdc.org/stories/pfas-chemicals-are-everywhere-what-can-you-do' },
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
