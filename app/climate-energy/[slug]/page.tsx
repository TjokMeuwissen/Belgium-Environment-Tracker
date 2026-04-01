'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Slug → indicator name map ─────────────────────────────────────────────
const TOPIC_COLOR = '#f97316'; // Climate & Energy orange

const SLUG_MAP: Record<string, string> = {
  'total-ghg-emissions':                         'Total GHG Emissions',
  'per-capita-ghg-footprint':                    'Per-capita GHG Footprint',
  'final-energy-consumption':                    'Final Energy Consumption',
  'renewable-electricity-share-of-generation':   'Renewable Electricity Share (% of generation)',
  'renewable-energy-share-of-final-consumption': 'Renewable Energy Share (% of final consumption)',
  'primary-energy-consumption':                  'Primary Energy Consumption',
  'climate-neutrality':                          'Climate Neutrality',
};

// ── Chart data (same as ClimateEnergyTab) ─────────────────────────────────
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
  { name: 'Housing',    value: 31.4, color: '#dc2626' },
  { name: 'Equipment',  value: 23.3, color: '#f97316' },
  { name: 'Transport',  value: 19.9, color: '#eab308' },
  { name: 'Food',       value: 15.0, color: '#22c55e' },
  { name: 'Services',   value: 7.3,  color: '#06b6d4' },
  { name: 'Other',      value: 3.1,  color: '#9ca3af' },
];

const GHG_SECTORS = [
  { name: 'Industry & construction', value: 28.3, color: '#dc2626' },
  { name: 'Transport',               value: 25.4, color: '#f97316' },
  { name: 'Buildings (heating)',     value: 17.8, color: '#eab308' },
  { name: 'Energy industries',       value: 16.0, color: '#8b5cf6' },
  { name: 'Agriculture',             value: 11.6, color: '#22c55e' },
  { name: 'Other',                   value: 1.9,  color: '#9ca3af' },
];

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'  },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'  },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'   },
};

function fmt(v: any, unit: string | null) {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-info-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{children}</div>
    </div>
  );
}

// Splits long text into bullet points at sentence boundaries
// ── Text processing helpers ────────────────────────────────────────────────

// Rewrites arrow-notation infringement chain into readable prose
function rewriteArrows(text: string): string {
  return text.replace(
    /EU infringement proceedings\s*→\s*referral to Court of Justice\s*→\s*financial fines/gi,
    'EU infringement proceedings, which can escalate to a referral to the Court of Justice of the EU and ultimately result in significant financial fines imposed on Belgium'
  ).replace(
    /infringement\s*→\s*ECJ\s*→\s*lump sum \/ daily fines/gi,
    'infringement proceedings before the Court of Justice, which can result in lump-sum payments or recurring daily fines until Belgium complies'
  ).replace(/\s*→\s*/g, ', leading to ');
}

// Splits text into sentences
function toSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z🇧"'])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Groups consequences: detects "past occurrences" sentences and nests them
function buildConsequenceBullets(text: string): Array<{ text: string; sub?: string[] }> {
  const sentences = toSentences(rewriteArrows(text));

  const pastKeywords = /already (faced|subject|missed)|court ruling|previous|infringement.*\d{4}|INFR\s*\d{4}/i;
  const pastItems: string[] = [];
  const mainItems: string[] = [];

  sentences.forEach(s => {
    if (pastKeywords.test(s)) {
      pastItems.push(s);
    } else {
      mainItems.push(s);
    }
  });

  const result: Array<{ text: string; sub?: string[] }> = mainItems.map(t => ({ text: t }));

  if (pastItems.length > 0) {
    result.push({
      text: 'Previous occurrences',
      sub: pastItems,
    });
  }

  return result;
}

// ── Responsibility grouping ────────────────────────────────────────────────

function groupResponsibility(text: string): {
  federal: string[];
  shared: string[];
  regional: string[];
} {
  const sentences = toSentences(text);

  const isFederal  = (s: string) => /\bfederal\b/i.test(s) && !/region|flanders|wallonia|brussels|flemish|walloon/i.test(s);
  const isRegional = (s: string) => /region|flanders|wallonia|brussels|flemish|walloon/i.test(s) && !/\bfederal\b/i.test(s);
  const isShared   = (s: string) =>
    /shared|coordinated|both|all levels|ICE|inter-?federal|inter-?ministerial/i.test(s) ||
    (/\bfederal\b/i.test(s) && /region|flanders|wallonia|brussels/i.test(s));

  const federal:  string[] = [];
  const shared:   string[] = [];
  const regional: string[] = [];

  sentences.forEach(s => {
    if (isShared(s))        shared.push(s);
    else if (isFederal(s))  federal.push(s);
    else if (isRegional(s)) regional.push(s);
    else                    shared.push(s); // default to shared if unclear
  });

  return { federal, shared, regional };
}

// ── Card components ────────────────────────────────────────────────────────

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
  const primaryMatch = text.match(/^(Regional|Federal|Shared)\s*\(primary\)\.\s*/i);
  const primaryLevel = primaryMatch ? primaryMatch[1] : null;
  const cleanText    = primaryMatch ? text.slice(primaryMatch[0].length) : text;
  const { federal, shared, regional } = groupResponsibility(cleanText);
  const pcMap: Record<string, { bg: string; border: string; text: string }> = {
    Regional: { bg: '#f0fdf4', border: '#16a34a', text: '#14532d' },
    Federal:  { bg: '#eff6ff', border: '#2563eb', text: '#1e3a8a' },
    Shared:   { bg: '#fefce8', border: '#ca8a04', text: '#713f12' },
  };
  const pc = primaryLevel ? pcMap[primaryLevel] ?? pcMap.Regional : null;
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
  if (sources.length === 1 && urls.length === 1) {
    return <a href={urls[0]} target="_blank" rel="noopener noreferrer" className="detail-link">{sources[0]} ↗</a>;
  }
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

