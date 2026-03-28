'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  LineChart, Line, ResponsiveContainer, Cell,
} from 'recharts';

// ── Slug → display name ────────────────────────────────────────────────────
const SLUG_MAP: Record<string, string> = {
  'protected-land-area-terrestrial':                       'Protected land area (terrestrial)',
  'marine-protected-areas':                                'Marine protected areas',
  'species-habitats-in-favourable-conservation-status':    'Species & habitats in favourable conservation status',
  'organic-farming-share':                                 'Organic farming share',
  'farmland-bird-population-index':                        'Farmland Bird Population Index',
  'invasive-alien-species-threatening-red-listed-species': 'Invasive alien species threatening red-listed species',
};

const DISPLAY_NAME: Record<string, string> = {
  'protected-land-area-terrestrial':                       'Protected Land Area (Terrestrial)',
  'marine-protected-areas':                                'Marine Protected Areas',
  'species-habitats-in-favourable-conservation-status':    'Species & Habitats in Favourable Conservation Status',
  'organic-farming-share':                                 'Organic Farming Share',
  'farmland-bird-population-index':                        'Farmland Bird Population Index',
  'invasive-alien-species-threatening-red-listed-species': 'Invasive Alien Species Threatening Red-Listed Species',
};

// ── EU comparison data ─────────────────────────────────────────────────────
const EU_COMPARISON = [
  { country: 'Luxembourg',  total: 40.6, status: 'Achieved'  },
  { country: 'Slovenia',    total: 40.6, status: 'Achieved'  },
  { country: 'Poland',      total: 39.6, status: 'Achieved'  },
  { country: 'Germany',     total: 38.5, status: 'Achieved'  },
  { country: 'Bulgaria',    total: 38.4, status: 'Achieved'  },
  { country: 'Croatia',     total: 37.2, status: 'Achieved'  },
  { country: 'Slovakia',    total: 35.7, status: 'Achieved'  },
  { country: 'Greece',      total: 33.8, status: 'Achieved'  },
  { country: 'Cyprus',      total: 31.2, status: 'Achieved'  },
  { country: 'Romania',     total: 27.9, status: 'Close'     },
  { country: 'Spain',       total: 27.6, status: 'Close'     },
  { country: 'Hungary',     total: 26.9, status: 'Close'     },
  { country: 'Italy',       total: 27.0, status: 'Close'     },
  { country: 'Austria',     total: 26.5, status: 'Close'     },
  { country: 'EU-27 avg',   total: 26.4, status: 'Close'     },
  { country: 'France',      total: 25.5, status: 'Close'     },
  { country: 'Portugal',    total: 24.8, status: 'Close'     },
  { country: 'Lithuania',   total: 22.2, status: 'Close'     },
  { country: 'Czechia',     total: 21.8, status: 'Close'     },
  { country: 'Estonia',     total: 21.8, status: 'Close'     },
  { country: 'Ireland',     total: 20.4, status: 'Close'     },
  { country: 'Netherlands', total: 19.8, status: 'Off track' },
  { country: 'Latvia',      total: 19.0, status: 'Off track' },
  { country: 'Malta',       total: 17.8, status: 'Off track' },
  { country: 'Sweden',      total: 15.0, status: 'Off track' },
  { country: 'Belgium',     total: 14.7, status: 'Belgium'   },
  { country: 'Finland',     total: 13.4, status: 'Off track' },
  { country: 'Denmark',     total:  8.7, status: 'Off track' },
].sort((a, b) => b.total - a.total);

const BAR_COLOR: Record<string, string> = {
  Achieved: '#bbf7d0', Close: '#fef08a', 'Off track': '#fecaca', Belgium: '#b91c1c',
};

const BoldTick = (props: any) => {
  const { x, y, payload } = props;
  const isBE = payload.value === 'Belgium';
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={isBE ? 12 : 11} fontWeight={isBE ? 700 : 400} fill={isBE ? '#b91c1c' : '#4b5563'}>
      {payload.value}
    </text>
  );
};

// ── Habitat examples ───────────────────────────────────────────────────────
const HABITAT_EXAMPLES = [
  { label: 'Heath & Scrub',      icon: '/icons/grassland.svg', pctBad: 100,  note: '100% of assessments rated Bad — complete conservation failure for this habitat type in Belgium.' },
  { label: 'Bogs, Mires & Fens', icon: '/icons/bogs.svg',      pctBad: 100,  note: 'All assessed bog and fen habitats are in unfavourable conservation status, driven by drainage, nitrogen deposition and peat extraction.' },
  { label: 'Vascular Plants',    icon: '/icons/plant.svg',      pctBad: 55.5, note: '55.5% of assessed vascular plant species in Bad status — the highest proportion among all species groups in Belgium.' },
  { label: 'Fish',               icon: '/icons/fish.svg',       pctBad: 50,   note: 'Approximately half of assessed fish species in Bad status, driven by water quality, physical barriers and invasive species.' },
];

