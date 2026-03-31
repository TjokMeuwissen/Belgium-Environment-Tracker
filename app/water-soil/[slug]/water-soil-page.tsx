'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Cell, ResponsiveContainer,
} from 'recharts';

// ── Slug map ──────────────────────────────────────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  'nitrate-pollution-groundwater-stations-exceeding-50-mg-l': 'Nitrate Pollution — Groundwater Stations Exceeding 50 mg/L',
  'phosphate-pollution-rivers-exceeding-good-status-threshold': 'Phosphate Pollution — Rivers Exceeding Good Status Threshold',
  'groundwater-in-good-chemical-status': 'Groundwater in Good Chemical Status',
  'drinking-water-quality-compliance': 'Drinking Water Quality Compliance',
  'soil-sealing-rate': 'Soil Sealing Rate',
  'surface-waters-in-good-ecological-status': 'Surface Waters in Good Ecological Status',
};

const TOPIC_COLOR = '#3b82f6';

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTION_DEFS: Record<string, { id: string; label: string }[]> = {
  'nitrate-pollution-groundwater-stations-exceeding-50-mg-l': [
    { id: 'key-figures',    label: 'Key figures'             },
    { id: 'technical-info', label: 'Technical Information'   },
    { id: 'consequences',   label: 'Consequences'            },
    { id: 'responsibility', label: 'Government responsibility'},
    { id: 'policy',         label: 'Policy'                  },
    { id: 'data-source',    label: 'Data source'             },
  ],
  'phosphate-pollution-rivers-exceeding-good-status-threshold': [
    { id: 'key-figures',    label: 'Key figures'             },
    { id: 'technical-info', label: 'Technical Information'   },
    { id: 'consequences',   label: 'Consequences'            },
    { id: 'responsibility', label: 'Government responsibility'},
    { id: 'policy',         label: 'Policy'                  },
    { id: 'data-source',    label: 'Data source'             },
  ],
  'groundwater-in-good-chemical-status': [
    { id: 'key-figures',    label: 'Key figures'             },
    { id: 'technical-info', label: 'Technical Information'   },
    { id: 'consequences',   label: 'Consequences'            },
    { id: 'responsibility', label: 'Government responsibility'},
    { id: 'policy',         label: 'Policy'                  },
    { id: 'data-source',    label: 'Data source'             },
  ],
  'drinking-water-quality-compliance': [
    { id: 'key-figures',    label: 'Key figures'             },
    { id: 'technical-info', label: 'Technical Information'   },
    { id: 'consequences',   label: 'Consequences'            },
    { id: 'responsibility', label: 'Government responsibility'},
    { id: 'policy',         label: 'Policy'                  },
    { id: 'data-source',    label: 'Data source'             },
  ],
  'soil-sealing-rate': [
    { id: 'key-figures',    label: 'Key figures'             },
    { id: 'main-chart',     label: 'Historical trend'        },
    { id: 'technical-info', label: 'Technical Information'   },
    { id: 'consequences',   label: 'Consequences'            },
    { id: 'responsibility', label: 'Government responsibility'},
    { id: 'policy',         label: 'Policy'                  },
    { id: 'data-source',    label: 'Data source'             },
  ],
  'surface-waters-in-good-ecological-status': [
    { id: 'key-figures',    label: 'Key figures'             },
    { id: 'technical-info', label: 'Technical Information'   },
    { id: 'consequences',   label: 'Consequences'            },
    { id: 'responsibility', label: 'Government responsibility'},
    { id: 'policy',         label: 'Policy'                  },
    { id: 'data-source',    label: 'Data source'             },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function toSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z🇧"'])/).map(s => s.trim()).filter(Boolean);
}

function rewriteArrows(text: string): string {
  return text.replace(/\s*→\s*/g, ', leading to ');
}

function buildConsequenceBullets(text: string): Array<{ text: string; sub?: string[] }> {
  const sentences = toSentences(rewriteArrows(text));
  const pastKeywords = /already (faced|subject|missed)|court ruling|previous|infringement.*\d{4}|INFR\s*\d{4}/i;
  const pastItems: string[] = [], mainItems: string[] = [];
  sentences.forEach(s => { if (pastKeywords.test(s)) pastItems.push(s); else mainItems.push(s); });
  const result: Array<{ text: string; sub?: string[] }> = mainItems.map(t => ({ text: t }));
  if (pastItems.length > 0) result.push({ text: 'Previous occurrences', sub: pastItems });
  return result;
}

function groupResponsibility(text: string) {
  const sentences = toSentences(text);
  const isFederal  = (s: string) => /\bfederal\b/i.test(s) && !/region|flanders|wallonia|brussels/i.test(s);
  const isRegional = (s: string) => /region|flanders|wallonia|brussels/i.test(s) && !/\bfederal\b/i.test(s);
  const isShared   = (s: string) =>
    /shared|coordinated|both|all levels|inter-?federal/i.test(s) ||
    (/\bfederal\b/i.test(s) && /region|flanders|wallonia|brussels/i.test(s));
  const federal: string[] = [], shared: string[] = [], regional: string[] = [];
  sentences.forEach(s => {
    if (isShared(s)) shared.push(s);
    else if (isFederal(s)) federal.push(s);
    else if (isRegional(s)) regional.push(s);
    else shared.push(s);
  });
  return { federal, shared, regional };
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
  const sources = source.split(/\s*[/|]\s*/).map(s => s.trim()).filter(Boolean);
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
            <span>
              {b.text}
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
  const { federal, shared, regional } = groupResponsibility(text);
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
      <div className="responsibility-groups">
        <Section label="Federal"  cls="tag-federal"  items={federal}  />
        <Section label="Shared"   cls="tag-shared"   items={shared}   />
        <Section label="Regional" cls="tag-regional" items={regional} />
      </div>
    </div>
  );
}

