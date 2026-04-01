'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar, ScatterChart, Scatter, ZAxis, LabelList,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#f97316';

const SLUG_MAP: Record<string, string> = {
  'total-ghg-emissions':                         'Total GHG Emissions',
  'per-capita-ghg-footprint':                    'Per-capita GHG Footprint',
  'final-energy-consumption':                    'Final Energy Consumption',
  'renewable-electricity-share-of-generation':   'Renewable Electricity Share (% of generation)',
  'renewable-energy-share-of-final-consumption': 'Renewable Energy Share (% of final consumption)',
  'primary-energy-consumption':                  'Primary Energy Consumption',
  'climate-neutrality':                          'Climate Neutrality',
};

// ── Static chart data ─────────────────────────────────────────────────────────
const ENERGY_MIX = [
  { name: 'Oil & petroleum',     value: 38, color: '#ef4444' },
  { name: 'Natural gas',         value: 23, color: '#f97316' },
  { name: 'Coal & solid fuels',  value: 5,  color: '#78716c' },
  { name: 'Nuclear electricity', value: 7,  color: '#8b5cf6' },
  { name: 'Other electricity',   value: 11, color: '#6366f1' },
  { name: 'Biomass & bioenergy', value: 6,  color: '#22c55e' },
  { name: 'Wind',                value: 4,  color: '#06b6d4' },
  { name: 'Solar PV',            value: 2,  color: '#fbbf24' },
  { name: 'Other',               value: 4,  color: '#d1d5db' },
];

const RENEWABLES_MIX = [
  { name: 'Biomass & bioenergy', value: 60, color: '#16a34a' },
  { name: 'Offshore wind',       value: 17, color: '#0369a1' },
  { name: 'Onshore wind',        value: 9,  color: '#38bdf8' },
  { name: 'Solar PV',            value: 9,  color: '#fbbf24' },
  { name: 'Heat pumps',          value: 4,  color: '#f97316' },
  { name: 'Hydro',               value: 1,  color: '#06b6d4' },
];

const FOOTPRINT_CATEGORIES = [
  { name: 'Housing',   value: 31.4, color: '#dc2626' },
  { name: 'Equipment', value: 23.3, color: '#f97316' },
  { name: 'Transport', value: 19.9, color: '#eab308' },
  { name: 'Food',      value: 15.0, color: '#22c55e' },
  { name: 'Services',  value: 7.3,  color: '#06b6d4' },
  { name: 'Other',     value: 3.1,  color: '#9ca3af' },
];

const GHG_SECTORS = [
  { name: 'Industry & construction', value: 28.3, color: '#dc2626' },
  { name: 'Transport',               value: 25.4, color: '#f97316' },
  { name: 'Buildings (heating)',     value: 17.8, color: '#eab308' },
  { name: 'Energy industries',       value: 16.0, color: '#8b5cf6' },
  { name: 'Agriculture',             value: 11.6, color: '#22c55e' },
  { name: 'Other',                   value: 1.9,  color: '#9ca3af' },
];

// GHG gas properties for bubble chart (AR5 GWP100)
const GHG_GASES = [
  { gas: 'CO\u2082',  gwp: 1,     share: 68.0, mt: 66.5, color: '#ef4444', lifetime: '50\u2013200 yr',  sources: 'Fossil fuel combustion, industry, LULUCF' },
  { gas: 'CH\u2084',  gwp: 30,    share: 12.9, mt: 12.6, color: '#f97316', lifetime: '~12 yr',          sources: 'Agriculture (livestock), waste, gas leaks' },
  { gas: 'N\u2082O',  gwp: 265,   share: 7.1,  mt: 6.9,  color: '#eab308', lifetime: '~114 yr',         sources: 'Agriculture (fertilisers), industrial processes' },
  { gas: 'HFCs',      gwp: 1800,  share: 9.5,  mt: 9.3,  color: '#8b5cf6', lifetime: '~15 yr avg',      sources: 'Refrigeration, air conditioning, heat pumps' },
  { gas: 'SF\u2086',  gwp: 23500, share: 1.5,  mt: 1.5,  color: '#06b6d4', lifetime: '~3,200 yr',       sources: 'Electrical switchgear, industrial processes' },
  { gas: 'PFCs',      gwp: 6630,  share: 0.5,  mt: 0.5,  color: '#22c55e', lifetime: '~10,000 yr',      sources: 'Aluminium smelting, semiconductor manufacturing' },
  { gas: 'NF\u2083',  gwp: 17200, share: 0.1,  mt: 0.1,  color: '#64748b', lifetime: '~500 yr',         sources: 'LCD screens, solar cell manufacturing' },
];

