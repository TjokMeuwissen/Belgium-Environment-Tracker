'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const TOPIC_COLOR = '#8b5cf6';

const SECTIONS = [
  { id: 'intro',      label: 'Why it matters'         },
  { id: 'livingroom', label: 'Living room'            },
  { id: 'kitchen',    label: 'Kitchen'                },
  { id: 'bathroom',   label: 'Bathroom & laundry'     },
  { id: 'bedroom',    label: 'Bedroom'                },
  { id: 'wholehome',  label: 'The whole home'         },
  { id: 'actions',    label: 'How to improve your air'},
  { id: 'sources',    label: 'Sources'                },
];

// ── Layout components ─────────────────────────────────────────────────────────

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f3f4f6' }}>
      {children}
    </h2>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, marginBottom: 12, ...style }}>{children}</p>;
}

function BulletList({ items }: { items: { bold: string; text: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
          <span style={{ color: TOPIC_COLOR, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>&#x25B8;</span>
          <span><strong style={{ color: '#1a1a1a' }}>{item.bold}</strong>: {item.text}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Room header ───────────────────────────────────────────────────────────────

function RoomHeader({ icon, label, pollutants }: { icon: string; label: string; pollutants: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f9fafb', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
      <div style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', marginBottom: 4 }}>{label}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {pollutants.map(p => (
            <span key={p} style={{ background: `${TOPIC_COLOR}18`, color: TOPIC_COLOR, borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────

function KeyFigures() {
  const figs = [
    { value: '~90%', label: 'of time spent indoors', sub: 'Europeans spend the vast majority of their lives inside homes, offices, and schools', color: TOPIC_COLOR },
    { value: '2\u20135\u00d7', label: 'more polluted indoors', sub: 'Indoor air can be 2 to 5 times more polluted than outdoor air, according to the US EPA', color: '#ef4444' },
    { value: '1,000+', label: 'chemical compounds', sub: 'Studies have detected over a thousand different VOCs inside typical European homes', color: '#f59e0b' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────

function ActionCard({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div style={{ background: '#f5f3ff', border: `1px solid ${TOPIC_COLOR}22`, borderLeft: `4px solid ${TOPIC_COLOR}`, borderRadius: 8, padding: '14px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', marginBottom: 8 }}>
        {icon} {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.55, display: 'flex', gap: 8 }}>
            <span style={{ color: TOPIC_COLOR, flexShrink: 0 }}>&#x2713;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IndoorAirQuality() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F32C;&#xFE0F;  Air Quality</p>
            <h1 className="detail-title">Indoor Air Quality</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/indoor-air.PNG" alt="Indoor air quality" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Why it matters */}
          <SectionCard id="intro">
            <SectionTitle>Why indoor air quality matters</SectionTitle>
            <Para>
              When people think about air pollution, they picture traffic fumes or factory smokestacks. But
              for most people, the air they breathe most is inside their own home. Europeans spend roughly
              90% of their lives indoors &mdash; sleeping, cooking, working, and relaxing in spaces where
              pollutant concentrations can build up far beyond what would be acceptable outdoors.
            </Para>
            <Para>
              Unlike outdoor air, which is regulated by European directives with mandatory monitoring and
              limit values, indoor air quality has no binding legal standards in Belgium. There is no
              obligation to measure it, and no authority that will intervene if your living room air is
              heavily polluted. The responsibility falls almost entirely on residents themselves.
            </Para>
            <Para>
              The sources are varied and often surprising. Some &mdash; like wood stoves and gas cookers
              &mdash; are obvious combustion sources. Others are chemical: the paints on your walls,
              the cleaning spray under your sink, the scented candle on your coffee table. And some are
              biological: mould spores, dust mite allergens, and pet dander that accumulate wherever
              ventilation is poor. Understanding what produces what, and in which room, is the first step
              toward breathing better air at home.
            </Para>
          </SectionCard>

          {/* 2 — Living room */}
          <SectionCard id="livingroom">
            <RoomHeader
              icon="&#x1F6CB;"
              label="Living room"
              pollutants={['Fine particles (PM2.5)', 'Black carbon', 'Polycyclic aromatic hydrocarbons', 'VOCs']}
            />
            <SectionTitle>Living room</SectionTitle>

            <Para><strong>Wood stoves and open fireplaces</strong></Para>
            <Para>
              A wood-burning stove or open fireplace is the single most polluting activity most Belgian
              households engage in. Burning wood releases large quantities of fine particles, black carbon,
              and polycyclic aromatic hydrocarbons (PAHs) &mdash; many of which are carcinogenic. An open
              fireplace is particularly problematic: much of the smoke that should go up the chimney
              re-enters the room through downdrafts and the gaps around the hearth.
            </Para>
            <Para>
              The quality of what you burn matters enormously. Wet or green wood produces far more smoke
              and toxic compounds than dry, well-seasoned wood. Treated wood, painted wood, or waste should
              never be burned &mdash; the coatings release heavy metals and dioxins. Even with dry wood and
              a modern certified stove, significant particle emissions occur during lighting and when
              refuelling, as the combustion temperature temporarily drops.
            </Para>

            <Para style={{ marginTop: 16 }}><strong>Candles</strong></Para>
            <Para>
              Burning candles &mdash; including scented candles &mdash; produces fine particles, soot, and
              volatile organic compounds (VOCs). Paraffin candles, made from petroleum, typically emit more
              soot and benzene than candles made from beeswax or soy. Scented candles add a further layer
              of chemical complexity: the fragrance compounds themselves can react with indoor ozone to
              produce secondary pollutants including formaldehyde and ultrafine particles. In a poorly
              ventilated room, several burning candles can raise particle levels to concentrations comparable
              to a busy roadside.
            </Para>
            <BulletList items={[
              { bold: 'Tip', text: 'Keep wicks trimmed to about 5 mm before each use. A long wick produces a larger, sootier flame. Choose beeswax or soy candles over paraffin, and always ventilate the room when burning candles.' },
            ]} />
          </SectionCard>

          {/* 3 — Kitchen */}
          <SectionCard id="kitchen">
            <RoomHeader
              icon="&#x1F373;"
              label="Kitchen"
              pollutants={['Fine particles (PM2.5)', 'NO\u2082', 'CO', 'Acrolein', 'VOCs']}
            />
            <SectionTitle>Kitchen</SectionTitle>

            <Para><strong>Cooking emissions</strong></Para>
            <Para>
              Cooking is one of the most significant sources of indoor air pollution in homes without
              wood-burning appliances. Frying, grilling, and roasting at high temperatures generate
              large quantities of fine particles, along with acrolein (a pungent, irritating aldehyde
              formed when fats and oils overheat) and other toxic compounds. The type of fat matters:
              oils with lower smoke points &mdash; such as butter or unrefined vegetable oils &mdash;
              begin breaking down at lower temperatures, producing more harmful compounds earlier.
            </Para>
            <Para>
              The cooking method also makes a large difference. Stir-frying at very high heat generates
              far more particles than simmering or steaming. Grilling meat produces heterocyclic amines
              and PAHs, compounds linked to elevated cancer risk, particularly when fat drips onto hot
              surfaces and produces smoke.
            </Para>

            <Para style={{ marginTop: 16 }}><strong>Gas hobs and boilers</strong></Para>
            <Para>
              Gas-burning appliances &mdash; hobs, ovens, and boilers &mdash; produce nitrogen dioxide
              (NO&#x2082;) and carbon monoxide (CO) as combustion byproducts, even when functioning
              normally. In poorly ventilated kitchens, NO&#x2082; from a gas hob can reach concentrations
              during cooking that exceed outdoor air quality guidelines within minutes. Unflued gas heaters
              pose an even greater risk and are the leading cause of CO poisoning in Belgian homes.
            </Para>
            <Para>
              Induction hobs produce no combustion emissions whatsoever. They are not only more energy
              efficient but significantly better for indoor air quality, eliminating the NO&#x2082; and CO
              contribution from gas cooking entirely. The shift away from gas in new construction that
              Belgium is gradually implementing will improve kitchen air quality across the housing stock.
            </Para>
            <BulletList items={[
              { bold: 'Tip', text: 'Always use the extractor hood when cooking, vented to the outside rather than recirculating. Open a window if possible. A recirculating hood filters grease but does not remove gases like NO\u2082 or CO.' },
            ]} />
          </SectionCard>

          {/* 4 — Bathroom & laundry */}
          <SectionCard id="bathroom">
            <RoomHeader
              icon="&#x1F6BF;"
              label="Bathroom &amp; laundry"
              pollutants={['VOCs', 'Terpenes', 'Formaldehyde', 'Mould spores']}
            />
            <SectionTitle>Bathroom &amp; laundry</SectionTitle>

            <Para><strong>Cleaning products and VOCs</strong></Para>
            <Para>
              The cleaning products most households use every day &mdash; sprays, disinfectants, bleach,
              glass cleaners, and descalers &mdash; release volatile organic compounds (VOCs) when used and
              for some time after. VOCs are carbon-containing gases that evaporate easily at room temperature.
              Many are irritants to the eyes, nose, and throat; some, like benzene and formaldehyde, are
              classified carcinogens with no known safe threshold.
            </Para>
            <Para>
              Scented cleaning products and air fresheners are a particular concern. The fragrances they
              contain are often mixtures of dozens of terpene compounds &mdash; chemicals also found in
              pine and citrus. When terpenes react with ozone (which is present in indoor air at low levels),
              they produce a secondary generation of pollutants including formaldehyde and ultrafine particles.
              This means that a product marketed as &ldquo;fresh&rdquo; or &ldquo;clean-smelling&rdquo; can
              actually worsen air quality rather than improve it.
            </Para>
            <BulletList items={[
              { bold: 'Tip', text: 'Choose fragrance-free or lightly scented products. Simple, concentrated options like diluted white vinegar, bicarbonate of soda, and unscented soap handle most household cleaning tasks with far lower VOC emissions than proprietary sprays.' },
            ]} />

            <Para style={{ marginTop: 16 }}><strong>Mould</strong></Para>
            <Para>
              Bathrooms are the most common location for household mould. Where warm, moist air repeatedly
              condenses on cool surfaces &mdash; tiles, ceilings, window frames, grout &mdash; mould spores
              find the conditions they need to grow. Mould releases spores and mycotoxins into the air, which
              can trigger or aggravate asthma, cause allergic rhinitis, and in sensitive individuals produce
              a persistent inflammatory response affecting the lungs and sinuses.
            </Para>
            <Para>
              Mould is not merely an aesthetic problem or a sign of poor housekeeping &mdash; it is a
              structural air quality issue. Once a colony is established inside wall cavities or under
              flooring, surface cleaning is insufficient. The root cause is always excess moisture, whether
              from inadequate ventilation, a plumbing leak, or condensation from thermal bridges in poorly
              insulated walls.
            </Para>
          </SectionCard>

          {/* 5 — Bedroom */}
          <SectionCard id="bedroom">
            <RoomHeader
              icon="&#x1F6CF;"
              label="Bedroom"
              pollutants={['VOCs', 'Formaldehyde', 'Dust mite allergens', 'Fine particles']}
            />
            <SectionTitle>Bedroom</SectionTitle>

            <Para><strong>Furniture and building materials off-gassing</strong></Para>
            <Para>
              New furniture &mdash; particularly flatpack products made from medium-density fibreboard
              (MDF) or particleboard &mdash; releases formaldehyde from the urea-formaldehyde resins used
              as adhesives. Formaldehyde is a colourless gas with a sharp smell at high concentrations,
              though it is odourless at the low levels typically found in furnished rooms. It is classified
              as a Group 1 carcinogen by the IARC. New furniture typically off-gasses most intensely in
              the first weeks after manufacture; emissions decline over months but can continue at lower
              levels for years.
            </Para>
            <Para>
              Paints, varnishes, and new flooring &mdash; especially synthetic carpets and vinyl flooring
              &mdash; also release VOCs. The &ldquo;new carpet smell&rdquo; or &ldquo;new car
              smell&rdquo; familiar to most people is largely a cocktail of VOCs off-gassing from synthetic
              materials. The bedroom is especially significant because people spend six to eight hours
              there every night, breathing at a lower rate but in close proximity to mattresses, pillows,
              and furniture.
            </Para>

            <Para style={{ marginTop: 16 }}><strong>Dust mites and allergens</strong></Para>
            <Para>
              House dust mites thrive in the warm, humid conditions created by human bodies in bedding.
              They feed on shed skin cells and are essentially invisible to the naked eye, but their
              faecal particles &mdash; which become airborne when bedding is disturbed &mdash; are among
              the most potent indoor allergens known. For the approximately 10 to 15% of the Belgian
              population with dust mite allergy, bedroom exposure is a daily trigger for rhinitis, eczema,
              and asthma symptoms.
            </Para>
            <BulletList items={[
              { bold: 'Tip', text: 'Wash bedding at 60\u00b0C or above weekly \u2014 temperatures below this do not reliably kill mites. Mattress and pillow covers with allergen barriers significantly reduce mite allergen exposure during sleep.' },
            ]} />
          </SectionCard>

          {/* 6 — Whole home */}
          <SectionCard id="wholehome">
            <RoomHeader
              icon="&#x1F3E0;"
              label="The whole home"
              pollutants={['Mould spores', 'Radon', 'CO\u2082', 'VOCs', 'Outdoor pollutants']}
            />
            <SectionTitle>The whole home</SectionTitle>

            <Para><strong>Ventilation and the accumulation problem</strong></Para>
            <Para>
              The common thread running through every indoor pollution source is <strong>accumulation</strong>.
              Outdoors, pollutants disperse. Indoors, they build up. A single candle, a short cooking
              session, or a spray of cleaning product releases compounds that &mdash; in a well-ventilated
              room &mdash; quickly dilute to negligible levels. In a poorly ventilated room, they linger
              for hours.
            </Para>
            <Para>
              Modern Belgian homes are built to increasingly airtight standards to reduce heat loss. This
              is good for energy efficiency but creates a fundamental ventilation challenge: without
              mechanical ventilation systems, airtight homes trap pollutants at far higher concentrations
              than older, leakier buildings. The standard in new Belgian construction is a
              mechanical ventilation system (type C or D), but many older homes rely entirely on natural
              ventilation through open windows and passive grilles, which residents frequently block to
              reduce draughts.
            </Para>

            <Para style={{ marginTop: 16 }}><strong>Humidity and mould throughout the home</strong></Para>
            <Para>
              Mould can establish itself in any room where relative humidity regularly exceeds 70%.
              Beyond the bathroom, common problem areas include poorly insulated exterior walls where
              cold surfaces cause condensation, rooms with inadequate airflow such as fitted wardrobes
              against exterior walls, and basements. The key prevention measure is keeping indoor
              humidity in the 40 to 60% range, achievable through adequate ventilation and,
              where necessary, a dehumidifier.
            </Para>

            <Para style={{ marginTop: 16 }}><strong>Radon</strong></Para>
            <Para>
              Radon is a naturally occurring radioactive gas that seeps from certain geological
              formations &mdash; granite, shale, and uranium-bearing soils &mdash; into buildings through
              foundations, floor cracks, and service entries. In Belgium, radon levels are highest in
              the Ardennes and parts of the Campine, and lowest in the coastal plain. After tobacco
              smoke, radon is the second leading cause of lung cancer in Belgium. Ground-floor and
              basement rooms in high-radon areas warrant particular attention, and measurement kits are
              available from the Belgian Nuclear Research Centre (SCK-CEN).
            </Para>
          </SectionCard>

          {/* 7 — Actions */}
          <SectionCard id="actions">
            <SectionTitle>How to improve your indoor air quality</SectionTitle>
            <Para>
              Many of the most effective actions cost nothing or very little. The biggest gains come from
              ventilation, reducing combustion indoors, and choosing less toxic products.
            </Para>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
              <ActionCard
                icon="&#x1F4A8;"
                title="Ventilate consistently"
                items={[
                  'Open windows briefly but fully \u2014 5 to 10 minutes of cross-ventilation several times a day exchanges far more air than leaving a window slightly ajar all day.',
                  'Never block ventilation grilles. They are part of your building\u2019s designed air circulation and blocking them raises CO\u2082, moisture, and pollutant levels.',
                  'Always ventilate during and after cooking, cleaning, painting, and burning candles or a wood stove.',
                  'In new airtight homes, ensure your mechanical ventilation system (type C or D) is serviced and filters are cleaned or replaced regularly.',
                ]}
              />
              <ActionCard
                icon="&#x1F525;"
                title="Reduce indoor combustion"
                items={[
                  'If you use a wood stove, burn only dry, seasoned wood (moisture content below 20%). Never burn treated wood, cardboard, or household waste.',
                  'Replace an open fireplace with a certified low-emission stove if you use it regularly \u2014 the difference in particle output is substantial.',
                  'Consider switching from a gas hob to induction. Induction eliminates NO\u2082 and CO from cooking entirely.',
                  'Limit candle use in small, poorly ventilated spaces. Choose beeswax or soy over paraffin, and keep wicks trimmed.',
                ]}
              />
              <ActionCard
                icon="&#x1F9F9;"
                title="Choose cleaner products"
                items={[
                  'Switch to fragrance-free or lightly scented cleaning products. Avoid aerosol sprays where possible \u2014 pump sprays or cloths release far fewer airborne particles.',
                  'Air out new furniture and flooring before bringing it into your living space, or let newly furnished rooms ventilate intensively for several weeks.',
                  'Avoid air fresheners and plug-in diffusers \u2014 they add VOCs without improving air quality. The best air freshener is an open window.',
                  'Store paints, solvents, and adhesives in a shed or garage rather than inside the living space.',
                ]}
              />
              <ActionCard
                icon="&#x1F4A7;"
                title="Control humidity and mould"
                items={[
                  'Keep indoor relative humidity between 40 and 60%. A simple hygrometer costs a few euros and takes the guesswork out of monitoring.',
                  'Dry laundry outside or in a well-ventilated space with an extractor. Drying laundry indoors without ventilation raises humidity sharply and feeds mould.',
                  'Clean bathroom surfaces regularly and address any visible mould promptly with a proper mould-removing product, not just surface wiping.',
                  'If mould reappears repeatedly in the same spot, investigate the cause \u2014 a thermal bridge, a slow leak, or blocked ventilation \u2014 rather than repeatedly cleaning the symptom.',
                ]}
              />
              <ActionCard
                icon="&#x1F6CF;"
                title="Protect the bedroom"
                items={[
                  'Wash bedding at 60\u00b0C weekly and use allergen-barrier covers on mattresses and pillows if you or a household member has dust mite allergy.',
                  'Vacuum mattresses regularly with a HEPA-filter vacuum cleaner.',
                  'Choose solid wood furniture over MDF or particleboard where possible, particularly for items in the bedroom. If buying new flat-pack furniture, let it off-gas in a well-ventilated space before use.',
                  'Keep the bedroom cool and well-ventilated during sleep \u2014 dust mites and mould both thrive in warm, humid conditions.',
                ]}
              />
              <ActionCard
                icon="&#x1F331;"
                title="Plants and air purifiers"
                items={[
                  'Houseplants provide modest benefits \u2014 they absorb some CO\u2082 and certain VOCs \u2014 but the effect is too small to compensate for poor ventilation. Think of them as a bonus, not a solution.',
                  'HEPA air purifiers are effective at removing fine particles and are a worthwhile investment for people with respiratory conditions, in high-traffic urban locations, or during wood-burning season.',
                  'Activated carbon filters in purifiers capture some VOCs and odours. Look for units with both a HEPA filter and an activated carbon stage.',
                  'Air purifiers do not remove gases like NO\u2082 or CO \u2014 for those, source reduction and ventilation are the only effective approaches.',
                ]}
              />
            </div>
          </SectionCard>

          {/* 8 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'WHO \u2014 WHO guidelines for indoor air quality: selected pollutants, 2010',          url: 'https://www.who.int/publications/i/item/9789289002134' },
                { label: 'European Environment Agency \u2014 Indoor air quality, 2023',                          url: 'https://www.eea.europa.eu/en/topics/in-depth/indoor-air-quality' },
                { label: 'IARC \u2014 Formaldehyde classified as Group 1 carcinogen',                           url: 'https://www.iarc.who.int/news-events/iarc-monographs-volume-100c-formaldehyde/' },
                { label: 'Sciensano \u2014 Indoor air quality in Belgian homes',                                 url: 'https://www.sciensano.be/en/health-topics/indoor-environment' },
                { label: 'SCK-CEN \u2014 Radon in Belgium',                                                     url: 'https://www.sckcen.be/en/radon' },
                { label: 'VITO / Flanders \u2014 Luchtkwaliteit binnenshuis',                                   url: 'https://www.vito.be/nl/onderzoek-resultaten/binnenluchtkwaliteit' },
                { label: 'Healthy Belgium / Sciensano \u2014 Indoor environment indicator sheet',                url: 'https://www.healthybelgium.be/en/health-status/determinants-of-health/indoor-environment' },
                { label: 'US EPA \u2014 Introduction to Indoor Air Quality',                                     url: 'https://www.epa.gov/indoor-air-quality-iaq/introduction-indoor-air-quality' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500 }}
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
