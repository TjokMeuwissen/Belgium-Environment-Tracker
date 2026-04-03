'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CountryVal { code: string; name: string; value: number; }
interface Indicator {
  key: string; label: string; unit: string; year: number | string;
  higherIsBetter: boolean; source: string; sourceUrl: string;
  note?: string; data: CountryVal[]; eu27: number;
}
interface Topic {
  key: string; label: string; emoji: string; color: string; indicators: Indicator[];
}

// ── Data (Eurostat / EEA downloads, April 2026) ───────────────────────────────

const TOPICS: Topic[] = [
  {
    key: 'climate_energy', label: 'Climate & Energy', emoji: '🌡️', color: '#f97316',
    indicators: [
      {
        key: 'ghg_per_cap', label: 'GHG per capita', unit: 'tCO\u2082eq/cap', year: 2023,
        higherIsBetter: false, eu27: 6.7,
        source: 'EEA GHG Inventory', sourceUrl: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/greenhouse-gases-viewer-data-viewers',
        note: 'Net territorial emissions including LULUCF. Sweden\u2019s low value (1.25 t) reflects large forest carbon sinks.',
        data: [
          {code:'IE',name:'Ireland',value:11.08},{code:'LU',name:'Luxembourg',value:10.64},
          {code:'FI',name:'Finland',value:9.51},{code:'EE',name:'Estonia',value:9.48},
          {code:'CZ',name:'Czech Rep.',value:9.11},{code:'DE',name:'Germany',value:8.89},
          {code:'CY',name:'Cyprus',value:8.55},{code:'AT',name:'Austria',value:8.35},
          {code:'BE',name:'Belgium',value:8.31},{code:'NL',name:'Netherlands',value:8.19},
          {code:'PL',name:'Poland',value:8.61},{code:'LV',name:'Latvia',value:7.78},
          {code:'DK',name:'Denmark',value:6.52},{code:'EL',name:'Greece',value:6.52},
          {code:'BG',name:'Bulgaria',value:5.70},{code:'IT',name:'Italy',value:5.61},
          {code:'SK',name:'Slovakia',value:5.22},{code:'HR',name:'Croatia',value:5.16},
          {code:'HU',name:'Hungary',value:5.06},{code:'SI',name:'Slovenia',value:4.96},
          {code:'FR',name:'France',value:4.96},{code:'PT',name:'Portugal',value:4.84},
          {code:'ES',name:'Spain',value:4.53},{code:'LT',name:'Lithuania',value:4.40},
          {code:'MT',name:'Malta',value:4.06},{code:'RO',name:'Romania',value:3.01},
          {code:'SE',name:'Sweden',value:1.25},
        ],
      },
      {
        key: 'renewable_share', label: 'Renewable energy share', unit: '% of final consumption', year: 2024,
        higherIsBetter: true, eu27: 25.2,
        source: 'Eurostat (nrg_ind_ren)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren/default/table',
        data: [
          {code:'SE',name:'Sweden',value:62.85},{code:'FI',name:'Finland',value:52.12},
          {code:'DK',name:'Denmark',value:46.46},{code:'LV',name:'Latvia',value:45.54},
          {code:'EE',name:'Estonia',value:42.23},{code:'AT',name:'Austria',value:42.95},
          {code:'PT',name:'Portugal',value:36.32},{code:'LT',name:'Lithuania',value:35.41},
          {code:'HR',name:'Croatia',value:26.48},{code:'EL',name:'Greece',value:25.36},
          {code:'ES',name:'Spain',value:25.42},{code:'RO',name:'Romania',value:25.38},
          {code:'SI',name:'Slovenia',value:25.00},{code:'FR',name:'France',value:23.23},
          {code:'BG',name:'Bulgaria',value:23.21},{code:'DE',name:'Germany',value:22.47},
          {code:'CY',name:'Cyprus',value:20.84},{code:'NL',name:'Netherlands',value:20.18},
          {code:'IT',name:'Italy',value:19.39},{code:'CZ',name:'Czech Rep.',value:19.21},
          {code:'HU',name:'Hungary',value:18.26},{code:'SK',name:'Slovakia',value:18.09},
          {code:'MT',name:'Malta',value:17.21},{code:'PL',name:'Poland',value:17.77},
          {code:'IE',name:'Ireland',value:16.06},{code:'LU',name:'Luxembourg',value:14.74},
          {code:'BE',name:'Belgium',value:14.34},
        ],
      },
    ],
  },
  {
    key: 'nature_biodiversity', label: 'Nature & Biodiversity', emoji: '🌿', color: '#22c55e',
    indicators: [
      {
        key: 'organic_farming', label: 'Organic farming share', unit: '% of agricultural area', year: 2024,
        higherIsBetter: true, eu27: 10.8,
        source: 'Eurostat (org_cropar)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/org_cropar/default/table',
        note: 'Austria, Denmark and Greece have no 2024 data.',
        data: [
          {code:'EE',name:'Estonia',value:22.58},{code:'PT',name:'Portugal',value:21.23},
          {code:'IT',name:'Italy',value:19.49},{code:'SE',name:'Sweden',value:16.66},
          {code:'LV',name:'Latvia',value:15.59},{code:'CZ',name:'Czech Rep.',value:15.96},
          {code:'SK',name:'Slovakia',value:14.79},{code:'FI',name:'Finland',value:13.49},
          {code:'SI',name:'Slovenia',value:11.94},{code:'ES',name:'Spain',value:11.91},
          {code:'DE',name:'Germany',value:11.11},{code:'FR',name:'France',value:9.47},
          {code:'HR',name:'Croatia',value:9.01},{code:'CY',name:'Cyprus',value:8.76},
          {code:'LT',name:'Lithuania',value:8.77},{code:'BE',name:'Belgium',value:7.43},
          {code:'LU',name:'Luxembourg',value:7.19},{code:'RO',name:'Romania',value:6.16},
          {code:'HU',name:'Hungary',value:6.07},{code:'IE',name:'Ireland',value:4.97},
          {code:'NL',name:'Netherlands',value:5.06},{code:'PL',name:'Poland',value:4.88},
          {code:'BG',name:'Bulgaria',value:3.95},{code:'MT',name:'Malta',value:0.77},
        ],
      },
    ],
  },
  {
    key: 'circularity_waste', label: 'Circularity & Waste', emoji: '♻️', color: '#06b6d4',
    indicators: [
      {
        key: 'msw_recycling', label: 'MSW recycling rate', unit: '%', year: 2024,
        higherIsBetter: true, eu27: 48.1,
        source: 'Eurostat (cei_wm011)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/cei_wm011/default/table',
        note: 'Austria, Bulgaria, Czech Rep., Greece, Ireland, Italy and Romania have no 2024 data.',
        data: [
          {code:'DE',name:'Germany',value:66.9},{code:'SI',name:'Slovenia',value:62.4},
          {code:'NL',name:'Netherlands',value:58.0},{code:'LU',name:'Luxembourg',value:57.3},
          {code:'BE',name:'Belgium',value:56.2},{code:'LV',name:'Latvia',value:52.7},
          {code:'LT',name:'Lithuania',value:52.5},{code:'SK',name:'Slovakia',value:50.7},
          {code:'FI',name:'Finland',value:47.9},{code:'DK',name:'Denmark',value:46.4},
          {code:'SE',name:'Sweden',value:46.1},{code:'ES',name:'Spain',value:42.5},
          {code:'FR',name:'France',value:40.9},{code:'EE',name:'Estonia',value:36.4},
          {code:'HR',name:'Croatia',value:36.7},{code:'HU',name:'Hungary',value:33.6},
          {code:'PT',name:'Portugal',value:32.8},{code:'PL',name:'Poland',value:31.1},
          {code:'MT',name:'Malta',value:16.7},{code:'CY',name:'Cyprus',value:15.8},
        ],
      },
      {
        key: 'msw_per_cap', label: 'Municipal waste per capita', unit: 'kg/cap', year: 2024,
        higherIsBetter: false, eu27: 517,
        source: 'Eurostat (env_wasmun)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/env_wasmun/default/table',
        data: [
          {code:'DK',name:'Denmark',value:755},{code:'BE',name:'Belgium',value:699},
          {code:'CY',name:'Cyprus',value:688},{code:'LU',name:'Luxembourg',value:681},
          {code:'DE',name:'Germany',value:628},{code:'MT',name:'Malta',value:621},
          {code:'FR',name:'France',value:530},{code:'SI',name:'Slovenia',value:526},
          {code:'PT',name:'Portugal',value:519},{code:'SK',name:'Slovakia',value:489},
          {code:'HR',name:'Croatia',value:486},{code:'NL',name:'Netherlands',value:473},
          {code:'LV',name:'Latvia',value:462},{code:'LT',name:'Lithuania',value:462},
          {code:'FI',name:'Finland',value:457},{code:'ES',name:'Spain',value:456},
          {code:'SE',name:'Sweden',value:427},{code:'HU',name:'Hungary',value:414},
          {code:'PL',name:'Poland',value:387},{code:'EE',name:'Estonia',value:375},
        ],
      },
      {
        key: 'landfill_rate', label: 'Landfill rate', unit: '%', year: 2024,
        higherIsBetter: false, eu27: 21.3,
        source: 'Eurostat (env_wasmun)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/env_wasmun/default/table',
        data: [
          {code:'BE',name:'Belgium',value:0.1},{code:'FI',name:'Finland',value:0.4},
          {code:'SE',name:'Sweden',value:0.7},{code:'NL',name:'Netherlands',value:1.5},
          {code:'DE',name:'Germany',value:1.6},{code:'DK',name:'Denmark',value:2.0},
          {code:'LU',name:'Luxembourg',value:2.6},{code:'LT',name:'Lithuania',value:5.6},
          {code:'SI',name:'Slovenia',value:10.3},{code:'EE',name:'Estonia',value:12.8},
          {code:'FR',name:'France',value:20.8},{code:'PL',name:'Poland',value:30.0},
          {code:'LV',name:'Latvia',value:30.7},{code:'SK',name:'Slovakia',value:38.0},
          {code:'ES',name:'Spain',value:47.4},{code:'HR',name:'Croatia',value:50.8},
          {code:'PT',name:'Portugal',value:52.0},{code:'HU',name:'Hungary',value:53.1},
          {code:'CY',name:'Cyprus',value:66.4},{code:'MT',name:'Malta',value:72.1},
        ],
      },
      {
        key: 'cmur', label: 'Circular material use rate', unit: '%', year: 2024,
        higherIsBetter: true, eu27: 12.2,
        source: 'Eurostat (cei_srm030)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/cei_srm030/default/table',
        data: [
          {code:'NL',name:'Netherlands',value:32.7},{code:'BE',name:'Belgium',value:22.7},
          {code:'IT',name:'Italy',value:21.6},{code:'EE',name:'Estonia',value:20.5},
          {code:'MT',name:'Malta',value:18.6},{code:'FR',name:'France',value:17.8},
          {code:'AT',name:'Austria',value:15.2},{code:'CZ',name:'Czech Rep.',value:14.8},
          {code:'DE',name:'Germany',value:14.8},{code:'SK',name:'Slovakia',value:12.2},
          {code:'LU',name:'Luxembourg',value:10.7},{code:'SE',name:'Sweden',value:10.4},
          {code:'SI',name:'Slovenia',value:10.1},{code:'DK',name:'Denmark',value:9.4},
          {code:'PL',name:'Poland',value:7.7},{code:'ES',name:'Spain',value:7.4},
          {code:'HU',name:'Hungary',value:7.3},{code:'LV',name:'Latvia',value:6.8},
          {code:'HR',name:'Croatia',value:5.9},{code:'CY',name:'Cyprus',value:5.5},
          {code:'EL',name:'Greece',value:5.2},{code:'BG',name:'Bulgaria',value:5.0},
          {code:'LT',name:'Lithuania',value:4.2},{code:'PT',name:'Portugal',value:3.0},
          {code:'FI',name:'Finland',value:2.0},{code:'IE',name:'Ireland',value:2.0},
          {code:'RO',name:'Romania',value:1.3},
        ],
      },
    ],
  },
  {
    key: 'air_quality', label: 'Air Quality', emoji: '💨', color: '#8b5cf6',
    indicators: [
      {
        key: 'pm25', label: 'PM2.5 concentration', unit: '\u00b5g/m\u00b3', year: 'Latest',
        higherIsBetter: false, eu27: 10.1,
        source: 'EEA Air Quality Data Viewer', sourceUrl: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/air-quality-statistics-viewer',
        note: 'Mean across monitoring stations per country. WHO guideline: 5 \u00b5g/m\u00b3. EU 2030 limit: 10 \u00b5g/m\u00b3.',
        data: [
          {code:'FI',name:'Finland',value:4.5},{code:'EE',name:'Estonia',value:4.6},
          {code:'SE',name:'Sweden',value:5.1},{code:'PT',name:'Portugal',value:5.9},
          {code:'IE',name:'Ireland',value:7.2},{code:'LT',name:'Lithuania',value:7.3},
          {code:'DK',name:'Denmark',value:7.5},{code:'LU',name:'Luxembourg',value:7.8},
          {code:'DE',name:'Germany',value:8.2},{code:'NL',name:'Netherlands',value:8.3},
          {code:'FR',name:'France',value:8.6},{code:'LV',name:'Latvia',value:8.8},
          {code:'BE',name:'Belgium',value:9.0},{code:'AT',name:'Austria',value:9.4},
          {code:'ES',name:'Spain',value:9.3},{code:'MT',name:'Malta',value:11.0},
          {code:'CZ',name:'Czech Rep.',value:12.1},{code:'HU',name:'Hungary',value:12.2},
          {code:'HR',name:'Croatia',value:13.0},{code:'IT',name:'Italy',value:13.3},
          {code:'SK',name:'Slovakia',value:13.3},{code:'CY',name:'Cyprus',value:14.0},
          {code:'SI',name:'Slovenia',value:14.1},{code:'BG',name:'Bulgaria',value:14.1},
          {code:'PL',name:'Poland',value:14.5},{code:'RO',name:'Romania',value:14.7},
          {code:'EL',name:'Greece',value:15.1},
        ],
      },
      {
        key: 'no2', label: 'NO\u2082 concentration', unit: '\u00b5g/m\u00b3', year: 'Latest',
        higherIsBetter: false, eu27: 14.9,
        source: 'EEA Air Quality Data Viewer', sourceUrl: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/air-quality-statistics-viewer',
        note: 'Mean across monitoring stations. EU limit: 40 \u00b5g/m\u00b3. WHO guideline: 10 \u00b5g/m\u00b3.',
        data: [
          {code:'EE',name:'Estonia',value:6.2},{code:'FI',name:'Finland',value:8.9},
          {code:'DK',name:'Denmark',value:9.5},{code:'SE',name:'Sweden',value:11.2},
          {code:'LT',name:'Lithuania',value:12.1},{code:'SK',name:'Slovakia',value:13.2},
          {code:'LV',name:'Latvia',value:13.3},{code:'CZ',name:'Czech Rep.',value:13.7},
          {code:'PT',name:'Portugal',value:13.9},{code:'PL',name:'Poland',value:13.9},
          {code:'AT',name:'Austria',value:14.6},{code:'IE',name:'Ireland',value:14.7},
          {code:'LU',name:'Luxembourg',value:14.8},{code:'MT',name:'Malta',value:15.4},
          {code:'SI',name:'Slovenia',value:15.7},{code:'NL',name:'Netherlands',value:15.6},
          {code:'HR',name:'Croatia',value:16.1},{code:'CY',name:'Cyprus',value:16.3},
          {code:'HU',name:'Hungary',value:17.2},{code:'IT',name:'Italy',value:17.3},
          {code:'BG',name:'Bulgaria',value:17.4},{code:'BE',name:'Belgium',value:18.2},
          {code:'DE',name:'Germany',value:18.8},{code:'FR',name:'France',value:14.2},
          {code:'ES',name:'Spain',value:12.9},{code:'RO',name:'Romania',value:21.9},
          {code:'EL',name:'Greece',value:24.1},
        ],
      },
    ],
  },
  {
    key: 'mobility_transport', label: 'Mobility & Transport', emoji: '🚗', color: '#ec4899',
    indicators: [
      {
        key: 'public_transport', label: 'Public transport modal share', unit: '% of passenger-km', year: 2023,
        higherIsBetter: true, eu27: 16.9,
        source: 'Eurostat (tran_hv_psmod)', sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/tran_hv_psmod/default/table',
        note: 'Trains, motor coaches, buses and trolleybuses as % of inland passenger transport.',
        data: [
          {code:'HU',name:'Hungary',value:24.5},{code:'AT',name:'Austria',value:23.1},
          {code:'SK',name:'Slovakia',value:21.7},{code:'IE',name:'Ireland',value:20.5},
          {code:'BE',name:'Belgium',value:19.6},{code:'CZ',name:'Czech Rep.',value:19.5},
          {code:'RO',name:'Romania',value:18.7},{code:'DK',name:'Denmark',value:18.2},
          {code:'SE',name:'Sweden',value:18.2},{code:'PL',name:'Poland',value:18.0},
          {code:'MT',name:'Malta',value:17.9},{code:'LU',name:'Luxembourg',value:17.3},
          {code:'FI',name:'Finland',value:17.0},{code:'IT',name:'Italy',value:16.7},
          {code:'DE',name:'Germany',value:16.5},{code:'CY',name:'Cyprus',value:16.5},
          {code:'EE',name:'Estonia',value:16.4},{code:'FR',name:'France',value:16.3},
          {code:'HR',name:'Croatia',value:16.1},{code:'ES',name:'Spain',value:16.1},
          {code:'LV',name:'Latvia',value:15.8},{code:'EL',name:'Greece',value:15.2},
          {code:'SI',name:'Slovenia',value:14.5},{code:'NL',name:'Netherlands',value:14.7},
          {code:'BG',name:'Bulgaria',value:11.2},{code:'PT',name:'Portugal',value:11.8},
          {code:'LT',name:'Lithuania',value:7.9},
        ],
      },
    ],
  },
];

