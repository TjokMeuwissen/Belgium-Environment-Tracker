'use client'

import React from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

const TOPIC_COLOR = '#8b5cf6'

const pm25Data = [
  { region: 'Wallonia', value: 4.6 },
  { region: 'Brussels', value: 7.4 },
  { region: 'Flanders', value: 8.1 },
]

export default function AirPollutionAndHumanHealth() {
  return (
    <div className="detail-page">
      <div
        className="detail-header"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}
      >
        <div className="detail-header-inner">
          <div className="detail-breadcrumb">
            <Link href="/learn">Learn</Link>
            <span> / </span>
            <Link href="/learn#air-quality">Air Quality</Link>
          </div>
          <h1>Air Pollution and Human Health</h1>
          <p className="detail-subtitle">
            Invisible but pervasive, air pollution is the leading environmental cause of illness
            and premature death in Belgium and across Europe.
          </p>
        </div>
      </div>

      <div className="detail-body">
        <nav className="detail-sidebar">
          <p className="sidebar-title">Contents</p>
          <ul>
            <li><a href="#intro">Why It Matters</a></li>
            <li><a href="#pollutants">The Key Pollutants</a></li>
            <li><a href="#size">Size in Perspective</a></li>
            <li><a href="#body">How They Enter the Body</a></li>
            <li><a href="#health">Health Impacts</a></li>
            <li><a href="#burden">Belgium\'s Burden</a></li>
            <li><a href="#vulnerable">Who Is Most at Risk?</a></li>
            <li><a href="#sources">Sources</a></li>
          </ul>
        </nav>

        <div className="detail-main">

          {/* ── INTRO ───────────────────────────────────────── */}
          <section id="intro">
            <h2>Why It Matters</h2>
            <p>
              Air pollution is invisible, largely odourless, and easy to overlook — yet it is the
              single largest environmental health risk facing Europeans today. According to the
              European Environment Agency, more than 182,000 people died prematurely across the EU
              in 2023 due to fine particulate matter alone. In Belgium, a densely populated country
              with heavy road traffic, intensive agriculture, and major port activity, the burden is
              significant.
            </p>
            <p>
              Unlike a dramatic environmental disaster, air pollution operates quietly and
              continuously. It accumulates in lung tissue over years, inflames blood vessels, and
              reaches organs well beyond the respiratory tract. Understanding which pollutants are
              involved, how they behave in the body, and what the evidence shows for Belgium is the
              starting point for informed action.
            </p>
          </section>

          {/* ── KEY POLLUTANTS ──────────────────────────────── */}
          <section id="pollutants">
            <h2>The Key Pollutants</h2>
            <p>
              Four pollutants are most relevant to human health in Belgium. They vary in origin,
              physical form, and the organs they affect most severely.
            </p>
            <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem',
                lineHeight: '1.5',
              }}>
                <thead>
                  <tr style={{ background: TOPIC_COLOR, color: '#fff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>
                      Pollutant
                    </th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Main Sources</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '0 6px 0 0' }}>
                      Key Health Concern
                    </th>
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
                      health: 'Inflames and narrows airways; aggravates asthma and COPD; a precursor to secondary particle and ozone formation',
                    },
                    {
                      name: 'Ozone (O\u2083) — ground-level',
                      sources: 'Not directly emitted; forms when sunlight reacts with NO\u2082 and volatile organic compounds',
                      health: 'Damages lung tissue on contact; paradoxically highest in rural Wallonia where traffic-related NO absorbs less ozone',
                    },
                    {
                      name: 'Black Carbon (BC)',
                      sources: 'Diesel engines, wood stoves, shipping (North Sea and Antwerp port)',
                      health: 'The most toxic component of PM2.5; carries absorbed carcinogens into lung tissue; also a potent short-lived climate forcer',
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', verticalAlign: 'top' }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '10px 14px' }}>{row.sources}</td>
                      <td style={{ padding: '10px 14px' }}>{row.health}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── SIZE IN PERSPECTIVE ─────────────────────────── */}
          <section id="size">
            <h2>Size in Perspective</h2>
            <p>
              The danger of PM2.5 is largely a function of its size. At less than 2.5 micrometres
              in diameter, fine particles are roughly 30 times smaller than a human hair and
              completely invisible to the eye. The image below illustrates how PM2.5 and PM10
              compare in scale to a red blood cell, a bacterium, and a virus.
            </p>
            <figure style={{ margin: '1.5rem 0', textAlign: 'center' }}>
              <img
                src="/images/particulate-matter.jpg"
                alt="Size comparison: PM2.5 and PM10 relative to a red blood cell, bacteria, and COVID-19 virus"
                style={{
                  width: '100%',
                  maxWidth: '860px',
                  borderRadius: '8px',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
              <figcaption style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: '#6b7280' }}>
                Comparative sizes of PM10 and PM2.5 alongside biological reference points.{' '}
                Source:{' '}
                <a
                  href="https://seetheair.org/2022/05/16/particulate-matter-pm2-5-mega-guide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: TOPIC_COLOR }}
                >
                  SeeTheAir.org
                </a>
              </figcaption>
            </figure>
            <p>
              This size difference explains why PM2.5 is far more dangerous than coarser particles.
              PM10 is largely caught in the nose and upper airways. PM2.5 bypasses these defences
              entirely and reaches the alveoli — the gas-exchange surfaces deep in the lungs. The
              very finest particles (ultrafine, below 0.1 µm) can cross into the bloodstream
              directly.
            </p>
          </section>

          {/* ── HOW THEY ENTER THE BODY ─────────────────────── */}
          <section id="body">
            <h2>How They Enter the Body</h2>
            <p>
              Inhalation is the primary exposure route, but the effects extend far beyond the lungs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              {[
                {
                  n: '1',
                  title: 'Inhalation',
                  text: 'Breathing draws particles and gases into the airways. Larger particles (PM10) are partly filtered by nasal hairs and mucus. PM2.5 and smaller particles pass through these defences entirely.',
                },
                {
                  n: '2',
                  title: 'Deep lung penetration',
                  text: 'PM2.5 reaches the alveoli — the tiny air sacs where oxygen passes into the blood. There, particles trigger inflammation and oxidative stress in surrounding lung tissue.',
                },
                {
                  n: '3',
                  title: 'Entering the bloodstream',
                  text: 'The finest particles and dissolved gases cross the alveolar membrane into the bloodstream, circulating throughout the body. This is how air pollutants reach the heart, brain, and other organs.',
                },
                {
                  n: '4',
                  title: 'Systemic inflammation',
                  text: 'Chronic exposure maintains a persistent low-grade inflammatory state. This underlying inflammation is the mechanism driving cardiovascular, metabolic, and neurological damage associated with long-term air pollution exposure.',
                },
              ].map((step) => (
                <div
                  key={step.n}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div
                    style={{
                      background: TOPIC_COLOR,
                      color: '#fff',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.3rem' }}>{step.title}</strong>
                    <p style={{ margin: 0, color: '#4b5563', fontSize: '0.92rem' }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── HEALTH IMPACTS ──────────────────────────────── */}
          <section id="health">
            <h2>Health Impacts</h2>
            <p>
              The health consequences of air pollution span multiple organ systems. Short-term
              concentration spikes cause acute episodes; long-term chronic exposure carries the
              greatest disease burden.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                margin: '1.5rem 0',
              }}
            >
              {[
                {
                  icon: '🫁',
                  title: 'Respiratory',
                  text: 'Ozone and PM2.5 irritate and damage airway lining. Long-term exposure is associated with reduced lung function, aggravated asthma and COPD, and elevated lung cancer risk. Children exposed during development can suffer lasting reductions in lung capacity.',
                },
                {
                  icon: '❤️',
                  title: 'Cardiovascular',
                  text: 'PM2.5 in the bloodstream promotes arterial plaque (atherosclerosis), raises blood pressure, and can trigger heart arrhythmias. Cardiovascular disease — including heart attack and stroke — accounts for the majority of premature deaths attributed to air pollution.',
                },
                {
                  icon: '🧠',
                  title: 'Cognitive & Neurological',
                  text: 'Emerging evidence links chronic PM2.5 and NO\u2082 exposure to accelerated cognitive decline and dementia. Children in high-pollution areas show measurable differences in brain development. The EEA has identified dementia as potentially the largest air pollution disease burden not yet fully quantified.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderTop: `4px solid ${TOPIC_COLOR}`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
                  <h3 style={{ color: TOPIC_COLOR, margin: '0 0 0.6rem', fontSize: '1rem' }}>
                    {card.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.55' }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── BELGIUM'S BURDEN ────────────────────────────── */}
          <section id="burden">
            <h2>Belgium\'s Air Quality Burden</h2>
            <p>
              Air quality in Belgium has improved substantially over the past two decades, driven
              by cleaner vehicle fleets, industrial regulation, and low emission zones in Brussels
              and Antwerp. Yet concentrations of PM2.5 and NO\u2082 remain above WHO guidelines
              across most of the country.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
                margin: '1.5rem 0',
              }}
            >
              {[
                {
                  stat: '930+',
                  label:
                    'premature deaths per year attributed to PM2.5 and NO\u2082 in the Brussels Capital Region alone',
                  source: 'Observatoire de la Sant\u00e9 et du Social de Bruxelles-Capitale',
                },
                {
                  stat: '85%+',
                  label:
                    'of the Belgian population was still exposed to NO\u2082 levels exceeding the WHO long-term guideline as recently as 2021',
                  source: 'Healthy Belgium / IRCEL-CELINE',
                },
              ].map((item) => (
                <div
                  key={item.stat}
                  style={{
                    background: '#f5f3ff',
                    border: `1px solid ${TOPIC_COLOR}33`,
                    borderLeft: `4px solid ${TOPIC_COLOR}`,
                    borderRadius: '8px',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{ fontSize: '2.2rem', fontWeight: 800, color: TOPIC_COLOR, lineHeight: 1 }}
                  >
                    {item.stat}
                  </div>
                  <p style={{ margin: '0.5rem 0 0.3rem', fontSize: '0.92rem', color: '#374151' }}>
                    {item.label}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>{item.source}</p>
                </div>
              ))}
            </div>

            <h3>PM2.5 Annual Mean by Region (2024)</h3>
            <p>
              The chart below shows the spatially averaged annual mean PM2.5 concentration for each
              Belgian region in 2024, based on IRCEL-CELINE monitoring data. All three regions
              exceed the WHO annual guideline of 5 µg/m\u00b3. Wallonia — with lower traffic and
              industrial density — sits closest to the threshold; Flanders, with its highly
              urbanised and industrialised corridor, records the highest average.
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pm25Data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="region" />
                <YAxis unit=" µg" domain={[0, 12]} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(v) => [`${v} µg/m\u00b3`, 'PM2.5 annual mean']}
                  contentStyle={{ fontSize: '0.85rem' }}
                />
                <ReferenceLine
                  y={5}
                  stroke="#ef4444"
                  strokeDasharray="5 4"
                  label={{
                    value: 'WHO guideline (5 µg/m\u00b3)',
                    position: 'insideTopRight',
                    fill: '#ef4444',
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="value" fill={TOPIC_COLOR} radius={[4, 4, 0, 0]} name="PM2.5" />
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Source: IRCEL-CELINE, 2024 preliminary assessment. Values are spatially averaged
              annual means by region; concentrations near busy roads or industrial sites are
              considerably higher.
            </p>

            <p>
              Across Belgium\'s five largest cities — Brussels, Antwerp, Ghent, Charleroi, and
              Liege — annual PM2.5 concentrations exceeded the WHO guideline consistently throughout
              2019 to 2023, with roughly half of observations recording concentrations more than
              double the threshold. Antwerp recorded the highest urban NO\u2082 levels of the five
              cities in 2019; concentrations had declined notably by 2023, with Liege recording the
              lowest urban NO\u2082 that year. Brussels has seen the steepest improvement overall —
              NO\u2082 concentrations fell by nearly 47% between 2006 and 2022, partly driven by
              its Low Emission Zone.
            </p>
          </section>

          {/* ── VULNERABLE GROUPS ───────────────────────────── */}
          <section id="vulnerable">
            <h2>Who Is Most at Risk?</h2>
            <p>
              Air pollution affects everyone, but certain groups bear a disproportionately higher
              burden.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                margin: '1.25rem 0',
              }}
            >
              {[
                {
                  title: 'Children',
                  text: 'Lungs are still developing and breathing rates are higher relative to body weight. Early exposure has lifelong consequences for lung capacity and brain development.',
                },
                {
                  title: 'Elderly people',
                  text: 'Reduced physiological reserves mean less capacity to compensate for inflammation and cardiovascular stress caused by pollution.',
                },
                {
                  title: 'Pre-existing conditions',
                  text: 'People with cardiovascular disease, diabetes, asthma, COPD, or thrombosis face significantly elevated mortality risk on high-pollution days, as confirmed by Belgian multi-city research funded by Sciensano.',
                },
                {
                  title: 'Outdoor workers',
                  text: 'Sustained physical activity outdoors — construction, cycling, agriculture — raises ventilation rate and therefore the total dose of inhaled pollutants.',
                },
                {
                  title: 'Lower-income communities',
                  text: 'Higher-traffic corridors and industrial zones are disproportionately located near lower-income neighbourhoods, creating compounding health inequities.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <strong
                    style={{ display: 'block', marginBottom: '0.4rem', color: '#111827' }}
                  >
                    {card.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SOURCES ─────────────────────────────────────── */}
          <section id="sources" className="sources-section">
            <h2>Sources</h2>
            <ul className="sources-list">
              <li>
                European Environment Agency (EEA) —{' '}
                <em>Health impacts of air pollution in Europe, 2025</em>
              </li>
              <li>
                IRCEL-CELINE —{' '}
                <em>Air quality in 2024: preliminary assessment; PM2.5 annual mean trends</em>
              </li>
              <li>
                Observatoire de la Sant\u00e9 et du Social de Bruxelles-Capitale (via City of
                Brussels)
              </li>
              <li>
                Healthy Belgium / Sciensano —{' '}
                <em>Air quality indicator sheet, 2024</em>
              </li>
              <li>
                Airscan —{' '}
                <em>
                  Air quality across major Belgian cities: a five-year comparison, 2026
                </em>
              </li>
              <li>
                Lequy et al. / Sciensano (PMC) —{' '}
                <em>
                  Impact of short-term exposure to air pollution on natural mortality in Belgium,
                  2024
                </em>
              </li>
              <li>
                SeeTheAir.org —{' '}
                <em>Particulate Matter PM2.5 mega guide, 2022</em>
              </li>
              <li>
                World Health Organization —{' '}
                <em>WHO Global Air Quality Guidelines, 2021</em>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  )
}
