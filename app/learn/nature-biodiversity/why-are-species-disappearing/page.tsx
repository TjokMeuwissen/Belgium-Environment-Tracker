// → app/learn/nature-biodiversity/why-are-species-disappearing/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, LineChart, Line, Area, AreaChart,
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

// ── Habitat Loss Chart ────────────────────────────────────────────────────────

const HABITAT_DATA = [
  { name: 'Heathlands',            loss: 95, source: 'INBO' },
  { name: 'Hay meadows',           loss: 90, source: 'INBO / SPW' },
  { name: 'Active raised bogs',    loss: 87, source: 'Peatlands of Wallony' },
  { name: 'Scheldt salt marshes',  loss: 25, source: 'EEA / Scheldt case study' },
];

function HabitatBar(props: any) {
  const { x, y, width, height, loss } = props;
  const color = loss >= 85 ? '#dc2626' : loss >= 60 ? '#f97316' : '#ca8a04';
  return <rect x={x} y={y} width={width} height={height} fill={color} rx={3} />;
}

function HabitatTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: '#fca5a5' }}>−{d.loss}% since 1900</div>
      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>Source: {d.source}</div>
    </div>
  );
}

function HabitatLossChart() {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '24px 20px 16px', margin: '20px 0' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
        Estimated habitat loss in Belgium since 1900
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
        % of habitat lost · Sources: INBO, SPW, Peatlands of Wallony, EEA
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={HABITAT_DATA} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `−${v}%`}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 13, fill: '#374151' }}
              interval={0}
            />
            <Tooltip content={(props: any) => <HabitatTooltip {...props} />} />
            <Bar dataKey="loss" shape={(props: any) => <HabitatBar {...props} />} label={{ position: 'right', formatter: (v: number) => `−${v}%`, fontSize: 12, fontWeight: 700, fill: '#374151' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Insect Decline Chart ──────────────────────────────────────────────────────

const INSECT_DATA = [
  { year: 1989, index: 100 },
  { year: 1991, index: 97 },
  { year: 1993, index: 93 },
  { year: 1996, index: 86 },
  { year: 1999, index: 78 },
  { year: 2002, index: 68 },
  { year: 2005, index: 60 },
  { year: 2008, index: 52 },
  { year: 2011, index: 42 },
  { year: 2014, index: 33 },
  { year: 2016, index: 27 },
];

function InsectTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#fdba74' }}>Index: {payload[0].value}</div>
      <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
        −{100 - payload[0].value}% vs 1989 baseline
      </div>
    </div>
  );
}

function InsectDeclineChart() {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '24px 20px 16px', margin: '20px 0' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>
        Flying insect biomass decline in Western Europe
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
        Biomass index (1989 = 100) · Protected areas, Germany · Hallmann et al., <em>PLOS ONE</em>, 2017
      </div>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={INSECT_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="insectGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis domain={[0, 110]} tick={{ fontSize: 11, fill: '#374151' }} tickFormatter={(v) => `${v}`} label={{ value: 'Index (1989 = 100)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#4b5563' }} />
            <Tooltip content={(props: any) => <InsectTooltip {...props} />} />
            <ReferenceLine y={25} stroke="#dc2626" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: '−75% threshold', position: 'insideBottomLeft', fontSize: 11, fill: '#dc2626' }} />
            <Area type="monotone" dataKey="index" stroke="#f97316" strokeWidth={2.5} fill="url(#insectGradient)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'intro',            label: 'Introduction'       },
  { id: 'habitat-loss',     label: '1. Habitat Loss'    },
  { id: 'invasive',         label: '2. Invasive Species'},
  { id: 'pollution',        label: '3. Pollution'       },
  { id: 'overexploitation', label: '4. Overexploitation'},
  { id: 'climate',          label: '5. Climate Change'  },
  { id: 'sources',          label: 'Sources'            },
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