// ── EU-27 set & GeoJSON mapping ───────────────────────────────────────────────

const EU27 = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','EL','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']);

// ── Color helpers ─────────────────────────────────────────────────────────────

const BELGIUM_COLOR = '#f97316';
const EU_COLOR      = '#9ca3af';

// Interpolate between green → amber → red based on t in [0,1]
// t=0 = best performer, t=1 = worst performer
function rankColor(t: number): string {
  if (t < 0.5) {
    // green → amber
    const s = t * 2;
    const r = Math.round(22  + (245 - 22)  * s);
    const g = Math.round(163 + (158 - 163) * s);
    const b = Math.round(74  + (11  - 74)  * s);
    return `rgb(${r},${g},${b})`;
  } else {
    // amber → red
    const s = (t - 0.5) * 2;
    const r = Math.round(245 + (220 - 245) * s);
    const g = Math.round(158 + (38  - 158) * s);
    const b = Math.round(11  + (38  - 11)  * s);
    return `rgb(${r},${g},${b})`;
  }
}

function getRank(ind: Indicator, code: string): number {
  const sorted = [...ind.data].sort((a, b) =>
    ind.higherIsBetter ? b.value - a.value : a.value - b.value
  );
  return sorted.findIndex(d => d.code === code) + 1;
}