function PieChartBlock({ data, title, source }: {
  data: { name: string; value: number; color: string }[];
  title: string;
  source: string;
}) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} cx="50%" cy="45%" outerRadius={110} dataKey="value" labelLine={false}>
            {data.map((e, i) => <Cell key={i} fill={e.color} stroke="white" strokeWidth={2} />)}
          </Pie>
          <Tooltip
            formatter={(v: any, n: any) => [`${v}%`, n]}
            contentStyle={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
          />
          <Legend iconType="circle" iconSize={9}
            formatter={v => <span style={{ fontSize: 12, color: '#4b5563' }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">{source}</p>
    </div>
  );
}

function LineChartBlock({ data }: { data: { year: number; value: number }[] }) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Total GHG Emissions — Belgium 1990–2023 (MtCO₂eq)</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={45} domain={[0, 160]} />
          <Tooltip
            contentStyle={{ background: '#ffffff', color: '#1a1a1a', border: '1px solid #e5e3da', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            formatter={(v: any) => [`${v} MtCO₂eq`, 'GHG Emissions']}
            labelStyle={{ fontWeight: 700 }}
          />
          <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
          <ReferenceLine
            y={64.3}
            stroke="#f97316"
            strokeDasharray="6 4"
            strokeWidth={1.8}
            label={{
              value: '🎯 2030 target: 64.3 MtCO₂eq',
              position: 'insideTopRight',
              fontSize: 11,
              fill: '#f97316',
              fontWeight: 600,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">Source: National Climate Commission / indicators.be</p>
    </div>
  );
}


// ── Per-slug sidebar sections ─────────────────────────────────────────────────
const SECTION_DEFS: Record<string, { id: string; label: string }[]> = {
  'total-ghg-emissions': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'main-chart',     label: 'Historical trend'       },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
  'per-capita-ghg-footprint': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'main-chart',     label: 'Footprint breakdown'    },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
  'final-energy-consumption': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'main-chart',     label: 'Energy mix'             },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
  'renewable-electricity-share-of-generation': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'main-chart',     label: 'Renewables breakdown'   },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
  'renewable-energy-share-of-final-consumption': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
  'primary-energy-consumption': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
  'climate-neutrality': [
    { id: 'key-figures',    label: 'Key figures'            },
    { id: 'technical-info', label: 'Technical information'  },
    { id: 'consequences',   label: 'Consequences'           },
    { id: 'responsibility', label: 'Gov. responsibility'    },
    { id: 'policy',         label: 'Policy'                 },
    { id: 'data-source',    label: 'Data source'            },
  ],
};

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

export default function ClimateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="loading">Loading…</div>;

  const indicatorName = SLUG_MAP[slug];
  if (!indicatorName) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Indicator not found.</p>
      <Link href="/indicators?topic=climate_energy">← Back to overview</Link>
    </div>
  );

  const ind = data.topics.climate_energy?.indicators?.find(
    (i: any) => i.indicator === indicatorName
  );

  const historicalGHG: { year: number; value: number }[] =
    data.historical?.climate_energy?.series?.['Total GHG Emissions']?.map(
      (d: any) => ({ year: d.year, value: d.value })
    ) ?? [];

  const sc = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  // Which chart to show
  let chartNode: React.ReactNode = null;
  if (slug === 'total-ghg-emissions') {
    chartNode = <LineChartBlock data={historicalGHG} />;
  } else if (slug === 'per-capita-ghg-footprint') {
    chartNode = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
        <PieChartBlock
          data={FOOTPRINT_CATEGORIES}
          title="Consumption-based footprint by lifestyle category (~15.7 t/cap, 2019)"
          source="Source: UCLouvain (2021)"
        />
        <PieChartBlock
          data={GHG_SECTORS}
          title="Territorial emissions by sector (% of 97.9 MtCO₂eq, 2023)"
          source="Source: National Climate Commission (2025)"
        />
      </div>
    );
  } else if (slug === 'final-energy-consumption') {
    chartNode = (
      <PieChartBlock
        data={ENERGY_MIX}
        title="Energy mix — % of Final Energy Consumption (2022)"
        source="Source: IEA World Energy Balances / Eurostat"
      />
    );
  } else if (slug === 'renewable-electricity-share-of-generation') {
    chartNode = (
      <PieChartBlock
        data={RENEWABLES_MIX}
        title="Renewables breakdown — % of total renewable energy (2023)"
        source="Source: IRENA Belgium Profile / Eurostat SHARES"
      />
    );
  }

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/indicators?topic=climate_energy" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Climate & Energy</p>
          <h1 className="detail-title">{indicatorName}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge" style={{ color: sc.color, background: sc.bg, padding: '5px 14px' }}>
              {sc.label}
            </span>
            {ind?.trend && (
              <span style={{ color: '#b0b0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                {ind.trend === 'Improving' ? '↑' : ind.trend === 'Worsening' ? '↓' : '→'} {ind.trend}
              </span>
            )}
          </div>
          {/* Description shown directly below header */}
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

        {/* Charts */}
        {chartNode && <div id="main-chart" className="detail-charts">{chartNode}</div>}

        {/* Detail information */}
        <div className="detail-info">
          <div id="technical-info">{ind?.description && <TechnicalInfoCard text={ind.description} notes={ind.notes} />}</div>
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