const PERCAPITA_BARS = [
  { country: 'Luxembourg',  value: 13.5, color: '#dc2626',  note: 'Inflated by fuel tourism' },
  { country: 'Germany',     value: 9.8,  color: '#f97316',  note: 'Coal + large industry base' },
  { country: 'Netherlands', value: 8.7,  color: '#f59e0b',  note: 'Gas production, refining' },
  { country: 'Belgium',     value: 8.3,  color: TOPIC_COLOR, note: 'Our tracked indicator' },
  { country: 'EU average',  value: 7.3,  color: '#6b7280',  note: 'EU27 average' },
  { country: 'France',      value: 6.5,  color: '#22c55e',  note: 'Low due to nuclear' },
  { country: 'Paris 2030',  value: 2.3,  color: '#3b82f6',  note: 'Fair-share 1.5\u00b0C target' },
];

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'  },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'  },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'   },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function rewriteArrows(text: string): string {
  return text
    .replace(/EU infringement proceedings\s*→\s*referral to Court of Justice\s*→\s*financial fines/gi,
      'EU infringement proceedings, which can escalate to a referral to the Court of Justice of the EU and ultimately result in significant financial fines imposed on Belgium')
    .replace(/infringement\s*→\s*ECJ\s*→\s*lump sum \/ daily fines/gi,
      'infringement proceedings before the Court of Justice, which can result in lump-sum payments or recurring daily fines until Belgium complies')
    .replace(/\s*→\s*/g, ', leading to ');
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
  const isFederal  = (s: string) => /\bfederal\b/i.test(s) && !/region|flanders|wallonia|brussels|flemish|walloon/i.test(s);
  const isRegional = (s: string) => /region|flanders|wallonia|brussels|flemish|walloon/i.test(s) && !/\bfederal\b/i.test(s);
  const isShared   = (s: string) =>
    /shared|coordinated|both|all levels|ICE|inter-?federal|inter-?ministerial/i.test(s) ||
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

// ── Card shells ───────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-info-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

function SectionCard({ icon, title, borderColor = '#3b82f6', children }: {
  icon: string; title: string; borderColor?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: '#fff', borderLeft: `4px solid ${borderColor}`, borderRadius: 12, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 20 }}>
      <div className="detail-section-header">
        <span className="detail-section-icon">{icon}</span>
        <span className="detail-section-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── Standard info cards ───────────────────────────────────────────────────────
