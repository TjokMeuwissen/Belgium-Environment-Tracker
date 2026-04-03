// → app/learn/nature-biodiversity/protected-areas-in-belgium/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

function BulletList({ items }: { items: { bold?: string; text: React.ReactNode }[] }) {
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '24px 0 12px' }}>
      {children}
    </h3>
  );
}

// ── Comparison table ──────────────────────────────────────────────────────────

function RegionComparisonTable() {
  const rows = [
    { label: 'Framework',           flanders: 'Legislated network (Natuurdecreet 1997)', wallonia: 'Dispersed instruments — no unified network law' },
    { label: 'Core protected area', flanders: '~93,000 ha (target: 125,000 ha)', wallonia: '~18,917 ha strict nature reserves' },
    { label: 'Prohibitions in core zones', flanders: 'Pesticides, vegetation change, water level, relief alterations', wallonia: 'Most activity prohibited within strict reserves; natural parks carry no specific prohibitions' },
    { label: 'Soft buffer / corridor zones', flanders: 'IVON corridor & weaving network', wallonia: '12 natural parks (~550,000 ha)' },
  ];

  return (
    <div style={{ overflowX: 'auto', margin: '20px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb', width: '22%' }}> </th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#1d4ed8', borderBottom: '2px solid #e5e7eb', width: '39%' }}>🟡 Flanders (VEN)</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#15803d', borderBottom: '2px solid #e5e7eb', width: '39%' }}>🟢 Wallonia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>{row.label}</td>
              <td style={{ padding: '10px 14px', color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>{row.flanders}</td>
              <td style={{ padding: '10px 14px', color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'top' }}>{row.wallonia}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── EU targets visual ─────────────────────────────────────────────────────────

function EUTargetCard({ value, label, current, color }: { value: string; label: string; current?: string; color: string }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, borderTop: `4px solid ${color}`, padding: '18px 16px' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#374151', marginTop: 6, lineHeight: 1.4, fontWeight: 600 }}>{label}</div>
      {current && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{current}</div>}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'intro',         label: 'Introduction' },
  { id: 'natura2000',    label: 'Natura 2000' },
  { id: 'regional',      label: 'Regional Networks' },
  { id: 'sonian',        label: 'The Sonian Forest' },
  { id: 'eu-objectives', label: 'EU Objectives' },
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

export default function ProtectedAreasPage() {
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
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <div className="header-eyebrow" style={{ color: '#86efac' }}>🌿 Nature &amp; Biodiversity</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 12px', lineHeight: 1.2 }}>
            Protected Areas in Belgium
          </h1>
          <p style={{ fontSize: 16, color: '#bbf7d0', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            From European law to Flemish fields — how Belgium protects its most valuable natural spaces.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <div className="detail-main">

          {/* Introduction */}
          <SectionCard id="intro">
            <SectionTitle>Introduction</SectionTitle>
            <Para>
              Designating an area as &#34;protected&#34; is one of the most direct tools available to
              conserve biodiversity. It signals that a place has exceptional ecological value, and
              that development pressures — urban sprawl, agricultural intensification,
              infrastructure — must yield to conservation objectives.
            </Para>
            <Para>
              In Belgium, protected areas operate at several overlapping levels: European
              (Natura 2000), regional (VEN in Flanders, nature reserves and natural parks in
              Wallonia), and international (UNESCO World Heritage). Together they form an
              imperfect but essential safety net for the country&#39;s most important habitats
              and species.
            </Para>
          </SectionCard>

          {/* Natura 2000 */}
          <SectionCard id="natura2000">
            <SectionTitle>Natura 2000 — Europe&#39;s Protected Area Network</SectionTitle>
            <Para>
              Natura 2000 is the largest coordinated network of protected areas in the world.
              By the end of 2023, it covered 18.6% of EU land area and 10.5% of its marine
              territory, comprising 27,165 sites. It is the principal instrument through which
              the EU implements its biodiversity commitments.
            </Para>
            <Para>
              The network rests on two pieces of legislation. The <strong>Birds Directive</strong>{' '}
              (1979) requires member states to designate{' '}
              <strong>Special Protection Areas (SPAs)</strong> for threatened and migratory bird
              species. The <strong>Habitats Directive</strong> (1992) requires designation of{' '}
              <strong>Special Areas of Conservation (SACs)</strong> for the 233 habitat types and
              900+ species listed in its annexes. The overall objective is to ensure these species
              and habitat types are maintained — or restored — to a favourable conservation status
              within the EU: not simply to halt decline, but to allow them to recover and thrive
              over the long term.
            </Para>

            <SubTitle>Natura 2000 in Belgium</SubTitle>
            <Para>
              Natura 2000 covers <strong>428,908 hectares in Belgium — 12.6% of the land
              area</strong>. The network is managed separately by each region. Wallonia hosts the
              largest share of the Belgian network, consistent with its more intact and less
              fragmented landscapes.
            </Para>

            <SubTitle>Selected examples</SubTitle>
            {[
              {
                name: 'Hautes Fagnes / Hohes Venn',
                region: 'Wallonia',
                color: '#15803d',
                text: "Belgium's largest Natura 2000 site and its first national park, protecting the largest raised bog complex in Western Europe alongside Ardennes upland forests and chalk grasslands. Designated for species including the black grouse, peregrine falcon, and Hautes Fagnes peatland specialists.",
              },
              {
                name: 'Kalmthoutse Heide',
                region: 'Flanders / Netherlands (transboundary)',
                color: '#1d4ed8',
                text: 'A transboundary site straddling the Belgian-Dutch border, protecting one of the largest remaining heathland complexes in Western Europe. Habitat for nightjar, sand lizard, and numerous rare invertebrates.',
              },
              {
                name: 'Uitkerkse Polder',
                region: 'Flanders, West Coast',
                color: '#1d4ed8',
                text: 'A coastal polder area of major importance for waterbirds — a critical wintering and staging ground for pink-footed geese, white-fronted geese, and black-tailed godwit.',
              },
              {
                name: 'Vallée de la Haute Sûre',
                region: 'Wallonia, Luxembourg province',
                color: '#15803d',
                text: 'River valley habitat protecting alluvial forests, wet meadows, and oligotrophic lakes in the Ardennes. Important for otter, kingfisher, and white-clawed crayfish.',
              },
              {
                name: 'Sonian Forest',
                region: 'Brussels / Flanders / Wallonia',
                color: '#7c3aed',
                text: 'Also a Natura 2000 site — discussed in detail below.',
              },
            ].map((ex) => (
              <div key={ex.name} style={{ display: 'flex', gap: 14, marginBottom: 12, padding: '14px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 4, borderRadius: 2, background: ex.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 2 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: ex.color, fontWeight: 600, marginBottom: 6 }}>{ex.region}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.65, color: '#6b7280', margin: 0 }}>{ex.text}</p>
                </div>
              </div>
            ))}
          </SectionCard>

          {/* Regional networks */}
          <SectionCard id="regional">
            <SectionTitle>Regional Protected Area Networks</SectionTitle>
            <Para>
              Natura 2000 is a European instrument applied consistently across Belgium. Each
              region has developed its own complementary approach — and the contrast between
              Flanders and Wallonia is instructive.
            </Para>

            <SubTitle>Flanders — the Vlaams Ecologisch Netwerk (VEN)</SubTitle>
            <Para>
              The <strong>Vlaams Ecologisch Netwerk (VEN)</strong> — Flemish Ecological Network
              — was established under the Flemish Nature Decree (*Natuurdecreet*) of 1997. It is
              a selection of the most valuable and sensitive nature areas in Flanders, where
              nature conservation must take priority. The network must eventually total{' '}
              <strong>125,000 hectares</strong> (around 9.2% of Flanders); approximately
              93,000 ha have been demarcated to date.
            </Para>
            <Para>
              VEN status carries binding legal protections. Within these areas it is prohibited
              to use pesticides, alter vegetation, change the structure of streams and rivers,
              alter groundwater levels, or modify the relief of the land. The existing landscape
              receives maximum protection — hedgerows and tree rows cannot be removed if they
              may be essential for local species.
            </Para>

            <Para style={{ fontWeight: 600, marginBottom: 8 }}>Selected examples:</Para>
            <BulletList items={[
              { bold: 'De Liereman (Oud-Turnhout, Antwerp province)', text: 'Protects wet heathland, raised bogs, and drift sands in the Kempen — one of the few remaining areas in Flanders with intact sphagnum moss communities and the sundew (Drosera).' },
              { bold: 'Mechels Broek (Mechelen)', text: 'A low-lying, wet area along the Dijle valley protecting alluvial grasslands, fen meadows, and floodplain forest. Important for breeding waders and otter.' },
              { bold: 'Hoge Kempen (Limburg)', text: "Flanders' only national park, largely overlapping with both VEN and Natura 2000. Dry and wet heathlands, drift sands, pine forests, and open water. Home to breeding nightjars, sand lizards, and smooth snakes." },
            ]} />

            <SubTitle>Wallonia — a more dispersed approach</SubTitle>
            <Para>
              Wallonia does not have a direct equivalent to the VEN. Rather than a single
              legislated ecological network, protection is delivered through a set of
              complementary instruments at different levels of stringency.
            </Para>
            <Para>
              The strictest protection comes from <strong>nature reserves</strong> (*réserves
              naturelles*), where most human activity is prohibited. Wallonia currently counts
              around <strong>18,917 hectares</strong> under this status — 14,335 ha managed by
              the regional administration and 4,582 ha managed by nature associations such as
              Natagora and Ardenne &amp; Gaume. The Walloon government has committed to
              classifying at least 1,000 new hectares per year.
            </Para>
            <Para>
              A broader soft-protection layer is provided by <strong>12 natural parks</strong>{' '}
              (*parcs naturels*), which together cover around 550,000 hectares — roughly a third
              of Walloon territory. Natural parks do not impose specific prohibitions; instead
              they work through voluntary management charters and multi-stakeholder agreements
              between municipalities, landowners, farmers, and conservation bodies.
            </Para>
            <Para>
              In December 2022, Wallonia created its first two <strong>national parks</strong>:
              the Parc national de l&#39;Entre-Sambre-et-Meuse and the Parc national de la
              Vallée de la Semois, together covering 51,033 ha. Like natural parks, they do not
              add legal prohibitions but create a framework for coordinated conservation,
              restoration, and sustainable tourism.
            </Para>

            <RegionComparisonTable />

            <NoteBox>
              🌿 The difference in approach reflects the difference in starting conditions.
              Flanders — densely populated, highly fragmented, with less than 10% natural habitat
              — needed a legislative backbone to prevent further erosion of what remained.
              Wallonia, with lower population density, larger intact forests, and naturally less
              fragmented landscapes, faces lower urgency for hard legal constraints, though its
              strict reserve network remains small relative to its ecological potential.
            </NoteBox>
          </SectionCard>

          {/* Sonian Forest */}
          <SectionCard id="sonian">
            <SectionTitle>The Sonian Forest — Belgium&#39;s Only UNESCO Natural World Heritage Site</SectionTitle>
            <Para>
              In 2017, five parts of the Sonian Forest received recognition as a UNESCO World
              Heritage Site, as part of{' '}
              <em>&#34;Ancient and Primeval Beech Forests of the Carpathians and Other Regions
              of Europe&#34;</em>. It is the only UNESCO Natural World Heritage site in Belgium.
            </Para>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, margin: '20px 0' }}>
              {[
                { value: '4,421 ha', label: 'Total forest area', color: '#15803d' },
                { value: '269 ha', label: 'UNESCO-designated reserves (5 sites)', color: '#7c3aed' },
                { value: '200+', label: 'Years old, oldest beech trees', color: '#b45309' },
                { value: '18 / 23', label: "Belgian bat species found here", color: '#0369a1' },
              ].map((f) => (
                <div key={f.label} style={{ background: '#f9fafb', borderRadius: 10, borderTop: `4px solid ${f.color}`, padding: '16px 14px' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1 }}>{f.value}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 5, lineHeight: 1.4 }}>{f.label}</div>
                </div>
              ))}
            </div>

            <Para>
              The forest covers 4,421 hectares at the south-eastern edge of Brussels, spanning
              all three Belgian regions. It is maintained jointly by Flanders (56%), Brussels
              (38%), and Wallonia (6%). Beech trees cover more than half the forest — around
              2,650 ha — and the forest contains an exceptionally high density of old-growth
              trees, averaging five trunks wider than 80 cm per hectare.
            </Para>
            <Para>
              The three UNESCO-designated integral forest reserves — Joseph Zwaenepoel (232 ha,
              Flanders), Grippensdelle (83 ha, Brussels), and Ticton (23.5 ha, Wallonia) — are
              left entirely unmanaged, allowing natural processes to run their course. UNESCO
              recognised them as a living example of the exceptional evolution of beech
              ecosystems in Europe since the last Ice Age: forests that developed with very
              little human influence and are now extremely rare.
            </Para>
            <Para>
              The biodiversity is remarkable for an urban forest. The Sonian Forest is home to
              18 of Belgium&#39;s 23 bat species and is the only forest in the country where
              seven different species of woodpecker can be found. In the integral reserves,
              biodiversity has increased in recent decades following improved forest management
              and the accumulation of dead wood — a key habitat component for saproxylic
              beetles, fungi, and cavity-nesting birds.
            </Para>

            <NoteBox>
              ⚠️ The forest faces real threats. Climate change — drier springs, hotter summers
              — stresses the beech trees that define it. Fragmentation by motorways and
              recreational pressure from over one million Brussels residents are ongoing
              pressures. A 60-metre-wide ecoduct opened across the Brussels Ring in 2018 to
              reconnect severed sections. Since 2020, Belgium has assumed the role of UNESCO
              secretariat for old beech forests.
            </NoteBox>
          </SectionCard>

          {/* EU Objectives */}
          <SectionCard id="eu-objectives">
            <SectionTitle>EU Objectives — Where Does Belgium Stand?</SectionTitle>
            <Para>
              Designating protected areas is only the first step. The EU&#39;s{' '}
              <strong>Biodiversity Strategy for 2030</strong> sets clear targets for both
              coverage and quality of protection across member states.
            </Para>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, margin: '20px 0' }}>
              <EUTargetCard value="30%" label="of EU land to be legally protected by 2030" current="Belgium today: ~12.6%" color="#15803d" />
              <EUTargetCard value="10%" label="of EU land under strict protection by 2030" current="EU average today: ~3%" color="#0369a1" />
              <EUTargetCard value="30%" label="of species & habitats currently in poor status must improve by 2030" current="In Belgium: 100% of heathlands in bad status" color="#dc2626" />
              <EUTargetCard value="0" label="further deterioration allowed in conservation trends by 2030" current="Most Belgian habitats still declining" color="#f97316" />
            </div>

            <Para>
              Belgium currently covers less than half the 30% protection target. More
              pressingly, conservation <em>quality</em> lags far behind coverage. In Belgium,
              heath and scrub habitats have 100% of their types in bad conservation status, and
              bogs, mires, and fens are at 91.6% bad status — among the worst figures in the EU
              for these habitat groups.
            </Para>
            <Para>
              The gap between the <em>existence</em> of protected areas and their{' '}
              <em>ecological effectiveness</em> is Belgium&#39;s central challenge in nature
              policy. A site can be designated as Natura 2000 while its characteristic species
              continue to decline if management is inadequate, nitrogen loads remain too high, or
              surrounding land use remains hostile. Meeting the 2030 targets will require not
              just more area, but a fundamental improvement in the condition of what already
              exists.
            </Para>
            <NoteBox>
              ⚠️ EU member states must submit National Restoration Plans to the European
              Commission by September 2026, detailing how they will meet the Biodiversity
              Strategy targets. Belgium&#39;s three regions — which hold primary competence for
              nature policy — are each developing their own contribution to this plan.
            </NoteBox>
          </SectionCard>

        </div>
        <Sidebar active={activeSection} />
      </div>
    </div>
  );
}
