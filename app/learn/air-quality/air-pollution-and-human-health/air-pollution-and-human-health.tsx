'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';

const TOPIC_COLOR = '#8b5cf6';

const SECTIONS = [
  { id: 'intro',       label: 'Why it matters'          },
  { id: 'pollutants',  label: 'The key pollutants'      },
  { id: 'size',        label: 'Size in perspective'     },
  { id: 'body',        label: 'How they enter the body' },
  { id: 'health',      label: 'Health impacts'          },
  { id: 'burden',      label: "Belgium's burden"        },
  { id: 'vulnerable',  label: 'Who is most at risk?'    },
  { id: 'sources',     label: 'Sources'                 },
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

// ── Key figures ───────────────────────────────────────────────────────────────

function KeyFigures() {
  const figs = [
    {
      value: '182,000',
      label: 'premature deaths in the EU',
      sub: 'Attributed to PM2.5 in 2023 — down 57% from 2005 (EEA, 2025)',
      color: TOPIC_COLOR,
    },
    {
      value: '930+',
      label: 'premature deaths per year',
      sub: 'Attributed to PM2.5 and NO\u2082 in the Brussels Capital Region alone',
      color: '#ef4444',
    },
    {
      value: '85%+',
      label: 'of Belgians',
      sub: 'Still exposed to NO\u2082 levels above the WHO long-term guideline as recently as 2021',
      color: '#f59e0b',
    },
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

// ── Body pathway diagram ──────────────────────────────────────────────────────

function BodyPathway() {
  const steps = [
    { n: '1', title: 'Inhalation', icon: '👃', text: 'Breathing draws particles and gases into the airways. Larger particles (PM10) are partly filtered by nasal hairs and mucus. PM2.5 and smaller pass through these defences entirely.' },
    { n: '2', title: 'Deep lung penetration', icon: '🫁', text: 'PM2.5 reaches the alveoli — the tiny air sacs where oxygen crosses into the blood. There, particles trigger inflammation and oxidative stress in the surrounding tissue.' },
    { n: '3', title: 'Entering the bloodstream', icon: '🩸', text: 'The finest particles and dissolved gases cross the alveolar membrane directly into circulation, reaching the heart, brain, and other organs far from the lungs.' },
    { n: '4', title: 'Systemic inflammation', icon: '🔥', text: 'Chronic exposure maintains a persistent low-grade inflammatory state throughout the body — the underlying mechanism driving cardiovascular, metabolic, and neurological damage.' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ background: TOPIC_COLOR, color: '#fff', borderRadius: '50%', width: 30, height: 30, minWidth: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>{step.n}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a1a', marginBottom: 4 }}>{step.icon} {step.title}</div>
            <div style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.6 }}>{step.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PM2.5 regional chart ──────────────────────────────────────────────────────

const pm25Data = [
  { region: 'Wallonia', value: 4.6 },
  { region: 'Brussels', value: 7.4 },
  { region: 'Flanders', value: 8.1 },
];

function RegionalChart() {
  return (
    <>
      <Para>
        The chart below shows spatially averaged annual mean PM2.5 concentrations by Belgian region in 2024,
        based on IRCEL-CELINE monitoring data. All three regions exceed the WHO annual guideline of 5 &micro;g/m&sup3;.
        Wallonia &mdash; with lower traffic and industrial density &mdash; sits closest to the threshold; Flanders,
        with its highly urbanised corridor, records the highest average.
      </Para>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={pm25Data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="region" tick={{ fontSize: 13 }} />
          <YAxis unit=" µg" domain={[0, 12]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v} µg/m³`, 'PM2.5 annual mean']} contentStyle={{ fontSize: '0.85rem' }} />
          <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 4" label={{ value: 'WHO guideline (5 µg/m³)', position: 'insideTopRight', fill: '#ef4444', fontSize: 11 }} />
          <Bar dataKey="value" fill={TOPIC_COLOR} radius={[4, 4, 0, 0]} name="PM2.5" />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 6 }}>
        Source: IRCEL-CELINE, 2024 preliminary assessment. Spatially averaged annual means by region;
        concentrations near busy roads or industrial sites are considerably higher.
      </p>
    </>
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

export default function AirPollutionAndHumanHealth() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F32C;&#xFE0F;  Air Quality</p>
            <h1 className="detail-title">Air Pollution and Human Health</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/air-pollution.jpg" alt="Air Pollution" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Why it matters */}
          <SectionCard id="intro">
            <SectionTitle>Why it matters</SectionTitle>
            <Para>
              Air pollution is invisible, largely odourless, and easy to overlook &mdash; yet it is the single largest
              environmental health risk facing Europeans today. According to the European Environment Agency, more than
              182,000 people died prematurely across the EU in 2023 due to fine particulate matter alone, and
              air pollution remains the top environmental cause of disease ahead of noise, chemicals, and heatwaves.
            </Para>
            <Para>
              In Belgium &mdash; a densely populated country with heavy road traffic, intensive agriculture, and major
              port activity &mdash; the burden is significant. Unlike a dramatic environmental disaster, air pollution
              operates quietly and continuously. It accumulates in lung tissue over years, inflames blood vessels, and
              reaches organs well beyond the respiratory tract. Understanding which pollutants are involved, how they
              behave in the body, and what the evidence shows for Belgium is the starting point for informed action.
            </Para>
          </SectionCard>

          {/* 2 — Key pollutants */}
          <SectionCard id="pollutants">
            <SectionTitle>The key pollutants</SectionTitle>
            <Para>
              Four pollutants are most relevant to human health in Belgium. They vary in origin, physical form,
              and the organs they affect most severely.
            </Para>
            <div style={{ overflowX: 'auto', margin: '12px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', lineHeight: 1.55 }}>
                <thead>
                  <tr style={{ background: TOPIC_COLOR, color: '#fff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Pollutant</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Main sources</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '0 6px 0 0' }}>Key health concern</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: 'PM2.5 — fine particulate matter (<2.5 µm)',
                      sources: 'Wood burning, diesel engines, secondary formation from NH\u2083 and NO\u2082, heavy industry',
                      health: 'Penetrates deep into lung tissue; enters the bloodstream; strongly linked to cardiovascular disease, lung cancer, and cognitive decline',
                    },
                    {
                      name: 'NO\u2082 — nitrogen dioxide',
                      sources: 'Road traffic (especially diesel), heating boilers, industry',
                      health: 'Inflames and narrows airways; aggravates asthma and COPD; precursor to secondary particle and ozone formation',
                    },
                    {
                      name: 'Ozone (O\u2083) — ground-level',
                      sources: 'Not directly emitted; forms when sunlight reacts with NO\u2082 and volatile organic compounds',
                      health: 'Damages lung tissue on contact; paradoxically highest in rural Wallonia where less traffic-related NO is available to break it down',
                    },
                    {
                      name: 'Black Carbon (BC)',
                      sources: 'Diesel engines, wood stoves, North Sea shipping and Antwerp port',
                      health: 'Most toxic component of PM2.5; carries absorbed carcinogens into lung tissue; also a potent short-lived climate forcer',
                    },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', verticalAlign: 'top' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1a1a1a' }}>{row.name}</td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>{row.sources}</td>
                      <td style={{ padding: '10px 14px', color: '#374151' }}>{row.health}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* 3 — Size in perspective */}
          <SectionCard id="size">
            <SectionTitle>Size in perspective</SectionTitle>
            <Para>
              The danger of PM2.5 is largely a function of its size. At less than 2.5 micrometres in diameter,
              fine particles are roughly 30 times smaller than a human hair and completely invisible to the naked eye.
              The image below illustrates how PM2.5 and PM10 compare in scale to a red blood cell, a bacterium,
              and a virus.
            </Para>
            <figure style={{ margin: '12px 0 16px', textAlign: 'center' }}>
              <img
                src="/images/learn/particulate-matter.jpg"
                alt="Size comparison of PM2.5 and PM10 relative to a red blood cell, bacteria, and COVID-19 virus"
                style={{ width: '100%', maxWidth: 820, borderRadius: 8, display: 'block', margin: '0 auto' }}
              />
              <figcaption style={{ marginTop: 8, fontSize: '0.78rem', color: '#9ca3af' }}>
                Comparative sizes of PM10 and PM2.5 alongside biological reference points. Source:{' '}
                <a href="https://seetheair.org/2022/05/16/particulate-matter-pm2-5-mega-guide/" target="_blank" rel="noopener noreferrer" style={{ color: TOPIC_COLOR }}>SeeTheAir.org</a>
              </figcaption>
            </figure>
            <Para>
              This size difference explains why PM2.5 is far more dangerous than coarser particles. PM10 is largely
              caught in the nose and upper airways. PM2.5 bypasses these defences entirely and reaches the alveoli &mdash;
              the gas-exchange surfaces deep in the lungs. The very finest particles (ultrafine, below 0.1 &micro;m) can
              cross directly into the bloodstream.
            </Para>
          </SectionCard>

          {/* 4 — How they enter the body */}
          <SectionCard id="body">
            <SectionTitle>How they enter the body</SectionTitle>
            <Para>
              Inhalation is the primary exposure route, but the effects extend far beyond the lungs.
              Pollutants travel a pathway from the air to virtually every organ system.
            </Para>
            <BodyPathway />
          </SectionCard>

          {/* 5 — Health impacts */}
          <SectionCard id="health">
            <SectionTitle>Health impacts</SectionTitle>
            <Para>
              The health consequences of air pollution span multiple organ systems. Short-term concentration
              spikes cause acute episodes; long-term chronic exposure carries the greatest disease burden.
            </Para>
            <BulletList items={[
              {
                bold: 'Respiratory',
                text: 'Ozone and PM2.5 irritate and damage airway lining. Long-term exposure is associated with reduced lung function, aggravated asthma and COPD, and elevated lung cancer risk. Children exposed during development can suffer lasting reductions in lung capacity.',
              },
              {
                bold: 'Cardiovascular',
                text: 'PM2.5 in the bloodstream promotes arterial plaque (atherosclerosis), raises blood pressure, and can trigger heart arrhythmias. Cardiovascular disease \u2014 including heart attack and stroke \u2014 accounts for the majority of premature deaths attributed to air pollution.',
              },
              {
                bold: 'Cognitive and neurological',
                text: 'Emerging evidence links chronic PM2.5 and NO\u2082 exposure to accelerated cognitive decline and dementia. Children in high-pollution areas show measurable differences in brain development. The EEA has identified dementia as potentially the largest air pollution disease burden not yet fully quantified.',
              },
              {
                bold: 'Metabolic',
                text: 'Air pollution exposure is increasingly associated with insulin resistance, type 2 diabetes, and metabolic syndrome, likely through the same systemic inflammation pathways.',
              },
            ]} />
          </SectionCard>

          {/* 6 — Belgium's burden */}
          <SectionCard id="burden">
            <SectionTitle>Belgium&apos;s burden</SectionTitle>
            <Para>
              Air quality in Belgium has improved substantially over the past two decades, driven by cleaner vehicle
              fleets, industrial regulation, and low emission zones in Brussels and Antwerp. Yet concentrations of
              PM2.5 and NO&#x2082; remain above WHO guidelines across most of the country.
            </Para>
            <RegionalChart />
            <Para style={{ marginTop: 16 }}>
              Across Belgium&apos;s five largest cities &mdash; Brussels, Antwerp, Ghent, Charleroi, and
              Li&egrave;ge &mdash; annual PM2.5 concentrations exceeded the WHO guideline consistently throughout 2019
              to 2023, with roughly half of observations recording concentrations more than double the threshold.
              Antwerp recorded the highest urban NO&#x2082; levels of the five cities in 2019; concentrations had
              declined notably by 2023, with Li&egrave;ge recording the lowest urban NO&#x2082; that year.
              Brussels has seen the steepest improvement overall &mdash; NO&#x2082; concentrations fell by nearly 47%
              between 2006 and 2022, partly driven by its Low Emission Zone.
            </Para>
          </SectionCard>

          {/* 7 — Vulnerable groups */}
          <SectionCard id="vulnerable">
            <SectionTitle>Who is most at risk?</SectionTitle>
            <Para>
              Air pollution affects everyone, but certain groups bear a disproportionately higher burden.
            </Para>
            <BulletList items={[
              {
                bold: 'Children',
                text: 'Lungs are still developing and breathing rates are higher relative to body weight. Early exposure has lifelong consequences for lung capacity and brain development.',
              },
              {
                bold: 'Elderly people',
                text: 'Reduced physiological reserves mean less capacity to compensate for the inflammation and cardiovascular stress caused by pollution.',
              },
              {
                bold: 'People with pre-existing conditions',
                text: 'Those with cardiovascular disease, diabetes, asthma, COPD, or thrombosis face significantly elevated mortality risk on high-pollution days, as confirmed by Belgian multi-city research funded by Sciensano.',
              },
              {
                bold: 'Outdoor workers',
                text: 'Sustained physical activity outdoors \u2014 construction, cycling, agriculture \u2014 raises ventilation rate and therefore the total dose of inhaled pollutants.',
              },
              {
                bold: 'Lower-income communities',
                text: 'Higher-traffic corridors and industrial zones are disproportionately located near lower-income neighbourhoods, creating compounding health and social inequities.',
              },
            ]} />
          </SectionCard>

          {/* 8 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'EEA \u2014 Health impacts of air pollution in Europe, 2025',          url: 'https://www.eea.europa.eu/en/newsroom/news/air-quality-improving-but-just-over-180-000-deaths-still-attributable-to-air-pollution-in-eu' },
                { label: 'IRCEL-CELINE \u2014 Air quality in 2024: preliminary assessment',     url: 'https://www.irceline.be/en/news/air-quality-in-2024-preliminary-assessment' },
                { label: 'IRCEL-CELINE \u2014 PM2.5 annual mean trends',                        url: 'https://www.irceline.be/en/air-quality/measurements/particulate-matter/history/trends/pm2-5-annual-mean-1' },
                { label: 'City of Brussels \u2014 Air quality & premature deaths',              url: 'https://www.brussels.be/air-quality' },
                { label: 'Healthy Belgium / Sciensano \u2014 Air quality indicator sheet, 2024', url: 'https://www.healthybelgium.be/en/health-status/determinants-of-health/air-quality' },
                { label: 'Airscan \u2014 Air quality across major Belgian cities, 2026',         url: 'https://airscan.org/insights/outdoor-monitoring/air-quality-across-major-belgian-cities-a-five-year-comparison/' },
                { label: 'Sciensano (PMC) \u2014 Short-term exposure to air pollution & mortality in Belgium, 2024', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10809644/' },
                { label: 'SeeTheAir.org \u2014 Particulate Matter PM2.5 mega guide, 2022',      url: 'https://seetheair.org/2022/05/16/particulate-matter-pm2-5-mega-guide/' },
                { label: 'WHO \u2014 Global Air Quality Guidelines, 2021',                       url: 'https://www.who.int/publications/i/item/9789240034228' },
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
