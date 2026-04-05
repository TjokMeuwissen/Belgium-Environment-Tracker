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
  { id: 'intro',    label: 'Two elements, one crisis'      },
  { id: 'sources',  label: 'Sources of N & P'             },
  { id: 'chemistry',label: 'What happens in water & soil' },
  { id: 'impacts',  label: 'Environmental impacts'        },
  { id: 'solutions',label: 'What is being done'           },
  { id: 'sources-reading', label: 'Sources & further reading' },
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
function ChemBox({ equation, label, color }: { equation: string; label: string; color: string }) {
  return (
    <div style={{ background: '#f9fafb', border: `1px solid ${color}30`, borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: color, marginBottom: 4 }}>{equation}</div>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.55 }}>{label}</div>
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

// ── Sources chart ─────────────────────────────────────────────────────────────
function SourcesChart() {
  const data = [
    { source: 'Agriculture (N)',      n: 65, p: 40, color: '#f97316' },
    { source: 'WWTPs (N)',            n: 12, p: 28, color: '#3b82f6' },
    { source: 'Septic / CSOs (N)',    n: 10, p: 18, color: '#8b5cf6' },
    { source: 'Urban runoff (N)',     n: 6,  p: 9,  color: '#6b7280' },
    { source: 'Atmospheric dep. (N)', n: 7,  p: 0,  color: '#9ca3af' },
    { source: 'Detergents / other (P)',n: 0, p: 5,  color: '#ec4899' },
  ];
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.78rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Estimated contribution to N and P loads in Belgian surface water (%)
      </p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16 }}>
        Indicative estimates based on VMM water quality reports, EEA nutrient loads data and SPW (Wallonia) monitoring. Values are approximate — contributions vary significantly by catchment and season.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {['n','p'].map(nutrient => {
          const chartData = data.filter(d => d[nutrient as 'n'|'p'] > 0).map(d => ({
            source: d.source.replace(' (N)','').replace(' (P)','').replace(' (N)',''),
            value: d[nutrient as 'n'|'p'],
            color: d.color,
          })).sort((a,b) => b.value - a.value);
          return (
            <div key={nutrient}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#374151', marginBottom: 8, textAlign: 'center' }}>
                {nutrient === 'n' ? '🔵 Nitrogen (N)' : '🟠 Phosphorus (P)'}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 70]} tick={{ fontSize: 10 }} unit="%" />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip formatter={(v: number) => [`${v}%`, nutrient === 'n' ? 'Nitrogen share' : 'Phosphorus share']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#374151' }} formatter={(v: number) => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Nitrogen cycle visual ─────────────────────────────────────────────────────
function NitrogenCycleSteps() {
  const steps = [
    { emoji: '🌱', label: 'Fertiliser / manure applied to soil', color: '#f97316' },
    { emoji: '⚗️', label: 'Nitrification: NH\u2084\u207A \u2192 NO\u2082\u207B \u2192 NO\u2083\u207B', color: '#eab308' },
    { emoji: '💧', label: 'Leaching: NO\u2083\u207B washes through soil to groundwater & rivers', color: '#3b82f6' },
    { emoji: '🌊', label: 'Eutrophication in waterbody', color: '#0ea5e9' },
    { emoji: '💨', label: 'Denitrification / volatilisation: returns N\u2082 or NH\u2083 to atmosphere', color: '#6b7280' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '16px 0', flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ textAlign: 'center', minWidth: 110, flex: 1 }}>
            <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600, lineHeight: 1.4 }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ color: '#d1d5db', fontWeight: 700, fontSize: 18, flexShrink: 0, padding: '0 2px', paddingBottom: 20 }}>&#x2192;</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function NitrogenPhosphorusPage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F4A7;  Water &amp; Soil</p>
            <h1 className="detail-title">Nitrogen &amp; Phosphorus: the Hidden Pollution</h1>
            <p style={{ color: '#bfdbfe', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              Two essential plant nutrients — nitrogen and phosphorus — are flooding Belgium&apos;s waterways at concentrations that choke aquatic life, trigger toxic algal blooms and drive biodiversity collapse.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/nitrate-pollution.jpg" alt="Nutrient pollution in water" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>Two elements, one crisis</SectionTitle>
            <Para>
              Nitrogen (N) and phosphorus (P) are the two macronutrients that all living things need to grow. In the right quantities and places, they are the foundation of life. In the wrong quantities — and Belgium&apos;s rivers, lakes and coastal waters consistently receive far too much — they become drivers of one of the most widespread environmental crises in Europe.
            </Para>
            <Para>
              The problem is not that nitrogen and phosphorus are inherently toxic. It is that they are <strong>fertilisers</strong>. When they accumulate in a water body, they trigger explosive growth of algae and aquatic plants — a process called <strong>eutrophication</strong> — which depletes oxygen, kills fish, eliminates sensitive species and can produce toxins dangerous to humans and animals. At the same time, nitrogen compounds in soil and water undergo chemical reactions that produce acid, contributing to <strong>acidification</strong> of both soils and freshwater.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              Belgium is one of the most severely affected countries in the EU. Intensive agriculture, high population density, dispersed settlement and decades of underinvestment in wastewater infrastructure have produced nitrogen and phosphorus concentrations in many waterways that far exceed both ecological thresholds and drinking water standards. The EU Nitrates Directive has been in force since 1991; Belgium has been in repeated infringement proceedings for failing to comply with it for more than three decades.
            </Para>
          </SectionCard>

          {/* 2 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Where does all this nitrogen and phosphorus come from?</SectionTitle>
            <Para>
              The sources of N and P in Belgian waterways are multiple. Agriculture dominates for nitrogen; the picture for phosphorus is more mixed.
            </Para>

            <SourcesChart />

            <Para><strong>Agriculture — the dominant nitrogen source</strong></Para>
            <Para>
              Belgium has some of the highest livestock densities in Europe — particularly in Flanders, where pigs, poultry and cattle are concentrated in areas far smaller than the land needed to absorb their manure. Nitrogen enters water in several ways:
            </Para>
            <BulletList items={[
              { bold: 'Nitrate leaching', text: 'nitrate (NO\u2083\u207B) is highly soluble and does not bind to soil particles. When soils receive more nitrogen than crops can absorb — through manure, slurry or synthetic fertiliser — the excess leaches through the soil profile into groundwater and drains into rivers via subsurface drainage systems' },
              { bold: 'Ammonia volatilisation', text: 'when manure and slurry are spread on fields, ammonia (NH\u2083) evaporates into the atmosphere. It is redeposited as nitrogen on soils and water surfaces downwind — Belgium is one of Europe\'s largest emitters of agricultural ammonia per unit area, and atmospheric nitrogen deposition contributes significantly to sensitive ecosystems' },
              { bold: 'Surface runoff', text: 'heavy rainfall on fertilised fields washes dissolved nitrates and particulate phosphorus directly into surface drains and ditches before the soil can filter them' },
            ]} />

            <Para><strong>Phosphorus sources</strong></Para>
            <Para>
              Unlike nitrate, phosphorus binds strongly to soil particles and does not leach as readily. It reaches water mainly through:
            </Para>
            <BulletList items={[
              { bold: 'Soil erosion and surface runoff', text: 'phosphorus is carried attached to fine soil particles. Bare soils after harvest, shallow-rooted crops and steep slopes with intensive tillage all accelerate erosion. Belgium\'s heavy clay soils and intensive cropping patterns make this a significant pathway' },
              { bold: 'Wastewater treatment', text: 'even treated wastewater contains phosphorus unless specific phosphorus removal is applied. Many smaller Belgian WWTPs lack tertiary phosphorus removal — a technically available but expensive step' },
              { bold: 'Septic tanks and combined sewer overflows', text: 'untreated or partially treated sewage from dispersed rural housing and urban overflow events delivers pulses of nutrient-rich wastewater directly to watercourses' },
              { bold: 'Legacy phosphorus in river sediments', text: 'decades of excess phosphorus input have built up large reserves in river and lake sediments. Even if all external inputs stopped tomorrow, this internal phosphorus load would continue releasing nutrients into the water column — a major challenge for restoration' },
            ]} />
          </SectionCard>

          {/* 3 — Chemistry */}
          <SectionCard id="chemistry">
            <SectionTitle>What happens when nitrogen and phosphorus enter water and soil</SectionTitle>
            <Para>
              Once nitrogen and phosphorus enter the environment, they are transformed through a series of chemical and biological reactions. Understanding these reactions helps explain both why the problems are so persistent and why they are so hard to reverse.
            </Para>

            <Para><strong>The nitrogen cycle in simplified form</strong></Para>
            <NitrogenCycleSteps />

            <Para style={{ marginTop: 8 }}>
              The key process is <strong>nitrification</strong> — performed by soil bacteria that convert ammonium (NH&#x2084;&#x207A;, the form of nitrogen in manure and organic matter) first to nitrite (NO&#x2082;&#x207B;) and then to nitrate (NO&#x2083;&#x207B;). This two-step process is aerobic (requires oxygen) and acidifies the soil, releasing hydrogen ions:
            </Para>

            <ChemBox
              equation="NH\u2084\u207A + 2O\u2082 \u2192 NO\u2083\u207B + 2H\u207A + H\u2082O"
              label="Nitrification: ammonium is oxidised to nitrate by bacteria. The release of H\u207A ions acidifies the soil. Nitrate, being negatively charged, is repelled by negatively charged soil particles and leaches easily with water."
              color="#f97316"
            />

            <Para>
              In waterlogged or oxygen-depleted conditions (such as flooded soils or river sediments), the reverse process — <strong>denitrification</strong> — occurs: nitrate is converted back to nitrogen gas (N&#x2082;) and released to the atmosphere. This is the only natural process that permanently removes nitrogen from the system:
            </Para>

            <ChemBox
              equation="2NO\u2083\u207B + 10e\u207B + 12H\u207A \u2192 N\u2082 + 6H\u2082O"
              label="Denitrification: nitrate is reduced to nitrogen gas under anoxic conditions. This is why restoring wetlands and riparian zones helps — they create the oxygen-depleted conditions where denitrification can occur, permanently removing nitrogen from the water."
              color="#3b82f6"
            />

            <Para><strong>Phosphorus in soil and water</strong></Para>
            <Para>
              Phosphorus chemistry is fundamentally different from nitrogen. Phosphorus does not have a gaseous phase — it cannot escape to the atmosphere. It cycles only between soil, water and living organisms. In soil, phosphorus binds strongly to iron and aluminium oxides in acidic conditions, and to calcium in alkaline conditions. This binding can be beneficial (keeping phosphorus out of water) or problematic (making it unavailable to plants even when present in large quantities).
            </Para>
            <ChemBox
              equation="Fe\u00B3\u207A + H\u2082PO\u2084\u207B \u21CC Fe-PO\u2084 (insoluble) + H\u207A"
              label="Phosphorus sorption: iron-phosphate complexes form in acidic soils, binding phosphorus. However, when soils become waterlogged and oxygen-depleted (anoxic), iron is reduced from Fe\u00B3\u207A to Fe\u00B2\u207A, releasing bound phosphorus back into solution \u2014 a key mechanism of internal phosphorus loading in lakes and sediments."
              color="#7c3aed"
            />

            <Para>
              This iron-reduction mechanism explains why <strong>internal phosphorus loading</strong> is such a problem for lake restoration: decades of phosphorus that has settled into sediments under aerobic conditions is released back into the water column whenever sediments become anoxic — which happens precisely when algal blooms decompose and consume oxygen. The system becomes self-reinforcing.
            </Para>

            <Para><strong>Acidification</strong></Para>
            <Para style={{ marginBottom: 0 }}>
              The nitrification reaction releases hydrogen ions, directly acidifying soils. In addition, ammonia deposited from the atmosphere reacts with soil to produce ammonium and subsequently nitrate, releasing further acid. Acidified soils lose calcium, magnesium and potassium — essential plant nutrients — to leaching, and release aluminium into solution, which is toxic to plant roots and aquatic invertebrates. Belgium&apos;s Natura 2000 heathlands and ancient forests are particularly vulnerable, with nitrogen deposition exceeding critical loads in most sensitive habitat areas.
            </Para>
          </SectionCard>

          {/* 4 — Impacts */}
          <SectionCard id="impacts">
            <SectionTitle>Environmental impacts — eutrophication, acidification and biodiversity loss</SectionTitle>

            <Para><strong>Eutrophication — too much life, then none</strong></Para>
            <Para>
              Eutrophication is the process by which excess nutrients stimulate explosive growth of algae and aquatic plants in water bodies. The sequence of events is predictable:
            </Para>
            <BulletList items={[
              { bold: 'Algal bloom formation', text: 'when nitrogen and phosphorus concentrations exceed critical thresholds, phytoplankton and cyanobacteria (blue-green algae) multiply rapidly. Surface blooms block light from reaching submerged plants and reduce photosynthetic oxygen production' },
              { bold: 'Oxygen depletion', text: 'when blooms die, they are decomposed by bacteria — a process that consumes enormous quantities of dissolved oxygen. Oxygen concentrations in the water column crash, sometimes to zero (anoxia). Fish, invertebrates and all aerobic organisms suffocate' },
              { bold: 'Dead zones', text: 'in severe cases, entire sections of river or lake become biologically dead. The Belgian coastal zone of the North Sea experiences seasonal hypoxia driven primarily by nutrient inputs from the Scheldt and other Belgian rivers' },
              { bold: 'Cyanobacterial toxins', text: 'many cyanobacterial species produce potent toxins (microcystins, cylindrospermopsins) that are dangerous to humans, livestock and pets. Swimming bans are common on Belgian lakes and ponds throughout summer' },
            ]} />

            <FullWidthImage
              src="/images/learn/algal-bloom.PNG"
              alt="Algal bloom on a lake with dead fish visible at the surface"
              caption="A cyanobacterial bloom causes oxygen depletion, killing fish. Such blooms are now common across Belgium\u2019s heavily eutrophied lakes, ponds and slow-moving rivers throughout summer."
            />

            <Para><strong>Acidification and soil degradation</strong></Para>
            <Para>
              Chronic nitrogen deposition has acidified soils across Belgium&apos;s most sensitive natural habitats. In Flemish heathlands — already fragmented and stressed — acidification shifts vegetation communities from diverse heath plants towards acid-tolerant grasses (particularly <em>Molinia caerulea</em>) that outcompete heather and bilberry. In ancient forests, soil acidification reduces the diversity of ground flora and disrupts mycorrhizal networks essential for tree nutrition. Most of Belgium&apos;s Natura 2000 sites receive nitrogen deposition significantly above their critical load — the level at which ecological damage begins.
            </Para>

            <Para><strong>Biodiversity loss — the connecting thread</strong></Para>
            <Para style={{ marginBottom: 0 }}>
              Nutrient pollution is one of the most important drivers of biodiversity loss in Belgium — and one of the least visible to the general public. Unlike plastic in a river or a felled tree, excess nitrogen and phosphorus are invisible. Their effects accumulate over years and decades. In aquatic ecosystems, eutrophication eliminates sensitive species first: stoneworts (<em>Chara</em> spp.), a group of macroalgae that indicate pristine water quality, have virtually disappeared from Belgian water bodies. Freshwater mussels — some of Europe&apos;s most endangered animals — cannot survive in nutrient-enriched, low-oxygen conditions. Salmon and sea trout have been extirpated from most Belgian rivers by a combination of eutrophication, low oxygen, siltation and barriers. On land, species-rich grasslands, which depend on nutrient-poor soils, have been largely replaced by coarse grass monocultures fertilised directly or by atmospheric deposition.
            </Para>
          </SectionCard>

          {/* 5 — Solutions */}
          <SectionCard id="solutions">
            <SectionTitle>What is being done</SectionTitle>
            <Para>
              Reducing nitrogen and phosphorus pollution requires action at every point in the chain — from how food is produced, to how wastewater is treated, to how land is managed between field and river.
            </Para>

            <InfoCard emoji="&#x1F4CB;" title="EU Nitrates Directive and the MAP framework" color="#dc2626" bg="#fef2f2">
              <p style={{ margin: '0 0 10px' }}>
                The EU Nitrates Directive (1991) requires member states to designate nitrate-vulnerable zones and implement action programmes to reduce nitrogen from agriculture. Belgium has been persistently non-compliant — particularly Flanders, which has faced multiple European Commission infringement proceedings and has been ordered by Belgian courts to strengthen its nitrogen policy.
              </p>
              <p style={{ margin: 0 }}>
                In Flanders, the policy instrument is the <strong>Mestactieplan (MAP)</strong> — the Manure Action Programme, currently in its seventh iteration (MAP 7). It sets maximum nitrogen and phosphorus application rates per crop and soil type, requires manure injection rather than surface spreading (reducing ammonia volatilisation), mandates closed manure storage, and sets limits on the total number of animals per unit area. Compliance and enforcement have historically been contested between the agricultural sector, environmental agencies and courts. The Flemish Stikstofakkoord (Nitrogen Agreement) — the subject of intense political controversy in 2022&#x2013;2024 — attempted to define legally binding reduction targets for nitrogen emissions from livestock farming, including potential farm closures near sensitive Natura 2000 areas.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F33F;" title="Buffer strips — the field-to-river barrier" color="#15803d" bg="#f0fdf4">
              <p style={{ margin: '0 0 10px' }}>
                Buffer strips are legally required zones of permanent vegetation — grass, wildflowers or shrubs — maintained between agricultural fields and watercourses. Their functions are multiple: they intercept surface runoff, promoting infiltration before water reaches the ditch; plant roots take up dissolved nitrogen; fine sediment carrying phosphorus settles out; and the vegetation provides habitat for insects, birds and small mammals along otherwise bare field margins.
              </p>
              <p style={{ margin: 0 }}>
                In Belgium, buffer strips of at least 1 metre are legally required along most watercourses, with wider strips (3&#x2013;9 m depending on water body classification) along more sensitive rivers and under agri-environment schemes. Compliance is monitored by satellite imagery analysis. Wider strips with diverse vegetation are significantly more effective than narrow grass strips — research suggests 5&#x2013;10 m strips can intercept 50&#x2013;90% of nitrate in shallow groundwater before it reaches the river.
              </p>
            </InfoCard>

            <FullWidthImage
              src="/images/learn/buffer.jpg"
              alt="Buffer strip of grass and wildflowers between agricultural field and watercourse"
              caption="A buffer strip separating a field from a drainage ditch. The vegetation intercepts runoff, filters nitrate from shallow groundwater and provides habitat along an otherwise bare field edge."
            />

            <InfoCard emoji="&#x1F33E;" title="Cover crops — keeping nitrogen in the field" color="#ca8a04" bg="#fffbeb">
              <p style={{ margin: '0 0 10px' }}>
                After harvest, bare soil is vulnerable: autumn and winter rainfall leaches residual nitrogen — nitrogen left from the previous crop&apos;s fertilisation that was not taken up — directly into groundwater. Cover crops are fast-growing plants sown immediately after harvest to cover the soil through winter. They serve two nutrient management functions simultaneously.
              </p>
              <p style={{ margin: '0 0 10px' }}>
                Non-legume cover crops (mustard, phacelia, rye) act as <strong>nitrogen catch crops</strong>: their roots absorb residual nitrate from the soil profile during autumn, locking it in plant biomass over winter. When the cover crop is incorporated in spring, this nitrogen is released slowly as the plant material decomposes — available to the next crop. Studies show cover crops can reduce nitrate leaching by 30&#x2013;70% compared to bare winter soils.
              </p>
              <p style={{ margin: 0 }}>
                Legume cover crops (clover, vetch, beans) do something more: they fix atmospheric nitrogen through their root nodules in symbiosis with <em>Rhizobium</em> bacteria, converting inert N&#x2082; gas into plant-available nitrogen. This biologically fixed nitrogen can then replace synthetic fertiliser in the following crop, directly reducing the total nitrogen input to the farming system. Belgian agri-environment schemes subsidise cover crop use, and MAP 7 makes them compulsory after certain high-risk crops in nitrate-vulnerable zones.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F6B0;" title="Wastewater treatment — phosphorus removal" color={TOPIC_COLOR} bg="#eff6ff">
              <p style={{ margin: '0 0 10px' }}>
                Modern large-scale wastewater treatment plants achieve biological or chemical phosphorus removal as a tertiary treatment step. Biological phosphorus removal (enhanced biological phosphorus removal, EBPR) exploits microorganisms that accumulate phosphorus in excess of their normal needs under alternating anaerobic and aerobic conditions. Chemical removal precipitates phosphorus as iron or aluminium phosphate by adding iron or aluminium salts to the treated effluent.
              </p>
              <p style={{ margin: 0 }}>
                Belgium&apos;s large urban WWTPs (Brussel-Noord, Aquafin plants) have phosphorus removal. Smaller rural plants often do not. The EU Urban Wastewater Treatment Directive, revised in 2022 and entering force from 2025, extends phosphorus removal requirements to smaller agglomerations and introduces stricter effluent standards — requiring Belgium to invest significantly in upgrading rural and peri-urban wastewater infrastructure over the coming decade.
              </p>
            </InfoCard>

            <InfoCard emoji="&#x1F30F;" title="Precision agriculture and nutrient management plans" color="#7c3aed" bg="#f5f3ff">
              <p style={{ margin: 0 }}>
                Precision agriculture uses soil mapping, satellite vegetation indices, variable-rate spreader technology and crop models to apply exactly the right quantity of fertiliser at the right time to the right place — rather than the blanket applications that have historically over-fertilised parts of fields while under-fertilising others. Mandatory nutrient management plans — required under MAP 7 for farms above certain thresholds — force farmers to account explicitly for the nitrogen and phosphorus already in their soil and manure before ordering additional synthetic fertiliser. While precision agriculture alone cannot solve the structural surplus in Belgian livestock areas, it reduces the gap between nutrient input and crop uptake that drives leaching.
              </p>
            </InfoCard>
          </SectionCard>

          {/* 6 — Sources reading */}
          <SectionCard id="sources-reading">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'VMM — Waterkwaliteit in Vlaanderen: jaarpport (annual quality report)', url: 'https://www.vmm.be/water/waterkwaliteit' },
                { label: 'European Environment Agency — Nutrients in freshwater (WISE)', url: 'https://www.eea.europa.eu/data-and-maps/indicators/nutrients-in-freshwater' },
                { label: 'EU Nitrates Directive 91/676/EEC and Belgian infringement cases', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A31991L0676' },
                { label: 'Mestbank Vlaanderen — MAP 7 (Mestactieplan)', url: 'https://www.mestbank.be/mestdecreet/mestactieplan' },
                { label: 'EU Urban Wastewater Treatment Directive (revised 2022)', url: 'https://environment.ec.europa.eu/topics/water/urban-wastewater_en' },
                { label: 'Schindler (2012) — The dilemma of controlling cultural eutrophication of lakes, Proc. R. Soc. B', url: 'https://doi.org/10.1098/rspb.2012.1032' },
                { label: 'EEA — Critical loads for nitrogen deposition in European ecosystems', url: 'https://www.eea.europa.eu/data-and-maps/indicators/air-pollutant-concentrations-at-urban' },
                { label: 'INBO — Stikstofdepositie en kritische lasten in Vlaamse Natura 2000-gebieden', url: 'https://www.inbo.be/nl/publicatie/stikstofdepositie-en-kritische-lasten-vlaamse-natura-2000-gebieden' },
                { label: 'Aquafin — wastewater treatment in Flanders', url: 'https://www.aquafin.be/en' },
                { label: 'SPW Wallonie — qualit\u00e9 des eaux de surface', url: 'https://environnement.wallonie.be/water/eaux_de_surface.htm' },
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
