'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const TOPIC_COLOR = '#3b82f6';

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',       label: 'Three pressures, one crisis'     },
  { id: 'canals',      label: 'Straightened rivers'             },
  { id: 'flooding',    label: 'Flooding paradox'                },
  { id: 'pollution',   label: 'River pollution'                 },
  { id: 'stakes',      label: 'Why this matters'                },
  { id: 'solutions',   label: 'What is being done'              },
  { id: 'sources',     label: 'Sources & further reading'       },
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
  return <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid #f3f4f6` }}>{children}</h2>;
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
function FullWidthImage({ src, alt, caption, source, sourceUrl }: { src: string; alt: string; caption?: string; source?: string; sourceUrl?: string }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <img src={src} alt={alt} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
      {(caption || source) && (
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6, lineHeight: 1.5 }}>
          {caption}{caption && source && ' — '}
          {source && sourceUrl
            ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: TOPIC_COLOR }}>{source}</a>
            : source}
        </p>
      )}
    </div>
  );
}
function InfoCard({ emoji, title, color, bg, children }: { emoji: string; title: string; color: string; bg: string; children: React.ReactNode }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 10, padding: '16px 18px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: color }}>{title}</span>
      </div>
      <div style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '26th/27',  label: 'EU freshwater ranking',       sub: 'Belgium ranks 26th out of 27 EU countries in renewable freshwater per capita — one of Europe\'s most water-stressed nations', color: '#ef4444' },
    { value: '~20%',     label: 'rivers in good status',       sub: 'Only ~20% of Belgian surface water bodies meet the EU Water Framework Directive\'s ecological quality standards', color: '#dc2626' },
    { value: '75%',      label: 'of Flemish wet nature lost',  sub: 'Flanders has lost three quarters of its wetlands since the 1950s — from 244,000 ha to just 68,000 ha today', color: '#f97316' },
    { value: '1,500+ km',label: 'of navigable waterways',     sub: 'Belgium\'s waterway network is one of the densest in Europe — the vast majority heavily modified from their natural state', color: '#3b82f6' },
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BelgiumWaterChallengePage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F4A7;  Water &amp; Soil</p>
            <h1 className="detail-title">Belgium&apos;s Water Challenge</h1>
            <p style={{ color: '#bfdbfe', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              Straightened rivers, lost floodplains, polluted waterways and worsening droughts and floods — how Belgium got here and what is being done about it.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/water-challenge.jpg" alt="Belgian river" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>Three pressures, one crisis</SectionTitle>
            <Para>
              Belgium&apos;s rivers and waterways are in poor health — and the problems are not new. Over the past century, three simultaneous pressures have transformed the country&apos;s water system from a complex, self-regulating network into a fragile, over-engineered system that floods harder, dries faster, and carries heavier pollution than it did a generation ago.
            </Para>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { emoji: '📏', title: 'Straightening', color: '#7c3aed', text: 'Rivers were canalized for navigation, land drainage and flood control — removing meanders, destroying riparian habitat and accelerating flow.' },
                { emoji: '🌊', title: 'Flood plain loss', color: '#ef4444', text: 'Agricultural drainage tiles and hard surfaces eliminated the wetlands and floodplains that once absorbed excess rainfall. Water reaches rivers faster, and harder.' },
                { emoji: '🏭', title: 'Pollution loading', color: '#f97316', text: 'Agriculture, industry and dense, dispersed settlement have loaded waterways with nitrates, phosphates, heavy metals, PFAS and untreated sewage.' },
              ].map(c => (
                <div key={c.title} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', borderTop: `3px solid ${c.color}` }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{c.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: c.color, marginBottom: 5 }}>{c.title}</div>
                  <div style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65 }}>{c.text}</div>
                </div>
              ))}
            </div>
            <Para style={{ marginBottom: 0 }}>
              These three problems compound each other. A straightened river carries pollution faster, leaving less time for natural filtration. A river stripped of its floodplain floods more violently. A polluted river with no riparian buffer zone cannot support the ecological communities that would otherwise help absorb nutrients. Understanding each pressure separately — and then together — is the only way to understand why Belgium consistently struggles to meet EU water quality standards.
            </Para>
          </SectionCard>

          {/* 2 — Canalization */}
          <SectionCard id="canals">
            <SectionTitle>A century of straightening — what canalization does to a river</SectionTitle>
            <Para>
              Belgium has one of the densest waterway networks in Europe — over 1,500 km of navigable canals and rivers, plus thousands of kilometres of smaller watercourses managed for agriculture and drainage. Almost none of these still follow their original course. The Scheldt, Meuse, Lys, Sambre, Demer, Dyle, Dijle and dozens of smaller rivers have been widened, deepened, embanked and straightened over the past two centuries — first for barge navigation during the industrial revolution, then for agricultural drainage during the mid-20th century.
            </Para>
            <Para>
              What does straightening actually do to a river?
            </Para>
            <BulletList items={[
              { bold: 'Removes meanders', text: 'a meandering river is longer than a straight one. Remove the bends and water moves faster — increasing downstream flood peaks and reducing the time available for infiltration and groundwater recharge' },
              { bold: 'Destroys the riparian zone', text: 'the strip of vegetation along a natural riverbank — reeds, willows, alder woodland — filters runoff before it enters the river, stabilises banks, provides habitat and shades the water. Embanked rivers lose this buffer entirely' },
              { bold: 'Eliminates in-stream habitat', text: 'meanders create pools and riffles, varied flow speeds and sediment deposits that support fish, invertebrates and aquatic plants. A uniform trapezoidal canal channel supports almost none of this complexity' },
              { bold: 'Disconnects the floodplain', text: 'natural rivers periodically overflow their banks into adjacent meadows, forests and wetlands. Embankments prevent this, forcing all flood water downstream — concentrating it rather than spreading it' },
              { bold: 'Accelerates sediment transport', text: 'faster water carries more sediment. Downstream areas receive pulses of fine sediment that smother gravel beds, reducing oxygen penetration and eliminating spawning habitat for species like salmon and brown trout — both now largely absent from Belgian rivers' },
            ]} />
            <Para>
              The Vesdre, a tributary of the Meuse in Li&egrave;ge province, is a particularly clear example. For much of the 20th century it was straightened and embanked to facilitate industry and urban development in the Vesdre valley. The river lost most of its natural meanders and floodplain between Li&egrave;ge and Verviers. When exceptional rainfall struck the region in July 2021, there was nowhere for the water to go except through the towns built in the former floodplain.
            </Para>

            <FullWidthImage
              src="/images/learn/vesdre.jpg"
              alt="Aerial view of the Vesdre river flooding, July 2021"
              source="Aerial view of the Vesdre valley flooding, July 2021"
            />

            <Para style={{ marginBottom: 0 }}>
              Belgium is not alone in this: the straightening of rivers across Western Europe was a deliberate policy throughout the 19th and 20th centuries, promoted by engineers, agricultural ministries and port authorities. It is only since the EU Water Framework Directive (2000) that restoration — rather than further modification — has become the legal baseline. But undoing a century of infrastructure takes decades, significant investment, and difficult land negotiations.
            </Para>
          </SectionCard>

          {/* 3 — Flooding */}
          <SectionCard id="flooding">
            <SectionTitle>The flooding paradox — too much and too little water</SectionTitle>
            <Para>
              Belgium faces a paradox that seems contradictory but is in fact a single coherent failure: it is one of the most water-stressed countries in the EU by available freshwater per capita, yet it also experiences severe and worsening flooding. The same landscapes that flood in winter and spring are dry and cracking in summer. The solution to this paradox is the same in both directions: Belgium has lost the capacity to hold water in the landscape.
            </Para>

            <Para><strong>Why water leaves the landscape so quickly</strong></Para>
            <BulletList items={[
              { bold: 'Agricultural drainage', text: 'the mid-20th century transformation of Belgian agriculture required wet meadows, marshes and poorly-drained fields to be drained — first with open ditches, then with buried clay drainage tiles and modern perforated pipes. These systems evacuate rainwater within hours rather than letting it infiltrate slowly over days and weeks. This was rational for agricultural productivity; its hydrological cost is now apparent' },
              { bold: 'Soil sealing', text: 'Belgium has one of the highest rates of soil sealing in Europe. Roads, buildings, parking lots and hard-surfaced gardens prevent rainfall from infiltrating at all — it runs off directly to drains and rivers' },
              { bold: 'Loss of wetlands', text: 'Flanders has lost 75% of its wet nature since the 1950s — from 244,000 ha to 68,000 ha. These wetlands acted as sponges: absorbing rainfall, releasing it slowly, and recharging groundwater. Their drainage means the same rainfall now reaches rivers in a fraction of the time' },
              { bold: 'Ribbon development in floodplains', text: 'Belgium\'s dispersed urbanisation pattern — long strips of housing along every rural road — has placed buildings in areas that functioned as natural floodplains. These areas were mapped as floodprone for centuries; building on them was legal and even encouraged by planning regulations for decades' },
            ]} />

            <Para>
              The result is that even moderate rainfall events now produce flood peaks that previously required exceptional storms. Climate change — bringing more intense precipitation events, longer dry periods, and higher evapotranspiration in summer — intensifies both extremes but does not create the problem from scratch. The structural vulnerability was built in over a century.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              The deeper irony is that the drainage that causes flooding in winter simultaneously depletes groundwater reserves in summer. Water that infiltrated slowly into the water table over decades now leaves the system within hours. Belgian groundwater levels have been declining in many areas — particularly in Flanders — contributing to water stress for agriculture, industry and drinking water supply during the increasingly long dry seasons.
            </Para>
          </SectionCard>

          {/* 4 — Pollution */}
          <SectionCard id="pollution">
            <SectionTitle>River pollution — among the worst in the EU</SectionTitle>
            <Para>
              Belgium consistently fails EU Water Framework Directive targets. Only around <strong>20% of Belgian surface water bodies</strong> are in good ecological status — one of the lowest proportions in Europe. The causes are multiple and compound each other: what agriculture adds, industry concentrates, and dispersed settlement prevents from being collected and treated.
            </Para>

            <FullWidthImage
              src="/images/learn/water-pollution.jpg"
              alt="Industrial discharge pipe emitting polluted water into a river"
            />

            <Para><strong>Agriculture — the largest diffuse source</strong></Para>
            <Para>
              Belgium has some of the most intensive agriculture in Europe — high livestock densities, greenhouse horticulture, sugar beet and potato cultivation — all of which generate large quantities of nitrogen and phosphorus that enter watercourses through runoff and leaching. Belgium has consistently been in violation of the EU Nitrates Directive, with nitrate concentrations in many Flemish rivers and canals exceeding the 50 mg/l drinking water standard. Pesticide residues are found in the majority of Flemish surface water monitoring stations. The MAP (Mestactieplan / Manure Action Programme) framework has been revised multiple times but enforcement remains contested.
            </Para>

            <Para><strong>Industrial legacy and PFAS</strong></Para>
            <Para>
              Belgium&apos;s industrial history — steel in the Meuse valley, chemicals and petrochemicals in Antwerp, textiles in Ghent — left a legacy of heavy metal and organic pollutant contamination in river sediments that persists decades after the industries themselves closed or cleaned up. More acutely, the 3M plant in Zwijndrecht near Antwerp was one of the largest emitters of PFAS (per- and polyfluoroalkyl substances) in Europe. PFAS contamination of the Scheldt and surrounding groundwater was confirmed at alarming levels in 2021, triggering restrictions on growing and eating vegetables from gardens within several kilometres of the plant. PFAS does not degrade; it accumulates in sediment, water and biological tissue.
            </Para>

            <Para><strong>Population density and ribbon development</strong></Para>
            <Para>
              Belgium&apos;s famously dispersed settlement pattern — the <em>lintbebouwing</em> (ribbon development) that strings houses along virtually every rural road — creates an almost insoluble sewage problem. Collecting wastewater from dispersed housing clusters to a centralised wastewater treatment plant (WWTP) is enormously expensive per connection. As a result, a significant fraction of Belgian households — particularly in Wallonia and rural Flanders — rely on septic tanks or cesspits that are poorly maintained or directly overflow to drainage ditches. Belgium has for decades been under European Commission infringement proceedings for failing to connect sufficient population to sewage treatment. During heavy rain events, combined sewer overflows (where storm runoff and sewage share the same pipe) discharge raw mixed sewage directly to rivers across all three regions.
            </Para>

            <Para style={{ marginBottom: 0 }}><strong>Combined sewer overflows</strong></Para>
            <Para style={{ marginBottom: 0 }}>
              Most of Belgium&apos;s urban drainage infrastructure was built as combined systems — a single pipe carrying both rainwater runoff and sewage. When rainfall exceeds the system&apos;s capacity (which happens frequently in ageing infrastructure), the overflow valve opens and the mixture discharges untreated to the nearest watercourse. This is legal under current regulation but represents a massive and largely invisible pollution load on urban rivers. Separate sewer systems — one for rainwater, one for sewage — are the standard in new construction but retrofitting existing cities is a multi-decade undertaking.
            </Para>
          </SectionCard>

          {/* 5 — Stakes */}
          <SectionCard id="stakes">
            <SectionTitle>Why this matters beyond ecology</SectionTitle>
            <Para>
              The ecological consequences of Belgium&apos;s water problems are severe — fish populations decimated, invertebrate communities simplified, aquatic plant communities replaced by algal blooms fuelled by nutrients. But the consequences extend well beyond ecology.
            </Para>
            <BulletList items={[
              { bold: 'Drinking water supply', text: 'Belgium increasingly relies on groundwater for drinking water — groundwater that is declining in level and rising in nitrate and PFAS contamination. The cost of treating contaminated water is already adding tens of millions of euros per year to water utility costs, ultimately borne by consumers' },
              { bold: 'Flood damage costs', text: 'the 2021 Vesdre floods caused over €2.5 billion in insured losses in Belgium — excluding uninsured damage, infrastructure costs and economic disruption. As climate change increases the frequency of intense precipitation events, these costs will grow unless landscape water retention is improved' },
              { bold: 'Agricultural water security', text: 'drought stress in Flemish agriculture is already causing yield losses in dry summers. Groundwater depletion reduces irrigation availability. A landscape that has been drained for production is now at risk from the very dryness it created' },
              { bold: 'Public health', text: 'PFAS in drinking water sources, cyanobacterial (blue-green algae) blooms on eutrophied lakes and rivers, and bacterial contamination from combined sewer overflows all pose public health risks. Swimming bans on Belgian rivers and lakes are common throughout summer' },
            ]} />
          </SectionCard>

          {/* 6 — Solutions */}
          <SectionCard id="solutions">
            <SectionTitle>What is being done</SectionTitle>
            <Para>
              Belgium&apos;s water challenges require policy responses at every level — from EU directives to local municipal projects. The most significant programmes are the Blue Deal in Flanders and the Plan de Gestion des Ressources en Eau (PGRE) in Wallonia.
            </Para>

            <InfoCard emoji="&#x1F4A7;" title="Blue Deal (Flanders) — a structural response to water scarcity and flooding" color="#1d4ed8" bg="#eff6ff">
              <p style={{ margin: '0 0 10px' }}>
                Launched in 2020 by the Flemish Government, the Blue Deal is a comprehensive programme with 15 concrete measures and significant investment to address both drought and flooding. Its central logic: <strong>keep water in the landscape longer</strong> — by restoring wetlands, rewetting drained land, removing drainage infrastructure, and creating space for rivers to spread into natural areas rather than concentrating into flood peaks.
              </p>
              <p style={{ margin: '0 0 10px' }}>
                A key strand is the <strong>Natte Natuur (Wet Nature) investment programme</strong>: &euro;6.2 million distributed across 38 specific local projects in Flanders, creating new wetlands and restoring drained valley systems. Examples include:
              </p>
              <ul style={{ margin: '0 0 10px', paddingLeft: 20, fontSize: '0.87rem', lineHeight: 1.7 }}>
                <li><strong>Rivierenhof (Antwerpen)</strong> — restoration of wet forest along the Groot Schijn river</li>
                <li><strong>Stiemervallei (Genk)</strong> — reopening historic wetland habitats and reactivating old meanders of the Munsterbeek</li>
                <li><strong>Uitkerkse Polder (Blankenberge)</strong> — rewetting coastal polder meadows that act as a freshwater buffer</li>
                <li><strong>Groen-blauwe ader Zuunbeek (Sint-Pieters-Leeuw)</strong> — creating a green-blue corridor along the Zuunbeek</li>
                <li><strong>Gentbrugse Meersen (Gent)</strong> — restoring wet nature in the Scheldt floodplain within the city of Ghent</li>
              </ul>
              <p style={{ margin: 0 }}>
                The Blue Deal also funds <strong>WaterLandSchap</strong> pilot projects where farmers, water managers, nature organisations and municipalities jointly redesign entire catchments to retain water — demonstrating that agricultural productivity and water retention are compatible if the landscape is managed as a whole.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F4CB;" title="Plan de Gestion des Ressources en Eau — PGRE (Wallonia)" color="#15803d" bg="#f0fdf4">
              <p style={{ margin: '0 0 10px' }}>
                Wallonia&apos;s water management framework is structured around the <strong>Plan de Gestion des Ressources en Eau (PGRE)</strong> — the regional implementation of the EU Water Framework Directive, revised every six years. The PGRE sets quality objectives for all water bodies, coordinates measures across agriculture, industry, urban drainage and nature restoration, and allocates funding for wastewater treatment infrastructure.
              </p>
              <p style={{ margin: '0 0 10px' }}>
                Following the catastrophic 2021 flooding, Wallonia also launched a dedicated <strong>Plan PLUIES</strong> (Plan de Lutte contre les Inondations et les Eaux pluviales en Syst&egrave;me) and a broader <strong>Plan de Reconstruction</strong> for the Vesdre valley that explicitly integrates river restoration — removing embankments, reactivating floodplains, relocating buildings out of the natural floodplain — rather than simply rebuilding the pre-flood infrastructure. The Vesdre restoration is Europe&apos;s largest current urban river restoration project, with several kilometres of embankments removed and the river allowed to reclaim its historic channel.
              </p>
              <p style={{ margin: 0 }}>
                Wallonia has also invested significantly in upgrading wastewater treatment plants in rural areas, addressing the chronic under-connection of dispersed housing — though progress remains slower than EU infringement proceedings require.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F3D7;&#xFE0F;" title="Sigma Plan &amp; Room for the River (Flanders)" color="#7c3aed" bg="#f5f3ff">
              <p style={{ margin: '0 0 10px' }}>
                The <strong>Sigma Plan</strong> is Belgium&apos;s largest water safety and nature restoration programme, protecting the Scheldt estuary hinterland (including Antwerp) from tidal flooding while simultaneously creating 7,400 ha of new wetlands and floodplains. Rather than simply raising dykes, it creates <em>gecontroleerde overstromingsgebieden</em> (controlled flood areas) — polders that are allowed to flood during peak tidal events, absorbing water that would otherwise inundate residential and industrial areas. These areas simultaneously become high-quality wetland habitat.
              </p>
              <p style={{ margin: 0 }}>
                The <strong>Demer and Dijle valley restoration projects</strong> apply similar logic further upstream: former agricultural land is rewetted, dykes are set back, and rivers are given room to spread into their natural floodplain rather than being forced through a narrow channel at high velocity.
              </p>
            </InfoCard>

            <Para style={{ marginTop: 16 }}><strong>What individuals and municipalities can do</strong></Para>
            <BulletList items={[
              { bold: 'De-pave (ontharden)', text: 'replace hard surfaces in gardens, driveways and car parks with permeable alternatives — gravel, grass pavers, water-permeable tiles. Every square metre of permeable surface reduces runoff and recharges groundwater' },
              { bold: 'Install a rainwater barrel or cistern', text: 'Belgium subsidises rainwater cisterns for new and existing buildings in all three regions. Collected water reduces mains demand and keeps rainfall out of drainage systems during peak events' },
              { bold: 'Report illegal dumping and discharges', text: 'the VMM (Vlaamse Milieumaatschappij) and SPW (Service Public de Wallonie) both operate reporting platforms for water pollution incidents' },
              { bold: 'Reduce nitrogen in your garden', text: 'avoid artificial fertilisers and choose plants suited to your soil rather than those requiring intensive feeding' },
              { bold: 'Support agricultural nitrate standards', text: 'the MAP framework governing agricultural nitrogen use is periodically renegotiated. Public awareness and political pressure influence the ambition level of successive MAP agreements' },
            ]} />
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'VMM — Waterkwaliteit in Vlaanderen (annual quality reports)', url: 'https://www.vmm.be/water/waterkwaliteit' },
                { label: 'SPW (Wallonia) — Plan de Gestion des Ressources en Eau', url: 'https://environnement.wallonie.be/water/pgre/' },
                { label: 'Blue Deal — Vlaamse Overheid programme page', url: 'https://www.vlaanderen.be/blue-deal' },
                { label: 'Blue Deal: Lokale hefboomprojecten natte natuur (project list)', url: 'https://omgeving.vlaanderen.be/nl/blue-deal-lokale-hefboomprojecten-gebiedsontwikkeling-met-focus-op-natte-natuur' },
                { label: 'Sigma Plan — Waterwegen en Zeekanaal / De Vlaamse Waterweg', url: 'https://www.sigmaplan.be' },
                { label: 'EU Water Framework Directive — progress and implementation', url: 'https://environment.ec.europa.eu/topics/water/water-framework-directive_en' },
                { label: 'EEA — European waters: Assessment of status and pressures 2024', url: 'https://www.eea.europa.eu/publications/european-waters-assessment-of-status-and-pressures-2024' },
                { label: 'VITO / VMM — PFAS contamination around 3M Zwijndrecht (2021)', url: 'https://www.vmm.be/nieuws/2021/onderzoek-pfas-3m' },
                { label: 'European Commission — Belgium infringement proceedings on wastewater treatment', url: 'https://ec.europa.eu/environment/water/water-urbanwaste/implementation/belgique_en.htm' },
                { label: 'Vesdre reconstruction — Plan de reconstruction de la Vesdre', url: 'https://www.wallonie.be/fr/reconstruction-et-inondations/vesdre' },
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
