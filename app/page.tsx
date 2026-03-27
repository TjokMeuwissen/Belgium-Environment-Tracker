'use client';

import { useState, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
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

interface TopicData {
  topic: string;
  indicators: Indicator[];
}

interface EnvData {
  topics: Record<string, TopicData>;
}

// ── Topic configuration ────────────────────────────────────────────────────
// To add or change a topic colour/emoji, edit this object.
const TOPIC_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  climate_energy:      { label: 'Climate & Energy',      color: '#f97316', emoji: '🌡️' },
  nature_biodiversity: { label: 'Nature & Biodiversity',  color: '#22c55e', emoji: '🌿' },
  circularity_waste:   { label: 'Circularity & Waste',   color: '#06b6d4', emoji: '♻️' },
  water_soil:          { label: 'Water & Soil',           color: '#3b82f6', emoji: '💧' },
  air_quality:         { label: 'Air Quality',            color: '#8b5cf6', emoji: '💨' },
  mobility_transport:  { label: 'Mobility & Transport',   color: '#ec4899', emoji: '🚗' },
};

// ── Status configuration ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  'Achieved':          { color: '#065f46', bg: '#d1fae5', label: '✅ Achieved'          },
  'On track':          { color: '#14532d', bg: '#bbf7d0', label: '🟢 On track'          },
  'Off track':         { color: '#7f1d1d', bg: '#fee2e2', label: '🔴 Off track'         },
  'Insufficient data': { color: '#374151', bg: '#f3f4f6', label: '⚪ Insufficient data' },
};

const TREND_ICON: Record<string, string> = {
  Improving: '↑',
  Stable:    '→',
  Worsening: '↓',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatValue(v: number | null | undefined, unit: string | null): string {
  if (v === null || v === undefined) return '—';
  const num = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(num)) return String(v);
  return `${num.toLocaleString('en-BE', { maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}`;
}

// Returns a 0–100 progress percentage toward the target (works for both
// "need to increase" and "need to decrease" cases).
function getProgress(latest: number | null, target: number | null): number | null {
  if (latest === null || target === null) return null;
  const l = typeof latest === 'number' ? latest : parseFloat(String(latest));
  const t = typeof target === 'number' ? target : parseFloat(String(target));
  if (isNaN(l) || isNaN(t) || t === 0) return null;
  if (t > l) return Math.min(100, (l / t) * 100);   // need to go up
  return Math.min(100, (t / l) * 100);               // need to go down
}