function TechnicalInfoCard({ text, notes }: { text: string; notes?: string | null }) {
  return (
    <div className="detail-technical-card">
      <div className="detail-section-header">
        <span className="detail-section-icon">📋</span>
        <span className="detail-section-title">Technical Information</span>
      </div>
      <p className="technical-text">{text}</p>
      {notes && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e5e3da' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: 6 }}>Notes</p>
          <p className="technical-text">{notes}</p>
        </div>
      )}
    </div>
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
  const primaryMatch = text.match(/^(Regional|Federal|Shared)\s*\(primary\)\.\s*/i);
  const primaryLevel = primaryMatch ? primaryMatch[1] : null;
  const cleanText = primaryMatch ? text.slice(primaryMatch[0].length) : text;
  const { federal, shared, regional } = groupResponsibility(cleanText);
  const pcMap: Record<string, { bg: string; border: string; text: string }> = {
    Regional: { bg: '#f0fdf4', border: '#16a34a', text: '#14532d' },
    Federal:  { bg: '#eff6ff', border: '#2563eb', text: '#1e3a8a' },
    Shared:   { bg: '#fefce8', border: '#ca8a04', text: '#713f12' },
  };
  const pc = primaryLevel ? pcMap[primaryLevel] ?? pcMap.Regional : null;
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
      {pc && primaryLevel && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 8, padding: '6px 14px', marginBottom: 12 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: pc.text }}>Primary responsibility</span>
          <span style={{ background: pc.border, color: 'white', borderRadius: 4, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700 }}>{primaryLevel}</span>
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

function DataSourceRow({ source, url }: { source: string; url: string | null }) {
  const sources = source.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean);
  const urls = url ? url.split(/\s*\|\s*/).map(u => u.trim()).filter(Boolean) : [];
  if (sources.length === 1 && urls.length === 1)
    return <a href={urls[0]} target="_blank" rel="noopener noreferrer" className="detail-link">{sources[0]} ↗</a>;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {sources.map((s, i) => (
        <li key={i} style={{ fontSize: '0.88rem' }}>
          {urls[i]
            ? <a href={urls[i]} target="_blank" rel="noopener noreferrer" className="detail-link">{s} ↗</a>
            : <span>{s}</span>}
        </li>
      ))}
    </ul>
  );
}

// ── Chart components ──────────────────────────────────────────────────────────
function PieChartBlock({ data, title, source }: {
  data: { name: string; value: number; color: string }[]; title: string; source: string;
}) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">{title}</div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="45%" outerRadius={110} dataKey="value" labelLine={false}>
              {data.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
            </Pie>
            <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]}
              contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }} />
            <Legend iconType="circle" iconSize={9}
              formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="detail-chart-source">{source}</p>
    </div>
  );
}

function LineChartBlock({ data }: { data: { year: number; value: number }[] }) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Total GHG Emissions — Belgium 1990–2023 (MtCO₂eq)</div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} domain={[0, 160]} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any) => [`${v} MtCO\u2082eq`, 'GHG Emissions']} labelStyle={{ fontWeight: 700 }} />
            <Line type="monotone" dataKey="value" stroke={TOPIC_COLOR} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: TOPIC_COLOR }} />
            <ReferenceLine y={64.3} stroke={TOPIC_COLOR} strokeDasharray="6 4" strokeWidth={1.8}
              label={{ value: '\uD83C\uDFAF 2030 target: 64.3 MtCO\u2082eq', position: 'insideTopRight', fontSize: 10, fill: TOPIC_COLOR, fontWeight: 600 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="detail-chart-source">Source: National Climate Commission / indicators.be</p>
    </div>
  );
}

