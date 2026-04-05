'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Cell, LabelList, Tooltip,
} from 'recharts';

const TOPIC_COLOR = '#f97316';
const PARIS_TARGET = 2.3;

// ── Flight chart data ─────────────────────────────────────────────────────────
const FLIGHT_DATA = [
  { name: 'Short-haul', sub: '< 1,500 km', example: 'e.g. Brussels–Barcelona', value: 0.7,  color: '#f97316' },
  { name: 'Medium-haul',sub: '1,500–4,000 km', example: 'e.g. Brussels–Marrakech', value: 1.5, color: '#dc2626' },
  { name: 'Long-haul',  sub: '> 4,000 km', example: 'e.g. Brussels–New York', value: 3.5,  color: '#7f1d1d' },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',      label: 'Your footprint in context'   },
  { id: 'calculator', label: 'Use the calculator'          },
  { id: 'flights',    label: 'The impact of flying'        },
  { id: 'money',      label: 'Your money & investments'    },
  { id: 'civic',      label: 'Collective & civic action'   },
  { id: 'local',      label: 'Neighbourhood & workplace'   },
  { id: 'sources',    label: 'Sources & further reading'   },
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

// ── Layout components ─────────────────────────────────────────────────────────
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

// ── Key figures ───────────────────────────────────────────────────────────────
function KeyFigures() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {[
        { value: '15.7 tCO₂eq', label: 'Belgian average footprint', sub: 'Per person per year (UCLouvain, 2019)', color: '#dc2626' },
        { value: '2.3 tCO₂eq',  label: 'Paris 2030 target',         sub: 'Per person per year to stay within 1.5°C', color: TOPIC_COLOR },
        { value: '6.8×',         label: 'above the Paris target',    sub: 'The scale of reduction needed is dramatic', color: '#7f1d1d' },
      ].map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginTop: 6 }}>{f.label}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────