// ── IAS data ───────────────────────────────────────────────────────────────
const IAS_EMOJI: Record<string, string> = {
  'American Bullfrog': '🐸', 'Japanese Knotweed': '🌿',
  'Asian Hornet': '🐝', 'American Mink': '🦦',
};

// ── Misc ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'  },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'  },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track' },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ No data'   },
};

const TOOLTIP_STYLE = {
  background: '#fff', color: '#1a1a1a',
  border: '1px solid #e5e3da', borderRadius: 8,
  fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
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

// ── Chart components ───────────────────────────────────────────────────────
function EUBarChartLarge() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Protected land area — all EU member states (% of land area, 2023)</div>
      <ResponsiveContainer width="100%" height={640}>
        <BarChart data={EU_COMPARISON} layout="vertical" margin={{ top: 4, right: 48, left: 100, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11, fill: '#6b6b6b' }} tickLine={false}
            label={{ value: '% of land area', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: '#9ca3af' }} />
          <YAxis type="category" dataKey="country" width={96} tick={<BoldTick />} tickLine={false} axisLine={false} interval={0} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, '']} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <ReferenceLine x={30} stroke="#f97316" strokeDasharray="4 2" strokeWidth={1.5}
            label={{ value: '30% EU target', position: 'insideTopRight', fontSize: 10, fill: '#f97316' }} />
          <Bar dataKey="total" radius={[0, 3, 3, 0]}>
            {EU_COMPARISON.map((e, i) => <Cell key={i} fill={BAR_COLOR[e.status] ?? '#e5e7eb'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        {[['#bbf7d0', 'Achieved (≥30%)'], ['#fef08a', 'Close (20–30%)'], ['#fecaca', 'Off track (<20%)']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color as string }} />
            <span style={{ color: '#4b5563' }}>{label}</span>
          </div>
        ))}
      </div>
      <p className="detail-chart-source">Source: EEA — Designated terrestrial protected areas in Europe (2025)</p>
    </div>
  );
}

function LineChartBlock({ data, color, title, unit, source }: { data: { year: number; value: number }[]; color: string; title: string; unit: string; source: string; }) {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={44} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}${unit ? ' ' + unit : ''}`, '']} labelStyle={{ fontWeight: 700 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="detail-chart-source">{source}</p>
    </div>
  );
}

function HabitatBlock() {
  return (
    <div className="detail-chart-block">
      <div className="detail-chart-title">Conservation status — selected habitats & species groups (Belgium, 2019 Art. 17 reporting)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        {HABITAT_EXAMPLES.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 14px', background: '#f9fafb', borderRadius: 8 }}>
            <div style={{ flexShrink: 0, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <Image src={h.icon} alt={h.label} width={36} height={36} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Roboto,sans-serif', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{h.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ flex: 1, height: 9, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${h.pctBad}%`, height: '100%', background: '#dc2626', borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>{h.pctBad}% Bad status</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6b6b6b', lineHeight: 1.55 }}>{h.note}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="detail-chart-source">Source: EEA — State of Nature in the EU (2020), Belgium Art. 17 Habitats Directive reporting</p>
    </div>
  );
}

