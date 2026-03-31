'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';

// ── Slug map ──────────────────────────────────────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  'municipal-solid-waste-recycling-rate':    'Municipal Solid Waste Recycling Rate',
  'packaging-waste-recycling-rate':          'Packaging Waste Recycling Rate',
  'plastic-packaging-recycling-rate':        'Plastic Packaging Recycling Rate',
  'municipal-waste-generation-per-capita':   'Municipal Waste Generation per Capita',
  'municipal-waste-landfill-rate':           'Municipal Waste Landfill Rate',
  'circular-material-use-rate-cmur':         'Circular Material Use Rate (CMUR)',
};

const DISPLAY_NAME: Record<string, string> = {
  'municipal-solid-waste-recycling-rate':    'Municipal Solid Waste Recycling Rate',
  'packaging-waste-recycling-rate':          'Packaging Waste Recycling Rate',
  'plastic-packaging-recycling-rate':        'Plastic Packaging Recycling Rate',
  'municipal-waste-generation-per-capita':   'Municipal Waste Generation per Capita',
  'municipal-waste-landfill-rate':           'Municipal Waste Landfill Rate',
  'circular-material-use-rate-cmur':         'Circular Material Use Rate (CMUR)',
};

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTION_DEFS: Record<string, { id: string; label: string }[]> = {
  'municipal-solid-waste-recycling-rate': [
    { id: 'key-figures',    label: 'Key figures' },
    { id: 'main-chart',     label: 'Historical trend' },
    { id: 'technical-info', label: 'Technical Information' },
    { id: 'consequences',   label: 'Consequences' },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy' },
    { id: 'data-source',    label: 'Data source' },
  ],
  'packaging-waste-recycling-rate': [
    { id: 'key-figures',    label: 'Key figures' },
    { id: 'technical-info', label: 'Technical Information' },
    { id: 'consequences',   label: 'Consequences' },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy' },
    { id: 'data-source',    label: 'Data source' },
  ],
  'plastic-packaging-recycling-rate': [
    { id: 'key-figures',    label: 'Key figures' },
    { id: 'technical-info', label: 'Technical Information' },
    { id: 'consequences',   label: 'Consequences' },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy' },
    { id: 'data-source',    label: 'Data source' },
  ],
  'municipal-waste-generation-per-capita': [
    { id: 'key-figures',    label: 'Key figures' },
    { id: 'technical-info', label: 'Technical Information' },
    { id: 'consequences',   label: 'Consequences' },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy' },
    { id: 'data-source',    label: 'Data source' },
  ],
  'municipal-waste-landfill-rate': [
    { id: 'key-figures',    label: 'Key figures' },
    { id: 'technical-info', label: 'Technical Information' },
    { id: 'consequences',   label: 'Consequences' },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy' },
    { id: 'data-source',    label: 'Data source' },
  ],
  'circular-material-use-rate-cmur': [
    { id: 'key-figures',    label: 'Key figures' },
    { id: 'main-chart',     label: 'Historical trend' },
    { id: 'technical-info', label: 'Technical Information' },
    { id: 'consequences',   label: 'Consequences' },
    { id: 'responsibility', label: 'Government responsibility' },
    { id: 'policy',         label: 'Policy' },
    { id: 'data-source',    label: 'Data source' },
  ],
};

const TOPIC_COLOR = '#06b6d4';

// ── Misc helpers ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};

