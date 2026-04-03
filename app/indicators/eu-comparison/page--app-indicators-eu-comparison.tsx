'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

// ── Data (verified from Eurostat / EEA downloads, April 2026) ────────────────

type CountryVal = { code: string; name: string; value: number };

type Indicator = {
  key:            string;
  label:          string;
  unit:           string;
  year:           number | string;
  higherIsBetter: boolean;
  source:         string;
  sourceUrl:      string;
  note?:          string;
  data:           CountryVal[];
  eu27:           number;
};

type Topic = {
  key:        string;
  label:      string;
  emoji:      string;
  color:      string;
  indicators: Indicator[];
};

const TOPICS: Topic[] = [
  {
    key: 'climate_energy', label: 'Climate & Energy', emoji: '🌡️', color: '#f97316',
    indicators: [
      {
        key: 'ghg_per_cap', label: 'GHG per capita', unit: 'tCO\u2082eq/cap', year: 2023,
        higherIsBetter: false,
        source: 'EEA GHG Inventory', sourceUrl: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/greenhouse-gases-viewer-data-viewers',
        note: 'Net territorial emissions including LULUCF. Sweden\u2019s low value (1.25) reflects large forest carbon sinks.',
        eu27: 6.7,
        data: [
          {code:'IE',name:'Ireland',     value:11.08},{code:'LU',name:'Luxembourg',  value:10.64},
          {code:'PL',name:'Poland',      value:8.61}, {code:'FI',name:'Finland',     value:9.51},
          {code:'EE',name:'Estonia',     value:9.48}, {code:'CZ',name:'Czech Rep.',  value:9.11},
          {code:'DE',name:'Germany',     value:8.89}, {code:'CY',name:'Cyprus',      value:8.55},
          {code:'AT',name:'Austria',     value:8.35}, {code:'BE',name:'Belgium',     value:8.31},
          {code:'NL',name:'Netherlands', value:8.19},
          {code:'LV',name:'Latvia',      value:7.78}, {code:'DK',name:'Denmark',     value:6.52},
          {code:'EL',name:'Greece',      value:6.52}, {code:'BG',name:'Bulgaria',    value:5.70},
          {code:'IT',name:'Italy',       value:5.61}, {code:'SK',name:'Slovakia',    value:5.22},
          {code:'HR',name:'Croatia',     value:5.16}, {code:'HU',name:'Hungary',     value:5.06},
          {code:'SI',name:'Slovenia',    value:4.96}, {code:'FR',name:'France',      value:4.96},
          {code:'PT',name:'Portugal',    value:4.84}, {code:'ES',name:'Spain',       value:4.53},
          {code:'LT',name:'Lithuania',   value:4.40}, {code:'MT',name:'Malta',       value:4.06},
          {code:'RO',name:'Romania',     value:3.01}, {code:'SE',name:'Sweden',      value:1.25},
        ],
      },
      {
        key: 'renewable_share', label: 'Renewable energy share', unit: '% of final consumption', year: 2024,
        higherIsBetter: true,
        source: 'Eurostat (nrg_ind_ren)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren/default/table',
        eu27: 25.2,
        data: [
          {code:'SE',name:'Sweden',      value:62.85},{code:'FI',name:'Finland',     value:52.12},
          {code:'DK',name:'Denmark',     value:46.46},{code:'LV',name:'Latvia',      value:45.54},
          {code:'EE',name:'Estonia',     value:42.23},{code:'AT',name:'Austria',     value:42.95},
          {code:'PT',name:'Portugal',    value:36.32},{code:'LT',name:'Lithuania',   value:35.41},
          {code:'HR',name:'Croatia',     value:26.48},{code:'EL',name:'Greece',      value:25.36},
          {code:'ES',name:'Spain',       value:25.42},{code:'RO',name:'Romania',     value:25.38},
          {code:'SI',name:'Slovenia',    value:25.00},{code:'FR',name:'France',      value:23.23},
          {code:'BG',name:'Bulgaria',    value:23.21},{code:'DE',name:'Germany',     value:22.47},
          {code:'CY',name:'Cyprus',      value:20.84},{code:'NL',name:'Netherlands', value:20.18},
          {code:'IT',name:'Italy',       value:19.39},{code:'CZ',name:'Czech Rep.',  value:19.21},
          {code:'HU',name:'Hungary',     value:18.26},{code:'SK',name:'Slovakia',    value:18.09},
          {code:'MT',name:'Malta',       value:17.21},{code:'PL',name:'Poland',      value:17.77},
          {code:'IE',name:'Ireland',     value:16.06},{code:'LU',name:'Luxembourg',  value:14.74},
          {code:'BE',name:'Belgium',     value:14.34},
        ],
      },
    ],
  },
  {
    key: 'nature_biodiversity', label: 'Nature & Biodiversity', emoji: '🌿', color: '#22c55e',
    indicators: [
      {
        key: 'organic_farming', label: 'Organic farming share', unit: '% of agricultural area', year: 2024,
        higherIsBetter: true,
        source: 'Eurostat (org_cropar)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/org_cropar/default/table',
        note: 'Austria, Denmark and Greece data not available for 2024.',
        eu27: 10.8,
        data: [
          {code:'EE',name:'Estonia',     value:22.58},{code:'PT',name:'Portugal',    value:21.23},
          {code:'IT',name:'Italy',       value:19.49},{code:'SE',name:'Sweden',      value:16.66},
          {code:'LV',name:'Latvia',      value:15.59},{code:'CZ',name:'Czech Rep.',  value:15.96},
          {code:'SK',name:'Slovakia',    value:14.79},{code:'FI',name:'Finland',     value:13.49},
          {code:'SI',name:'Slovenia',    value:11.94},{code:'ES',name:'Spain',       value:11.91},
          {code:'DE',name:'Germany',     value:11.11},{code:'FR',name:'France',      value:9.47},
          {code:'HR',name:'Croatia',     value:9.01}, {code:'CY',name:'Cyprus',      value:8.76},
          {code:'LT',name:'Lithuania',   value:8.77}, {code:'BE',name:'Belgium',     value:7.43},
          {code:'LU',name:'Luxembourg',  value:7.19}, {code:'RO',name:'Romania',     value:6.16},
          {code:'HU',name:'Hungary',     value:6.07}, {code:'IE',name:'Ireland',     value:4.97},
          {code:'NL',name:'Netherlands', value:5.06}, {code:'PL',name:'Poland',      value:4.88},
          {code:'BG',name:'Bulgaria',    value:3.95}, {code:'MT',name:'Malta',       value:0.77},
        ],
      },
    ],
  },
  {
    key: 'circularity_waste', label: 'Circularity & Waste', emoji: '♻️', color: '#06b6d4',
    indicators: [
      {
        key: 'msw_recycling', label: 'MSW recycling rate', unit: '%', year: 2024,
        higherIsBetter: true,
        source: 'Eurostat (cei_wm011)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/cei_wm011/default/table',
        note: 'Some countries have no 2024 data (Austria, Bulgaria, Czech Rep., Greece, Ireland, Italy, Romania).',
        eu27: 48.1,
        data: [
          {code:'DE',name:'Germany',     value:66.9}, {code:'SI',name:'Slovenia',    value:62.4},
          {code:'LU',name:'Luxembourg',  value:57.3}, {code:'NL',name:'Netherlands', value:58.0},
          {code:'BE',name:'Belgium',     value:56.2}, {code:'LV',name:'Latvia',      value:52.7},
          {code:'LT',name:'Lithuania',   value:52.5}, {code:'SK',name:'Slovakia',    value:50.7},
          {code:'FI',name:'Finland',     value:47.9}, {code:'DK',name:'Denmark',     value:46.4},
          {code:'SE',name:'Sweden',      value:46.1}, {code:'ES',name:'Spain',       value:42.5},
          {code:'FR',name:'France',      value:40.9}, {code:'EE',name:'Estonia',     value:36.4},
          {code:'HR',name:'Croatia',     value:36.7}, {code:'HU',name:'Hungary',     value:33.6},
          {code:'PT',name:'Portugal',    value:32.8}, {code:'PL',name:'Poland',      value:31.1},
          {code:'MT',name:'Malta',       value:16.7}, {code:'CY',name:'Cyprus',      value:15.8},
        ],
      },
      {
        key: 'msw_per_cap', label: 'Municipal waste per capita', unit: 'kg/cap', year: 2024,
        higherIsBetter: false,
        source: 'Eurostat (env_wasmun)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/env_wasmun/default/table',
        eu27: 517,
        data: [
          {code:'DK',name:'Denmark',     value:755}, {code:'BE',name:'Belgium',     value:699},
          {code:'LU',name:'Luxembourg',  value:681}, {code:'CY',name:'Cyprus',      value:688},
          {code:'DE',name:'Germany',     value:628}, {code:'MT',name:'Malta',       value:621},
          {code:'FR',name:'France',      value:530}, {code:'SI',name:'Slovenia',    value:526},
          {code:'PT',name:'Portugal',    value:519}, {code:'NL',name:'Netherlands', value:473},
          {code:'FI',name:'Finland',     value:457}, {code:'ES',name:'Spain',       value:456},
          {code:'LV',name:'Latvia',      value:462}, {code:'LT',name:'Lithuania',   value:462},
          {code:'SE',name:'Sweden',      value:427}, {code:'HU',name:'Hungary',     value:414},
          {code:'SK',name:'Slovakia',    value:489}, {code:'PL',name:'Poland',      value:387},
          {code:'EE',name:'Estonia',     value:375}, {code:'HR',name:'Croatia',     value:486},
        ],
      },
      {
        key: 'landfill_rate', label: 'Landfill rate', unit: '%', year: 2024,
        higherIsBetter: false,
        source: 'Eurostat (env_wasmun)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/env_wasmun/default/table',
        eu27: 21.3,
        data: [
          {code:'BE',name:'Belgium',     value:0.1}, {code:'FI',name:'Finland',     value:0.4},
          {code:'SE',name:'Sweden',      value:0.7}, {code:'DE',name:'Germany',     value:1.6},
          {code:'NL',name:'Netherlands', value:1.5}, {code:'DK',name:'Denmark',     value:2.0},
          {code:'LU',name:'Luxembourg',  value:2.6}, {code:'LT',name:'Lithuania',   value:5.6},
          {code:'SI',name:'Slovenia',    value:10.3},{code:'EE',name:'Estonia',     value:12.8},
          {code:'FR',name:'France',      value:20.8},{code:'LV',name:'Latvia',      value:30.7},
          {code:'PL',name:'Poland',      value:30.0},{code:'SK',name:'Slovakia',    value:38.0},
          {code:'PT',name:'Portugal',    value:52.0},{code:'HU',name:'Hungary',     value:53.1},
          {code:'ES',name:'Spain',       value:47.4},{code:'HR',name:'Croatia',     value:50.8},
          {code:'CY',name:'Cyprus',      value:66.4},{code:'MT',name:'Malta',       value:72.1},
        ],
      },
      {
        key: 'cmur', label: 'Circular material use rate', unit: '%', year: 2024,
        higherIsBetter: true,
        source: 'Eurostat (cei_srm030)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/cei_srm030/default/table',
        eu27: 12.2,
        data: [
          {code:'NL',name:'Netherlands', value:32.7},{code:'BE',name:'Belgium',     value:22.7},
          {code:'IT',name:'Italy',       value:21.6},{code:'MT',name:'Malta',       value:18.6},
          {code:'FR',name:'France',      value:17.8},{code:'AT',name:'Austria',     value:15.2},
          {code:'CZ',name:'Czech Rep.',  value:14.8},{code:'DE',name:'Germany',     value:14.8},
          {code:'EE',name:'Estonia',     value:20.5},{code:'SK',name:'Slovakia',    value:12.2},
          {code:'LU',name:'Luxembourg',  value:10.7},{code:'SE',name:'Sweden',      value:10.4},
          {code:'SI',name:'Slovenia',    value:10.1},{code:'DK',name:'Denmark',     value:9.4},
          {code:'HU',name:'Hungary',     value:7.3}, {code:'PL',name:'Poland',      value:7.7},
          {code:'ES',name:'Spain',       value:7.4}, {code:'LV',name:'Latvia',      value:6.8},
          {code:'HR',name:'Croatia',     value:5.9}, {code:'EL',name:'Greece',      value:5.2},
          {code:'CY',name:'Cyprus',      value:5.5}, {code:'BG',name:'Bulgaria',    value:5.0},
          {code:'LT',name:'Lithuania',   value:4.2}, {code:'PT',name:'Portugal',    value:3.0},
          {code:'RO',name:'Romania',     value:1.3}, {code:'FI',name:'Finland',     value:2.0},
          {code:'IE',name:'Ireland',     value:2.0},
        ],
      },
    ],
  },
  {
    key: 'air_quality', label: 'Air Quality', emoji: '💨', color: '#8b5cf6',
    indicators: [
      {
        key: 'pm25', label: 'PM2.5 concentration', unit: '\u00b5g/m\u00b3', year: 'Latest',
        higherIsBetter: false,
        source: 'EEA Air Quality Data Viewer', sourceUrl: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/air-quality-statistics-viewer',
        note: 'Mean across all monitoring stations per country. WHO guideline: 5 \u00b5g/m\u00b3. EU 2030 limit: 10 \u00b5g/m\u00b3.',
        eu27: 10.1,
        data: [
          {code:'EE',name:'Estonia',     value:4.6}, {code:'FI',name:'Finland',     value:4.5},
          {code:'IE',name:'Ireland',     value:7.2}, {code:'PT',name:'Portugal',    value:5.9},
          {code:'SE',name:'Sweden',      value:5.1}, {code:'DK',name:'Denmark',     value:7.5},
          {code:'LU',name:'Luxembourg',  value:7.8}, {code:'FR',name:'France',      value:8.6},
          {code:'DE',name:'Germany',     value:8.2}, {code:'NL',name:'Netherlands', value:8.3},
          {code:'BE',name:'Belgium',     value:9.0}, {code:'AT',name:'Austria',     value:9.4},
          {code:'LT',name:'Lithuania',   value:7.3}, {code:'LV',name:'Latvia',      value:8.8},
          {code:'ES',name:'Spain',       value:9.3}, {code:'CZ',name:'Czech Rep.',  value:12.1},
          {code:'HU',name:'Hungary',     value:12.2},{code:'IT',name:'Italy',       value:13.3},
          {code:'HR',name:'Croatia',     value:13.0},{code:'SI',name:'Slovenia',    value:14.1},
          {code:'BG',name:'Bulgaria',    value:14.1},{code:'CY',name:'Cyprus',      value:14.0},
          {code:'RO',name:'Romania',     value:14.7},{code:'EL',name:'Greece',      value:15.1},
          {code:'MT',name:'Malta',       value:11.0},{code:'SK',name:'Slovakia',    value:13.3},
          {code:'PL',name:'Poland',      value:14.5},
        ],
      },
      {
        key: 'no2', label: 'NO\u2082 concentration', unit: '\u00b5g/m\u00b3', year: 'Latest',
        higherIsBetter: false,
        source: 'EEA Air Quality Data Viewer', sourceUrl: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/air-quality-statistics-viewer',
        note: 'Mean across monitoring stations. EU annual limit: 40 \u00b5g/m\u00b3. New WHO guideline: 10 \u00b5g/m\u00b3.',
        eu27: 14.9,
        data: [
          {code:'EE',name:'Estonia',     value:6.2}, {code:'FI',name:'Finland',     value:8.9},
          {code:'DK',name:'Denmark',     value:9.5}, {code:'SE',name:'Sweden',      value:11.2},
          {code:'LT',name:'Lithuania',   value:12.1},{code:'SK',name:'Slovakia',    value:13.2},
          {code:'PL',name:'Poland',      value:13.9},{code:'PT',name:'Portugal',    value:13.9},
          {code:'CZ',name:'Czech Rep.',  value:13.7},{code:'LV',name:'Latvia',      value:13.3},
          {code:'FR',name:'France',      value:14.2},{code:'IE',name:'Ireland',     value:14.7},
          {code:'LU',name:'Luxembourg',  value:14.8},{code:'MT',name:'Malta',       value:15.4},
          {code:'NL',name:'Netherlands', value:15.6},{code:'HR',name:'Croatia',     value:16.1},
          {code:'CY',name:'Cyprus',      value:16.3},{code:'SI',name:'Slovenia',    value:15.7},
          {code:'HU',name:'Hungary',     value:17.2},{code:'BG',name:'Bulgaria',    value:17.4},
          {code:'IT',name:'Italy',       value:17.3},{code:'BE',name:'Belgium',     value:18.2},
          {code:'DE',name:'Germany',     value:18.8},{code:'AT',name:'Austria',     value:14.6},
          {code:'ES',name:'Spain',       value:12.9},{code:'EL',name:'Greece',      value:24.1},
          {code:'RO',name:'Romania',     value:21.9},
        ],
      },
    ],
  },
  {
    key: 'mobility_transport', label: 'Mobility & Transport', emoji: '🚗', color: '#ec4899',
    indicators: [
      {
        key: 'public_transport', label: 'Public transport modal share', unit: '% of passenger-km', year: 2023,
        higherIsBetter: true,
        source: 'Eurostat (tran_hv_psmod)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/tran_hv_psmod/default/table',
        note: 'Trains, motor coaches, buses and trolleybuses as % of inland passenger transport (passenger-km).',
        eu27: 16.9,
        data: [
          {code:'HU',name:'Hungary',     value:24.5},{code:'AT',name:'Austria',     value:23.1},
          {code:'IE',name:'Ireland',     value:20.5},{code:'BE',name:'Belgium',     value:19.6},
          {code:'SK',name:'Slovakia',    value:21.7},{code:'CZ',name:'Czech Rep.',  value:19.5},
          {code:'RO',name:'Romania',     value:18.7},{code:'PL',name:'Poland',      value:18.0},
          {code:'SE',name:'Sweden',      value:18.2},{code:'DK',name:'Denmark',     value:18.2},
          {code:'MT',name:'Malta',       value:17.9},{code:'FI',name:'Finland',     value:17.0},
          {code:'LU',name:'Luxembourg',  value:17.3},{code:'BG',name:'Bulgaria',    value:11.2},
          {code:'IT',name:'Italy',       value:16.7},{code:'FR',name:'France',      value:16.3},
          {code:'EE',name:'Estonia',     value:16.4},{code:'CY',name:'Cyprus',      value:16.5},
          {code:'DE',name:'Germany',     value:16.5},{code:'EL',name:'Greece',      value:15.2},
          {code:'LV',name:'Latvia',      value:15.8},{code:'NL',name:'Netherlands', value:14.7},
          {code:'SI',name:'Slovenia',    value:14.5},{code:'ES',name:'Spain',       value:16.1},
          {code:'HR',name:'Croatia',     value:16.1},{code:'PT',name:'Portugal',    value:11.8},
          {code:'LT',name:'Lithuania',   value:7.9},
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const BELGIUM_COLOR = '#f97316';
const EU_COLOR      = '#6b7280';

function getRank(ind: Indicator, code: string): number | null {
  const sorted = [...ind.data].sort((a, b) =>
    ind.higherIsBetter ? b.value - a.value : a.value - b.value
  );
  const idx = sorted.findIndex(d => d.code === code);
  return idx >= 0 ? idx + 1 : null;
}

function getSuffix(n: number) {
  if (n === 1) return 'st'; if (n === 2) return 'nd'; if (n === 3) return 'rd'; return 'th';
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, indicator }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as CountryVal;
  const isBE = d.code === 'BE';
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, color: isBE ? BELGIUM_COLOR : '#1a1a1a', marginBottom: 2 }}>{d.name}</p>
      <p style={{ color: '#374151' }}>{d.value} {indicator?.unit}</p>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function EUBarChart({ indicator, topicColor }: { indicator: Indicator; topicColor: string }) {
  // Sort: best → worst (so bar with best value is at top)
  const sorted = [...indicator.data].sort((a, b) =>
    indicator.higherIsBetter ? b.value - a.value : a.value - b.value
  );

  const chartHeight = Math.max(340, sorted.length * 22 + 60);

  return (
    <div>
      <div style={{ width: '100%', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 60, left: 8, bottom: 28 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: '#4b5563' }}
              tickLine={false} axisLine={false}
              label={{ value: indicator.unit, position: 'insideBottom', offset: -16, fontSize: 10, fill: '#4b5563' }}
            />
            <YAxis
              type="category" dataKey="name" width={110}
              tick={{ fontSize: 10, fill: '#374151' }} tickLine={false} axisLine={false}
            />
            <Tooltip content={(props: any) => <CustomTooltip {...props} indicator={indicator} />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <ReferenceLine x={indicator.eu27} stroke={EU_COLOR} strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: `EU avg: ${indicator.eu27}`, position: 'top', fontSize: 10, fill: EU_COLOR, fontWeight: 700 }} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
              {sorted.map((d, i) => (
                <Cell key={i} fill={d.code === 'BE' ? BELGIUM_COLOR : d.code === 'EU27' ? EU_COLOR : '#d1d5db'} />
              ))}
              <LabelList dataKey="value" position="right"
                style={{ fontSize: 9, fill: '#374151', fontWeight: 500 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {indicator.note && (
        <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 4 }}>{indicator.note}</p>
      )}
      <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
        Source: <a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>{indicator.source}</a>
        {typeof indicator.year === 'number' ? ` · ${indicator.year}` : ` · ${indicator.year}`}
      </p>
    </div>
  );
}

// ── Key stat cards ────────────────────────────────────────────────────────────
function KeyStats({ indicator, topicColor }: { indicator: Indicator; topicColor: string }) {
  const be   = indicator.data.find(d => d.code === 'BE');
  const rank = be ? getRank(indicator, 'BE') : null;
  const n    = indicator.data.length;
  const isGood = rank !== null && (
    indicator.higherIsBetter ? rank <= Math.ceil(n / 3) : rank <= Math.ceil(n / 3)
  );
  const rankLabel = indicator.higherIsBetter
    ? `${rank}${getSuffix(rank!)} highest out of ${n}`
    : `${rank}${getSuffix(rank!)} lowest out of ${n}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `3px solid ${topicColor}` }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 4 }}>Belgium</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Roboto, sans-serif', color: topicColor, lineHeight: 1 }}>{be?.value ?? '—'}</div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>{indicator.unit} · {indicator.year}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: '3px solid #9ca3af' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 4 }}>EU-27 average</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Roboto, sans-serif', color: '#6b7280', lineHeight: 1 }}>{indicator.eu27}</div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>{indicator.unit} · {indicator.year}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `3px solid ${isGood ? '#16a34a' : '#dc2626'}` }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 4 }}>Belgium rank</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Roboto, sans-serif', color: isGood ? '#16a34a' : '#dc2626', lineHeight: 1 }}>#{rank ?? '—'}</div>
        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>{rank ? rankLabel : 'out of ' + n}</div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EUComparisonPage() {
  const [activeTopic, setActiveTopic]   = useState(TOPICS[0].key);
  const [activeInd, setActiveInd]       = useState(TOPICS[0].indicators[0].key);

  const topic     = TOPICS.find(t => t.key === activeTopic) ?? TOPICS[0];
  const indicator = topic.indicators.find(i => i.key === activeInd) ?? topic.indicators[0];

  const switchTopic = (tk: string) => {
    const t = TOPICS.find(x => x.key === tk)!;
    setActiveTopic(tk);
    setActiveInd(t.indicators[0].key);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f3f4f6' }}>

      {/* ── Header ── */}
      <header style={{ background: '#1a1a1a', padding: '32px 48px 28px', position: 'relative', overflow: 'hidden' }}>
        <div className="flag-stripe black" /><div className="flag-stripe yellow" /><div className="flag-stripe red" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="header-text">
            <p className="header-eyebrow">&#x1F1E7;&#x1F1EA; Belgium</p>
            <h1>Environment Tracker</h1>
            <p className="header-sub">How does Belgium compare to other EU member states?</p>
          </div>
        </div>
      </header>

      {/* ── Toggle National / Regional / vs EU ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 48px', display: 'flex', gap: 4, alignItems: 'center' }}>
        <Link href="/indicators" style={{ padding: '12px 20px', fontSize: '0.88rem', fontWeight: 600, color: '#6b7280', textDecoration: 'none', borderBottom: '2px solid transparent', display: 'inline-block' }}>
          <span style={{ display: 'inline-block', width: 18, height: 13, background: 'linear-gradient(to right, #1a1a1a 33%, #f0c000 33%, #f0c000 67%, #dc2626 67%)', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />
          National
        </Link>
        <Link href="/indicators/regional" style={{ padding: '12px 20px', fontSize: '0.88rem', fontWeight: 600, color: '#6b7280', textDecoration: 'none', borderBottom: '2px solid transparent', display: 'inline-block' }}>
          Regional
        </Link>
        <span style={{ padding: '12px 20px', fontSize: '0.88rem', fontWeight: 700, color: '#f97316', borderBottom: '2px solid #f97316', cursor: 'default', display: 'inline-block' }}>
          Belgium vs EU
        </span>
      </div>

      <div style={{ padding: '24px 48px 48px' }}>

        {/* ── Topic tabs ── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {TOPICS.map(t => {
            const active = t.key === activeTopic;
            return (
              <button key={t.key} onClick={() => switchTopic(t.key)} style={{
                padding: '8px 16px', borderRadius: 20, fontSize: '0.85rem', fontWeight: active ? 700 : 500,
                border: `1.5px solid ${active ? t.color : '#e5e7eb'}`,
                background: active ? t.color : '#fff',
                color: active ? '#fff' : '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {t.emoji} {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Indicator selector ── */}
        {topic.indicators.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {topic.indicators.map(ind => {
              const active = ind.key === activeInd;
              return (
                <button key={ind.key} onClick={() => setActiveInd(ind.key)} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: active ? 600 : 400,
                  border: `1.5px solid ${active ? topic.color : '#e5e7eb'}`,
                  background: active ? '#fff' : '#f9fafb',
                  color: active ? topic.color : '#6b7280',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {ind.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Key stats ── */}
        <KeyStats indicator={indicator} topicColor={topic.color} />

        {/* ── Chart ── */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a1a1a', margin: 0 }}>
              {indicator.label} — EU member states
            </h2>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: BELGIUM_COLOR, display: 'inline-block' }} /> Belgium
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 3, borderTop: `2px dashed ${EU_COLOR}`, display: 'inline-block', marginBottom: 1 }} /> EU-27 average
              </span>
            </span>
          </div>
          <EUBarChart indicator={indicator} topicColor={topic.color} />
        </div>

      </div>
    </main>
  );
}