// ── Technical info cards ──────────────────────────────────────────────────────

// Helper: two-column info box
function InfoBox({ items }: { items: { icon: string; title: string; text: string; color?: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '10px 0' }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', borderLeft: `4px solid ${item.color ?? TOPIC_COLOR}` }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{item.icon} {item.title}</div>
          <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0, lineHeight: 1.55 }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

// Nitrate technical card
function NitrateTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is nitrate?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          Nitrate (NO₃⁻) is an inorganic ion formed when nitrogen combines with oxygen. It is a natural
          part of the nitrogen cycle — produced by bacteria breaking down organic matter in soil — but
          becomes a pollutant when agricultural inputs (fertilisers and animal manure) add far more
          nitrogen to the soil than crops can absorb. Excess nitrate is highly soluble and mobile:
          it dissolves in water and travels easily through soil layers into groundwater, or runs off
          the surface into rivers and streams.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What happens when nitrate enters water?</strong>
        <InfoBox items={[
          { icon: '🌿', title: 'Eutrophication', color: '#16a34a',
            text: 'Nitrate acts as a fertiliser in water. Excess NO₃⁻ triggers explosive growth of algae and aquatic plants, consuming dissolved oxygen as they decompose — a process called eutrophication.' },
          { icon: '🐟', title: 'Oxygen depletion (hypoxia)', color: '#0369a1',
            text: 'As algae decompose, bacteria consume oxygen. Dissolved oxygen drops below levels fish and invertebrates need to survive, creating "dead zones" in rivers and coastal waters.' },
          { icon: '⚗️', title: 'Denitrification (natural removal)', color: '#7c3aed',
            text: 'Under low-oxygen conditions bacteria convert NO₃⁻ back to harmless N₂ gas via denitrification — the main natural attenuation pathway in aquifers and wetlands.' },
          { icon: '🔬', title: 'Nitrite formation', color: '#dc2626',
            text: 'In oxygen-poor environments, NO₃⁻ can be reduced to nitrite (NO₂⁻), which is more directly toxic to fish and, in drinking water, can react with haemoglobin.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Health and environmental impacts</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['💧 Drinking water', 'Nitrate above 50 mg/L in drinking water can cause methemoglobinaemia ("blue baby syndrome") in infants — nitrite formed from NO₃⁻ binds to haemoglobin, reducing its ability to carry oxygen. The EU Drinking Water Directive sets a limit of 50 mg/L NO₃⁻.'],
            ['🌊 Coastal eutrophication', 'Nitrate exported via Belgian rivers (Scheldt, Meuse) contributes to eutrophication in the North Sea coastal zone, affecting the marine ecosystem and fisheries.'],
            ['🐾 Biodiversity loss', 'Nutrient enrichment shifts river ecology from diverse invertebrate communities to algae-dominated systems, drastically reducing biodiversity and WFD ecological status.'],
            ['💰 Treatment costs', 'Water utilities must apply extra treatment (ion exchange, reverse osmosis) to remove nitrate from drinking water sources, significantly raising costs that are passed on to consumers.'],
          ].map(([title, text], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
              <span style={{ flexShrink: 0, fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', minWidth: 140 }}>{title}</span>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 10 }}>
          The EU Nitrates Directive (91/676/EEC) and Water Framework Directive set the policy framework.
          Belgium was taken to the Court of Justice of the EU for insufficient action on nitrate pollution.
        </p>
      </div>
    </div>
  );
}

// Phosphate technical card
function PhosphateTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is phosphate?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          Phosphate (PO₄³⁻) is a phosphorus-oxygen ion essential for all living cells — it forms
          the backbone of DNA and ATP (cellular energy). Unlike nitrate, phosphate binds strongly
          to soil particles and does not leach into groundwater. Instead it travels attached to
          eroded soil particles via surface runoff into rivers and lakes. Phosphorus is typically
          the limiting nutrient in freshwater ecosystems, meaning even small increases trigger
          large ecological responses.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What happens when phosphate enters water?</strong>
        <InfoBox items={[
          { icon: '🌱', title: 'Algal blooms', color: '#16a34a',
            text: 'Phosphorus is the growth-limiting nutrient in most freshwater bodies. Even small additions trigger explosive algal growth (blooms), turning water green or blue-green and blocking sunlight.' },
          { icon: '☠️', title: 'Toxic cyanobacteria', color: '#dc2626',
            text: 'Blue-green algae (cyanobacteria) produce cyanotoxins that are harmful to humans, livestock and pets. Blooms on Belgian rivers and canals regularly trigger swimming and water abstraction bans.' },
          { icon: '🐠', title: 'Oxygen depletion', color: '#0369a1',
            text: 'Decomposing algal biomass consumes dissolved oxygen, causing fish kills and loss of invertebrate diversity — the main reason Belgian rivers fail WFD good ecological status.' },
          { icon: '🧱', title: 'Sediment phosphorus legacy', color: '#7c3aed',
            text: 'Phosphorus accumulated in river sediments over decades can re-dissolve under low-oxygen or high-temperature conditions, acting as an internal source even after external inputs are reduced.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Key differences from nitrate</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Movement in soil', nitrate: 'Leaches into groundwater (soluble)', phosphate: 'Binds to soil, moves via surface runoff' },
            { label: 'Key water body affected', nitrate: 'Groundwater & rivers', phosphate: 'Rivers, lakes & coastal waters' },
            { label: 'Limiting nutrient in', nitrate: 'Marine/coastal waters', phosphate: 'Freshwater bodies' },
            { label: 'Main EU legislation', nitrate: 'Nitrates Directive (91/676)', phosphate: 'Water Framework Directive (2000/60)' },
          ].map((row, i) => (
            <div key={i} style={{ fontSize: '0.78rem', background: '#f8fafc', borderRadius: 6, padding: '8px 10px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>{row.label}</div>
              <div style={{ color: '#1d4ed8' }}>NO₃⁻ {row.nitrate}</div>
              <div style={{ color: '#7c3aed' }}>PO₄³⁻ {row.phosphate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Groundwater technical card
function GroundwaterTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is "good chemical status"?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          Under the EU Water Framework Directive (WFD), groundwater bodies are assessed against
          chemical quality standards for a set of pollutants. A groundwater body achieves
          "good chemical status" when all measured pollutants stay below their threshold values —
          including nitrates (50 mg/L), pesticides, heavy metals, and other hazardous substances.
          The assessment uses a strict "one out, all out" rule: if any single pollutant exceeds
          its standard, the entire body is classified as "poor chemical status", regardless of
          performance on other parameters. Belgium&#39;s main failures are driven by nitrates
          (from agriculture) and pesticides.
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Main consumers of groundwater in Belgium</strong>
        <InfoBox items={[
          { icon: '🚰', title: 'Drinking water (40%)', color: TOPIC_COLOR,
            text: 'Groundwater is used directly (after treatment) as drinking water. Wallonia provides ~55% of Belgian drinking water from groundwater — Flanders and Brussels both depend on this supply.' },
          { icon: '🌾', title: 'Agriculture (35%)', color: '#16a34a',
            text: 'Irrigation, livestock watering and crop processing. Belgium\'s intensive farming sector is both a major user and the primary source of nitrate and pesticide contamination.' },
          { icon: '🏭', title: 'Industry (20%)', color: '#f97316',
            text: 'Cooling water for industrial processes, food processing, and some manufacturing. Industrial abstractions are declining as water recycling improves.' },
          { icon: '🏙️', title: 'Other / urban (5%)', color: '#8b5cf6',
            text: 'Municipal parks, construction dewatering and urban heat exchange systems (geothermal). Growing in cities as a cooling resource.' },
        ]} />
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Drivers of high groundwater stress in Belgium</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['🏙️ Population density', 'Belgium is one of the most densely populated countries in the EU (~380 inhabitants/km²). High demand is concentrated in a small territory with limited recharge area.'],
            ['🌾 Agricultural intensity', 'Flanders has among the EU\'s highest livestock densities. Intensive farming saturates soils with nitrogen and phosphorus, degrading groundwater quality and limiting usable recharge.'],
            ['🗺️ Flat topography', 'Flanders\' low-lying, flat landscape limits natural groundwater recharge. Impervious surfaces from urbanisation further reduce infiltration, especially in the already-sealed north.'],
            ['☀️ Climate change', 'More frequent summer droughts reduce precipitation and increase abstraction demand simultaneously. The 2018, 2020 and 2022 droughts caused unprecedented groundwater level drops in Flanders.'],
            ['🧪 Legacy contamination', 'Decades of agricultural and industrial pollution have left nitrate, pesticide and PFAS contamination in shallow aquifers that is slow to remediate — recovery timescales are measured in decades.'],
          ].map(([title, text], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
              <span style={{ flexShrink: 0, fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', minWidth: 170 }}>{title}</span>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Drinking water technical card
function DrinkingWaterTechnicalCard() {
  const steps = [
    { icon: '💧', title: 'Abstraction', color: '#0369a1',
      text: 'Groundwater is pumped from aquifer wells (Wallonia) or captured from surface water (Flanders, which imports ~40% of its drinking water from Wallonia). The water is tested for raw quality before treatment begins.' },
    { icon: '🪨', title: 'Coagulation & sedimentation', color: '#78716c',
      text: 'Coagulants (aluminium sulphate or iron salts) are added to cause fine particles and some dissolved substances to clump together and settle out, removing turbidity and some heavy metals.' },
    { icon: '🏖️', title: 'Filtration', color: '#d97706',
      text: 'Water passes through sand and/or activated carbon filters. Activated carbon adsorbs pesticides, organic micropollutants, taste and odour compounds — particularly important for Belgian groundwater contaminated by agricultural chemicals.' },
    { icon: '☀️', title: 'Aeration / iron & manganese removal', color: '#16a34a',
      text: 'Groundwater often contains dissolved iron and manganese. Aeration oxidises these to insoluble forms which are then filtered out. This step also removes dissolved CO₂ and hydrogen sulphide.' },
    { icon: '🔬', title: 'Advanced treatment (if needed)', color: '#7c3aed',
      text: 'Where nitrate or PFAS contamination is present, additional processes are applied: ion exchange resins remove nitrate, activated carbon removes PFAS and pesticides, reverse osmosis removes a broad range of dissolved substances.' },
    { icon: '🧴', title: 'Disinfection', color: '#dc2626',
      text: 'Chlorination (most common in Belgium) or UV disinfection eliminates bacteria, viruses and parasites. A residual chlorine level is maintained in the distribution network to prevent re-contamination.' },
    { icon: '🏗️', title: 'Distribution', color: TOPIC_COLOR,
      text: 'Treated water is pumped through pressurised distribution networks to households and businesses. Belgium&#39;s network is generally well-maintained, with lower leakage rates than the EU average.' },
  ];

  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>How is drinking water made from groundwater?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', marginBottom: 12 }}>
          Raw groundwater must be treated before it is safe to drink. The treatment steps depend on
          the quality of the source water — Belgian groundwater varies significantly: Wallonian aquifer
          water is generally of high quality requiring minimal treatment, while some Flemish sources
          require advanced treatment for nitrates, pesticides and PFAS contamination.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{step.icon}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: step.color }}>{i + 1}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a1a1a', marginBottom: 3 }}>{step.title}</div>
                <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0, lineHeight: 1.55 }}>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 10 }}>
          Belgium&#39;s 99.5% compliance rate reflects well-managed treatment and distribution.
          The remaining 0.5% mostly relates to lead in old household pipes (pre-1970s buildings) and
          localised PFAS contamination near industrial sites in Flanders.
        </p>
      </div>
    </div>
  );
}

// Soil sealing technical card
function SoilSealingTechnicalCard({ euComparison }: { euComparison: any[] }) {
  const TOPIC_COLOR_LOCAL = '#3b82f6';
  const barData = euComparison.map(c => ({
    country: c.country,
    rate: c.rate,
    fill: c.country === 'Belgium' ? TOPIC_COLOR_LOCAL : c.country === 'EU average' ? '#94a3b8' : '#bfdbfe',
  }));

  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is Copernicus, and how is this indicator measured?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', margin: 0 }}>
          The <strong>Copernicus Land Monitoring Service (CLMS)</strong> is the EU&#39;s earth observation
          programme, operated by EEA and the European Commission using Sentinel satellites. Its
          High Resolution Layer (HRL) Imperviousness product maps every 10 m × 10 m pixel of
          European land as either pervious or impervious using satellite imagery and machine learning.
          A pixel is classified as impervious (sealed) if it is covered by artificial, hard surfaces
          that prevent water infiltration — buildings, roads, car parks, airports and paved areas.
          The resulting soil sealing rate is expressed as the percentage of total national land area
          that is impervious. Updates are published every three years (2006, 2009, 2012, 2015, 2018, 2021).
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginBottom: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Belgium vs Europe — soil sealing rate (2018)</strong>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 10px' }}>
          Belgium has the second highest soil sealing rate in the EU after Malta, far above the EU average of 4.2%.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 30]} />
            <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false} width={80} interval={0} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => [`${v}%`, 'Soil sealing rate']} />
            <Bar dataKey="rate" radius={[0, 3, 3, 0]}>
              {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 4 }}>Source: EEA / Copernicus HRL Imperviousness, 2018.</p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>What are the consequences of impervious land?</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { title: '💧 Disrupts the water cycle', text: "Sealed surfaces prevent rainwater from infiltrating. Instead of recharging groundwater, water runs off rapidly into drainage — directly worsening Belgium's water stress." },
            { title: '🌡️ Urban heat island', text: 'Impervious surfaces retain solar heat, raising urban temperatures up to 5°C above surrounding countryside, increasing cooling demand and heat-related health risks.' },
            { title: '🦋 Habitat fragmentation', sub: '& biodiversity loss', text: 'Sealed land eliminates soil biodiversity and fragments wildlife corridors, destroying habitats for ground-nesting insects and plants.' },
            { title: '🌊 Increased flood risk', text: "Rapid runoff overwhelms urban drainage, contributing to flash flooding. Belgium's 2021 floods (Liège, Namur) were worsened by high soil sealing in valley catchments." },
            { title: '🌱 Loss of agricultural land', text: 'Once sealed, land is almost impossible to restore. Belgium loses ~6 km² of farmland per year to urbanisation — a permanent, irreversible loss.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0', alignItems: 'start' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a', lineHeight: 1.45 }}>
                <div>{item.title}</div>
                {'sub' in item && <div>{(item as any).sub}</div>}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function WaterSidebar({ slug }: { slug: string }) {
  const [active, setActive] = useState('key-figures');
  const sections = SECTION_DEFS[slug] ?? [];

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(s.id);
          return;
        }
      }
      setActive(sections[0]?.id ?? '');
    };
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
        <button key={s.id}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WaterSoilDetailPage() {
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
      <Link href="/?topic=water_soil" style={{ color: TOPIC_COLOR, fontWeight: 600 }}>← Back to overview</Link>
    </div>
  );

  const ind = data.topics.water_soil?.indicators?.find((i: any) => i.indicator === indicatorName);
  const sc  = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  const historicalSoil = data.historical?.water_soil?.series?.['Soil sealing rate']?.map(
    (d: any) => ({ year: d.year, value: d.value })
  ) ?? [];
  const euComparison = data.water_supplementary?.soil_sealing_eu ?? [];

  // Chart node (soil sealing only)
  let chartNode: React.ReactNode = null;
  if (slug === 'soil-sealing-rate' && historicalSoil.length > 0) {
    chartNode = (
      <div className="detail-chart-block">
        <div className="detail-chart-title">Soil Sealing Rate — Belgium 2006–2021 (%)</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={historicalSoil} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[8, 16]} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => [`${v}%`, 'Soil sealing rate']} />
            <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="detail-chart-source">Source: Copernicus Land Monitoring Service / EEA HRL Imperviousness. Values every 3 years.</p>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '10px 14px', marginTop: 8 }}>
          <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: 1.55 }}>
            <strong>⚠️ Note on the 2015→2018 jump (10.4% → 12.9%):</strong> This discontinuity
            reflects a methodological improvement in the Copernicus HRL 2018 product — a refined
            algorithm reclassified some surfaces (e.g. gravel rooftops, dark parking areas) that
            were previously missed as pervious. The actual rate of new sealing was much lower than
            the apparent 2.5 pp jump suggests. Post-2018 values are directly comparable; pre-2018
            values are comparable with each other but not with the 2018/2021 figures.
          </p>
        </div>
      </div>
    );
  }

  // Technical info node per slug
  let technicalNode: React.ReactNode = null;
  if (slug === 'nitrate-pollution-groundwater-stations-exceeding-50-mg-l') {
    technicalNode = <NitrateTechnicalCard />;
  } else if (slug === 'phosphate-pollution-rivers-exceeding-good-status-threshold') {
    technicalNode = <PhosphateTechnicalCard />;
  } else if (slug === 'groundwater-in-good-chemical-status') {
    technicalNode = <GroundwaterTechnicalCard />;
  } else if (slug === 'drinking-water-quality-compliance') {
    technicalNode = <DrinkingWaterTechnicalCard />;
  } else if (slug === 'soil-sealing-rate') {
    technicalNode = <SoilSealingTechnicalCard euComparison={euComparison} />;
  }

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/?topic=water_soil" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Water &amp; Soil</p>
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
        <WaterSidebar slug={slug} />

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

          {chartNode && <div id="main-chart" className="detail-charts">{chartNode}</div>}

          <div className="detail-info">
            <div id="technical-info">{technicalNode}</div>
            <div id="consequences">{ind?.consequences && <ConsequencesCard text={ind.consequences} />}</div>
            <div id="responsibility">{ind?.responsible && <ResponsibilityCard text={ind.responsible} />}</div>
            <div id="policy">{ind?.policy && (
              <InfoRow label="Policy / Legal basis">
                <DataSourceRow source={ind.policy} url={ind.policy_url ?? null} />
              </InfoRow>
            )}</div>
            <div id="data-source">{ind?.data_source && (
              <InfoRow label="Data source">
                <DataSourceRow source={ind.data_source} url={ind.data_source_url} />
              </InfoRow>
            )}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