function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function CircularitySidebar({ slug }: { slug: string }) {
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
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="detail-sidebar" style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
      <div className="detail-sidebar-title">On this page</div>
      {sections.map(s => (
        <button key={s.id}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────
function DataSourceRow({ source, url, description }: {
  source: string; url: string | null; description?: string | null;
}) {
  const sources = source.split(/\s*[/|]\s*/).map(s => s.trim()).filter(Boolean);
  const urls    = url         ? url.split(/\s*\|\s*/).map(u => u.trim()).filter(Boolean) : [];
  const descs   = description ? description.split(/\s*\|\s*/).map(d => d.trim()).filter(Boolean) : [];
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sources.map((s, i) => (
        <li key={i}>
          {urls[i]
            ? <a href={urls[i]} target="_blank" rel="noopener noreferrer" className="detail-link">{s} ↗</a>
            : <span style={{ fontSize: '0.88rem' }}>{s}</span>}
          {descs[i] && (
            <span style={{ display: 'block', fontSize: '0.79rem', color: '#6b7280', marginTop: 2, lineHeight: 1.5 }}>{descs[i]}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-info-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

// ── Text processing helpers (same as nature/climate pages) ──────────────────
function rewriteArrows(text: string): string {
  return text.replace(
    /EU infringement proceedings\s*→\s*referral to Court of Justice\s*→\s*financial fines/gi,
    'EU infringement proceedings, which can escalate to a referral to the Court of Justice of the EU and ultimately result in significant financial fines imposed on Belgium'
  ).replace(
    /infringement\s*→\s*ECJ\s*→\s*lump sum \/ daily fines/gi,
    'infringement proceedings before the Court of Justice, which can result in lump-sum payments or recurring daily fines until Belgium complies'
  ).replace(/\s*→\s*/g, ', leading to ');
}

function toSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[A-Z🇧"'])/).map(s => s.trim()).filter(s => s.length > 0);
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
  const isFederal  = (s: string) => /federal/i.test(s) && !/region|flanders|wallonia|brussels|flemish|walloon/i.test(s);
  const isRegional = (s: string) => /region|flanders|wallonia|brussels|flemish|walloon/i.test(s) && !/federal/i.test(s);
  const isShared   = (s: string) =>
    /shared|coordinated|both|all levels|ICE|inter-?federal|inter-?ministerial/i.test(s) ||
    (/federal/i.test(s) && /region|flanders|wallonia|brussels/i.test(s));
  const federal: string[] = [], shared: string[] = [], regional: string[] = [];
  sentences.forEach(s => {
    if (isShared(s)) shared.push(s);
    else if (isFederal(s)) federal.push(s);
    else if (isRegional(s)) regional.push(s);
    else shared.push(s);
  });
  return { federal, shared, regional };
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
                      <span className="bullet-dot">–</span>
                      <span>{s}</span>
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
    if (items.length === 0) return null;
    return (
      <div className="responsibility-group">
        <span className={`responsibility-tag ${cls}`}>{label}</span>
        <ul className="responsibility-list">
          {items.map((item, i) => (
            <li key={i} className="responsibility-list-item">
              <span className="bullet-dot">•</span>
              <span>{item}</span>
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

// ── Charts ────────────────────────────────────────────────────────────────────
const MATERIAL_COLORS: Record<string, string> = {
  'Paper & Cardboard': '#3b82f6',
  'Glass':             '#06b6d4',
  'Plastic':           '#f97316',
  'Wood':              '#22c55e',
  'Metal':             '#8b5cf6',
};

const TREATMENT_COLORS = ['#f97316', '#06b6d4', '#22c55e', '#94a3b8'];

// ── Technical Information cards ───────────────────────────────────────────────

// Ind 1: MSW Recycling Rate
function MSWTechnicalCard() {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is recycling?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', marginBottom: 10 }}>
          Recycling is the process of converting waste materials into new raw materials or products.
          Instead of discarding used materials, they are collected separately, sorted, and reprocessed
          so that they can be used again as inputs into manufacturing — closing the material loop.
          Recycling reduces the need for virgin raw material extraction, saves energy (recycling
          aluminium uses 95% less energy than making it from ore), and reduces greenhouse gas emissions
          and landfill volumes.
        </p>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151' }}>
          Belgium&#39;s 56% municipal solid waste recycling rate includes both <strong>material
          recycling</strong> (dry recyclables: paper, glass, metals, plastics) and
          <strong> biological recycling</strong> via composting and fermentation of organic waste.
          Together these account for 56% of all municipal waste treated — with the remainder
          mostly incinerated with energy recovery (44%).
        </p>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18, marginBottom: 20 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What is composting and fermentation?</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              title: '🪱 Composting', color: '#16a34a', bg: '#f0fdf4',
              text: 'Organic waste (food scraps, garden waste) is broken down aerobically by microorganisms into compost — a nutrient-rich soil improver used in agriculture and horticulture. It avoids synthetic fertilisers derived from fossil fuels and returns organic matter to the soil.',
              output: '🌿 Compost → replaces synthetic fertiliser',
            },
            {
              title: '🫧 Fermentation (anaerobic digestion)', color: '#0369a1', bg: '#f0f9ff',
              text: 'Organic waste is broken down in the absence of oxygen by bacteria, producing two valuable outputs: biogas (a mixture of methane and CO₂) and digestate (a liquid fertiliser). The biogas can be burned to generate electricity and heat, or upgraded to biomethane and injected into the gas grid.',
              output: '🔥 Biogas → replaces natural gas
💧 Digestate → replaces synthetic fertiliser',
            },
          ].map((item, i) => (
            <div key={i} style={{ background: item.bg, borderRadius: 8, padding: '14px 16px', borderLeft: `4px solid ${item.color}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginBottom: 6 }}>{item.title}</div>
              <p style={{ fontSize: '0.81rem', color: '#374151', margin: '0 0 8px', lineHeight: 1.6 }}>{item.text}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {item.output.split('\n').map((line: string, li: number) => (
                  <div key={li} style={{ fontSize: '0.75rem', fontWeight: 600, color: item.color }}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 10, lineHeight: 1.6 }}>
          In Belgium, 22% of municipal waste is composted or fermented (2023). Mandatory bio-waste
          collection was introduced in Brussels in 2023 and in Flanders and Wallonia in 2024,
          which should increase this share significantly in coming years.
        </p>
      </div>
    </div>
  );
}

// Ind 2: Packaging Waste Recycling Rate
function PackagingTechnicalCard({ packaging }: { packaging: any[] }) {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>How is packaging waste collected in Belgium?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', marginBottom: 12 }}>
          Belgium operates a highly effective <strong>Extended Producer Responsibility (EPR)</strong> scheme
          for packaging waste. Producers and importers who place packaging on the Belgian market are legally
          responsible for funding its collection and recycling. This is organised through two approved
          organisations: <strong>Fost Plus</strong> for household packaging and <strong>Valipac</strong>
          for industrial and commercial packaging.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '🔵', title: 'PMD blue bag', desc: 'Plastics (bottles, containers), Metal cans, and Drink cartons collected together in the iconic blue bag. Collected door-to-door across Belgium.' },
            { icon: '📰', title: 'Paper & cardboard', desc: 'Newspapers, magazines, cardboard boxes collected separately in bags or bundles. Door-to-door collection in most municipalities.' },
            { icon: '🫙', title: 'Glass', desc: 'Glass bottles and jars brought to neighbourhood collection points (glasbollen). Some municipalities also have door-to-door glass collection.' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#1a1a1a', marginBottom: 4 }}>{item.title}</div>
              <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18, marginBottom: 20 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What happens to the blue bag?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', marginBottom: 12 }}>
          After collection, blue bags are transported to one of <strong>5 sorting centres</strong> across
          Belgium where automated and manual processes separate the mixed plastics, metals and
          drink cartons into individual material streams. Each stream is then baled and sent to
          specialised recycling plants:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['🧴 PET bottles', 'Shredded, washed and pelletised → new bottles, fleece clothing, food packaging'],
            ['🥤 HDPE containers', 'Reprocessed into new containers, pipes, garden furniture'],
            ['🥫 Steel cans', 'Melted and recast → new steel products at >96% efficiency'],
            ['🍺 Aluminium cans', 'Melted → new aluminium (uses 95% less energy than virgin production)'],
            ['🧃 Drink cartons', 'Separated into paper fibre (recycled) and plastic/aluminium (energy recovery)'],
          ].map(([mat, dest], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
              <span style={{ flexShrink: 0, fontSize: '1rem' }}>{mat.split(' ')[0]}</span>
              <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>
                <strong>{mat.replace(/^\S+\s/, '')}</strong> → {dest}
              </div>
            </div>
          ))}
        </div>
      </div>

      {packaging.length > 0 && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Recycling rate by material — Belgium 2023</strong>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>
            Belgium leads the EU in plastic packaging recycling (59.5%) and exceeds the 2030 EU target
            for all materials except paper & cardboard (84% vs 85% target).
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={packaging.map(p => ({ ...p, name: p.material === 'Paper & Cardboard' ? 'Paper' : p.material }))}
              margin={{ top: 4, right: 20, left: 0, bottom: 4 }} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4b5563' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any, _: any, props: any) => [`${v}% recycled (2030 target: ${props.payload.target_2030}%)`, props.payload.name]} />
              <Bar dataKey="recycling_rate" radius={[3, 3, 0, 0]}>
                {packaging.map((p, i) => <Cell key={i} fill={MATERIAL_COLORS[p.material] ?? '#94a3b8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6 }}>
            Source: IVCIE / Statbel / Eurostat env_waspac (2023).
          </p>
        </div>
      )}
    </div>
  );
}

// Ind 3: Municipal Waste per Capita
function WastePerCapitaTechnicalCard({ treatment, energyRecovery }: { treatment: any[]; energyRecovery: any[] }) {
  const totalElec = energyRecovery.find(e => e.metric === 'Total electricity from all waste incineration (est.)');
  const totalConsumption = energyRecovery.find(e => e.metric === 'Belgium total electricity consumption (2022)');

  const treatmentData = treatment.map((t, i) => ({
    name: t.method, value: t.pct_2023, color: TREATMENT_COLORS[i] ?? '#94a3b8',
  }));

  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What happens to Belgium&#39;s municipal waste?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', marginBottom: 12 }}>
          Of the 700 kg of municipal waste each Belgian generates per year (2023), a small portion
          is landfilled (0.1%) while the rest goes to one of three treatment routes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              pct: '34%', icon: '♻️', title: 'Material recycling', color: '#06b6d4', bg: '#f0f9ff',
              text: 'Dry recyclables (paper, glass, PMD bags) and residual scrap metals are sorted and sent to specialised recycling plants. These materials re-enter manufacturing as secondary raw materials, displacing virgin resource extraction.',
            },
            {
              pct: '22%', icon: '🌱', title: 'Composting & fermentation', color: '#16a34a', bg: '#f0fdf4',
              text: 'Food waste and garden waste are composted into soil improver or fermented to produce biogas (replacing natural gas) and digestate (replacing synthetic fertiliser). Share growing rapidly due to mandatory bio-waste collection from 2023–2024.',
            },
            {
              pct: '44%', icon: '🔥', title: 'Incineration with energy recovery', color: '#f97316', bg: '#fff7ed',
              text: `Residual waste that cannot be recycled is incinerated in Belgium's 15 waste-to-energy plants (all R1 energy recovery status). Heat and electricity are recovered — the Belgian sector produces an estimated 2–3 TWh of electricity per year, representing roughly 2–3% of Belgium's total electricity consumption of ${totalConsumption?.value ?? 80} TWh. Beyond electricity, plants supply steam directly to industry — Indaver's ECLUSE network in the Port of Antwerp provides 250 MW of steam to 6 chemical companies, replacing fossil fuels. Belgium also imports waste for incineration from the Netherlands, Germany and France due to excess capacity.`,
            },
            {
              pct: '0.1%', icon: '⬇️', title: 'Landfill', color: '#94a3b8', bg: '#f9fafb',
              text: 'Near-zero landfill rate — one of the lowest in the EU. Both Flanders and Wallonia have effective landfill bans combined with incineration taxes that make landfilling economically unattractive. Only a small fraction of inert waste that cannot be treated otherwise goes to landfill.',
            },
          ].map((item, i) => (
            <div key={i} style={{ background: item.bg, borderRadius: 8, padding: '12px 14px', borderLeft: `4px solid ${item.color}`, display: 'flex', gap: 12 }}>
              <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem' }}>{item.icon}</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.1rem', fontWeight: 900, color: item.color, marginTop: 2 }}>{item.pct}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginBottom: 4 }}>{item.title}</div>
                <p style={{ fontSize: '0.81rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>Treatment breakdown — Belgium 2023</strong>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={treatmentData} cx="50%" cy="45%" outerRadius={90} dataKey="value" labelLine={false}>
              {treatmentData.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
            </Pie>
            <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]}
              contentStyle={{ background: '#ffffff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <Legend iconType="circle" iconSize={9}
              formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 6 }}>Source: Statbel — municipal waste statistics 2023.</p>
      </div>
    </div>
  );
}

// Ind 4: CMUR
function CMURTechnicalCard({ cmurByMaterial }: { cmurByMaterial: any[] }) {
  const CMUR_COLORS = ['#94a3b8', '#22c55e', '#f97316', '#06b6d4'];

  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What drives Belgium&#39;s high CMUR?</strong>
        <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: '#374151', marginBottom: 12 }}>
          The Circular Material Use Rate (CMUR) measures the share of total material use in the
          economy that comes from recycled waste — rather than freshly extracted virgin materials.
          Belgium&#39;s 22.2% is the 2nd highest in the EU (after the Netherlands at 27.5%) and
          already close to the EU 2030 target of 24%. Four material categories drive the figure:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cmurByMaterial.map((m, i) => (
            <div key={i} style={{ padding: '12px 14px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0', borderLeft: `4px solid ${CMUR_COLORS[i] ?? '#94a3b8'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a' }}>{m.material}</span>
                <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                  ~{m.pct_be_stream}% of recycled stream · EU CMUR: {m.eu_cmur_pct}%
                </span>
              </div>
              <p style={{ fontSize: '0.81rem', color: '#4b5563', margin: 0, lineHeight: 1.55 }}>{m.drivers}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>What makes up Belgium&#39;s recycled material stream?</strong>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>
          This chart shows the <strong>share of each material category in the total weight of
          secondary materials recycled domestically in Belgium</strong> — i.e. the materials
          that re-enter the Belgian economy as recycled inputs rather than virgin raw materials.
          It is the numerator of the CMUR formula. Larger material flows (like construction
          minerals) dominate by weight even if their recycling rate per tonne is lower.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={cmurByMaterial.map((m, i) => ({ name: m.material, value: m.pct_be_stream, color: CMUR_COLORS[i] ?? '#94a3b8' }))}
              cx="50%" cy="45%" outerRadius={90} dataKey="value" labelLine={false}
            >
              {cmurByMaterial.map((_, i) => <Cell key={i} fill={CMUR_COLORS[i] ?? '#94a3b8'} stroke="white" strokeWidth={2} />)}
            </Pie>
            <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]}
              contentStyle={{ background: '#ffffff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <Legend iconType="circle" iconSize={9}
              formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '12px 14px', borderLeft: '4px solid #06b6d4', marginTop: 12 }}>
          <p style={{ fontSize: '0.83rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>
            <strong>Why non-metallic minerals dominate:</strong> Belgium/Flanders has a near-100%
            construction and demolition (C&D) waste recycling rate. Crushed concrete, bricks and
            asphalt rubble are reused as road sub-base and fill material. While this is counted as
            recycling in CMUR calculations, some critics note the quality of this "downcycling"
            is limited compared to, for example, metals recycling which genuinely replaces virgin ore.
          </p>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 8 }}>
          Source: CE Monitor Flanders / Eurostat (cei_srm030) 2022.
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CircularityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="loading">Loading…</div>;

  const indicatorName = SLUG_MAP[slug];
  if (!indicatorName) return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: 'Roboto,sans-serif' }}>
      <p style={{ marginBottom: 16, color: '#6b6b6b' }}>Indicator not found.</p>
      <Link href="/?topic=circularity_waste" style={{ color: TOPIC_COLOR, fontWeight: 600 }}>← Back to overview</Link>
    </div>
  );

  const ind = data.topics.circularity_waste?.indicators?.find((i: any) => i.indicator === indicatorName);
  const sc  = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  // Historical series
  const historicalMSW   = data.historical?.circularity_waste?.series?.['Municipal solid waste recycling rate']?.map((d: any) => ({ year: d.year, value: d.value })) ?? [];
  const historicalCMUR  = data.historical?.circularity_waste?.series?.['Circular material use rate (CMUR)']?.map((d: any) => ({ year: d.year, value: d.value })) ?? [];
  const historicalWaste = data.historical?.circularity_waste?.series?.['Municipal waste generation per capita']?.map((d: any) => ({ year: d.year, value: d.value })) ?? [];

  // Supplementary
  const packaging      = data.circularity_supplementary?.packaging_by_material ?? [];
  const treatment      = data.circularity_supplementary?.treatment_breakdown ?? [];
  const energyRecovery = data.circularity_supplementary?.energy_recovery ?? [];
  const cmurByMaterial = data.circularity_supplementary?.cmur_by_material ?? [];

  // Chart per slug
  let chartNode: React.ReactNode = null;
  if (slug === 'municipal-solid-waste-recycling-rate') {
    chartNode = (
      <div className="detail-chart-block">
        <div className="detail-chart-title">Municipal Solid Waste Recycling Rate — Belgium 2016–2023</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={historicalMSW} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[40, 65]} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => [`${v}%`, 'Recycling rate']} />
            <ReferenceLine y={55} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
              label={{ value: '🎯 2025 target: 55%', position: 'insideTopRight', fontSize: 11, fill: TOPIC_COLOR, fontWeight: 600 }} />
            <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="detail-chart-source">Source: Statbel / Eurostat (env_wasmun). ⚠️ Series break at 2020 — new EU definition.</p>
      </div>
    );
  } else if (slug === 'circular-material-use-rate-cmur') {
    chartNode = (
      <div className="detail-chart-block">
        <div className="detail-chart-title">Circular Material Use Rate (CMUR) — Belgium 2010–2022</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={historicalCMUR} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={36} domain={[14, 26]} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => [`${v}%`, 'CMUR']} />
            <ReferenceLine y={24} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
              label={{ value: '🎯 2030 target: 24%', position: 'insideTopRight', fontSize: 11, fill: TOPIC_COLOR, fontWeight: 600 }} />
            <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="detail-chart-source">Source: Eurostat (cei_srm030). 2022 latest available.</p>
      </div>
    );
  }

  // Technical info card per slug
  let technicalNode: React.ReactNode = null;
  if (slug === 'municipal-solid-waste-recycling-rate') {
    technicalNode = <MSWTechnicalCard />;
  } else if (slug === 'packaging-waste-recycling-rate') {
    technicalNode = <PackagingTechnicalCard packaging={packaging} />;
  } else if (slug === 'municipal-waste-generation-per-capita') {
    technicalNode = <WastePerCapitaTechnicalCard treatment={treatment} energyRecovery={energyRecovery} />;
  } else if (slug === 'circular-material-use-rate-cmur') {
    technicalNode = <CMURTechnicalCard cmurByMaterial={cmurByMaterial} />;
  }

  const displayName = DISPLAY_NAME[slug] ?? indicatorName;

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/?topic=circularity_waste" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Circularity &amp; Waste</p>
          <h1 className="detail-title">{displayName}</h1>
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
        <CircularitySidebar slug={slug} />

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
                {ind.policy_url
                  ? <a href={ind.policy_url} target="_blank" rel="noopener noreferrer" className="detail-link">{ind.policy} ↗</a>
                  : ind.policy}
              </InfoRow>
            )}</div>

            <div id="data-source">{ind?.data_source && (
              <InfoRow label="Data source">
                <DataSourceRow
                  source={ind.data_source}
                  url={ind.data_source_url}
                  description={ind.data_source_description}
                />
              </InfoRow>
            )}</div>

          </div>
        </div>
      </div>
    </div>
  );
}
