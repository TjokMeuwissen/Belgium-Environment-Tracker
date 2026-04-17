'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClimateEnergyTab from '../components/ClimateEnergyTab';
import NatureBiodiversityTab from '../components/NatureBiodiversityTab';
import CircularityWasteTab from '../components/CircularityWasteTab';
import WaterSoilTab from '../components/WaterSoilTab';
import AirQualityTab from '../components/AirQualityTab';
import MobilityTransportTab from '../components/MobilityTransportTab';

interface Indicator {
  indicator: string;
  description: string | null;
  unit: string | null;
  target_value: number | null;
  target_year: number | null;
  latest_value: number | null;
  latest_value_year: number | null;
  target_context: string | null;
  status: string | null;
  trend: string | null;
  policy: string | null;
  policy_url: string | null;
  data_source: string | null;
  data_source_url: string | null;
  notes: string | null;
  consequences: string | null;
  responsible: string | null;
}

interface TopicData { topic: string; indicators: Indicator[]; }
interface EnvData   { topics: Record<string, TopicData>; historical: any; nature_supplementary: any; circularity_supplementary: any; water_supplementary: any; mobility_supplementary: any; air_supplementary: any; }

const TOPIC_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  climate_energy:      { label: 'Climate & Energy',     color: '#f97316', emoji: '🌡️' },
  nature_biodiversity: { label: 'Nature & Biodiversity', color: '#22c55e', emoji: '🌿' },
  circularity_waste:   { label: 'Circularity & Waste',  color: '#06b6d4', emoji: '♻️' },
  water_soil:          { label: 'Water & Soil',          color: '#3b82f6', emoji: '💧' },
  air_quality:         { label: 'Air Quality',           color: '#8b5cf6', emoji: '💨' },
  mobility_transport:  { label: 'Mobility & Transport',  color: '#ec4899', emoji: '🚗' },
};

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'         },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'         },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'        },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};

const TREND_ICON: Record<string, string> = { Improving: '↑', Stable: '→', Worsening: '↓' };

