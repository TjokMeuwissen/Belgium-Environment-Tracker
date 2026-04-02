'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

// ── Region colours ────────────────────────────────────────────────────────────
const FL_COLOR  = '#F59E0B'; // Flanders — amber/gold
const WA_COLOR  = '#DC2626'; // Wallonia — red
const BXL_COLOR = '#7C3AED'; // Brussels — purple (iris)
const NA_COLOR  = '#E5E7EB'; // N/A stub

// ── Topic config ─────────────────────────────────────────────────────────────
const TOPIC_COLOR: Record<string, string> = {
  climate_energy:      '#f97316',
  nature_biodiversity: '#22c55e',
  circularity_waste:   '#06b6d4',
  water_soil:          '#3b82f6',
  air_quality:         '#8b5cf6',
};

const TOPIC_LABEL: Record<string, string> = {
  climate_energy:      '\uD83C\uDF21\uFE0F  Climate & Energy',
  nature_biodiversity: '\uD83C\uDF3F  Nature & Biodiversity',
  circularity_waste:   '\u267B\uFE0F  Circularity & Waste',
  water_soil:          '\uD83D\uDCA7  Water & Soil',
  air_quality:         '\uD83D\uDCA8  Air Quality',
};

// Must match national tab order
const TOPIC_ORDER = [
  'climate_energy',
  'nature_biodiversity',
  'circularity_waste',
  'water_soil',
  'air_quality',
];

// ── Indicator data ────────────────────────────────────────────────────────────
interface RegInd {
  id: string; indicator: string; shortDesc: string;
  topic: string; unit: string; refYear: number; national: number;
  fl: number | null; wa: number | null; bxl: number | null;
  note: string;
  forceMax?: number;   // override auto x-axis max
  isTotal?: boolean;   // true → show 'BE total' instead of 'BE avg'
}