function getSuffix(n: number): string {
  if (n === 1) return 'st'; if (n === 2) return 'nd'; if (n === 3) return 'rd'; return 'th';
}

// ── Map component ─────────────────────────────────────────────────────────────

// Simple conic projection centred on Europe
function project(lon: number, lat: number, W: number, H: number): [number, number] {
  // Bounds: lon -25..45, lat 34..72
  const lonMin = -25, lonMax = 45, latMin = 34, latMax = 72;
  const scale  = Math.min(W / (lonMax - lonMin), H / (latMax - latMin));
  const x = (lon - lonMin) * scale;
  // Mercator latitude correction
  const latRad   = lat   * Math.PI / 180;
  const latMinR  = latMin * Math.PI / 180;
  const latMaxR  = latMax * Math.PI / 180;
  const yMid     = Math.log(Math.tan(Math.PI / 4 + latMaxR / 2)) - Math.log(Math.tan(Math.PI / 4 + latMinR / 2));
  const y        = (Math.log(Math.tan(Math.PI / 4 + latMaxR / 2)) - Math.log(Math.tan(Math.PI / 4 + latRad / 2))) / yMid * H;
  return [x, y];
}

function coordsToPath(rings: number[][][], W: number, H: number): string {
  return rings.map(ring =>
    ring.map((pt, i) => {
      const [x, y] = project(pt[0], pt[1], W, H);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join('') + 'Z'
  ).join('');
}

function geometryToPath(geom: any, W: number, H: number): string {
  if (!geom) return '';
  if (geom.type === 'Polygon') return coordsToPath(geom.coordinates, W, H);
  if (geom.type === 'MultiPolygon')
    return geom.coordinates.map((poly: number[][][]) => coordsToPath(poly, W, H)).join('');
  return '';
}

interface TooltipState { x: number; y: number; name: string; value: number | null; rank: number; total: number; code: string; }

function EUMap({ indicator, topicColor }: { indicator: Indicator; topicColor: string }) {
  const [features, setFeatures] = useState<any[]>([]);
  const [tooltip, setTooltip]   = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 760, H = 520;

  useEffect(() => {
    // Eurostat GISCO GeoJSON — uses same country codes as our data (ISO Alpha-2, EL for Greece)
    fetch('https://gisco-services.ec.europa.eu/distribution/v2/countries/geojson/CNTR_RG_60M_2020_4326.geojson')
      .then(r => r.json())
      .then(geo => setFeatures(geo.features))
      .catch(console.error);
  }, []);

  // Build lookup: geoCode → {value, rank}
  const sorted = [...indicator.data].sort((a, b) =>
    indicator.higherIsBetter ? b.value - a.value : a.value - b.value
  );
  const rankMap: Record<string, { value: number; rank: number }> = {};
  sorted.forEach((d, i) => { rankMap[d.code] = { value: d.value, rank: i + 1 }; });
  const n = indicator.data.length;

  const getCode = (feat: any): string => {
    // Eurostat GISCO uses CNTR_ID which matches our codes (ISO Alpha-2, EL for Greece)
    return feat.properties?.CNTR_ID ?? feat.properties?.ISO_A2 ?? '';
  };

  const getFillColor = (code: string): string => {
    if (!EU27.has(code)) return '#8c949e'; // non-EU → dark slate grey // non-EU → visible grey
    const entry = rankMap[code];
    if (!entry) return '#c8cdd4';          // EU, no data → lighter grey           // EU but no data → slightly darker grey
    if (code === 'BE') return BELGIUM_COLOR; // Belgium always orange
    const t = (entry.rank - 1) / Math.max(n - 1, 1);
    return rankColor(t);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGGElement>, feat: any) => {
    const code = getCode(feat);
    const entry = rankMap[code];
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 10,
      name: feat.properties?.NAME_ENGL ?? feat.properties?.SOVEREIGNT ?? feat.properties?.name ?? code,
      value: entry?.value ?? null,
      rank: entry?.rank ?? 0,
      total: n,
      code,
    });
  }, [rankMap, n]);

  if (features.length === 0) {
    return (
      <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
        Loading map…
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {features.map((feat, i) => {
          const code  = getCode(feat);
          const fill  = getFillColor(code);
          const isEU  = EU27.has(code);
          return (
            <g key={i}
              onMouseMove={e => handleMouseMove(e, feat)}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: isEU ? 'pointer' : 'default' }}
            >
              <path
                d={geometryToPath(feat.geometry, W, H)}
                fill={fill}
                stroke="#fff"
                strokeWidth={isEU ? 0.6 : 0.3}
                opacity={isEU ? 1 : 0.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x, top: tooltip.y,
          background: '#1a1a1a', color: '#fff', borderRadius: 8, padding: '8px 12px',
          fontSize: 12, pointerEvents: 'none', zIndex: 10, minWidth: 160,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 3, color: tooltip.code === 'BE' ? '#f97316' : '#fff' }}>
            {tooltip.name}
          </div>
          {tooltip.value !== null ? (
            <>
              <div style={{ color: '#d1d5db' }}>{tooltip.value} {indicator.unit}</div>
              <div style={{ color: rankColor((tooltip.rank - 1) / Math.max(n - 1, 1)), fontWeight: 600, marginTop: 2 }}>
                #{tooltip.rank} out of {tooltip.total}
              </div>
            </>
          ) : (
            <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No data</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Best</span>
        <div style={{
          height: 10, width: 200, borderRadius: 4,
          background: 'linear-gradient(to right, rgb(22,163,74), rgb(245,158,11), rgb(220,38,38))',
        }} />
        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Worst</span>
        <span style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#6b7280' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: BELGIUM_COLOR, flexShrink: 0, display: 'inline-block' }} /> Belgium
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#6b7280' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#c8cdd4', flexShrink: 0, display: 'inline-block' }} /> No data
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#6b7280' }}>
          <span style={{ width: 12, height: 12, borderRadius: 2, background: '#8c949e', flexShrink: 0, display: 'inline-block' }} /> Non-EU
        </span>
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, unit }: { active?: boolean; payload?: {payload: CountryVal}[]; unit: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ fontWeight: 700, color: d.code === 'BE' ? BELGIUM_COLOR : '#1a1a1a', marginBottom: 2 }}>{d.name}</p>
      <p style={{ color: '#374151' }}>{d.value} {unit}</p>
    </div>
  );
}

function CustomYTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const isBE = payload?.value === 'Belgium';
  return (
    <text
      x={x} y={y} dy={4}
      textAnchor="end"
      fill={isBE ? BELGIUM_COLOR : '#374151'}
      fontWeight={isBE ? 800 : 400}
      fontSize={isBE ? 12.5 : 10.5}
    >
      {payload?.value}
    </text>
  );
}