function GHGBubbleChart() {
  const bubbleData = GHG_GASES.map(g => ({ ...g, logGwp: parseFloat(Math.log10(g.gwp).toFixed(3)) }));
  const GWP_TICKS = [0, 1, 2, 3, 4, 5];
  const customTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, padding: '10px 14px', fontSize: 12, maxWidth: 240, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, color: d.color, marginBottom: 4 }}>{d.gas}</p>
        <p>GWP100: <strong>{d.gwp.toLocaleString()}</strong></p>
        <p>Share of Belgian GHG: <strong>{d.share}%</strong></p>
        <p>Absolute: <strong>{d.mt} MtCO\u2082eq</strong></p>
        <p style={{ color: '#6b7280', marginTop: 4, fontSize: 11 }}>{d.sources}</p>
        <p style={{ color: '#9ca3af', fontSize: 11 }}>Atm. lifetime: {d.lifetime}</p>
      </div>
    );
  };
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">GHG gases — global warming potential vs share of Belgian emissions (2023)</div>
      <div style={{ width: '100%', height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 32, left: 8, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" dataKey="logGwp" domain={[-0.2, 5.2]} name="GWP100"
              ticks={GWP_TICKS}
              tickFormatter={v => v === 0 ? '1' : v === 1 ? '10' : v === 2 ? '100' : v === 3 ? '1,000' : v === 4 ? '10,000' : '100,000'}
              tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false}
              label={{ value: 'Global Warming Potential — GWP100 (log scale, relative to CO\u2082)', position: 'insideBottom', offset: -20, fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis type="number" dataKey="share" domain={[0, 75]} name="Share of Belgian GHG"
              tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={44}
              tickFormatter={v => `${v}%`}
            />
            <ZAxis type="number" dataKey="mt" range={[80, 3000]} name="MtCO\u2082eq" />
            <Tooltip content={customTooltip} />
            {bubbleData.map(g => (
              <Scatter key={g.gas} name={g.gas} data={[g]} fill={g.color} fillOpacity={0.85} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', margin: '4px 0 8px', padding: '0 8px' }}>
        {GHG_GASES.map(g => (
          <span key={g.gas} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#374151' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0, display: 'inline-block' }} />
            {g.gas}
          </span>
        ))}
      </div>
      <p className="detail-chart-source">Source: Belgian GHG Inventory (NIR 2025) / IPCC AR5 GWP100. Bubble size proportional to MtCO\u2082eq.</p>
    </div>
  );
}

function EnergySectorsChart({ data }: { data: any[] }) {
  const COLORS: Record<string, string> = {
    Industry: '#dc2626', Transport: '#f97316', Households: '#eab308', Services: '#22c55e', Agriculture: '#06b6d4',
  };
  const chartData = data.map(d => ({ ...d, color: COLORS[d.sector] ?? '#9ca3af' }));
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Final energy consumption by sector — Belgium 2022 (Mtoe)</div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 64, left: 80, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} domain={[0, 12]} tickFormatter={v => `${v}`} />
            <YAxis type="category" dataKey="sector" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} axisLine={false} interval={0} width={78} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any, _: any, props: any) => [`${v} Mtoe (${props.payload.pct}%)`, '']} />
            <Bar dataKey="mtoe" radius={[0, 4, 4, 0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              <LabelList dataKey="mtoe" position="right" formatter={(v: any) => `${v} Mtoe`} style={{ fontSize: 11, fill: '#6b7280' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="detail-chart-source">Source: Eurostat Energy Balances / Belgian NECP 2024. Excludes non-energy use and bunkers.</p>
    </div>
  );
}

function RenewableCapacityChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    source: d.source,
    'Installed (2024)': d.installed_gw,
    'Target 2030': d.target_2030_gw,
    'Potential': d.potential_gw,
  }));
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Renewable electricity capacity — installed vs 2030 target vs long-term potential (GW)</div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="source" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `${v} GW`} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any, name: string) => [`${v} GW`, name]} />
            <Legend iconType="circle" iconSize={9}
              formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>} />
            <Bar dataKey="Installed (2024)" fill={TOPIC_COLOR} radius={[3,3,0,0]} />
            <Bar dataKey="Target 2030"      fill="#3b82f6"    radius={[3,3,0,0]} />
            <Bar dataKey="Potential"        fill="#d1d5db"    radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="detail-chart-source">Source: Elia (2025) / IEA-PVPS Belgium 2024 / FPS Economy Belgium.</p>
    </div>
  );
}