// Ordered: climate → nature → circularity → water → air
const INDICATORS: RegInd[] = [
  {
    id: 'total-ghg', indicator: 'Total GHG Emissions',
    shortDesc: 'Total greenhouse gas emissions on regional territory',
    topic: 'climate_energy', unit: 'MtCO\u2082eq', refYear: 2023, national: 97.9,
    fl: 65.4, wa: 29.4, bxl: 3.1,
    isTotal: true,
    note: 'Brussels derived as residual (97.9 \u2212 65.4 \u2212 29.4). Flanders: VMM open definition (incl. biomass CO\u2082). Wallonia: AWAC excl. forestry. Sources: VMM (2025), AWAC (2025).',
  },
  {
    id: 'per-capita-ghg', indicator: 'GHG Emissions per Capita',
    shortDesc: 'Territorial GHG emissions per inhabitant',
    topic: 'climate_energy', unit: 'tCO\u2082eq/cap', refYear: 2023, national: 8.3,
    fl: 9.7, wa: 8.0, bxl: 2.6,
    note: 'Brussels low due to minimal industry and agriculture; ~95% of electricity consumed is generated outside the region. Sources: VMM, AWAC, IWEPS (2025).',
  },
  {
    id: 'organic-farming', indicator: 'Organic Farming Share',
    shortDesc: '% of utilised agricultural area under certified organic farming',
    topic: 'nature_biodiversity', unit: '% UAA', refYear: 2023, national: 7.6,
    fl: 1.4, wa: 12.1, bxl: null,
    note: 'Wallonia holds ~91% of Belgian organic area. Brussels has negligible agricultural area (N/A). Sources: Statbel (2023), BIOWALLONIE, Dep. Landbouw & Visserij.',
  },
  {
    id: 'landfill-rate', indicator: 'Municipal Waste Landfill Rate',
    shortDesc: '% of municipal waste sent to landfill',
    topic: 'circularity_waste', unit: '%', refYear: 2023, national: 0.1,
    fl: 0.1, wa: 0.5, bxl: 0.0,
    note: 'Flanders: landfill ban on separately collected waste since 1998 (OVAM). Brussels: no landfilling \u2014 all incinerated or exported. Wallonia: combustible waste ban since 2004. Sources: OVAM, SPW, Bruxelles Environnement.',
  },
  {
    id: 'drinking-water', indicator: 'Drinking Water Quality Compliance',
    shortDesc: '% of population supplied with water meeting EU Drinking Water Directive values',
    topic: 'water_soil', unit: '%', refYear: 2022, national: 99.5,
    fl: 99.5, wa: 99.5, bxl: 99.5,
    forceMax: 100,
    note: 'All three regions report >99% compliance. Emerging challenge: PFAS contamination at specific sites in Flanders (Zwijndrecht area). Sources: De Watergroep, SWDE, Vivaqua/Hydrobru.',
  },
  {
    id: 'pm25', indicator: 'PM2.5 Annual Mean',
    shortDesc: 'Fine particulate matter \u2014 population-weighted annual mean concentration',
    topic: 'air_quality', unit: '\u00b5g/m\u00b3', refYear: 2023, national: 8.5,
    fl: 9.5, wa: 5.0, bxl: 8.7,
    note: 'Population-weighted averages from IRCEL-CELINE RIO 4\u00d74 km interpolation model. Wallonia benefits from lower density and less traffic. Source: IRCEL annual report (2023).',
  },
  {
    id: 'no2', indicator: 'NO\u2082 Annual Mean',
    shortDesc: 'Nitrogen dioxide \u2014 spatial average annual mean concentration',
    topic: 'air_quality', unit: '\u00b5g/m\u00b3', refYear: 2023, national: 9.0,
    fl: 9.1, wa: 5.3, bxl: 14.6,
    note: 'Spatial averages from IRCEL. Brussels significantly above average due to high traffic density. National population-weighted average ~11 \u00b5g/m\u00b3. Source: IRCEL (2023).',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtVal(v: number | null, unit: string): string {
  if (v === null) return 'N/A';
  return `${v.toLocaleString('en-BE', { maximumFractionDigits: 1 })} ${unit}`;
}

// Returns a clean integer/half-integer ceiling for the chart x-axis
function niceMax(rawMax: number, forceMax?: number): number {
  if (forceMax !== undefined) return forceMax;
  const target = rawMax * 1.25;
  if (target <= 0) return 1;
  const exp = Math.floor(Math.log10(target));
  const mag = Math.pow(10, exp);
  const norm = target / mag; // 1..10
  let niceNorm: number;
  if      (norm <= 1.2) niceNorm = 1.2;
  else if (norm <= 1.5) niceNorm = 1.5;
  else if (norm <= 2  ) niceNorm = 2;
  else if (norm <= 2.5) niceNorm = 2.5;
  else if (norm <= 3  ) niceNorm = 3;
  else if (norm <= 4  ) niceNorm = 4;
  else if (norm <= 5  ) niceNorm = 5;
  else if (norm <= 6  ) niceNorm = 6;
  else if (norm <= 8  ) niceNorm = 8;
  else                  niceNorm = 10;
  return Math.round(niceNorm * mag * 100) / 100;
}

// ── Card ─────────────────────────────────────────────────────────────────────
function RegionalCard({ ind }: { ind: RegInd }) {
  const topicColor = TOPIC_COLOR[ind.topic] ?? '#888';
  const refLabel   = ind.isTotal ? 'BE total' : 'BE avg';

  const allVals = [
    ind.fl ?? 0,
    ind.wa ?? 0,
    ind.bxl !== null ? ind.bxl : 0,
    ind.national,
  ];
  const maxVal = Math.max(...allVals);
  const naStub = Math.max(maxVal * 0.04, 0.01);

  const chartData = [
    { region: 'Flanders', value: ind.fl  !== null ? ind.fl  : naStub, color: FL_COLOR,  isNA: ind.fl  === null },
    { region: 'Wallonia', value: ind.wa  !== null ? ind.wa  : naStub, color: WA_COLOR,  isNA: ind.wa  === null },
    { region: 'Brussels', value: ind.bxl !== null ? ind.bxl : naStub, color: ind.bxl === null ? NA_COLOR : BXL_COLOR, isNA: ind.bxl === null },
  ];

  const xMax = niceMax(maxVal, ind.forceMax);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: 2 }}>{d?.region}</p>
        <p style={{ color: '#374151' }}>{d?.isNA ? 'Not applicable for this region' : fmtVal(d?.value, ind.unit)}</p>
      </div>
    );
  };

  // Custom label rendered above chart area (in the top margin space)
  const RefLabel = (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    return (
      <text
        x={viewBox.x}
        y={viewBox.y - 6}
        textAnchor="middle"
        fontSize={10}
        fill={topicColor}
        fontWeight={700}
      >
        {refLabel}
      </text>
    );
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '5px 1fr', marginBottom: 16 }}>
      <div style={{ background: topicColor }} />
      <div style={{ padding: '20px 24px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 6 }}>
          <div>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', marginBottom: 3 }}>
              {ind.indicator}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>{ind.shortDesc}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{ind.refYear}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff', background: topicColor, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>{ind.unit}</span>
          </div>
        </div>

        {/* National reference line */}
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10 }}>
          {ind.isTotal ? 'National total' : 'National average'}:{' '}
          <strong style={{ color: '#374151' }}>{fmtVal(ind.national, ind.unit)}</strong>
        </p>

        {/* Chart — margin top 24 gives room for the label above the first bar */}
        <div style={{ width: '100%', height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 24, right: 84, left: 4, bottom: 0 }}>
              <XAxis
                type="number"
                domain={[0, xMax]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="region"
                tick={{ fontSize: 12, fill: '#374151' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <ReferenceLine
                x={ind.national}
                stroke={topicColor}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={<RefLabel />}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                <LabelList
                  dataKey="value"
                  content={(props: any) => {
                    const { x, y, width, height, index } = props;
                    const entry = chartData[index];
                    const label = entry.isNA ? 'N/A' : fmtVal(entry.value, ind.unit);
                    return (
                      <text
                        x={Number(x) + Number(width) + 7}
                        y={Number(y) + Number(height) / 2 + 4}
                        fontSize={11}
                        fill={entry.isNA ? '#9ca3af' : '#374151'}
                        fontWeight={600}
                      >
                        {label}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Note */}
        <p style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: 10, lineHeight: 1.55, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
          {ind.note}
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RegionalIndicatorsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const topicsPresent = TOPIC_ORDER.filter(t => INDICATORS.some(i => i.topic === t));
  const filters = [
    { id: 'all', label: 'All indicators' },
    ...topicsPresent.map(t => ({ id: t, label: TOPIC_LABEL[t] })),
  ];

  const visibleInds = activeFilter === 'all'
    ? INDICATORS
    : INDICATORS.filter(i => i.topic === activeFilter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Dark header */}
      <div style={{ background: '#1a1a1a', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 48px 36px' }}>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, marginTop: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Regional Indicators
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.95rem', marginTop: 8, maxWidth: 520 }}>
            Indicators tracked at regional level — Flanders, Wallonia and Brussels. Only indicators with officially published regional data are shown.
          </p>

          {/* Region legend with flag PNGs */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Flanders', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Flag_of_Flanders.svg/80px-Flag_of_Flanders.svg.png' },
              { label: 'Wallonia',  flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Flag_of_Wallonia.svg/80px-Flag_of_Wallonia.svg.png' },
              { label: 'Brussels', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Flag_of_the_Brussels-Capital_Region.svg/80px-Flag_of_the_Brussels-Capital_Region.svg.png' },
            ].map(r => (
              <span key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d1d5db' }}>
                <img src={r.flag} alt={`${r.label} flag`}
                  style={{ width: 28, height: 'auto', borderRadius: 2, display: 'block', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}
                />
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* National / Regional toggle */}
      <div className="view-toggle-bar">
        <div className="view-toggle">
          <a href="/indicators" className="view-toggle-btn" style={{ textDecoration: 'none' }}>🇧🇪 National</a>
          <button className="view-toggle-btn active">🗺️ Regional</button>
        </div>
      </div>

      {/* Topic filter — sticky */}
      <div style={{ position: 'sticky', top: 'var(--nav-height)', zIndex: 90, background: '#f4f3ee', borderBottom: '1px solid #e5e3da', padding: '10px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 48px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
              padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'Epilogue, sans-serif', fontSize: '0.82rem', fontWeight: 600,
              background: activeFilter === f.id ? '#1a1a1a' : '#fff',
              color:      activeFilter === f.id ? '#fff' : '#6b7280',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              transition: 'background 0.15s, color 0.15s',
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 48px 64px' }}>
        {activeFilter === 'all' ? (
          topicsPresent.map(topic => {
            const topicInds = INDICATORS.filter(i => i.topic === topic);
            return (
              <div key={topic} style={{ marginBottom: 40 }}>
                {/* Group header — no coloured bar */}
                <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    {TOPIC_LABEL[topic]}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>
                    {topicInds.length} indicator{topicInds.length !== 1 ? 's' : ''} with regional data
                  </span>
                </div>
                {topicInds.map(ind => <RegionalCard key={ind.id} ind={ind} />)}
              </div>
            );
          })
        ) : (
          <>
            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                {TOPIC_LABEL[activeFilter]}
              </span>
            </div>
            {visibleInds.map(ind => <RegionalCard key={ind.id} ind={ind} />)}
          </>
        )}
      </div>

      <footer>
        <p>Data sourced from VMM, AWAC, Bruxelles Environnement, IRCEL-CELINE, Statbel and other official sources. Last updated March 2026.</p>
      </footer>
    </div>
  );
}
