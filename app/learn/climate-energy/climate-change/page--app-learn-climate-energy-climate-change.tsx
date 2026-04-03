'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#f97316';

// ── CO₂ data ──────────────────────────────────────────────────────────────────
// Ice core data — EPICA Dome C / Vostok proxy records + modern measurements
// x = calendar year, y = CO₂ ppm
const ICE_CORE_DATA = [
  { year: -800000, ppm: 190 }, { year: -780000, ppm: 240 }, { year: -760000, ppm: 200 },
  { year: -740000, ppm: 235 }, { year: -720000, ppm: 185 }, { year: -700000, ppm: 230 },
  { year: -680000, ppm: 200 }, { year: -660000, ppm: 242 }, { year: -640000, ppm: 188 },
  { year: -620000, ppm: 228 }, { year: -600000, ppm: 195 }, { year: -580000, ppm: 230 },
  { year: -560000, ppm: 200 }, { year: -540000, ppm: 240 }, { year: -520000, ppm: 200 },
  { year: -500000, ppm: 225 }, { year: -480000, ppm: 210 }, { year: -460000, ppm: 235 },
  { year: -440000, ppm: 200 }, { year: -420000, ppm: 280 }, { year: -400000, ppm: 225 },
  { year: -380000, ppm: 228 }, { year: -360000, ppm: 202 }, { year: -340000, ppm: 232 },
  { year: -320000, ppm: 205 }, { year: -300000, ppm: 245 }, { year: -280000, ppm: 200 },
  { year: -260000, ppm: 238 }, { year: -240000, ppm: 218 }, { year: -220000, ppm: 243 },
  { year: -200000, ppm: 200 }, { year: -180000, ppm: 228 }, { year: -160000, ppm: 198 },
  { year: -140000, ppm: 248 }, { year: -130000, ppm: 278 }, { year: -120000, ppm: 258 },
  { year: -110000, ppm: 236 }, { year: -100000, ppm: 222 }, { year: -90000,  ppm: 210 },
  { year: -80000,  ppm: 218 }, { year: -70000,  ppm: 195 }, { year: -60000,  ppm: 208 },
  { year: -50000,  ppm: 194 }, { year: -40000,  ppm: 185 }, { year: -30000,  ppm: 188 },
  { year: -20000,  ppm: 185 }, { year: -15000,  ppm: 192 }, { year: -10000,  ppm: 244 },
  { year: -5000,   ppm: 264 }, { year: -2000,   ppm: 275 }, { year: -500,    ppm: 280 },
  { year: 0,       ppm: 280 }, { year: 1800,    ppm: 286 }, { year: 1850,    ppm: 288 },
  { year: 1900,    ppm: 296 }, { year: 1950,    ppm: 310 }, { year: 1970,    ppm: 326 },
  { year: 1990,    ppm: 354 }, { year: 2000,    ppm: 369 }, { year: 2010,    ppm: 390 },
  { year: 2024,    ppm: 424 },
];