function ActionCard({ emoji, title, children, links }: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  links?: { label: string; url: string }[];
}) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px 18px', marginBottom: 12, borderLeft: `3px solid ${TOPIC_COLOR}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a1a1a', marginBottom: 5 }}>{title}</div>
          <div style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.7 }}>{children}</div>
          {links && links.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {links.map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1px solid ${TOPIC_COLOR}40`, borderRadius: 6, padding: '4px 10px', fontSize: '0.78rem', color: TOPIC_COLOR, fontWeight: 600, textDecoration: 'none' }}>
                  ↗ {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Flight chart ──────────────────────────────────────────────────────────────
const CustomFlightTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{d?.name} <span style={{ fontWeight: 400, color: '#6b7280' }}>{d?.sub}</span></p>
      <p style={{ color: '#dc2626', marginBottom: 2 }}>{d?.value} tCO₂eq per return flight</p>
      <p style={{ color: '#9ca3af', fontSize: 11 }}>{d?.example}</p>
    </div>
  );
};

function FlightChart() {
  return (
    <div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={FLIGHT_DATA} layout="vertical" margin={{ top: 16, right: 80, left: 8, bottom: 8 }}>
            <XAxis type="number" domain={[0, 4.5]} tick={{ fontSize: 10, fill: '#4b5563' }} tickLine={false} axisLine={false}
              label={{ value: 'tCO₂eq per return flight (incl. RFI ×2)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#4b5563' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} tickLine={false} axisLine={false} width={100} />
            <Tooltip content={<CustomFlightTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <ReferenceLine x={PARIS_TARGET} stroke="#16a34a" strokeDasharray="5 4" strokeWidth={2}
              label={{ value: 'Paris 2030 target', position: 'top', fontSize: 10, fill: '#16a34a', fontWeight: 700 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {FLIGHT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              <LabelList dataKey="value" position="right" formatter={(v: number) => `${v} t`}
                style={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#4b5563', marginTop: 4 }}>
        Values include a radiative forcing multiplier of ×2, as recommended by ADEME, to account for the warming effect of contrails and other non-CO₂ emissions at cruise altitude. Assumes economy class, return trip from Brussels.
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ReduceFootprintPage() {
  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">← Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>🌡️  Climate &amp; Energy</p>
            <h1 className="detail-title">How to Reduce Your Carbon Footprint</h1>
            <p style={{ color: '#b0b0b0', fontSize: '0.95rem', marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
              Individual choices matter. So does where you put your money, your voice, and your energy.
            </p>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/tips.jpg" alt="Reduce your carbon footprint" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Intro */}
          <SectionCard id="intro">
            <SectionTitle>Your footprint in context</SectionTitle>
            <Para>
              The average Belgian's consumption-based carbon footprint is approximately{' '}
              <strong>15.7 tCO₂eq per person per year</strong> — nearly seven times higher than the
              Paris-compatible budget of 2.3 tCO₂eq needed by 2030 to limit warming to 1.5°C.
              This footprint is spread across five major categories: housing (the largest contributor at 4.9 t),
              equipment (3.7 t), transport (3.1 t), food (2.4 t), and public and commercial services (1.6 t).
            </Para>
            <Para>
              Not all of these categories are equally within your control. Services such as public
              infrastructure, healthcare and education are largely fixed regardless of individual behaviour.
              But housing, transport, food and equipment together account for over{' '}
              <strong>75% of the footprint</strong> — and each offers meaningful levers for reduction.
            </Para>
            <Para style={{ marginBottom: 0 }}>
              Closing the gap to 2.3 t cannot happen through individual action alone — structural and
              systemic change is essential. But individual action is not irrelevant: it accumulates,
              signals demand, and builds the political legitimacy for systemic change. This article
              covers both.
            </Para>
          </SectionCard>

          {/* 2 — Calculator CTA */}
          <SectionCard id="calculator">
            <SectionTitle>Explore your personal footprint</SectionTitle>
            <Para>
              The best way to understand where your footprint sits — and what moves the needle most for your
              specific situation — is to use the carbon footprint calculator. It covers housing, heating,
              electricity, food, transport, flights, shopping and pets, calibrated to Belgian conditions.
            </Para>

            {/* What-if questions */}
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '18px 20px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#9a3412', marginBottom: 12 }}>
                🌿 Try answering these questions in the calculator:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { q: 'What happens to your footprint if you cycle to work three days a week instead of driving?', emoji: '🚲' },
                  { q: 'What if you swap your gas boiler for a heat pump — how much does heating fall?', emoji: '🌡️' },
                  { q: 'What if you go vegetarian, or just cut red meat to once a week?', emoji: '🥗' },
                  { q: 'What if you install solar panels and charge an EV from them?', emoji: '☀️' },
                  { q: 'What if you buy nothing new this year — repair, borrow and buy second-hand instead?', emoji: '🔧' },
                ].map(item => (
                  <div key={item.q} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{item.emoji}</span>
                    <span style={{ fontSize: '0.87rem', color: '#374151', lineHeight: 1.65, fontStyle: 'italic' }}>{item.q}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/calculator"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: TOPIC_COLOR, color: '#fff', padding: '11px 22px', borderRadius: 8, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
              🧮 Open the Carbon Footprint Calculator →
            </Link>
          </SectionCard>

          {/* 3 — Flights */}
          <SectionCard id="flights">
            <SectionTitle>The impact of flying</SectionTitle>
            <Para>
              Flying is one of the most carbon-intensive individual activities — and one where the
              numbers are large enough to deserve attention even if you fly infrequently. A single
              long-haul return flight can equal or exceed the{' '}
              <em>entire annual Paris-compatible carbon budget</em> of 2.3 tCO₂eq per person.
            </Para>
            <Para>
              Short-haul flights are less impactful per trip, but often the easiest to replace:
              Brussels to Barcelona by train takes under 6 hours and emits roughly{' '}
              <strong>25× less CO₂</strong> than flying. For medium-haul destinations within Europe,
              night trains are an increasingly viable alternative as services expand.
            </Para>
            <FlightChart />
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '14px 16px', marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 8 }}>Practical actions on flights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { text: 'Take fewer, longer trips rather than frequent short breaks by air', emoji: '📅' },
                  { text: 'Choose train over plane for journeys under 6 hours — Rail Europe or Trainline make cross-border booking easier', emoji: '🚄' },
                  { text: 'When you must fly, economy class has a lower footprint per passenger than business or first class', emoji: '💺' },
                  { text: 'Avoid connecting flights — landing and take-off are the most fuel-intensive phases', emoji: '✈️' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.87rem', color: '#374151' }}>
                    <span style={{ flexShrink: 0 }}>{item.emoji}</span>
                    <span style={{ lineHeight: 1.65 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* 4 — Money & investments */}
          <SectionCard id="money">
            <SectionTitle>Your money &amp; investments</SectionTitle>
            <Para>
              Where you keep and invest your money has a larger carbon impact than most people
              realise. Banks use deposits to fund loans — including to fossil fuel companies. Pension
              funds hold shares in the companies shaping the energy system for decades. Redirecting
              even a fraction of Belgian household savings towards sustainable finance would dwarf the
              individual lifestyle changes above.
            </Para>

            <ActionCard
              emoji="⚡"
              title="Join a citizen energy cooperative"
              links={[
                { label: 'Ecopower (Flanders)', url: 'https://www.ecopower.be' },
                { label: 'Energie Samen', url: 'https://www.energiesamen.be' },
                { label: 'Rescoop Wallonie', url: 'https://www.recoopw.be' },
                { label: 'Courant d\'Air (Brussels)', url: 'https://courantdair.be' },
              ]}
            >
              Citizen energy cooperatives allow you to co-own local wind and solar infrastructure.
              You buy shares (typically €250–€500 each, capped to prevent speculation), the cooperative
              invests in renewable energy projects in your region, and you receive a dividend from clean
              electricity generation. This is one of the highest-impact financial actions available to
              Belgian individuals — your money directly finances new renewable capacity and stays local.
            </ActionCard>

            <ActionCard
              emoji="🏦"
              title="Move your savings to a purpose-driven bank"
              links={[
                { label: 'Triodos Belgium', url: 'https://www.triodos.be' },
              ]}
            >
              Triodos Bank exclusively finances sustainable projects — renewable energy, organic farming,
              social housing, education. Its loan book is fully transparent and publicly searchable. Moving
              a savings account here means your deposits fund the transition rather than oil and gas
              infrastructure. Other Belgian banks (Argenta, Crelan) have sustainability credentials but with
              less rigorous exclusion policies — check their sustainable finance reports directly.
            </ActionCard>

            <ActionCard
              emoji="📈"
              title="Review your investments and pension fund"
              links={[
                { label: 'Fairfin — Belgian banking & fossil fuels', url: 'https://www.fairfin.be' },
              ]}
            >
              If you have a pension fund through your employer, you likely have a choice of investment
              profiles. Ask HR which funds are available and check their EU SFDR classification: Article 9
              funds have the highest sustainability requirements, Article 8 moderate. For personal investments,
              sustainable ETFs exist across all asset classes — but verify the underlying holdings, not just the
              label. Fairfin (Belgium) publishes independent research on Belgian banks&apos; fossil fuel exposure.
            </ActionCard>

            <ActionCard
              emoji="🏗️"
              title="Belgian green bonds"
              links={[
                { label: 'Belgian Debt Agency', url: 'https://www.debtagency.be/en' },
              ]}
            >
              The Belgian federal government periodically issues green bonds accessible to retail investors,
              with proceeds ring-fenced for climate and environmental spending. Yields are typically
              below-market (you accept a lower return in exchange for the guarantee of green use of funds),
              but they are low-risk and directly finance public green investment. Check the Debt Agency
              website for current issuances.
            </ActionCard>
          </SectionCard>

          {/* 5 — Collective & civic action */}
          <SectionCard id="civic">
            <SectionTitle>Collective &amp; civic action</SectionTitle>
            <Para>
              Individual consumption choices are necessary but not sufficient — the scale and speed of
              decarbonisation required depends on systemic change that only policy and collective action
              can deliver. The good news: civic pressure works. Belgium&apos;s own Klimaatzaak case showed
              that citizens can hold their government legally accountable for climate inaction.
              Climate ambition should transcend party politics — whoever you vote for, demanding clear
              commitments on targets, timelines and funding is reasonable and justified.
            </Para>

            <ActionCard
              emoji="⚖️"
              title="Support Klimaatzaak — Belgium's citizen climate case"
              links={[
                { label: 'klimaatzaak.be', url: 'https://klimaatzaak.be' },
              ]}
            >
              Klimaatzaak is the Belgian citizen organisation that successfully sued the federal and
              regional governments for inadequate climate policy, winning a landmark ruling in 2021 and
              appeal in 2023. They continue to monitor government compliance and build public pressure
              for enforceable climate commitments. Signing up, donating or simply sharing their communications
              contributes to accountability regardless of which party you support.
            </ActionCard>

            <ActionCard
              emoji="✉️"
              title="Write to your elected representatives"
              links={[
                { label: 'Find your Belgian MP', url: 'https://www.lachambre.be/kvvcr/showpage.cfm?section=depute&language=fr&rightmenu=right_depute&cfm=cvlist.cfm' },
                { label: 'Find your MEP', url: 'https://www.europarl.europa.eu/meps/en/search/advanced' },
              ]}
            >
              Direct constituent contact remains one of the most effective tools of democratic pressure.
              A brief, specific email to your federal MP or MEP — asking where they stand on Belgium&apos;s
              2030 emissions reduction commitment, the renovation premium, or the end of fossil fuel subsidies —
              costs ten minutes and is noticed. Politicians track constituent correspondence.
              Focus on specific policies rather than broad positions: &quot;Will you support a binding
              renovation roadmap for Belgium&apos;s housing stock?&quot; is more effective than &quot;please act on climate.&quot;
            </ActionCard>

            <ActionCard
              emoji="🏘️"
              title="Participate in an energy community"
              links={[
                { label: 'Energie Samen — communities', url: 'https://www.energiesamen.be/energiegemeenschappen' },
                { label: 'Rescoop.eu', url: 'https://www.rescoop.eu' },
              ]}
            >
              The EU&apos;s revised Renewable Energy Directive (RED III, 2023) gives citizens the legal right
              to collectively produce, store, share and sell renewable energy through an &quot;energy community.&quot;
              Belgium is transposing this into regional law. Joining or founding a local energy community
              lets you collectively invest in rooftop solar on community buildings, share the output, and
              pool grid flexibility — reducing everyone&apos;s bills while building local renewable capacity.
            </ActionCard>

            <ActionCard
              emoji="🌱"
              title="Join a climate or environment organisation"
              links={[
                { label: 'Bond Beter Leefmilieu', url: 'https://www.bondbeterleefmilieu.be' },
                { label: 'Inter-Environnement Wallonie', url: 'https://www.iewonline.be' },
                { label: 'Rise for Climate Belgium', url: 'https://riseforclimate.be' },
              ]}
            >
              Environmental umbrella organisations like Bond Beter Leefmilieu (Flanders) and
              Inter-Environnement Wallonie (Wallonia) aggregate citizen voices into policy advocacy,
              legal interventions and public campaigns across party lines. Membership — even just
              paying annual dues — increases their mandate and resources. They also provide
              practical guidance on Belgian subsidy programmes, renovation advice, and local action.
            </ActionCard>
          </SectionCard>

          {/* 6 — Neighbourhood & workplace */}
          <SectionCard id="local">
            <SectionTitle>At neighbourhood &amp; workplace level</SectionTitle>
            <Para>
              Some of the most effective climate action is hyper-local: extending the life of a product,
              insulating a building, or changing how a team commutes. These actions also tend to save money
              and build community — making them easier to sustain than purely sacrificial choices.
            </Para>

            <ActionCard
              emoji="🔧"
              title="Use or start a repair café"
              links={[
                { label: 'Repair Café Belgium', url: 'https://www.repaircafe.be' },
              ]}
            >
              Belgium has hundreds of volunteer-run repair cafés where broken electronics, appliances,
              clothing and bicycles are fixed for free or low cost. Every repaired item avoids the
              carbon cost of manufacturing a replacement and extends the material life of the embedded
              resources. Repair Café Belgium&apos;s website lists locations and opening times. Some municipalities
              also subsidise repair workshops — check with your local authority.
            </ActionCard>

            <ActionCard
              emoji="🏠"
              title="Get a free renovation energy audit"
              links={[
                { label: 'Woonwijzer (Flanders)', url: 'https://www.mijnwoonwijzer.be' },
                { label: 'Guichet de l\'Énergie (Wallonia)', url: 'https://energie.wallonie.be' },
                { label: 'Bruxelles Environnement', url: 'https://environnement.brussels/thematiques/energie' },
              ]}
            >
              Belgium&apos;s residential buildings are among the least energy-efficient in Western Europe.
              Renovating — starting with insulation, then heating — is the single largest lever for most
              homeowners. Each region offers free or subsidised energy audits that identify priority
              interventions and available subsidies. Significant renovation premiums exist in all three
              regions, particularly for low-income households and deep renovations.
            </ActionCard>

            <ActionCard
              emoji="🚲"
              title="Push for a company mobility plan"
              links={[
                { label: 'Mobiplus — workplace mobility (Brussels)', url: 'https://www.mobiplus.brussels' },
              ]}
            >
              Belgian law requires companies with more than 100 employees to have a mobility plan. If
              yours exists, ask to see it — and ask whether it includes cycling allowances, work-from-home
              targets, public transport coverage, and EV charging. If you&apos;re in HR or management, the
              tax framework for sustainable commuting in Belgium is generous: the bicycle allowance
              is tax-exempt up to €0.35/km, and employer-provided public transport passes are deductible.
            </ActionCard>

            <ActionCard
              emoji="🥕"
              title="Join a food cooperative or short-chain initiative"
              links={[
                { label: 'Voedselteam (Flanders)', url: 'https://www.voedselteam.be' },
                { label: 'BEES Coop (Brussels)', url: 'https://bees-coop.be' },
                { label: 'Collectif Alimenterre (Wallonia)', url: 'https://www.collectifalimenterre.org' },
              ]}
            >
              Food cooperatives and short-chain purchase groups aggregate local demand for regional,
              seasonal and organic food — reducing the transport, packaging and production emissions
              of conventional supermarket supply chains. Voedselteam operates purchase groups across
              Flanders; BEES Coop in Brussels is a member-run cooperative supermarket. Buying locally
              and seasonally can reduce the emissions of your food basket by 10–30% while
              supporting regional farmers.
            </ActionCard>

            <ActionCard
              emoji="🏫"
              title="Engage your school, club or association"
            >
              Community institutions — schools, sports clubs, churches, neighbourhood associations —
              have collective purchasing power, buildings and audiences that dwarf individual action.
              A school that installs solar panels, a sports club that switches to a green energy
              tariff, or a neighbourhood association that organises bulk renovation procurement can
              achieve more than any individual member acting alone. Many municipalities have a
              sustainability officer or a &quot;durability coördinator&quot; who can provide guidance and links
              to subsidy schemes.
            </ActionCard>
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources &amp; further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'UCLouvain (2021) — Belgian carbon footprint baseline (15.69 tCO₂eq, 2019)', url: 'https://dial.uclouvain.be/memoire/ucl/en/object/thesis:46878' },
                { label: 'ADEME Base Empreinte® — Emission factors (Bilan Carbone® methodology)', url: 'https://base-empreinte.ademe.fr' },
                { label: 'IEA — Net Zero by 2050: A Roadmap for the Global Energy Sector', url: 'https://www.iea.org/reports/net-zero-by-2050' },
                { label: 'Klimaatzaak — Belgian climate accountability case', url: 'https://klimaatzaak.be' },
                { label: 'Fairfin — Belgian banks and fossil fuel financing', url: 'https://www.fairfin.be' },
                { label: 'Rescoop.eu — European federation of citizen energy cooperatives', url: 'https://www.rescoop.eu' },
                { label: 'Bond Beter Leefmilieu — Flemish environmental policy umbrella', url: 'https://www.bondbeterleefmilieu.be' },
                { label: 'Repair Café Belgium — nationwide repair network', url: 'https://www.repaircafe.be' },
                { label: 'ICCT (2025) — EV lifecycle emissions, EU context', url: 'https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/' },
                { label: 'Scarborough et al. (2023) — Diet and carbon footprint, Oxford', url: 'https://www.nature.com/articles/s43016-023-00795-w' },
                { label: 'EU Renewable Energy Directive (RED III, 2023) — energy communities', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L2413' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.85rem', fontWeight: 500 }}
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