export default function WhyAreSpeciesDisappearingPage() {
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
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <div className="header-eyebrow" style={{ color: '#86efac', marginTop: 16 }}>&#x1F33F;&nbsp; Nature &amp; Biodiversity</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 12px', lineHeight: 1.2 }}>
              Why Are Species Disappearing?
            </h1>
            <p style={{ fontSize: 16, color: '#bbf7d0', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
              The five forces driving biodiversity loss &mdash; and what they mean for Belgium.
            </p>
          </div>
          <img
            src="/images/learn/biodiversity-loss.jpg"
            alt="Biodiversity loss"
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
          />
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
              Species have always come and gone. Over the 3.8 billion years of life on Earth,
              five mass extinction events have reshaped the biosphere — the last one, 66 million
              years ago, wiped out the non-avian dinosaurs. Between those events, background
              extinction rates settled at roughly one to five species per year per million species.
            </Para>
            <Para>
              Today that rate is estimated to be <strong>100 to 1,000 times higher</strong> — and
              accelerating. Unlike the five previous mass extinctions, this one has a single
              identifiable cause: us. Scientists now refer to the current period as the{' '}
              <strong>sixth mass extinction</strong>, or the <strong>Anthropocene extinction</strong>{' '}
              — the first in Earth&#39;s history driven by a single species.
            </Para>
            <NoteBox>
              ⚠️ The IPBES Global Assessment (2019) concluded that around one million species are
              currently threatened with extinction. That is roughly one in eight of all known
              species on Earth.
            </NoteBox>
          </SectionCard>

          {/* Habitat Loss */}
          <SectionCard id="habitat-loss">
            <SectionTitle>1. Habitat Loss &amp; Fragmentation</SectionTitle>
            <Para>
              Habitat loss is by far the dominant driver of biodiversity loss globally — and in
              Belgium in particular. When natural land is converted to farmland, cities, roads,
              or infrastructure, species lose the space and resources they need to survive.
              But the damage goes beyond simple area loss. <strong>Fragmentation</strong> — the
              breaking up of continuous habitat into isolated patches — is often as destructive
              as the loss itself. A forest patch surrounded by motorways cannot sustain the same
              communities as a connected landscape. Populations become too small to be genetically
              viable. Species that need large territories — wolves, golden eagles, large beetles
              — simply cannot persist.
            </Para>
            <Para>
              In Belgium, the consequences are stark. Flanders is one of the most densely built
              and fragmented landscapes in Europe. Less than 15% of Flemish territory is
              considered semi-natural or natural habitat, and most of it exists in small,
              disconnected fragments. Wallonia is in better shape, but agricultural
              intensification — the shift from mixed farming to large-scale monocultures — has
              driven dramatic losses in grassland and hedgerow habitats since the 1950s.
            </Para>

            <div style={{ margin: '28px 0' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
                What the de Ferraris maps tell us
              </div>
              <Para>
                The <em>Kabinetskaart der Oostenrijkse Nederlanden</em>, drawn between 1771 and
                1778 under Count Joseph de Ferraris, is the first systematic large-scale map of
                what is now Belgium — and the standard historical baseline for land use research.
                In 2024, INBO, VITO, Agentschap Landbouw en Zeevisserij, and Digitaal Vlaanderen
                used AI to read the map legends and digitise land use across four time periods
                (1778, 1873, 1969, and today), making it possible for the first time to precisely
                calculate how much heathland, forest, cropland, and grassland existed at each
                moment.
              </Para>

              <div style={{ margin: '20px 0', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <Image
                  src="/images/learn/veranderingen_landschap_ai.jpg"
                  alt="Land use in Flanders and Brussels across 250 years: 1778, 1873, 1969 and present"
                  width={860}
                  height={400}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ background: '#f9fafb', padding: '10px 14px', fontSize: 12, color: '#6b7280', borderTop: '1px solid #e5e7eb' }}>
                  Land use in Flanders and Brussels across 250 years: 1778, 1873, 1969, and present.
                  Source: INBO / VITO / Agentschap Landbouw en Zeevisserij / Digitaal Vlaanderen, 2024.
                </div>
              </div>

              <Para>
                The maps reveal a paradox in the forest story and a stark truth about everything
                else. Total forest area in Flanders has barely changed: around 155,000 ha were
                mapped as forest in 1778; roughly 150,000 ha remain today. But this apparent
                stability conceals a near-total replacement. Forests in western and southern
                Flanders were cleared for farmland; new plantations — mostly non-native conifers
                grown for pit props and industrial timber — were established on heathland in the
                Kempen. The location shifted, and the ecological character changed entirely.
              </Para>
              <Para>
                Only about <strong>15% of today&#39;s Flemish forest</strong> has been
                continuously forested since 1778. This ancient woodland —{' '}
                <em>Ferrarisbos</em> — harbours species that simply cannot colonise younger
                forests: wood anemone, wild garlic, bluebell, stag beetle, fire salamander,
                and black woodpecker. Once cleared, those communities are gone permanently —
                no amount of replanting can restore them on any human timescale.
              </Para>
              <Para>
                For heathland and wet meadow the comparison is bleaker and more straightforward.
                The open heaths that covered large parts of the Campine and coastal hinterland
                in 1778 have almost entirely vanished. The rich mosaic of wet meadows, marshy
                depressions, and small ponds that characterised lowland Flanders is largely gone.
              </Para>
            </div>

            <NoteBox>
              ⚠️ The digitised de Ferraris maps are now used by INBO and regional planning
              authorities as a direct reference for identifying which land parcels carry the
              highest conservation value — and which losses are irreversible.
            </NoteBox>

            <Para style={{ fontWeight: 600, margin: '20px 0 8px' }}>
              Key habitat losses in Belgium since 1900
            </Para>

            <HabitatLossChart />

            <BulletList items={[
              { bold: 'Heathlands', text: 'Over 95% gone in Flanders — replaced by agriculture, forestry plantations, and urban development. (INBO)' },
              { bold: 'Hay meadows', text: 'Traditional species-rich grasslands have declined by over 90% across Belgium, replaced by intensive silage production. (INBO / SPW)' },
              { bold: 'Active raised bogs', text: 'The Hautes Fagnes and surrounding uplands have lost roughly 87% of active raised bog habitat — only 125 ha of intact bog remains from a historical extent of around 1,000 ha. (Peatlands of Wallony)' },
              { bold: 'Scheldt estuary salt marshes', text: 'Salt marsh area in the Belgian Scheldt has decreased by around 25% since 1900, from ~700 to ~550 hectares, driven by land reclamation, dike construction, and channel deepening for the Port of Antwerp. (EEA Scheldt Estuary Case Study)' },
            ]} />
          </SectionCard>

          {/* Invasive Species */}
          <SectionCard id="invasive">
            <SectionTitle>2. Invasive Species</SectionTitle>
            <Para>
              When species are moved beyond their natural range — deliberately or accidentally
              — they can devastate the ecosystems they enter. Native species have not evolved
              alongside these newcomers and lack defences against their predation, competition,
              or disease.
            </Para>
            <Para>
              Belgium has over <strong>120 established invasive alien species</strong> of
              ecological concern, according to INBO and the EU Invasive Species Regulation
              (Regulation 1143/2014). Some of the most damaging:
            </Para>
            <BulletList items={[
              { bold: 'American mink (Neovison vison)', text: 'Escaped from fur farms, now widespread across Belgium. Predates directly on water voles, moorhens, and ground-nesting birds — species already under pressure from habitat loss.' },
              { bold: 'Signal crayfish (Pacifastacus leniusculus)', text: 'Outcompetes the native white-clawed crayfish (Austropotamobius pallipes), now Critically Endangered in Belgium. Also carries a fungal plague lethal to native crayfish species.' },
              { bold: 'Japanese knotweed (Reynoutria japonica)', text: 'Forms dense monocultures that crowd out native riverside vegetation. Extremely difficult and expensive to eradicate once established.' },
              { bold: 'Giant hogweed (Heracleum mantegazzianum)', text: 'Outcompetes native plants in riparian habitats and poses a direct health risk through its photosensitising sap.' },
              { bold: 'Himalayan balsam (Impatiens glandulifera)', text: 'Spreads rapidly along waterways, smothering native plants and destabilising riverbanks through its shallow root system.' },
            ]} />
            <NoteBox>
              🌿 Invasive species are the second leading cause of biodiversity loss globally after
              habitat destruction — and their impact is accelerating as trade and travel increase
              the rate of accidental introductions.
            </NoteBox>
          </SectionCard>

          {/* Pollution */}
          <SectionCard id="pollution">
            <SectionTitle>3. Pollution</SectionTitle>
            <Para>
              Pollution acts as a slow, pervasive pressure on biodiversity — degrading habitats
              and harming species even when no visible destruction is taking place.
            </Para>
            <Para>
              <strong>Nitrogen deposition</strong> is the most significant form of pollution
              for Belgian biodiversity. Belgium has some of the highest atmospheric nitrogen
              deposition rates in Europe, driven by intensive livestock farming (ammonia
              emissions) and road transport (nitrogen oxides). Nitrogen fertilises soils,
              favouring fast-growing grasses and nettles at the expense of the slow-growing,
              specialised plants that depend on nutrient-poor conditions. Heathlands, chalk
              grasslands, and bogs — habitats defined by their low nutrient levels — are
              particularly vulnerable. In Flanders, critical nitrogen loads are exceeded across
              the vast majority of sensitive nature areas.
            </Para>
            <Para>
              <strong>Pesticides</strong> — particularly insecticides and herbicides — have
              contributed to dramatic declines in invertebrate populations. The loss of insects
              has cascading effects up the food chain: fewer insects means fewer insectivorous
              birds, bats, and amphibians. A widely cited 2017 study in Germany found a 75%
              decline in flying insect biomass over 27 years in protected areas — a pattern
              increasingly replicated across Western Europe.
            </Para>

            <InsectDeclineChart />

            <Para>
              <strong>Light pollution</strong> disrupts the behaviour of nocturnal species —
              moths, bats, and migrating birds are all affected. Belgium ranks among the most
              light-polluted countries in Europe.
            </Para>
            <Para>
              <strong>Water pollution</strong> — from agricultural runoff, urban wastewater,
              and industrial discharge — degrades aquatic habitats. Many Belgian rivers and
              streams still fail to meet good ecological status under the EU Water Framework
              Directive.
            </Para>
          </SectionCard>

          {/* Overexploitation */}
          <SectionCard id="overexploitation">
            <SectionTitle>4. Overexploitation</SectionTitle>
            <Para>
              Overexploitation — harvesting wild species faster than they can reproduce — was
              the primary driver of biodiversity loss for most of human history, and remains
              critical today for certain groups. In the Belgian context, the most relevant
              pressures are:
            </Para>
            <BulletList items={[
              { bold: 'Fishing in the North Sea', text: 'The Belgian fishing fleet operates in one of the most intensively fished seas in the world. Bottom trawling — still the dominant method — disturbs seabed habitats and generates significant bycatch of non-target species including seabirds, dolphins, and juvenile fish.' },
              { bold: 'Hunting and illegal persecution', text: 'Legal hunting is regulated in Belgium, but illegal persecution of protected species — particularly raptors — remains documented. Poisoning of birds of prey, nest disturbance of eagles and ospreys, and illegal trapping of songbirds are periodically recorded.' },
              { bold: 'Wild plant collection', text: 'Collection of wild bulbs, orchids, and mosses, though illegal, continues to put pressure on rare plant populations, particularly in the Ardennes and chalk grasslands.' },
            ]} />
          </SectionCard>

          {/* Climate Change */}
          <SectionCard id="climate">
            <SectionTitle>5. Climate Change</SectionTitle>
            <Para>
              Climate change is the youngest of the five main drivers but is rapidly becoming
              the most powerful — and uniquely dangerous because it interacts with and amplifies
              all the others. Species can often adapt to individual pressures if given enough
              space, time, and connectivity. Climate change removes all three simultaneously.
            </Para>
            <Para style={{ fontWeight: 600, marginBottom: 8 }}>
              Observed impacts in Belgium and Western Europe:
            </Para>
            <BulletList items={[
              { bold: 'Phenological mismatches', text: 'Spring is arriving earlier. Insects emerge sooner; caterpillars peak sooner. But birds that migrate from Africa follow day-length cues, not temperature — arriving to find the food window for raising chicks has already passed. The pied flycatcher (Ficedula hypoleuca) has not adapted, and its populations are declining as a result.' },
              { bold: 'Range shifts', text: 'Species are moving northward and upward in altitude. Warmth-loving species arrive in Belgium that were previously absent; cold-adapted species retreat. The Hautes Fagnes is losing its specialist bog and moorland species as conditions warm and dry.' },
              { bold: 'Extreme weather', text: 'Droughts stress trees and make them more vulnerable to pest outbreaks. Flooding events disturb ground-nesting birds and wash away invertebrate communities. Both are increasing in frequency and intensity.' },
              { bold: 'Ocean warming', text: 'The North Sea is warming faster than the global ocean average. Cold-water fish species are shifting northward; jellyfish blooms are becoming more frequent; and acidification is beginning to affect shell-forming invertebrates at the base of the food web.' },
            ]} />
            <NoteBox>
              ⚠️ Climate change does not operate in isolation. A species already weakened by
              habitat loss, nitrogen stress, and invasive competitors has far less resilience to
              absorb the additional shock of a changing climate. The drivers combine — and their
              combined effect is greater than the sum of their parts.
            </NoteBox>
          </SectionCard>

          {/* Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {[
                { label: 'IPBES (2019) \u2014 Global Assessment Report on Biodiversity and Ecosystem Services (~1 million species threatened)', url: 'https://ipbes.net/global-assessment' },
                { label: 'INBO, VITO, Agentschap Landbouw en Zeevisserij & Digitaal Vlaanderen (2024) \u2014 AI digitisation of de Ferraris maps: 250 years of land-use change in Flanders', url: 'https://www.inbo.be' },
                { label: 'INBO \u2014 Habitat loss data: heathlands (>95%), hay meadows (>90%), Flemish nature indicators', url: 'https://www.vlaanderen.be/inbo/backgroundindicatoren' },
                { label: 'SPW D\u00e9partement de la Nature et des For\u00eats \u2014 Grassland loss in Wallonia', url: 'https://etat.environnement.wallonie.be' },
                { label: 'Peatlands of Wallony \u2014 Active raised bog loss (~87%), Hautes Fagnes', url: 'https://www.peatlandswallony.be' },
                { label: 'EEA \u2014 Scheldt Estuary Case Study: salt marsh change since 1900', url: 'https://www.eea.europa.eu/themes/water/europes-seas-and-coasts/assessments/scheldt' },
                { label: 'EU Regulation 1143/2014 \u2014 Prevention and management of invasive alien species (basis for Belgium\u2019s IAS list)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R1143' },
                { label: 'Hallmann CA et al. (2017) \u2014 More than 75 percent decline over 27 years in total flying insect biomass in protected areas. PLOS ONE.', url: 'https://doi.org/10.1371/journal.pone.0185809' },
                { label: 'EU Water Framework Directive (2000/60/EC) \u2014 Ecological status of Belgian rivers and water bodies', url: 'https://ec.europa.eu/environment/water/water-framework/index_en.html' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                >
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>&#x2197;</span>
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