function IASBlock({ species }: { species: any[] }) {
  return (
    <div className="ias-detail-grid">
      {species.map((sp, i) => (
        <div key={i} className="ias-detail-card">
          <div className="ias-detail-accent" />
          <div className="ias-detail-body">
            <div className="ias-detail-header">
              <span className="ias-detail-emoji">{IAS_EMOJI[sp.common_name] ?? '🦠'}</span>
              <div>
                <div className="ias-detail-name">{sp.common_name}</div>
                <div className="ias-detail-sci">{sp.scientific_name} · Origin: {sp.origin}</div>
              </div>
            </div>
            <div className="ias-detail-section"><strong>Ecological impact</strong><p>{sp.impact}</p></div>
            <div className="ias-detail-section"><strong>Current management</strong><p>{sp.management}</p></div>
            <div className="ias-detail-section"><strong>EU regulatory status</strong><p>{sp.eu_status}</p></div>
            <div className="ias-detail-section"><strong>Establishment in Belgium</strong><p>{sp.establishment} · First recorded: {sp.first_recorded}</p></div>
            {sp.source_url && (
              <div className="ias-detail-section">
                <strong>Source</strong>
                <a href={sp.source_url} target="_blank" rel="noopener noreferrer">{sp.source} ↗</a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function NatureDetailPage() {
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
      <Link href="/" style={{ color: '#22c55e', fontWeight: 600 }}>← Back to overview</Link>
    </div>
  );

  const ind = data.topics.nature_biodiversity?.indicators?.find((i: any) => i.indicator === indicatorName);
  const sc = STATUS_CFG[ind?.status ?? ''] ?? STATUS_CFG['Insufficient data'];

  const historicalOrganic = data.historical?.nature_biodiversity?.series?.['Organic farming share']?.map((d: any) => ({ year: d.year, value: d.value })) ?? [];
  const historicalBirds   = data.historical?.nature_biodiversity?.series?.['Farmland bird population index']?.map((d: any) => ({ year: d.year, value: d.value })) ?? [];
  const invasiveSpecies   = data.nature_supplementary?.invasive_alien_species ?? [];

  const displayName = DISPLAY_NAME[slug] ?? indicatorName;

  // Pick chart for this slug
  let chartNode: React.ReactNode = null;
  if (slug === 'protected-land-area-terrestrial')                       chartNode = <EUBarChartLarge />;
  else if (slug === 'species-habitats-in-favourable-conservation-status') chartNode = <HabitatBlock />;
  else if (slug === 'organic-farming-share')
    chartNode = <LineChartBlock data={historicalOrganic} color="#22c55e" title="Organic farming share — Belgium 2000–2023" unit="% UAA" source="Source: Eurostat / Statbel" />;
  else if (slug === 'farmland-bird-population-index')
    chartNode = <LineChartBlock data={historicalBirds} color="#f97316" title="Farmland bird population index — Belgium 1990–2023 (1990 = 100)" unit="" source="Source: INBO / Natagora / indicators.be" />;
  else if (slug === 'invasive-alien-species-threatening-red-listed-species')
    chartNode = <IASBlock species={invasiveSpecies} />;

  return (
    <div className="detail-page">
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner">
          <Link href="/" className="back-link">← Back to overview</Link>
          <p className="header-eyebrow" style={{ marginTop: 16 }}>🇧🇪 Nature & Biodiversity</p>
          <h1 className="detail-title">{displayName}</h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="status-badge" style={{ color: sc.color, background: sc.bg, padding: '5px 14px' }}>{sc.label}</span>
            {ind?.trend && (
              <span style={{ color: '#b0b0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                {ind.trend === 'Improving' ? '↑' : ind.trend === 'Worsening' ? '↓' : '→'} {ind.trend}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="detail-body">
        {/* Key figures */}
        <div className="detail-figures">
          {ind?.latest_value != null && (
            <div className="figure-card">
              <div className="figure-label">Latest value</div>
              <div className="figure-number">{fmt(ind.latest_value, ind.unit)}</div>
              <div className="figure-year">{ind.latest_value_year}</div>
            </div>
          )}
          {ind?.target_value != null && (
            <div className="figure-card">
              <div className="figure-label">Target</div>
              <div className="figure-number">{fmt(ind.target_value, ind.unit)}</div>
              <div className="figure-year">by {ind.target_year}</div>
            </div>
          )}
          {ind?.target_context && (
            <div className="figure-card figure-card-wide">
              <div className="figure-label">Target context</div>
              <div className="figure-text">{ind.target_context}</div>
            </div>
          )}
        </div>

        {/* Chart */}
        {chartNode && <div className="detail-charts">{chartNode}</div>}

        {/* Detail info */}
        <div className="detail-info">
          {ind?.description  && <InfoRow label="Description">{ind.description}</InfoRow>}
          {ind?.notes        && <InfoRow label="Notes">{ind.notes}</InfoRow>}
          {ind?.consequences && <InfoRow label="Consequences if missed">{ind.consequences}</InfoRow>}
          {ind?.responsible  && <InfoRow label="Government responsibility">{ind.responsible}</InfoRow>}
          {ind?.policy       && (
            <InfoRow label="Policy / Legal basis">
              {ind.policy_url
                ? <a href={ind.policy_url} target="_blank" rel="noopener noreferrer" className="detail-link">{ind.policy} ↗</a>
                : ind.policy}
            </InfoRow>
          )}
          {ind?.data_source && (
            <InfoRow label="Data source">
              {ind.data_source_url
                ? <a href={ind.data_source_url} target="_blank" rel="noopener noreferrer" className="detail-link">{ind.data_source} ↗</a>
                : ind.data_source}
            </InfoRow>
          )}
        </div>
      </div>
    </div>
  );
}