// ── IndicatorCard component ────────────────────────────────────────────────
function IndicatorCard({ ind, topicColor }: { ind: Indicator; topicColor: string }) {
  const [expanded, setExpanded] = useState(false);

  const statusCfg = STATUS_CONFIG[ind.status ?? ''] ?? STATUS_CONFIG['Insufficient data'];
  const trendIcon = TREND_ICON[ind.trend ?? ''] ?? '—';
  const progress  = getProgress(ind.latest_value, ind.target_value);

  return (
    <div className="card" style={{ '--topic-color': topicColor } as React.CSSProperties}>

      {/* Coloured left accent bar */}
      <div className="card-accent" />

      <div className="card-inner">

        {/* Status badge + Trend */}
        <div className="card-top">
          <span
            className="status-badge"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            {statusCfg.label}
          </span>
          <span className="trend">
            {trendIcon} {ind.trend ?? '—'}
          </span>
        </div>

        {/* Indicator name */}
        <h3 className="card-title">{ind.indicator}</h3>

        {/* Short description (capped at 2 lines via CSS) */}
        {ind.description && (
          <p className="card-desc">{ind.description}</p>
        )}

        {/* Latest value + Target value */}
        <div className="card-values">
          <div className="value-block">
            <span className="value-label">Latest</span>
            <span className="value-num">{formatValue(ind.latest_value, ind.unit)}</span>
            {ind.latest_value_year && (
              <span className="value-year">{ind.latest_value_year}</span>
            )}
          </div>
          {ind.target_value !== null && (
            <div className="value-block">
              <span className="value-label">Target</span>
              <span className="value-num">{formatValue(ind.target_value, ind.unit)}</span>
              {ind.target_year && (
                <span className="value-year">by {ind.target_year}</span>
              )}
            </div>
          )}
        </div>

        {/* Progress bar toward target */}
        {progress !== null && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%`, background: topicColor }}
              />
            </div>
            <span className="progress-label">
              {progress.toFixed(0)}% of the way to target
            </span>
          </div>
        )}

        {/* Expand / collapse button */}
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less ↑' : 'Show more ↓'}
        </button>

        {/* Expanded detail panel */}
        {expanded && (
          <div className="card-detail">
            {ind.target_context && (
              <div className="detail-row">
                <strong>Context</strong>
                <p>{ind.target_context}</p>
              </div>
            )}
            {ind.notes && (
              <div className="detail-row">
                <strong>Notes</strong>
                <p>{ind.notes}</p>
              </div>
            )}
            {ind.consequences && (
              <div className="detail-row">
                <strong>Consequences if missed</strong>
                <p>{ind.consequences}</p>
              </div>
            )}
            {ind.responsible && (
              <div className="detail-row">
                <strong>Responsible government level</strong>
                <p>{ind.responsible}</p>
              </div>
            )}
            {ind.data_source && (
              <div className="detail-row">
                <strong>Data source</strong>
                {ind.data_source_url
                  ? <a href={ind.data_source_url} target="_blank" rel="noopener noreferrer">{ind.data_source}</a>
                  : <p>{ind.data_source}</p>
                }
              </div>
            )}
            {ind.policy && (
              <div className="detail-row">
                <strong>Policy / Agreement</strong>
                {ind.policy_url
                  ? <a href={ind.policy_url} target="_blank" rel="noopener noreferrer">{ind.policy}</a>
                  : <p>{ind.policy}</p>
                }
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [data, setData]           = useState<EnvData | null>(null);
  const [activeTopic, setActive]  = useState('climate_energy');

  // Load JSON data from the public folder
  useEffect(() => {
    fetch('/data/belgium_environment_data.json')
      .then(r => r.json())
      .then(setData)
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  if (!data) return <div className="loading">Loading data…</div>;

  // Compute overall stats across all topics
  const allIndicators = Object.values(data.topics).flatMap(t => t.indicators);
  const stats = {
    achieved: allIndicators.filter(i => i.status === 'Achieved').length,
    onTrack:  allIndicators.filter(i => i.status === 'On track').length,
    offTrack: allIndicators.filter(i => i.status === 'Off track').length,
    noData:   allIndicators.filter(i => i.status === 'Insufficient data').length,
  };

  const activeCfg        = TOPIC_CONFIG[activeTopic];
  const activeIndicators = data.topics[activeTopic]?.indicators ?? [];

  return (
    <main>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header>
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />

        <div className="header-content">
          <div className="header-text">
            <p className="header-eyebrow">🇧🇪 Belgium</p>
            <h1>Environment Tracker</h1>
            <p className="header-sub">
              Tracking Belgium's progress on climate &amp; environment objectives
            </p>
          </div>

          {/* Overall status summary */}
          <div className="header-stats">
            <div className="stat-pill achieved">✅ {stats.achieved} Achieved</div>
            <div className="stat-pill ontrack">🟢 {stats.onTrack} On track</div>
            <div className="stat-pill offtrack">🔴 {stats.offTrack} Off track</div>
            {stats.noData > 0 && (
              <div className="stat-pill nodata">⚪ {stats.noData} No data</div>
            )}
          </div>
        </div>
      </header>

      {/* ── TOPIC TABS ───────────────────────────────────────────────────── */}
      <nav className="tabs" aria-label="Topics">
        {Object.entries(TOPIC_CONFIG).map(([key, cfg]) => {
          const indicators = data.topics[key]?.indicators ?? [];
          const offTrack   = indicators.filter(i => i.status === 'Off track').length;
          return (
            <button
              key={key}
              className={`tab ${activeTopic === key ? 'active' : ''}`}
              style={{ '--tab-color': cfg.color } as React.CSSProperties}
              onClick={() => setActive(key)}
              aria-current={activeTopic === key ? 'page' : undefined}
            >
              <span className="tab-emoji">{cfg.emoji}</span>
              <span className="tab-label">{cfg.label}</span>
              {/* Red badge showing number of off-track indicators */}
              {offTrack > 0 && (
                <span className="tab-badge" title={`${offTrack} off track`}>
                  {offTrack}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── TOPIC CONTENT ────────────────────────────────────────────────── */}
      <section className="topic-section">

        {/* Topic header */}
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

        {/* Indicator cards */}
        <div className="cards-grid">
          {activeIndicators.map((ind, i) => (
            <IndicatorCard
              key={i}
              ind={ind}
              topicColor={activeCfg.color}
            />
          ))}
        </div>

      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer>
        <p>
          Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources.
          Last updated March 2026.
        </p>
      </footer>

    </main>
  );
}