function PerCapitaComparisonChart() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Territorial GHG per capita — Belgium vs neighbours &amp; targets (tCO₂eq/cap, 2023)</div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={PERCAPITA_BARS} layout="vertical" margin={{ top: 4, right: 70, left: 90, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" domain={[0, 16]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} tickFormatter={v => `${v} t`} />
            <YAxis type="category" dataKey="country" tick={{ fontSize: 12, fill: '#374151' }} tickLine={false} axisLine={false} interval={0} width={88} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 12 }}
              formatter={(v: any, _: any, props: any) => [`${v} tCO\u2082eq/cap`, props.payload.note]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {PERCAPITA_BARS.map((d, i) => <Cell key={i} fill={d.color} />)}
              <LabelList dataKey="value" position="right" formatter={(v: any) => `${v} t`} style={{ fontSize: 11, fill: '#6b7280' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="detail-chart-source">Source: EEA GHG Data Viewer / EDGAR v8 / IEEP fair-share analysis (2021).</p>
    </div>
  );
}

// ── Explainer cards ───────────────────────────────────────────────────────────
function WhatIsGHGCard() {
  const gases = [
    { gas: 'CO\u2082', gwp: '1 (reference)',   lifetime: '50–200 yr',    source: 'Fossil fuels, industry, LULUCF' },
    { gas: 'CH\u2084', gwp: '30\u00d7',        lifetime: '~12 yr',       source: 'Agriculture (livestock), waste, gas leaks' },
    { gas: 'N\u2082O', gwp: '265\u00d7',       lifetime: '~114 yr',      source: 'Fertilisers, manure, industrial processes' },
    { gas: 'HFCs',     gwp: 'up to 14,800\u00d7', lifetime: '1–270 yr', source: 'Refrigeration, air conditioning' },
    { gas: 'SF\u2086', gwp: '23,500\u00d7',    lifetime: '~3,200 yr',    source: 'Electrical switchgear, industry' },
  ];
  return (
    <SectionCard icon="🌍" title="What is a greenhouse gas?" borderColor={TOPIC_COLOR}>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#374151', marginBottom: 14 }}>
        Greenhouse gases (GHGs) absorb outgoing infrared radiation from Earth&#39;s surface and re-emit it back downward — trapping heat that would otherwise escape to space. Without any greenhouse effect, Earth&#39;s average surface temperature would be around -18°C. Human activities have dramatically increased atmospheric concentrations of these gases since industrialisation, intensifying the natural effect and driving global warming.
      </p>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#374151', marginBottom: 16 }}>
        Not all GHGs are equally potent. Scientists compare them using the <strong>Global Warming Potential over 100 years (GWP100)</strong> — the total heat trapped by 1 tonne of a gas over a century, relative to CO₂. While CO₂ is the most abundant GHG, some F-gases trap tens of thousands of times more heat per molecule. The bubble chart below plots each gas on this scale — position shows warming power, bubble size shows its share of Belgian emissions.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e3da' }}>
              {['Gas', 'GWP100 (AR5)', 'Atmospheric lifetime', 'Main Belgian sources'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gases.map((g, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '7px 10px', fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: '#1a1a1a' }}>{g.gas}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{g.gwp}</td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{g.lifetime}</td>
                <td style={{ padding: '7px 10px', color: '#6b7280' }}>{g.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function WhatIsFootprintCard() {
  return (
    <SectionCard icon="👣" title="What is a carbon footprint — and why do two numbers exist?" borderColor={TOPIC_COLOR}>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#374151', marginBottom: 20 }}>
        A carbon footprint measures the total GHG emissions caused by an individual, organisation or country — expressed in tonnes of CO₂ equivalent. For countries, two fundamentally different accounting methods give very different results.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', marginBottom: 6 }}>Territorial (production-based)</p>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 8 }}>8.3 t/cap</p>
          <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.65 }}>
            Counts all emissions <strong>physically occurring on Belgian soil</strong> — from factories, cars, farms and buildings in Belgium. This is the official figure reported to the EU and UNFCCC, and what this indicator tracks.
          </p>
        </div>
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7c3aed', marginBottom: 6 }}>Consumption-based (full footprint)</p>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 8 }}>~15.7 t/cap</p>
          <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.65 }}>
            Counts all emissions <strong>caused by what Belgians consume</strong>, regardless of where production happened. Importing steel from Asia or electronics from Taiwan means those manufacturing emissions are counted in Belgium&#39;s consumption footprint.
          </p>
        </div>
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid ${TOPIC_COLOR}` }}>
        <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, marginBottom: 8 }}>
          <strong>The ~7.4 tonne gap</strong> is Belgium&#39;s &#39;imported carbon&#39; — the CO₂ embedded in goods manufactured abroad but consumed in Belgium. This matters for policy: reducing territorial emissions by offshoring production does not reduce Belgium&#39;s true climate impact. Consumption-based accounting holds countries responsible for what they buy, not just what they produce domestically.
        </p>
        <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
          ⚠ Note: the consumption-based figure (~15.7 t) uses 2019 data from UCLouvain — a different reference year from the territorial indicator (2023). The two figures use different methodologies and are not directly comparable.
        </p>
      </div>
    </SectionCard>
  );
}

function ElectricalVsThermalCard() {
  return (
    <SectionCard icon="⚡" title="Electrical energy vs thermal energy — why the distinction matters" borderColor={TOPIC_COLOR}>
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#374151', marginBottom: 16 }}>
        Final Energy Consumption (FEC) captures the energy actually delivered to end users — after all conversion and transmission losses. It includes two fundamentally different forms that play very different roles in the energy transition.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ea580c', marginBottom: 8 }}>🔥 Thermal energy (~75% of Belgian FEC)</p>
          <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65 }}>
            Heat delivered directly to the end user: natural gas burned in a home boiler, diesel in a lorry engine, coal in a steel furnace. Most of Belgium&#39;s energy use today is thermal — and most of it comes from fossil fuels.
          </p>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '16px 18px' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1d4ed8', marginBottom: 8 }}>⚡ Electrical energy (~25% of Belgian FEC)</p>
          <p style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.65 }}>
            The versatile, zero-emission-at-point-of-use form. It can power anything from a heat pump to a steel arc furnace, and can be generated from renewables. Electrification of heat and transport is central to Belgium&#39;s decarbonisation strategy.
          </p>
        </div>
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 16px', borderLeft: `3px solid ${TOPIC_COLOR}` }}>
        <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7 }}>
          <strong>The efficiency advantage of electrification:</strong> a heat pump delivering 1 unit of heat uses only ~0.33 units of electricity (coefficient of performance ≈ 3), compared to burning 1 unit of gas for 0.85–0.90 units of heat. This means total FEC can <em>fall</em> even as electricity demand <em>rises</em>. Belgium&#39;s NECP projects a roughly 40% increase in electricity demand by 2030 alongside an overall FEC reduction target — a dual challenge of replacing gas boilers and combustion engines while keeping the grid balanced.
        </p>
      </div>
    </SectionCard>
  );
}

function GridCongestionCard({ capacityData }: { capacityData: any[] }) {
  const solar   = capacityData.find(d => d.source === 'Solar PV');
  const offshore = capacityData.find(d => d.source === 'Offshore wind');
  return (
    <SectionCard icon="🔌" title="Grid congestion — the infrastructure bottleneck" borderColor="#dc2626">
      <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#374151', marginBottom: 16 }}>
        Belgium&#39;s electricity grid was designed for centralised fossil fuel generation — power flowing one way, from large plants to consumers. Rapid growth in distributed solar and wind is creating structural mismatches that are already causing measurable problems.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#dc2626', marginBottom: 6 }}>🚫 Curtailment &amp; negative electricity prices</p>
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
            When more electricity is generated than the grid can transmit or consumers can absorb, grid operators must instruct generators to reduce output — wasting clean energy that has already been built and paid for.
            {solar ? <> Solar PV curtailment is already occurring in Belgium&#39;s distribution grid during high-generation periods. Elia recorded negative wholesale electricity prices <strong>6.1% of the time in 2025</strong> — meaning generators were effectively paying to export power.</> : null}
          </p>
        </div>
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#ea580c', marginBottom: 6 }}>🔧 Belgium&#39;s infrastructure bottlenecks</p>
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65, marginBottom: 8 }}>
            <strong>Ventilus</strong> (West Flanders): a new 380 kV high-voltage line critical for connecting offshore wind to the national grid — its permit process faced years of delays due to local opposition and environmental procedures.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
            <strong>Boucle du Hainaut</strong> (Wallonia): a grid reinforcement ring essential for southern Belgium&#39;s electricity capacity — also behind schedule.
            {offshore ? <> Together, these delays constrain how much additional offshore capacity can be delivered: the Princess Elisabeth Zone alone has seen farms delayed by 3+ years per Elia&#39;s 2025 assessment.</> : null}
          </p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#16a34a', marginBottom: 6 }}>✅ What can solve it</p>
          <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.65 }}>
            <strong>Battery storage</strong> absorbs excess generation and releases it during demand peaks. <strong>Demand flexibility</strong> shifts industrial and commercial loads to high-generation periods. <strong>Smart EV charging</strong> turns vehicles into mobile buffers. <strong>Cross-border interconnectors</strong> with France, the Netherlands, the UK and Germany spread the load. Elia&#39;s Adequacy &amp; Flexibility study projects Belgium will need 1.5–2.5 GW of new flexibility capacity by 2030 to absorb the renewable ramp-up.
          </p>
        </div>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Source: Elia Adequacy Report (2025) / Princess Elisabeth Zone tender documentation / FPS Economy Belgium.</p>
    </SectionCard>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
// Standard sections for all slugs — sub-sections within technical-info are NOT
// listed here (they live inside the card, not as separate sidebar entries).
const BASE_SECTIONS = [
  { id: 'key-figures',    label: 'Key figures'        },
  { id: 'technical-info', label: 'Technical info'     },
  { id: 'consequences',   label: 'Consequences'       },
  { id: 'responsibility', label: 'Gov. responsibility'},
  { id: 'policy',         label: 'Policy'             },
  { id: 'data-source',    label: 'Data source'        },
];

const CHART_LABEL: Record<string, string> = {
  'total-ghg-emissions':                         'Historical trend',
  'per-capita-ghg-footprint':                    'Footprint breakdown',
  'final-energy-consumption':                    'Energy mix',
  'renewable-electricity-share-of-generation':   'Renewables mix',
};

// Build SECTION_DEFS dynamically: insert main-chart entry where applicable
const SECTION_DEFS: Record<string, { id: string; label: string }[]> = Object.fromEntries(
  Object.keys(CHART_LABEL).concat(
    ['renewable-energy-share-of-final-consumption','primary-energy-consumption','climate-neutrality']
  ).map(slug => [
    slug,
    CHART_LABEL[slug]
      ? [BASE_SECTIONS[0], { id: 'main-chart', label: CHART_LABEL[slug] }, ...BASE_SECTIONS.slice(1)]
      : BASE_SECTIONS,
  ])
);

function ClimateSidebar({ slug }: { slug: string }) {
  const [active, setActive] = useState('key-figures');
  const sections = SECTION_DEFS[slug] ?? SECTION_DEFS['total-ghg-emissions'];

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(s.id); return; }
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClimateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="loading">Loading…</div>;

  const indicatorName = SLUG_MAP[slug];
  if (!indicatorName) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Indicator not found.</p>
      <Link href="/indicators?topic=climate_energy">← Back to overview</Link>
    </div>
  );

  const ind = data.topics.climate_energy?.indicators?.find((i: any) => i.indicator === indicatorName);

  const historicalGHG: { year: number; value: number }[] =
    data.historical?.climate_energy?.series?.['Total GHG Emissions']?.map(
      (d: any) => ({ year: d.year, value: d.value })
    ) ?? [];

  const climateSupp      = data.climate_supplementary ?? {};
  const finalEnergyData  = climateSupp.final_energy_by_sector ?? [];
  const renewableCapData = climateSupp.renewable_capacity ?? [];

  const sc = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  let chartNode: React.ReactNode = null;
  if (slug === 'total-ghg-emissions') {
    chartNode = <LineChartBlock data={historicalGHG} />;
  } else if (slug === 'per-capita-ghg-footprint') {
    chartNode = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <PieChartBlock data={FOOTPRINT_CATEGORIES} title="Consumption-based footprint by lifestyle category (~15.7 t/cap, 2019)" source="Source: UCLouvain (2021)" />
        <PieChartBlock data={GHG_SECTORS} title="Territorial emissions by sector (% of 97.9 MtCO\u2082eq, 2023)" source="Source: National Climate Commission (2025)" />
      </div>
    );
  } else if (slug === 'final-energy-consumption') {
    chartNode = <PieChartBlock data={ENERGY_MIX} title="Energy mix — % of Final Energy Consumption (2022)" source="Source: IEA World Energy Balances / Eurostat" />;
  } else if (slug === 'renewable-electricity-share-of-generation') {
    chartNode = <PieChartBlock data={RENEWABLES_MIX} title="Renewables breakdown — % of total renewable energy (2023)" source="Source: IRENA Belgium Profile / Eurostat SHARES" />;
  }

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/indicators?topic=climate_energy" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Climate &amp; Energy</p>
          <h1 className="detail-title">{indicatorName}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge" style={{ color: sc.color, background: sc.bg, padding: '5px 14px' }}>{sc.label}</span>
            {ind?.trend && (
              <span style={{ color: '#b0b0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                {ind.trend === 'Improving' ? '↑' : ind.trend === 'Worsening' ? '↓' : '→'} {ind.trend}
              </span>
            )}
          </div>
          {(ind?.short_description || ind?.description) && (
            <p style={{ color: '#d1d5db', fontSize: '0.95rem', marginTop: 14, maxWidth: 680, lineHeight: 1.6 }}>
              {ind.short_description || ind.description}
            </p>
          )}
        </div>
      </div>

      <div className="detail-body">
        <ClimateSidebar slug={slug} />
        <div className="detail-main">

          {/* Key figures */}
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

          {/* Main chart — primary visualisation only */}
          {chartNode && <div id="main-chart" className="detail-charts">{chartNode}</div>}

          {/* All info sections — slug-specific content lives inside technical-info */}
          <div className="detail-info">

            <div id="technical-info">
              {/* total-ghg-emissions */}
              {slug === 'total-ghg-emissions' && (<><WhatIsGHGCard /><GHGBubbleChart /></>)}

              {/* per-capita-ghg-footprint */}
              {slug === 'per-capita-ghg-footprint' && (<><WhatIsFootprintCard /><PerCapitaComparisonChart /></>)}

              {/* final-energy-consumption */}
              {slug === 'final-energy-consumption' && (<>
                {finalEnergyData.length > 0 && <EnergySectorsChart data={finalEnergyData} />}
                <ElectricalVsThermalCard />
              </>)}

              {/* renewable-electricity-share-of-generation */}
              {slug === 'renewable-electricity-share-of-generation' && (<>
                {renewableCapData.length > 0 && <RenewableCapacityChart data={renewableCapData} />}
                <GridCongestionCard capacityData={renewableCapData} />
              </>)}

              {/* Slugs without custom content — show notes as technical info */}
              {!['total-ghg-emissions','per-capita-ghg-footprint','final-energy-consumption','renewable-electricity-share-of-generation'].includes(slug) && ind?.notes && (
                <TechnicalInfoCard text={ind.notes} />
              )}
            </div>

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
                <DataSourceRow source={ind.data_source} url={ind.data_source_url} />
              </InfoRow>
            )}</div>
          </div>

        </div>{/* /detail-main */}
      </div>
    </div>
  );
}