function fmt(v: number | null | undefined, unit: string | null): string {
  if (v == null) return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n)) return String(v);
  return `${n.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

function getProgress(latest: number | null, target: number | null, status?: string | null): number | null {
  if (latest == null || target == null) return null;
  const l = typeof latest === 'number' ? latest : parseFloat(String(latest));
  const t = typeof target === 'number' ? target : parseFloat(String(target));
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  if (status === 'Achieved') return 100;
  if (l < t) return Math.min(100, (l / t) * 100);
  return Math.min(100, (t / l) * 100);
}

function progressColor(pct: number): string {
  if (pct >= 100) return '#166534';
  if (pct >= 80)  return '#16a34a';
  if (pct >= 60)  return '#86efac';
  if (pct >= 40)  return '#f97316';
  if (pct >= 20)  return '#ef4444';
  return '#b91c1c';
}

function IndicatorCard({ ind, topicColor }: { ind: Indicator; topicColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const sc  = STATUS_CFG[ind.status ?? ''] ?? STATUS_CFG['Insufficient data'];
  const p   = getProgress(ind.latest_value, ind.target_value, ind.status);
  return (
    <div className="card" style={{ '--topic-color': topicColor } as React.CSSProperties}>
      <div className="card-accent" />
      <div className="card-inner">
        <div className="card-top">
          <span className="status-badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
          <span className="trend">{TREND_ICON[ind.trend ?? ''] ?? '—'} {ind.trend ?? '—'}</span>
        </div>
        <h3 className="card-title">{ind.indicator}</h3>
        {ind.description && <p className="card-desc">{(ind as any).short_description || ind.description}</p>}
        <div className="card-values">
          <div className="value-block">
            <span className="value-label">Latest</span>
            <span className="value-num">{fmt(ind.latest_value, ind.unit)}</span>
            {ind.latest_value_year && <span className="value-year">{ind.latest_value_year}</span>}
          </div>
          {ind.target_value != null && (
            <div className="value-block">
              <span className="value-label">Target</span>
              <span className="value-num">{fmt(ind.target_value, ind.unit)}</span>
              {ind.target_year && <span className="value-year">by {ind.target_year}</span>}
            </div>
          )}
        </div>
        {p != null && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${p}%`, background: progressColor(p) }} />
            </div>
            <span className="progress-label">{p === 100 ? '100% of the way to target! 🎉' : `${p.toFixed(0)}% of the way to target`}</span>
          </div>
        )}
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>
        {expanded && (
          <div className="card-detail">
            {ind.target_context && <div className="detail-row"><strong>Context</strong><p>{ind.target_context}</p></div>}
            {ind.notes && <div className="detail-row"><strong>Notes</strong><p>{ind.notes}</p></div>}
            {ind.consequences && <div className="detail-row"><strong>Consequences if missed</strong><p>{ind.consequences}</p></div>}
            {ind.responsible && <div className="detail-row"><strong>Responsible government</strong><p>{ind.responsible}</p></div>}
            {ind.data_source && (
              <div className="detail-row">
                <strong>Data source</strong>
                {ind.data_source_url
                  ? <a href={ind.data_source_url} target="_blank" rel="noopener noreferrer">{ind.data_source}</a>
                  : <p>{ind.data_source}</p>}
              </div>
            )}
            {ind.policy && (
              <div className="detail-row">
                <strong>Policy</strong>
                {ind.policy_url
                  ? <a href={ind.policy_url} target="_blank" rel="noopener noreferrer">{ind.policy}</a>
                  : <p>{ind.policy}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HomeInner() {
  const [data, setData]          = useState<EnvData | null>(null);
  const [activeTopic, setActive] = useState('climate_energy');
  const searchParams             = useSearchParams();

  useEffect(() => {
    const topic = searchParams.get('topic');
    if (topic && TOPIC_CONFIG[topic]) setActive(topic);
  }, [searchParams]);

  useEffect(() => {
    fetch('/data/belgium_environment_data.json')
      .then(r => r.json())
      .then(setData)
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  if (!data) return <div className="loading">Loading data…</div>;

  const allIndicators = Object.values(data.topics).flatMap(t => t.indicators);
  const stats = {
    achieved: allIndicators.filter(i => i.status === 'Achieved').length,
    onTrack:  allIndicators.filter(i => i.status === 'On track').length,
    offTrack: allIndicators.filter(i => i.status === 'Off track').length,
    noData:   allIndicators.filter(i => i.status === 'Insufficient data').length,
  };

  const activeCfg        = TOPIC_CONFIG[activeTopic];
  const activeIndicators = data.topics[activeTopic]?.indicators ?? [];

  const historicalGHG =
    data.historical?.climate_energy?.series?.['Total GHG Emissions']?.map(
      (d: any) => ({ year: d.year, value: d.value, unit: d.unit })
    ) ?? [];

  const historicalOrganic =
    data.historical?.nature_biodiversity?.series?.['Organic farming share']?.map(
      (d: any) => ({ year: d.year, value: d.value })
    ) ?? [];

  const historicalBirds =
    data.historical?.nature_biodiversity?.series?.['Farmland bird population index']?.map(
      (d: any) => ({ year: d.year, value: d.value })
    ) ?? [];

  const invasiveSpecies = data.nature_supplementary?.invasive_alien_species ?? [];

  const historicalMSW   = data.historical?.circularity_waste?.series?.['Municipal solid waste recycling rate']?.map(
    (d: any) => ({ year: d.year, value: d.value })
  ) ?? [];
  const historicalCMUR  = data.historical?.circularity_waste?.series?.['Circular material use rate (CMUR)']?.map(
    (d: any) => ({ year: d.year, value: d.value })
  ) ?? [];
  const historicalWaste = data.historical?.circularity_waste?.series?.['Municipal waste generation per capita']?.map(
    (d: any) => ({ year: d.year, value: d.value })
  ) ?? [];
  const packagingByMaterial = data.circularity_supplementary?.packaging_by_material ?? [];
  const treatmentBreakdown  = data.circularity_supplementary?.treatment_breakdown ?? [];

  const historicalSoil   = data.historical?.water_soil?.series?.['Soil sealing rate']?.map(
    (d: any) => ({ year: d.year, value: d.value })
  ) ?? [];
  const landUse          = data.water_supplementary?.land_use ?? [];
  const nitrateSources   = data.water_supplementary?.nitrate_sources ?? [];
  const phosphateSources = data.water_supplementary?.phosphate_sources ?? [];
  const modalSplit   = data.mobility_supplementary?.modal_split ?? [];
  const bevHistory   = data.mobility_supplementary?.bev_history ?? [];

  return (
    <main>
      <header>
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="header-layout">
          <div className="header-content" style={{ paddingLeft: 252 }}>
            <div className="header-text">
              <p className="header-eyebrow">Belgium</p>
              <h1>Environment Tracker</h1>
              <p className="header-sub">Tracking Belgium&apos;s progress on a selected set of climate &amp; environment objectives</p>
              <p className="header-indicator-count">{allIndicators.length} objectives assessed across {Object.keys(data.topics).length} themes</p>
            </div>
            <div className="header-stats">
              <div className="stat-pill achieved">✅ {stats.achieved} Achieved</div>
              <div className="stat-pill ontrack">🟢 {stats.onTrack} On track</div>
              <div className="stat-pill offtrack">🔴 {stats.offTrack} Off track</div>
              {stats.noData > 0 && <div className="stat-pill nodata">⚪ {stats.noData} No data</div>}
            </div>
          </div>
          <div className="header-image-wrap">
            <img src="/images/pic-bxl.jpg" alt="Atomium Brussels with spring flowers" className="header-image" />
          </div>
        </div>
      </header>

      {/* National / Regional / Belgium vs EU toggle */}
      <div className="view-toggle-bar">
        <div className="view-toggle">
          <button className="view-toggle-btn active" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ display: 'inline-flex', width: 18, height: 13, borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.12)' }}>
              <span style={{ flex: 1, background: '#1a1a1a' }} />
              <span style={{ flex: 1, background: '#FAE042' }} />
              <span style={{ flex: 1, background: '#EF3340' }} />
            </span>
            National
          </button>
          <a href="/indicators/regional" className="view-toggle-btn" style={{ textDecoration: 'none' }}>Regional</a>
          <a href="/indicators/eu-comparison" className="view-toggle-btn" style={{ textDecoration: 'none' }}>Belgium vs EU</a>
        </div>
      </div>

      <nav className="tabs" aria-label="Topics">
        {Object.entries(TOPIC_CONFIG).map(([key, cfg]) => {
          const inds     = data.topics[key]?.indicators ?? [];
          return (
            <button
              key={key}
              className={`tab ${activeTopic === key ? 'active' : ''}`}
              style={{ '--tab-color': cfg.color } as React.CSSProperties}
              onClick={() => { setActive(key); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <span className="tab-emoji">{cfg.emoji}</span>
              <span className="tab-label">{cfg.label}</span>
            </button>
          );
        })}
      </nav>

      <section className="topic-section">
        {activeTopic === 'climate_energy' ? (
          <ClimateEnergyTab indicators={activeIndicators} historicalGHG={historicalGHG} />
        ) : activeTopic === 'nature_biodiversity' ? (
          <NatureBiodiversityTab
            indicators={activeIndicators}
            historicalOrganic={historicalOrganic}
            historicalBirds={historicalBirds}
            invasiveSpecies={invasiveSpecies}
          />
        ) : activeTopic === 'water_soil' ? (
          <WaterSoilTab
            indicators={activeIndicators}
            historicalSoil={historicalSoil}
            landUse={landUse}
            nitrateSources={nitrateSources}
            phosphateSources={phosphateSources}
          />
        ) : activeTopic === 'circularity_waste' ? (
          <CircularityWasteTab
            indicators={activeIndicators}
            historicalMSW={historicalMSW}
            historicalCMUR={historicalCMUR}
            historicalWaste={historicalWaste}
            packaging={packagingByMaterial}
            treatment={treatmentBreakdown}
          />
        ) : activeTopic === 'air_quality' ? (
          <AirQualityTab indicators={activeIndicators} />
        ) : activeTopic === 'mobility_transport' ? (
          <MobilityTransportTab
            indicators={activeIndicators}
            modalSplit={modalSplit}
            bevHistory={bevHistory}
          />
        ) : (
          <>
            <div className="topic-header" style={{ borderColor: activeCfg.color }}>
              <h2>{activeCfg.emoji} {activeCfg.label}</h2>
              <div className="topic-meta">
                <span>{activeIndicators.length} indicators tracked</span>
                <span style={{ color: '#dc2626' }}>
                  {activeIndicators.filter(i => i.status === 'Off track').length} off track
                </span>
                <span style={{ color: '#16a34a' }}>
                  {activeIndicators.filter(i =>
                    i.status === 'On track' || i.status === 'Achieved'
                  ).length} on track / achieved
                </span>
              </div>
            </div>
            <div className="cards-grid">
              {activeIndicators.map((ind, i) => (
                <IndicatorCard key={i} ind={ind} topicColor={activeCfg.color} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="loading">Loading…</div>}>
      <HomeInner />
    </Suspense>
  );
}