// Mauna Loa annual averages — Keeling Curve (Scripps / NOAA)
const KEELING_DATA = [
  { year: 1959, ppm: 316 }, { year: 1960, ppm: 317 }, { year: 1961, ppm: 318 },
  { year: 1962, ppm: 318 }, { year: 1963, ppm: 319 }, { year: 1964, ppm: 320 },
  { year: 1965, ppm: 320 }, { year: 1966, ppm: 321 }, { year: 1967, ppm: 322 },
  { year: 1968, ppm: 323 }, { year: 1969, ppm: 325 }, { year: 1970, ppm: 326 },
  { year: 1971, ppm: 326 }, { year: 1972, ppm: 327 }, { year: 1973, ppm: 330 },
  { year: 1974, ppm: 330 }, { year: 1975, ppm: 331 }, { year: 1976, ppm: 332 },
  { year: 1977, ppm: 334 }, { year: 1978, ppm: 335 }, { year: 1979, ppm: 337 },
  { year: 1980, ppm: 339 }, { year: 1981, ppm: 340 }, { year: 1982, ppm: 341 },
  { year: 1983, ppm: 343 }, { year: 1984, ppm: 345 }, { year: 1985, ppm: 346 },
  { year: 1986, ppm: 347 }, { year: 1987, ppm: 349 }, { year: 1988, ppm: 352 },
  { year: 1989, ppm: 353 }, { year: 1990, ppm: 354 }, { year: 1991, ppm: 356 },
  { year: 1992, ppm: 356 }, { year: 1993, ppm: 357 }, { year: 1994, ppm: 359 },
  { year: 1995, ppm: 361 }, { year: 1996, ppm: 363 }, { year: 1997, ppm: 364 },
  { year: 1998, ppm: 367 }, { year: 1999, ppm: 368 }, { year: 2000, ppm: 369 },
  { year: 2001, ppm: 371 }, { year: 2002, ppm: 373 }, { year: 2003, ppm: 376 },
  { year: 2004, ppm: 377 }, { year: 2005, ppm: 380 }, { year: 2006, ppm: 382 },
  { year: 2007, ppm: 384 }, { year: 2008, ppm: 386 }, { year: 2009, ppm: 387 },
  { year: 2010, ppm: 390 }, { year: 2011, ppm: 392 }, { year: 2012, ppm: 394 },
  { year: 2013, ppm: 396 }, { year: 2014, ppm: 399 }, { year: 2015, ppm: 401 },
  { year: 2016, ppm: 404 }, { year: 2017, ppm: 407 }, { year: 2018, ppm: 409 },
  { year: 2019, ppm: 411 }, { year: 2020, ppm: 414 }, { year: 2021, ppm: 416 },
  { year: 2022, ppm: 419 }, { year: 2023, ppm: 421 }, { year: 2024, ppm: 424 },
];

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'what-is-climate-change', label: 'What is climate change?' },
  { id: 'greenhouse-effect',      label: 'The greenhouse effect'   },
  { id: 'co2-atmosphere',         label: 'CO\u2082 in the atmosphere'    },
  { id: 'consequences',           label: 'Consequences'            },
  { id: 'paris-agreement',        label: 'The Paris Agreement'     },
  { id: 'further-reading',        label: 'Further reading'         },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatIceYear(v: number): string {
  if (v >= 1000) return `${v}`;
  if (v >= 0)    return `${v} CE`;
  const abs = Math.abs(v);
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}M BCE`;
  if (abs >= 1000)    return `${(abs / 1000).toFixed(0)}k BCE`;
  return `${abs} BCE`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function KeyFigures() {
  const figs = [
    { value: '+1.3\u00b0C', label: 'above pre-industrial levels', sub: '2024 global average (Copernicus)', color: '#f97316' },
    { value: '424 ppm',    label: 'CO\u2082 in the atmosphere',    sub: 'Highest in at least 3 million years',  color: '#ef4444' },
    { value: '10 / 10',   label: 'hottest years since 2014',    sub: 'All 10 warmest years on record',       color: '#8b5cf6' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, padding: '24px 28px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#1a1a1a', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #f3f4f6' }}>
      {children}
    </h2>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, marginBottom: 12 }}>{children}</p>;
}

function BulletList({ items }: { items: { bold: string; text: string }[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
          <span style={{ color: TOPIC_COLOR, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>▸</span>
          <span><strong style={{ color: '#1a1a1a' }}>{item.bold}</strong>: {item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function CO2Chart() {
  const [view, setView] = useState<'icecore' | 'keeling'>('icecore');
  const data   = view === 'icecore' ? ICE_CORE_DATA : KEELING_DATA;
  const domain = view === 'icecore' ? [-800000, 2024] : [1959, 2024];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e3da', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: 2 }}>
          {view === 'icecore' ? formatIceYear(d?.year) : d?.year}
        </p>
        <p style={{ color: TOPIC_COLOR }}>{d?.ppm} ppm CO₂</p>
      </div>
    );
  };

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([
          { id: 'icecore', label: '800,000-year view' },
          { id: 'keeling', label: 'Keeling Curve (1959–2024)' },
        ] as const).map(opt => (
          <button
            key={opt.id}
            onClick={() => setView(opt.id)}
            style={{
              padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'Epilogue, sans-serif', fontSize: '0.8rem', fontWeight: 600,
              background: view === opt.id ? TOPIC_COLOR : '#f3f4f6',
              color:      view === opt.id ? '#fff' : '#6b7280',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={TOPIC_COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={TOPIC_COLOR} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              type="number"
              domain={domain}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => view === 'icecore'
                ? (Math.abs(v) >= 1000 ? `${(Math.abs(v) / 1000).toFixed(0)}k${v < 0 ? ' BCE' : ''}` : String(v))
                : String(v)}
              tickCount={view === 'icecore' ? 9 : 8}
              label={{ value: view === 'icecore' ? 'Year' : 'Year', position: 'insideBottom', offset: -14, fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis
              domain={[160, 440]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}`}
              label={{ value: 'CO\u2082 (ppm)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {view === 'icecore' && (
              <ReferenceLine x={1800} stroke="#6b7280" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: 'Industrial Revolution', position: 'insideTopRight', fontSize: 9, fill: '#9ca3af' }} />
            )}
            {view === 'keeling' && (
              <ReferenceLine y={350} stroke="#6b7280" strokeDasharray="4 3" strokeWidth={1}
                label={{ value: '350 ppm (safe boundary)', position: 'insideTopLeft', fontSize: 9, fill: '#9ca3af' }} />
            )}
            <Area
              type="monotone"
              dataKey="ppm"
              stroke={TOPIC_COLOR}
              strokeWidth={2}
              fill="url(#co2grad)"
              dot={false}
              activeDot={{ r: 4, fill: TOPIC_COLOR }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
        {view === 'icecore'
          ? 'Sources: EPICA Dome C & Vostok ice core records; NOAA / Scripps Institution of Oceanography (post-1958). Approximate data points.'
          : 'Source: Scripps Institution of Oceanography / NOAA, Mauna Loa Observatory. Annual mean CO\u2082 concentrations.'}
      </p>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) { setActive(s.id); return; }
      }
      setActive(SECTIONS[0].id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    <div className="detail-sidebar" style={{ '--topic-color': TOPIC_COLOR } as React.CSSProperties}>
      <div className="detail-sidebar-title">On this page</div>
      {SECTIONS.map(s => (
        <button key={s.id} className={`detail-sidebar-link${active === s.id ? ' active' : ''}`} onClick={() => scrollTo(s.id)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ClimateChangePage() {
  return (
    <div className="detail-page">

      {/* Dark header */}
      <div className="detail-header" style={{ background: '#1a1a1a' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">\u2190 Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>\uD83C\uDF21\uFE0F  Climate &amp; Energy</p>
            <h1 className="detail-title">Climate Change</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/climate-change.jpg" alt="Climate Change" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        <Sidebar />

        <div className="detail-main">

          {/* Key figures */}
          <KeyFigures />

          {/* 1 — What is climate change */}
          <SectionCard id="what-is-climate-change">
            <SectionTitle>What is climate change?</SectionTitle>
            <Para>
              Climate change refers to long-term shifts in global temperatures and weather patterns. While the Earth&apos;s
              climate has always varied over geological timescales, since the mid-20th century human activity has become
              the dominant driver of change. The burning of fossil fuels, deforestation and industrial processes release
              greenhouse gases faster than natural systems can absorb them, trapping more heat in the lower atmosphere
              and pushing the climate into territory it has not experienced for millions of years.
            </Para>
          </SectionCard>

          {/* 2 — Greenhouse effect */}
          <SectionCard id="greenhouse-effect">
            <SectionTitle>The greenhouse effect</SectionTitle>
            <Para>
              The sun emits energy as short-wave radiation — mostly visible light — which passes easily through the
              atmosphere and is absorbed by the Earth&apos;s surface. The warmed surface then re-emits this energy as
              longer-wave infrared (IR) radiation back towards space.
            </Para>
            <Para>
              Greenhouse gases — including CO&#x2082;, methane (CH&#x2084;), nitrous oxide (N&#x2082;O) and fluorinated
              gases — absorb a portion of this outgoing IR radiation before it can escape. They do so because their
              molecular bonds vibrate at frequencies that match the wavelength of infrared light: when an IR photon
              hits a molecule, it causes the bond to stretch or bend, absorbing the photon&apos;s energy and then
              re-emitting it in all directions — including back towards Earth.
            </Para>
            <Para>
              Not all greenhouse gases are equally effective at trapping heat. This is captured by the{' '}
              <strong>Global Warming Potential (GWP)</strong> — a measure of how much heat a gas traps over 100 years
              relative to CO&#x2082; (IPCC AR5 standard):
            </Para>
            <BulletList items={[
              { bold: 'CO\u2082',                           text: 'GWP of 1 (the reference). Dominant driver of warming due to its volume and long atmospheric lifetime of 50\u2013200 years' },
              { bold: 'Methane (CH\u2084)',                 text: 'GWP of ~30\u00d7. Emitted by livestock, waste decomposition and gas leaks. Shorter-lived but far more potent per molecule' },
              { bold: 'Nitrous oxide (N\u2082O)',           text: 'GWP of ~265\u00d7. Mainly from fertilisers and manure. Persists for ~114 years in the atmosphere' },
              { bold: 'HFCs (hydrofluorocarbons)',          text: 'GWP up to 14,800\u00d7. Used in refrigeration and air conditioning' },
              { bold: 'SF\u2086 (sulphur hexafluoride)',   text: 'GWP of 23,500\u00d7. Used in electrical switchgear. Extremely long-lived (~3,200 years)' },
              { bold: 'PFCs (perfluorocarbons)',            text: 'GWP of ~6,630\u00d7. Released during aluminium smelting and semiconductor manufacturing' },
            ]} />
          </SectionCard>

          {/* 3 — CO₂ in atmosphere */}
          <SectionCard id="co2-atmosphere">
            <SectionTitle>CO&#x2082; in the atmosphere</SectionTitle>
            <CO2Chart />
            <Para style={{ marginTop: 16 }}>
              How do we know what CO&#x2082; levels were hundreds of thousands of years ago? Scientists drill deep into
              ice sheets in Antarctica and Greenland, extracting cores that contain tiny air bubbles trapped when snow
              originally fell. The longest ice core records stretch back around 800,000 years and show that CO&#x2082;
              concentration never exceeded 300 ppm throughout that entire period — until the Industrial Revolution.
            </Para>
            <Para>
              Since 1958, direct atmospheric measurements have been taken at the Mauna Loa Observatory in Hawaii,
              far from industrial sources, providing a clean global baseline. The resulting dataset — the{' '}
              <strong>Keeling Curve</strong> — is one of the most iconic records in climate science. It shows an
              unbroken rise from 316 ppm in 1959 to 424 ppm in 2024, with a small seasonal oscillation caused by
              Northern Hemisphere vegetation absorbing CO&#x2082; in summer and releasing it in winter.
            </Para>
          </SectionCard>

          {/* 4 — Consequences */}
          <SectionCard id="consequences">
            <SectionTitle>Consequences of climate change</SectionTitle>
            <Para>
              The extra heat trapped by greenhouse gases adds energy to the entire climate system, making weather more
              intense and variable. Belgium has already felt these effects — the 2021 Vesdre valley floods killed 42
              people and caused billions in damage, while the summer of 2019 saw temperatures exceed 40&deg;C for the
              first time in recorded history. The main consequences are:
            </Para>
            <BulletList items={[
              { bold: 'Rising temperatures and heatwaves', text: 'Each degree of warming increases the probability and severity of extreme heat events. Days that once occurred once every 50 years now recur every 5\u201310 years in many parts of Europe' },
              { bold: 'Changing precipitation',            text: 'A warmer atmosphere holds more water vapour, intensifying both heavy rainfall and drought. Wet regions tend to get wetter; dry regions drier' },
              { bold: 'Sea level rise',                    text: 'Warming expands ocean water and melts land-based ice. Global sea levels have risen ~20 cm since 1900, with the rate accelerating' },
              { bold: 'Ocean acidification',               text: 'The oceans absorb ~25% of CO\u2082 emissions, forming carbonic acid. Ocean pH has dropped by 0.1 units since pre-industrial times \u2014 a 26% increase in acidity \u2014 threatening marine ecosystems' },
              { bold: 'Biodiversity loss',                 text: 'Species ranges are shifting poleward and to higher elevations. Timing mismatches between plants, insects and birds are disrupting food webs' },
            ]} />
          </SectionCard>

          {/* 5 — Paris Agreement */}
          <SectionCard id="paris-agreement">
            <SectionTitle>The Paris Agreement</SectionTitle>
            <Para>
              Adopted in December 2015 and ratified by 195 countries, the Paris Agreement is the central international
              framework for addressing climate change. Its core goal is to{' '}
              <strong>limit global average temperature rise to well below 2&deg;C above pre-industrial levels, and to
              pursue efforts to limit it to 1.5&deg;C</strong>.
            </Para>
            <Para>Under the agreement, each country must:</Para>
            <BulletList items={[
              { bold: 'Submit a Nationally Determined Contribution (NDC)', text: 'a national plan setting emission reduction targets and adaptation measures' },
              { bold: 'Update its NDC every five years',                   text: 'with increasing ambition — targets can only become more stringent over time' },
              { bold: 'Report transparently on progress',                  text: 'through a common framework of measurement, reporting and verification' },
            ]} />
            <Para style={{ marginTop: 14 }}>
              The 1.5&deg;C threshold matters: the difference between 1.5&deg;C and 2&deg;C means hundreds of millions
              fewer people exposed to climate risks, potential survival of most coral reefs, and significantly lower
              sea level rise. At current national pledges, the world is on course for approximately{' '}
              <strong>2.5&ndash;3&deg;C of warming by 2100</strong>.
            </Para>
            <Para>
              Belgium implements its Paris commitments through EU climate law. The{' '}
              <strong>European Climate Law</strong> sets a legally binding target of net climate neutrality by 2050 and
              a 55% reduction in emissions by 2030 compared to 1990. Belgium&apos;s specific obligation under the{' '}
              <strong>Effort Sharing Regulation</strong> is a 47% reduction in non-ETS emissions by 2030 vs 2005 — a
              target it is currently not on track to meet.
            </Para>
          </SectionCard>

          {/* 6 — Further reading */}
          <SectionCard id="further-reading">
            <SectionTitle>Further reading</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'IPCC Sixth Assessment Report (AR6)',           url: 'https://www.ipcc.ch/assessment-report/ar6/' },
                { label: 'Copernicus Climate Change Service',            url: 'https://climate.copernicus.eu' },
                { label: 'The Keeling Curve — Scripps Institution',      url: 'https://keelingcurve.ucsd.edu' },
                { label: 'Belgian National Climate Commission',          url: 'https://www.indicators.be' },
                { label: 'Royal Meteorological Institute of Belgium (RMI)', url: 'https://www.meteo.be' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                >
                  <span style={{ color: TOPIC_COLOR, fontWeight: 700, fontSize: '0.75rem' }}>&#x2197;</span>
                  {link.label}
                </a>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>

    </div>
  );
}