function EUBarChart({ indicator }: { indicator: Indicator }) {
  const sorted = [...indicator.data].sort((a, b) =>
    indicator.higherIsBetter ? b.value - a.value : a.value - b.value
  );
  const n      = sorted.length;
  const maxVal = Math.max(...sorted.map(d => d.value));
  const xMax   = Math.ceil(Math.max(maxVal, indicator.eu27) * 1.18);
  const chartH = n * 28 + 60;  // 28px per bar ensures all labels fit

  return (
    <div>
      <div style={{ width: '100%', height: chartH }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 12, right: 70, left: 0, bottom: 32 }}>
            <XAxis type="number" domain={[0, xMax]} tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false}
              label={{ value: indicator.unit, position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#6b7280' }} />
            <YAxis type="category" dataKey="name" width={116} interval={0} tick={(props: any) => <CustomYTick {...props} />} tickLine={false} axisLine={false} />
            <Tooltip content={(props) => <ChartTooltip {...props as any} unit={indicator.unit} />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <ReferenceLine x={indicator.eu27} stroke={EU_COLOR} strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: `EU avg: ${indicator.eu27}`, position: 'insideBottomLeft', fontSize: 10, fill: EU_COLOR, fontWeight: 700, offset: 6 }} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={18}>
              {sorted.map((d, i) => {
                const t    = i / Math.max(n - 1, 1);
                const fill = d.code === 'BE' ? BELGIUM_COLOR : rankColor(t);
                return <Cell key={i} fill={fill} />;
              })}
              <LabelList dataKey="value" position="right" style={{ fontSize: 9.5, fill: '#374151', fontWeight: 500 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {indicator.note && <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 4 }}>{indicator.note}</p>}
      <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>
        Source: <a href={indicator.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>{indicator.source}</a>
        {` · ${indicator.year}`}
      </p>
    </div>
  );
}

