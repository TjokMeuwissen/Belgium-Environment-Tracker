'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  LineChart, Line, Cell, ResponsiveContainer,
} from 'recharts';

// ── Slug map ──────────────────────────────────────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  'pm2-5-annual-mean-concentration-population-weighted': 'PM2.5 Annual Mean Concentration (population-weighted)',
  'nox-emissions-reduction-vs-2005-baseline':            'NOₓ Emissions — Reduction vs 2005 Baseline',
  'nh3-emissions-reduction-vs-2005-baseline':            'NH₃ Emissions — Reduction vs 2005 Baseline',
  'ozone-days-exceeding-120-g-m3-3-year-average':        'Ozone — Days Exceeding 120 µg/m³ (3-year average)',
};

const TOPIC_COLOR = '#8b5cf6';

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};

// ── Sidebar section defs ──────────────────────────────────────────────────────
const SECTION_DEFS: Record<string, { id: string; label: string }[]> = {
  'pm2-5-annual-mean-concentration-population-weighted': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'main-chart',     label: 'EU comparison'            },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
  'nox-emissions-reduction-vs-2005-baseline': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'main-chart',     label: 'Reduction trend'          },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
  'nh3-emissions-reduction-vs-2005-baseline': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'main-chart',     label: 'Reduction trend'          },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
  'ozone-days-exceeding-120-g-m3-3-year-average': [
    { id: 'key-figures',    label: 'Key figures'              },
    { id: 'main-chart',     label: 'Recent trend'             },
    { id: 'technical-info', label: 'Technical information'    },
    { id: 'consequences',   label: 'Consequences'             },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy'                   },
    { id: 'data-source',    label: 'Data source'              },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 1 })}${unit ? ' ' + unit : ''}`;
}

function toSentences(text: string) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z🇧"'])/).map(s => s.trim()).filter(Boolean);
}
function rewriteArrows(t: string) { return t.replace(/\s*→\s*/g, ', leading to '); }

function buildConsequenceBullets(text: string) {
  const sentences = toSentences(rewriteArrows(text));
  const pastKw = /already (faced|subject|missed)|court ruling|infringement.*\d{4}|INFR\s*\d{4}/i;
  const past: string[] = [], main: string[] = [];
  sentences.forEach(s => pastKw.test(s) ? past.push(s) : main.push(s));
  const result: { text: string; sub?: string[] }[] = main.map(t => ({ text: t }));
  if (past.length) result.push({ text: 'Previous occurrences', sub: past });
  return result;
}

function groupResponsibility(text: string) {
  const sentences = toSentences(text);
  const isFed  = (s: string) => /\bfederal\b/i.test(s) && !/region|flanders|wallonia|brussels/i.test(s);
  const isReg  = (s: string) => /region|flanders|wallonia|brussels/i.test(s) && !/\bfederal\b/i.test(s);
  const isSh   = (s: string) =>
    /shared|coordinated|both|all levels|inter-?federal/i.test(s) ||
    (/\bfederal\b/i.test(s) && /region|flanders|wallonia|brussels/i.test(s));
  const fed: string[] = [], sh: string[] = [], reg: string[] = [];
  sentences.forEach(s => isSh(s) ? sh.push(s) : isFed(s) ? fed.push(s) : isReg(s) ? reg.push(s) : sh.push(s));
  return { federal: fed, shared: sh, regional: reg };
}

// ── Shared components ─────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-info-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

function DataSourceRow({ source, url }: { source: string; url: string | null }) {
  const sources = source.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean);
  const urls    = url ? url.split(/\s*\|\s*/).map(u => u.trim()).filter(Boolean) : [];
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sources.map((s, i) => (
        <li key={i}>
          {urls[i]
            ? <a href={urls[i]} target="_blank" rel="noopener noreferrer" className="detail-link">{s} ↗</a>
            : <span style={{ fontSize: '0.88rem' }}>{s}</span>}
        </li>
      ))}
    </ul>
  );
}

function ConsequencesCard({ text }: { text: string }) {
  const bullets = buildConsequenceBullets(text);
  return (
    <div className="detail-consequences-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">⚠️</span>
        <span className="detail-section-title">Consequences if Target is Missed</span>
      </div>
      <ul className="consequences-list">
        {bullets.map((b, i) => (
          <li key={i} className="consequences-item">
            <span className="bullet-dot">•</span>
            <span>{b.text}
              {b.sub && (
                <ul className="consequences-sub-list">
                  {b.sub.map((s, j) => (
                    <li key={j} className="consequences-sub-item">
                      <span className="bullet-dot">–</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResponsibilityCard({ text }: { text: string }) {
  const primaryMatch = text.match(/^(Regional|Federal|Shared)\s*\(primary\)\.\s*/i);
  const primaryLevel = primaryMatch ? primaryMatch[1] : null;
  const cleanText    = primaryMatch ? text.slice(primaryMatch[0].length) : text;
  const { federal, shared, regional } = groupResponsibility(cleanText);
  const pc: Record<string, { bg: string; border: string; text: string }> = {
    Regional: { bg: '#f0fdf4', border: '#16a34a', text: '#14532d' },
    Federal:  { bg: '#eff6ff', border: '#2563eb', text: '#1e3a8a' },
    Shared:   { bg: '#fefce8', border: '#ca8a04', text: '#713f12' },
  };
  const pcEntry = primaryLevel ? pc[primaryLevel] ?? pc.Regional : null;
  const Section = ({ label, cls, items }: { label: string; cls: string; items: string[] }) => {
    if (!items.length) return null;
    return (
      <div className="responsibility-group">
        <span className={`responsibility-tag ${cls}`}>{label}</span>
        <ul className="responsibility-list">
          {items.map((item, i) => (
            <li key={i} className="responsibility-list-item">
              <span className="bullet-dot">•</span><span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  return (
    <div className="detail-responsibility-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">🏛️</span>
        <span className="detail-section-title">Government Responsibility</span>
      </div>
      {pcEntry && primaryLevel && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: pcEntry.bg, border: `1px solid ${pcEntry.border}`, borderRadius: 8, padding: '6px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: pcEntry.text }}>Primary responsibility</span>
          <span style={{ background: pcEntry.border, color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700 }}>{primaryLevel}</span>
        </div>
      )}
      <div className="responsibility-groups">
        <Section label="Federal"  cls="tag-federal"  items={federal}  />
        <Section label="Shared"   cls="tag-shared"   items={shared}   />
        <Section label="Regional" cls="tag-regional" items={regional} />
      </div>
    </div>
  );
}

// ── Source rows helper ────────────────────────────────────────────────────────
function SourceRows({ items }: { items: { emoji: string; title: string; text: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', lineHeight: 1.45 }}>{item.emoji} {item.title}</span>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function ImpactRows({ items }: { items: { emoji: string; title: string; text: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', lineHeight: 1.45 }}>{item.emoji} {item.title}</span>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Technical cards ───────────────────────────────────────────────────────────


// ── Belgium concentration map with regional explanation ──────────────────────
function BelgiumMap({ src, alt, caption, explanations }: {
  src: string;
  alt: string;
  caption: string;
  explanations: { region: string; level: string; color: string; reason: string }[];
}) {
  return (
    <div style={{ margin: '16px 0', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
      <strong style={{ display: 'block', marginBottom: 8 }}>Spatial distribution across Belgium</strong>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 auto', maxWidth: 280 }}>
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', display: 'block' }}
          />
          <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '5px 0 0', lineHeight: 1.4 }}>{caption}</p>
        </div>
        <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {explanations.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', background: '#fafafa', borderRadius: 6, border: `1px solid #f0f0f0`, borderLeft: `4px solid ${e.color}` }}>
              <div style={{ flexShrink: 0, minWidth: 90 }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1a1a1a' }}>{e.region}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: e.color }}>{e.level}</div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{e.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PM25TechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is PM2.5?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          PM2.5 refers to fine particulate matter — solid or liquid particles suspended in air with an aerodynamic
          diameter of 2.5 micrometres (µm) or less. These particles are about 30 times smaller than the width of a
          human hair. Their tiny size allows them to penetrate deep into the lungs and even enter the bloodstream.
          PM2.5 includes both primary particles (emitted directly) and secondary particles (formed in the atmosphere
          from chemical reactions involving NOₓ, SO₂, NH₃ and VOCs).
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>PM2.5 vs PM10 — what is the difference?</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'PM10', sub: 'Coarse particles (≤10 µm)', color: '#f97316', items: ['Visible as dust', 'Filtered mostly in nose and throat', 'Sources: construction dust, road abrasion, pollen', 'Causes upper respiratory irritation'] },
            { label: 'PM2.5', sub: 'Fine particles (≤2.5 µm)', color: TOPIC_COLOR, items: ['Invisible to the naked eye', 'Penetrates deep into lungs and bloodstream', 'Sources: combustion, industry, secondary aerosol', 'More toxic — linked to cardiovascular disease'] },
          ].map((col, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `4px solid ${col.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: col.color, marginBottom: 2 }}>{col.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8 }}>{col.sub}</div>
              {col.items.map((item, j) => (
                <div key={j} style={{ fontSize: '0.78rem', color: '#374151', marginBottom: 3 }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Main sources in Belgium</strong>
        <SourceRows items={[
          { emoji: '🪵', title: 'Residential heating', color: '#f97316', text: 'Wood and biomass burning in domestic stoves and fireplaces. The dominant source in Belgium (~33%), especially in winter. Flanders has campaigns against open-fire burning during smog episodes.' },
          { emoji: '🏭', title: 'Industry', color: '#6366f1', text: 'Combustion processes in manufacturing, metal processing and chemical industry. Contributes ~22% of primary PM2.5. Subject to industrial emission limit values under the IED.' },
          { emoji: '🌾', title: 'Agriculture', color: '#16a34a', text: 'Mainly indirect: ammonia (NH₃) from livestock and fertilisers reacts in the atmosphere to form ammonium-based secondary aerosol — one of the largest components of PM2.5 in Belgium.' },
          { emoji: '🚗', title: 'Road transport', color: '#3b82f6', text: 'Exhaust combustion (diesel engines) plus non-exhaust: tyre wear, brake dust and road abrasion. Transport contributes ~13% of PM2.5 and is the main source in urban hotspots.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Health impacts</strong>
        <ImpactRows items={[
          { emoji: '🫁', title: 'Respiratory disease', text: 'Fine particles lodge deep in the lungs, causing inflammation, reduced lung function and increased risk of asthma and COPD. Long-term exposure is linked to permanent lung damage.' },
          { emoji: '❤️', title: 'Cardiovascular disease', text: 'PM2.5 that enters the bloodstream triggers systemic inflammation, increasing risk of heart attacks, stroke and heart failure. This is the primary cause of PM2.5-related premature death.' },
          { emoji: '🧠', title: 'Neurological effects', text: 'Emerging evidence links long-term PM2.5 exposure to cognitive decline and dementia. Ultrafine particles can cross the blood-brain barrier.' },
          { emoji: '💀', title: 'Premature mortality', text: 'PM2.5 was responsible for approximately 8,000 premature deaths per year in Belgium (EEA 2020 data). Even current "safe" concentrations cause measurable life-expectancy reduction.' },
        ]} />
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 8 }}>
          The WHO 2021 guideline is 5 µg/m³ — Belgium at 8.5 µg/m³ still exceeds this by 70%, despite being well below the EU 2030 legal limit of 10 µg/m³.
        </p>
        <BelgiumMap
          src="/images/belgium_pm25_map.png"
          alt="PM2.5 annual mean concentration map of Belgium"
          caption="Source: healthybelgium.be / EEA. PM2.5 annual mean concentration (µg/m³), 2019."
          explanations={[
            { region: 'Flanders', level: 'Highest', color: '#dc2626',
              reason: 'Dense population, highest road traffic density, intensive agriculture (NH₃ → secondary aerosol) and proximity to North Sea ports and Rotterdam industrial corridor.' },
            { region: 'Brussels', level: 'High (urban)', color: '#f97316',
              reason: 'High traffic volumes in a compact area, urban wood burning in older buildings and the regional heating mix contribute to elevated concentrations.' },
            { region: 'Wallonia (cities)', level: 'Moderate', color: '#f59e0b',
              reason: 'Industrial legacy in Liège, Charleroi and Mons drives elevated PM2.5 in the Sillon Industriel corridor. Lower baseline than Flanders.' },
            { region: 'Wallonia (Ardennes)', level: 'Lowest', color: '#16a34a',
              reason: 'Sparse population, minimal industry and agriculture, dense forests that absorb some particles. Cleanest air in Belgium.' },
          ]}
        />
      </div>
    </div>
  );
}

function NOxTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is NOₓ?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          NOₓ is the collective term for nitric oxide (NO) and nitrogen dioxide (NO₂) — gases formed during high-temperature
          combustion when nitrogen in fuel or in air reacts with oxygen. NO is emitted first from combustion sources but rapidly
          oxidises to NO₂ in the atmosphere. NO₂ is directly toxic, and NOₓ as a whole is a key precursor to ground-level
          ozone and secondary PM2.5. Belgium historically struggled with NOₓ compliance, exceeding its NEC ceiling from 2010
          to 2016 before achieving the 2020–2029 reduction target.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Main sources in Belgium</strong>
        <SourceRows items={[
          { emoji: '🚗', title: 'Road transport (~47%)', color: '#3b82f6', text: 'Predominantly diesel vehicles — diesel passenger cars and freight trucks account for over 90% of transport NOₓ. Low Emission Zones in Brussels, Antwerp and Ghent target the most polluting vehicles.' },
          { emoji: '⚡', title: 'Energy industries (~18%)', color: '#f59e0b', text: 'Power generation and petroleum refining. Covered partly by EU ETS. Belgium\'s shift from coal to gas and renewables has significantly reduced this sector\'s NOₓ output.' },
          { emoji: '🏭', title: 'Industry (~18%)', color: '#6366f1', text: 'Manufacturing combustion processes, cement production and chemical industry. Subject to industrial emission standards under the Industrial Emissions Directive (IED).' },
          { emoji: '🚜', title: 'Non-road machinery (~12%)', color: '#f97316', text: 'Agricultural tractors, construction equipment, inland waterway vessels and railway locomotives. Regulated by the Non-Road Mobile Machinery (NRMM) Regulation.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Health and environmental impacts</strong>
        <ImpactRows items={[
          { emoji: '🫁', title: 'Respiratory inflammation', text: 'NO₂ causes airway inflammation and increases susceptibility to respiratory infections. Particularly harmful for children and people with asthma. WHO guideline: 10 µg/m³ (annual mean).' },
          { emoji: '☁️', title: 'Ozone formation', text: 'NOₓ + VOCs + sunlight → ground-level ozone. This secondary pollutant damages crops, forests and human health — amplifying the impact of NOₓ well beyond direct NO₂ exposure.' },
          { emoji: '🌧️', title: 'Acid rain & acidification', text: 'NOₓ dissolves in rainwater to form nitric acid (HNO₃), which acidifies soils and freshwater bodies, damaging forests and killing freshwater organisms.' },
          { emoji: '🌿', title: 'Eutrophication', text: 'Nitrogen deposition from NOₓ enriches soils and water bodies with nutrients, favouring fast-growing species and displacing specialised biodiversity in heathlands, dunes and wetlands.' },
        ]} />
        <BelgiumMap
          src="/images/belgium_no2_map.png"
          alt="NO₂ annual mean concentration map of Belgium"
          caption="Source: healthybelgium.be / EEA. NO₂ annual mean concentration (µg/m³), 2019."
          explanations={[
            { region: 'Brussels', level: 'Highest', color: '#dc2626',
              reason: 'Highest traffic density in Belgium in the smallest area. The ring road (R0) and inbound motorways create intense NO₂ hotspots. Still had 1 monitoring station above 2030 limit in 2023.' },
            { region: 'Antwerp / E313 corridor', level: 'Very high', color: '#f97316',
              reason: 'Port of Antwerp (shipping emissions), heavy freight traffic on motorways, and the petrochemical industrial zone contribute to some of Belgium&#39;s worst NO₂ levels.' },
            { region: 'Flanders (general)', level: 'Elevated', color: '#f59e0b',
              reason: 'Dense motorway network (E40, E17, E19) and high car dependency. Belgium has one of the EU&#39;s highest rates of diesel car ownership, amplifying road-transport NOₓ.' },
            { region: 'Wallonia (Ardennes)', level: 'Lowest', color: '#16a34a',
              reason: 'Lower traffic volumes and population density. Rural and forested areas naturally have very low NO₂ — often below WHO guideline (10 µg/m³).' },
          ]}
        />
      </div>
    </div>
  );
}

function NH3TechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is NH₃?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          Ammonia (NH₃) is a colourless gas with a pungent smell, formed mainly during the decomposition of nitrogen-containing
          organic matter. In Belgium, agriculture accounts for over 90% of total NH₃ emissions — livestock manure and synthetic
          fertiliser application are the overwhelmingly dominant sources. Although ammonia itself is not classified as a
          direct greenhouse gas, it contributes to PM2.5 formation as a secondary aerosol precursor (reacting with
          NO₂ and SO₂ to form ammonium nitrate and ammonium sulphate particles), and to nitrogen deposition
          which drives biodiversity loss across sensitive ecosystems in Belgium.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Main sources in Belgium</strong>
        <SourceRows items={[
          { emoji: '🐄', title: 'Livestock manure (~65%)', color: '#16a34a', text: 'Cattle, pig and poultry manure releases NH₃ during storage and field application. Flanders has among the EU\'s highest livestock densities, creating intense localised NH₃ pressure.' },
          { emoji: '🌱', title: 'Mineral fertilisers (~25%)', color: '#22c55e', text: 'Synthetic nitrogen fertilisers (urea, ammonium nitrate) volatilise NH₃ after application, especially in warm, dry conditions. Accounts for roughly a quarter of agricultural NH₃.' },
          { emoji: '🚗', title: 'Road transport (~5%)', color: '#3b82f6', text: 'Catalytic converters in petrol and diesel vehicles emit small amounts of NH₃ as a by-product of NOₓ reduction chemistry. A growing source as modern three-way catalysts become more widespread.' },
          { emoji: '🏭', title: 'Industry & other (~3%)', color: '#94a3b8', text: 'Industrial processes (refrigeration, chemical production) and waste treatment contribute minor amounts of NH₃ emissions.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Health and environmental impacts</strong>
        <ImpactRows items={[
          { emoji: '🫁', title: 'Secondary PM2.5', text: 'NH₃ reacts with NOₓ and SO₂ in the atmosphere to form ammonium salts — fine particles that are a major component of Belgium\'s background PM2.5. Up to 30% of Belgian PM2.5 is estimated to be secondary aerosol from NH₃.' },
          { emoji: '🌿', title: 'Nitrogen deposition', text: 'NH₃ is deposited directly onto soils and vegetation. Sensitive habitats — heathland, dunes, oligotrophic wetlands — are overwhelmed by nitrogen, causing a shift to fast-growing grasses and loss of specialist species. Over 80% of Belgian Natura 2000 sites exceed their critical nitrogen load.' },
          { emoji: '💧', title: 'Acidification', text: 'After deposition, NH₃ converts to ammonium and then nitrate through nitrification, releasing H⁺ ions and acidifying soils — damaging tree roots and leaching base cations (Ca²⁺, Mg²⁺).' },
          { emoji: '🐟', title: 'Aquatic toxicity', text: 'High concentrations of dissolved ammonia in water (from run-off or direct deposition) are directly toxic to fish and aquatic invertebrates, particularly in low-pH waters where un-ionised NH₃ dominates.' },
        ]} />
      </div>
    </div>
  );
}

function OzoneTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is ground-level ozone?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          Ozone (O₃) consists of three oxygen atoms bonded together. In the upper atmosphere (stratosphere) it forms the
          protective ozone layer that shields life from UV radiation. Ground-level or tropospheric ozone is entirely
          different: it is not emitted directly but formed by photochemical reactions between nitrogen oxides (NOₓ) and
          volatile organic compounds (VOCs) in the presence of sunlight. Paradoxically, O₃ concentrations are often
          <em> lower</em> in city centres (where NO from traffic scavenges it) and <em>higher</em> in downwind rural
          areas — which is why the Belgian countryside regularly experiences higher ozone levels than Brussels or Antwerp.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginBottom: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Main precursor sources</strong>
        <SourceRows items={[
          { emoji: '🚗', title: 'Road transport', color: '#3b82f6', text: 'The dominant source of NOₓ, the key ozone precursor. Diesel engines, in particular, emit large quantities of NO and VOCs in exhaust. Also the main source of many reactive VOC species.' },
          { emoji: '🏭', title: 'Industry & energy', color: '#6366f1', text: 'Power generation and manufacturing emit both NOₓ and VOCs (solvents, process gases). Together with transport, these sectors drive the bulk of Belgium\'s ozone-precursor burden.' },
          { emoji: '🌱', title: 'Vegetation (biogenic VOCs)', color: '#16a34a', text: 'Forests and crops emit isoprene and terpenes — biogenic VOCs that contribute to ozone formation especially in warm conditions. Belgium\'s Ardennes forests are a notable biogenic source.' },
          { emoji: '🌡️', title: 'Heatwaves (climate driver)', color: '#f97316', text: 'Higher temperatures accelerate ozone chemistry and increase biogenic VOC emissions. Belgium\'s ozone exceedance days are concentrated in heatwave episodes, which are becoming more frequent.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Health and environmental impacts</strong>
        <ImpactRows items={[
          { emoji: '🫁', title: 'Lung inflammation', text: 'Ground-level ozone is a powerful oxidant that inflames airways, reduces lung function and aggravates asthma. Short-term peaks (during heatwaves) cause measurable respiratory hospital admissions.' },
          { emoji: '💀', title: 'Premature mortality', text: 'Chronic ozone exposure causes approximately 1,000 premature deaths per year in Belgium (EEA). The trend is worsening due to climate change, despite reductions in NOₓ emissions.' },
          { emoji: '🌾', title: 'Crop damage', text: 'Ozone is absorbed by plant stomata, damaging chloroplasts and reducing photosynthesis. EU-wide, ozone costs >€1 billion/year in agricultural yield losses (wheat, soybean, potato).' },
          { emoji: '🌲', title: 'Forest damage', text: 'Chronic ozone exposure weakens trees, reducing growth rates and increasing vulnerability to pests, drought and disease. Belgian Ardennes forests show measurable ozone injury on sensitive species.' },
        ]} />
        <BelgiumMap
          src="/images/belgium_ozone_map.png"
          alt="Ozone concentration map of Belgium"
          caption="Source: healthybelgium.be / EEA. Ozone mean concentration (µg/m³), 2019."
          explanations={[
            { region: 'Ardennes & rural south', level: 'Highest', color: '#dc2626',
              reason: 'O₃ forms downwind of urban/industrial sources and accumulates in rural areas. The Ardennes receive transported ozone from the Rhine-Ruhr industrial complex and from Belgian cities, combined with biogenic VOC emissions from forests.' },
            { region: 'Wallonia (open areas)', level: 'High', color: '#f97316',
              reason: 'Agricultural plains and river valleys away from cities experience mid-to-high ozone. Lower NO levels mean less scavenging — O₃ persists longer than in urban air.' },
            { region: 'Flanders (suburban)', level: 'Moderate', color: '#f59e0b',
              reason: 'Moderate ozone, lower than south but higher than city centres. The balance between precursor emissions and NO scavenging creates a transition zone.' },
            { region: 'Brussels / city centres', level: 'Lowest', color: '#16a34a',
              reason: 'Paradoxically the lowest O₃ values: high NO concentrations from traffic scavenge ozone (O₃ + NO → NO₂ + O₂), keeping ground-level concentrations low at the source.' },
          ]}
        />
      </div>
    </div>
  );
}

// ── Chart data (hardcoded from EEA/IRCEL public data) ────────────────────────

// PM2.5: EU country comparison 2022 (EEA Air Quality report)
const PM25_EU = [
  { country: 'Finland',     value: 4.8, fill: '#bfdbfe' },
  { country: 'Sweden',      value: 5.2, fill: '#bfdbfe' },
  { country: 'Iceland',     value: 5.5, fill: '#bfdbfe' },
  { country: 'Ireland',     value: 6.1, fill: '#bfdbfe' },
  { country: 'Portugal',    value: 6.8, fill: '#bfdbfe' },
  { country: 'Luxembourg',  value: 7.4, fill: '#bfdbfe' },
  { country: 'Netherlands', value: 8.1, fill: '#bfdbfe' },
  { country: 'Belgium',     value: 8.5, fill: TOPIC_COLOR },
  { country: 'Germany',     value: 9.8, fill: '#bfdbfe' },
  { country: 'France',      value: 10.2, fill: '#bfdbfe' },
  { country: 'EU average',  value: 11.0, fill: '#94a3b8' },
  { country: 'Czechia',     value: 14.8, fill: '#bfdbfe' },
  { country: 'Poland',      value: 19.4, fill: '#bfdbfe' },
];

// NOx reduction trend (Belgium, key years from IRCEL/indicators.be)
const NOX_TREND = [
  { year: '2005', value: 0   },
  { year: '2008', value: 9   },
  { year: '2010', value: 16  },
  { year: '2012', value: 21  },
  { year: '2015', value: 29  },
  { year: '2018', value: 39  },
  { year: '2020', value: 47  },
  { year: '2021', value: 49  },
  { year: '2022', value: 51  },
];

// NH3 reduction trend (Belgium, from IRCEL NEC reporting)
const NH3_TREND = [
  { year: '2005', value: 0   },
  { year: '2008', value: 3   },
  { year: '2010', value: 5   },
  { year: '2012', value: 8   },
  { year: '2015', value: 12  },
  { year: '2018', value: 18  },
  { year: '2020', value: 21  },
  { year: '2021', value: 22  },
  { year: '2022', value: 24  },
];

// Ozone exceedance days trend (Belgium, 3-year running average, IRCEL)
const OZONE_TREND = [
  { year: '2015', value: 14 },
  { year: '2016', value: 12 },
  { year: '2017', value: 14 },
  { year: '2018', value: 22 },
  { year: '2019', value: 19 },
  { year: '2020', value: 15 },
  { year: '2021', value: 14 },
  { year: '2022', value: 17 },
  { year: '2023', value: 18 },
];

// ── Chart blocks ──────────────────────────────────────────────────────────────
function PM25Chart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">PM2.5 — Belgium vs EU member states (2022, µg/m³)</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={PM25_EU} layout="vertical" margin={{ top: 4, right: 50, left: 10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
            tickFormatter={v => `${v}`} domain={[0, 22]} />
          <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={90} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any) => [`${v} µg/m³`, 'PM2.5']} />
          <ReferenceLine x={10} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 EU 2030: 10', position: 'insideTopRight', fontSize: 10, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <ReferenceLine x={5} stroke="#dc2626" strokeDasharray="4 3" strokeWidth={1.4}
            label={{ value: 'WHO: 5', position: 'insideTopLeft', fontSize: 10, fill: '#dc2626', fontWeight: 600 }} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]}>
            {PM25_EU.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: EEA Air Quality in Europe 2023 report. EU 2030 target = Directive 2024/2881. WHO guideline = 5 µg/m³ (2021).</p>
    </div>
  );
}

function NOxChart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">NOₓ emission reduction vs 2005 baseline — Belgium (%)</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={NOX_TREND} margin={{ top: 8, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36}
            domain={[0, 65]} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any) => [`${v}%`, 'Reduction vs 2005']} />
          <ReferenceLine y={41} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
            label={{ value: '2020–2029 target: −41%', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b', fontWeight: 600 }} />
          <ReferenceLine y={59} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 2030 target: −59%', position: 'insideTopRight', fontSize: 10, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: IRCEL/CELINE NEC Directive reporting; indicators.be. 2005 baseline: ~322 kt NO₂ eq. 2022: ~132 kt.</p>
    </div>
  );
}

function NH3Chart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">NH₃ emission reduction vs 2005 baseline — Belgium (%)</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={NH3_TREND} margin={{ top: 8, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36}
            domain={[0, 30]} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any) => [`${v}%`, 'Reduction vs 2005']} />
          <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
            label={{ value: '2020–2029 target: −5%', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b', fontWeight: 600 }} />
          <ReferenceLine y={24} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 2030 target: −24%', position: 'insideTopRight', fontSize: 10, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: IRCEL/CELINE NEC Directive reporting. Belgium achieved 2030 target (−24%) already in 2022.</p>
    </div>
  );
}

function OzoneChart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Ozone — days exceeding 120 µg/m³ — Belgium (3-year rolling average)</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={OZONE_TREND} margin={{ top: 8, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={30}
            domain={[0, 30]} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
            formatter={(v: any) => [`${v} days/yr`, 'Exceedance days (3yr avg)']} />
          <ReferenceLine y={25} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
            label={{ value: '🎯 Target: ≤25 days', position: 'insideTopRight', fontSize: 10, fill: TOPIC_COLOR, fontWeight: 600 }} />
          <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">
        Source: IRCEL-CELINE ozone monitoring network. ⚠️ Despite being on track, the 2018 heatwave spike (22 days) and the
        upward trend since 2020 reflect that climate change is increasing ozone risk even as NOₓ emissions fall.
      </p>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function AirSidebar({ slug }: { slug: string }) {
  const [active, setActive] = useState('key-figures');
  const sections = SECTION_DEFS[slug] ?? [];

  useEffect(() => {
    if (!sections.length) return;
    // Scroll listener: activate the section whose top is closest above the
    // top-quarter of the viewport (more responsive than a fixed 120px offset)
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.25;
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= threshold) {
          setActive(s.id);
          return;
        }
      }
      setActive(sections[0]?.id ?? '');
    };
    handleScroll(); // set correct active item on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  };

  return (
    <div className="detail-sidebar" style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
      <div className="detail-sidebar-title">On this page</div>
      {sections.map(s => (
        <button key={s.id} className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}>{s.label}</button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AirQualityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="loading">Loading…</div>;

  const indicatorName = SLUG_MAP[slug];
  if (!indicatorName) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p style={{ color: '#6b6b6b', marginBottom: 16 }}>Indicator not found.</p>
      <Link href="/indicators?topic=air_quality" style={{ color: TOPIC_COLOR, fontWeight: 600 }}>← Back to overview</Link>
    </div>
  );

  const ind = data.topics.air_quality?.indicators?.find((i: any) => i.indicator === indicatorName);
  const sc  = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  const chartNode: Record<string, React.ReactNode> = {
    'pm2-5-annual-mean-concentration-population-weighted': <PM25Chart />,
    'nox-emissions-reduction-vs-2005-baseline':            <NOxChart />,
    'nh3-emissions-reduction-vs-2005-baseline':            <NH3Chart />,
    'ozone-days-exceeding-120-g-m3-3-year-average':        <OzoneChart />,
  };

  const technicalNode: Record<string, React.ReactNode> = {
    'pm2-5-annual-mean-concentration-population-weighted': <PM25TechnicalCard />,
    'nox-emissions-reduction-vs-2005-baseline':            <NOxTechnicalCard />,
    'nh3-emissions-reduction-vs-2005-baseline':            <NH3TechnicalCard />,
    'ozone-days-exceeding-120-g-m3-3-year-average':        <OzoneTechnicalCard />,
  };

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/indicators?topic=air_quality" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Air Quality</p>
          <h1 className="detail-title">{indicatorName}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge" style={{ color: sc.color, background: sc.bg, padding: '5px 14px' }}>{sc.label}</span>
            {ind?.trend && (
              <span style={{ color: '#b0b0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                {ind.trend === 'Improving' ? '↑' : ind.trend === 'Worsening' ? '↓' : '→'} {ind.trend}
              </span>
            )}
          </div>
          {ind?.description && (
            <p style={{ color: '#d1d5db', fontSize: '0.95rem', marginTop: 14, maxWidth: 680, lineHeight: 1.6 }}>
              {ind.description}
            </p>
          )}
        </div>
      </div>

      <div className="detail-body">
        <AirSidebar slug={slug} />
        <div className="detail-main">
          <div id="key-figures" className="detail-figures">
            <div className="figure-card">
              <div className="figure-label">Latest value</div>
              <div className="figure-number">{fmt(ind?.latest_value, ind?.unit)}</div>
              <div className="figure-year">{ind?.latest_value_year}</div>
            </div>
            {ind?.target_value != null && (
              <div className="figure-card">
                <div className="figure-label">Target</div>
                <div className="figure-number">{fmt(ind?.target_value, ind?.unit)}</div>
                <div className="figure-year">by {ind?.target_year}</div>
              </div>
            )}
            {ind?.target_context && (
              <div className="figure-card figure-card-wide">
                <div className="figure-label">Target context</div>
                <div className="figure-text">{ind.target_context}</div>
              </div>
            )}
          </div>

          <div id="main-chart" className="detail-charts">{chartNode[slug]}</div>

          <div className="detail-info">
            <div id="technical-info">{technicalNode[slug]}</div>
            <div id="consequences">{ind?.consequences && <ConsequencesCard text={ind.consequences} />}</div>
            <div id="responsibility">{ind?.responsible && <ResponsibilityCard text={ind.responsible} />}</div>
            <div id="policy">{ind?.policy && (
              <InfoRow label="Policy / Legal basis">
                <DataSourceRow source={ind.policy} url={ind.policy_url ?? null} />
              </InfoRow>
            )}</div>
            <div id="data-source">{ind?.data_source && (
              <InfoRow label="Data source">
                <DataSourceRow source={ind.data_source} url={ind.data_source_url ?? null} />
              </InfoRow>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