// ── Stat cards ────────────────────────────────────────────────────────────────

function KeyStats({ indicator, topicColor }: { indicator: Indicator; topicColor: string }) {
  const be   = indicator.data.find(d => d.code === 'BE');
  const rank = be ? getRank(indicator, 'BE') : 0;
  const n    = indicator.data.length;
  const rankCol = rank === 0 ? '#6b7280' : rank <= 5 ? '#16a34a' : rank >= n - 4 ? '#dc2626' : '#b45309';
  const rankDir = indicator.higherIsBetter ? 'highest' : 'lowest';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
      {[
        { label: 'Belgium', val: be ? String(be.value) : '—', sub: `${indicator.unit} · ${indicator.year}`, color: topicColor },
        { label: 'EU-27 average', val: String(indicator.eu27), sub: `${indicator.unit} · ${indicator.year}`, color: '#6b7280' },
        { label: 'Belgium rank', val: rank > 0 ? `#${rank}` : '—', sub: rank > 0 ? `${rank}${getSuffix(rank)} ${rankDir} out of ${n}` : `out of ${n}`, color: rankCol },
      ].map(card => (
        <div key={card.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', borderTop: `3px solid ${card.color}` }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280', marginBottom: 4 }}>{card.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Roboto, sans-serif', color: card.color, lineHeight: 1 }}>{card.val}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EUComparisonPage() {
  const [activeTopic, setActiveTopic] = useState(TOPICS[0].key);
  const [activeInd,   setActiveInd]   = useState(TOPICS[0].indicators[0].key);

  const topic     = TOPICS.find(t => t.key === activeTopic) ?? TOPICS[0];
  const indicator = topic.indicators.find(i => i.key === activeInd) ?? topic.indicators[0];

  const switchTopic = (tk: string) => {
    const t = TOPICS.find(x => x.key === tk) ?? TOPICS[0];
    setActiveTopic(tk);
    setActiveInd(t.indicators[0].key);
  };

  return (
    <main>
      {/* Header */}
      <header>
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="header-content" style={{ padding: '32px 48px 28px 72px' }}>
          <div className="header-text">
            <p className="header-eyebrow">🇧🇪 Belgium</p>
            <h1>Environment Tracker</h1>
            <p className="header-sub">How does Belgium compare to other EU member states?</p>
          </div>
        </div>
      </header>

      {/* Toggle */}
      <div className="view-toggle-bar">
        <div className="view-toggle">
          <a href="/indicators" className="view-toggle-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ display: 'inline-flex', width: 18, height: 13, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.12)' }}>
              <span style={{ flex: 1, background: '#1a1a1a' }} />
              <span style={{ flex: 1, background: '#FAE042' }} />
              <span style={{ flex: 1, background: '#EF3340' }} />
            </span>
            National
          </a>
          <a href="/indicators/regional" className="view-toggle-btn" style={{ textDecoration: 'none' }}>Regional</a>
          <button className="view-toggle-btn active">Belgium vs EU</button>
        </div>
      </div>

      {/* Topic tabs */}
      <nav className="tabs" aria-label="Topics">
        {TOPICS.map(t => (
          <button key={t.key}
            className={`tab${activeTopic === t.key ? ' active' : ''}`}
            style={{ '--tab-color': t.color } as React.CSSProperties}
            onClick={() => switchTopic(t.key)}
          >
            <span className="tab-emoji">{t.emoji}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Indicator sub-selector */}
      {topic.indicators.length > 1 && (
        <div style={{ background: '#3a3a3a', borderBottom: '2px solid #2e2e2e', padding: '8px 0', display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {topic.indicators.map(ind => {
            const active = ind.key === activeInd;
            return (
              <button key={ind.key} onClick={() => setActiveInd(ind.key)} style={{
                padding: '5px 16px', borderRadius: 4, fontSize: '0.82rem', fontWeight: active ? 700 : 400,
                border: `1.5px solid ${active ? topic.color : 'transparent'}`,
                background: active ? '#fff' : 'transparent',
                color: active ? topic.color : '#aaa',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {ind.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <section style={{ maxWidth: 1800, margin: '0 auto', padding: '32px 40px 64px' }}>
        <KeyStats indicator={indicator} topicColor={topic.color} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Bar chart */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a1a1a', margin: 0 }}>
                {indicator.label}
              </h2>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.75rem', color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: BELGIUM_COLOR, display: 'inline-block' }} /> Belgium
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 14, height: 2, borderTop: `2px dashed ${EU_COLOR}`, display: 'inline-block' }} /> EU avg
                </span>
              </span>
            </div>
            <EUBarChart indicator={indicator} />
          </div>

          {/* Map */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a1a1a', margin: '0 0 12px' }}>
              {indicator.label} — map
            </h2>
            <EUMap indicator={indicator} topicColor={topic.color} />
          </div>
        </div>
      </section>
    </main>
  );
}
