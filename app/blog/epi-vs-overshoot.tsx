'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── Colors ────────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#0891b2';

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',      label: 'Introduction'          },
  { id: 'explainers', label: 'The two metrics'        },
  { id: 'comparison', label: 'The paradox'            },
  { id: 'timeline',   label: 'Overshoot timeline'     },
  { id: 'why',        label: 'Why the gap exists'     },
  { id: 'epi-chart',  label: "Belgium's EPI profile"  },
  { id: 'sources',    label: 'Sources'                },
];

// ── Timeline data ──────────────────────────────────────────────────────────────
interface CountryMarker {
  name: string; dayOfYear: number; earths: number; row: 1 | 2 | 3; highlight?: boolean;
}
interface YearMarker {
  year: string; dayOfYear: number; row: 1 | 2 | 3; note?: string; highlight?: boolean;
}
interface WithinLimits {
  name: string; epiRank: number; pct: number;
}

const COUNTRY_MARKERS: CountryMarker[] = [
  { name: 'Qatar',      dayOfYear: 35,  earths: 10.0, row: 1 },
  { name: 'Luxembourg', dayOfYear: 48,  earths: 7.7,  row: 2 },
  { name: 'Denmark',    dayOfYear: 79,  earths: 4.7,  row: 3 },
  { name: 'Austria',    dayOfYear: 92,  earths: 4.0,  row: 1 },
  { name: 'Belgium',    dayOfYear: 101, earths: 3.6,  row: 2, highlight: true },
  { name: 'France',     dayOfYear: 114, earths: 3.2,  row: 3 },
  { name: 'Germany',    dayOfYear: 130, earths: 2.8,  row: 1 },
  { name: 'UK',         dayOfYear: 142, earths: 2.6,  row: 2 },
];

const YEAR_MARKERS: YearMarker[] = [
  { year: '1990', dayOfYear: 284, row: 1 },
  { year: '1995', dayOfYear: 278, row: 2 },
  { year: '2000', dayOfYear: 267, row: 3 },
  { year: '2005', dayOfYear: 238, row: 1 },
  { year: '2020', dayOfYear: 235, row: 3, note: 'COVID' },
  { year: '2010', dayOfYear: 220, row: 2 },
  { year: '2023', dayOfYear: 214, row: 1 },
  { year: '2015', dayOfYear: 218, row: 3 },
  { year: '2019', dayOfYear: 210, row: 2 },
  { year: '2025', dayOfYear: 205, row: 1, highlight: true },
];

const WITHIN_LIMITS: WithinLimits[] = [
  { name: 'India',       epiRank: 176, pct: 75 },
  { name: 'Philippines', epiRank: 169, pct: 94 },
  { name: 'Senegal',     epiRank: 100, pct: 99 },
];

// ── Comparison data ────────────────────────────────────────────────────────────
const COMPARISON_HIGH = [
  { country: 'Luxembourg', flag: '🇱🇺', epiRank: 2,   epiScore: 75.1, overshootDay: 'Feb 17', earths: 7.7 },
  { country: 'Austria',    flag: '🇦🇹', epiRank: 8,   epiScore: 68.9, overshootDay: 'Apr 2',  earths: 4.0 },
  { country: 'Belgium',    flag: '🇧🇪', epiRank: 15,  epiScore: 66.8, overshootDay: 'Apr 11', earths: 3.6 },
];
const COMPARISON_LOW = [
  { country: 'India',       flag: '🇮🇳', epiRank: 176, epiScore: 27.6, overshootDay: 'None',   pct: 75 },
  { country: 'Philippines', flag: '🇵🇭', epiRank: 169, epiScore: 32.1, overshootDay: 'None',   pct: 94 },
  { country: 'Senegal',     flag: '🇸🇳', epiRank: 100, epiScore: 43.8, overshootDay: 'None',   pct: 99 },
];

// ── EPI Indicator data ─────────────────────────────────────────────────────────
interface EPIIndicator {
  code: string; name: string; score: number; rank: number; total: number; description: string;
}
const EPI_STRONG: EPIIndicator[] = [
  {
    code: 'NXA', name: 'NOx emissions trend', score: 100, rank: 1, total: 195,
    description: 'Average annual rate of nitrogen oxide (NOx) emissions 2013-2022, adjusted for economic trends. A score of 100 means emissions are falling by at least 3.94% per year -- isolating policy effort from economic fluctuation.',
  },
  {
    code: 'SDA', name: 'SO2 emissions trend', score: 100, rank: 1, total: 195,
    description: 'Average annual rate of sulfur dioxide (SO2) emissions 2013-2022, adjusted for economic trends. A score of 100 means emissions are falling by at least 3.94% per year. SO2 causes acid rain and respiratory harm.',
  },
  {
    code: 'SPI', name: 'Species Protection Index', score: 96.0, rank: 5, total: 178,
    description: 'Measures how well a country\'s terrestrial protected areas overlap with the habitat ranges of its vertebrate species. A score of 100 would mean all species\' ranges are fully covered by protected areas.',
  },
  {
    code: 'WRR', name: 'Waste Recovery Rate', score: 98.9, rank: 5, total: 196,
    description: 'Measures the quality of municipal solid waste management by rewarding recycling, composting, and energy recovery. Belgium\'s high score reflects its well-developed waste collection and sorting infrastructure.',
  },
];
const EPI_WEAK: EPIIndicator[] = [
  {
    code: 'NOD', name: 'NO2 exposure (health)', score: 24.5, rank: 134, total: 198,
    description: 'Measures human exposure to nitrogen dioxide (NO2) using age-standardised disability-adjusted life-years (DALYs) lost per 100,000 people. Belgium\'s dense road traffic and industrial activity drive high ambient NO2 levels.',
  },
  {
    code: 'PSU', name: 'Phosphorus Surplus', score: 29.3, rank: 160, total: 194,
    description: 'The difference between phosphorus inputs from fertilizers and outputs from harvested crops. A high surplus means excess phosphorus runs off into waterways, causing algal blooms and eutrophication. Belgium\'s intensive livestock sector generates large volumes of manure.',
  },
  {
    code: 'BER', name: 'Bioclimatic Ecosystem Resilience', score: 6.7, rank: 196, total: 217,
    description: 'Measures the capacity of natural ecosystems to retain species diversity under climate change, based on the diversity of bioclimatic conditions present in protected areas. Belgium\'s small, fragmented and climatically uniform landscape limits this score.',
  },
  {
    code: 'BTZ', name: 'Bottom Trawling in EEZ', score: 0.0, rank: 137, total: 149,
    description: 'The proportion of total catch in a country\'s Exclusive Economic Zone caught using bottom trawling or dredging -- one of the most ecologically destructive fishing methods. A score of 100 would mean zero bottom trawling in national waters.',
  },
];

// ── Month label positions ─────────────────────────────────────────────────────
const MONTH_LABELS = [
  { label: 'Jan', day: 15 }, { label: 'Feb', day: 46 }, { label: 'Mar', day: 74 },
  { label: 'Apr', day: 105 }, { label: 'May', day: 135 }, { label: 'Jun', day: 166 },
  { label: 'Jul', day: 196 }, { label: 'Aug', day: 227 }, { label: 'Sep', day: 258 },
  { label: 'Oct', day: 288 }, { label: 'Nov', day: 319 }, { label: 'Dec', day: 349 },
];

// ── Layout helpers ─────────────────────────────────────────────────────────────
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{
      background: '#fff', borderRadius: 12,
      padding: '24px 28px 22px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '1.1rem',
      color: '#1a1a1a', marginBottom: 14, paddingBottom: 10,
      borderBottom: '2px solid #f3f4f6',
    }}>
      {children}
    </h2>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: 'Roboto, sans-serif', fontSize: '0.93rem', color: '#374151',
      lineHeight: 1.75, marginBottom: 14, ...style,
    }}>
      {children}
    </p>
  );
}

function Callout({ color = TOPIC_COLOR, children }: { color?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: `${color}10`, borderLeft: `4px solid ${color}`,
      borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: 16,
      fontFamily: 'Roboto, sans-serif', fontSize: '0.88rem', color: '#1a1a1a', lineHeight: 1.65,
    }}>
      {children}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
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
        <button
          key={s.id}
          className={`detail-sidebar-link${active === s.id ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', background: open ? `${TOPIC_COLOR}08` : '#fafafa',
          border: 'none', cursor: 'pointer', fontFamily: 'Roboto, sans-serif',
          fontWeight: 700, fontSize: '0.92rem', color: '#1a1a1a', textAlign: 'left' as const,
          borderBottom: open ? `1px solid ${TOPIC_COLOR}30` : 'none', transition: 'background 0.15s',
        }}
      >
        {title}
        <span style={{
          fontSize: '1.1rem', color: TOPIC_COLOR, transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block',
        }}>&#x25BE;</span>
      </button>
      {open && (
        <div style={{ padding: '16px 18px', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Comparison table ───────────────────────────────────────────────────────────
function ComparisonTable() {
  const cellStyle = (bold?: boolean): React.CSSProperties => ({
    padding: '10px 14px', fontFamily: 'Roboto, sans-serif',
    fontSize: '0.85rem', color: bold ? '#111827' : '#374151',
    fontWeight: bold ? 700 : 400, borderBottom: '1px solid #f3f4f6',
    textAlign: 'center' as const, verticalAlign: 'middle' as const,
  });
  const hStyle: React.CSSProperties = {
    padding: '10px 14px', fontFamily: 'Roboto, sans-serif',
    fontSize: '0.78rem', fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    background: '#f9fafb', borderBottom: '2px solid #e5e7eb',
    textAlign: 'center' as const,
  };
  return (
    <div style={{ overflowX: 'auto' as const }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            <th style={{ ...hStyle, textAlign: 'left' as const }}>Country</th>
            <th style={hStyle}>EPI Rank</th>
            <th style={hStyle}>EPI Score</th>
            <th style={hStyle}>Overshoot Day 2026</th>
            <th style={hStyle}>Earths required / % of budget</th>
          </tr>
        </thead>
        <tbody>
          {/* High EPI group header */}
          <tr>
            <td colSpan={5} style={{
              padding: '8px 14px', background: `${TOPIC_COLOR}12`,
              fontFamily: 'Roboto, sans-serif', fontSize: '0.78rem',
              fontWeight: 700, color: TOPIC_COLOR, letterSpacing: '0.04em',
            }}>
              HIGH EPI SCORE &mdash; EARLY OVERSHOOT
            </td>
          </tr>
          {COMPARISON_HIGH.map(r => (
            <tr key={r.country} style={{ background: r.country === 'Belgium' ? `${TOPIC_COLOR}06` : '#fff' }}>
              <td style={{ ...cellStyle(true), textAlign: 'left' as const }}>
                {r.flag}{' '}{r.country}
                {r.country === 'Belgium' && (
                  <span style={{
                    marginLeft: 8, fontSize: '0.72rem', background: TOPIC_COLOR,
                    color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 700,
                  }}>this article</span>
                )}
              </td>
              <td style={cellStyle()}>#{r.epiRank}</td>
              <td style={cellStyle()}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{r.epiScore}</span>
              </td>
              <td style={cellStyle()}>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>{r.overshootDay}</span>
              </td>
              <td style={cellStyle()}>
                <strong style={{ color: '#dc2626' }}>{r.earths} Earths</strong>
              </td>
            </tr>
          ))}
          {/* Low EPI group header */}
          <tr>
            <td colSpan={5} style={{
              padding: '8px 14px', background: '#f3f4f6',
              fontFamily: 'Roboto, sans-serif', fontSize: '0.78rem',
              fontWeight: 700, color: '#6b7280', letterSpacing: '0.04em',
            }}>
              LOW EPI SCORE &mdash; NO OVERSHOOT DAY
            </td>
          </tr>
          {COMPARISON_LOW.map(r => (
            <tr key={r.country} style={{ background: '#fff' }}>
              <td style={{ ...cellStyle(true), textAlign: 'left' as const }}>{r.flag}{' '}{r.country}</td>
              <td style={cellStyle()}>#{r.epiRank}</td>
              <td style={cellStyle()}>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>{r.epiScore}</span>
              </td>
              <td style={cellStyle()}>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>None</span>
              </td>
              <td style={cellStyle()}>
                <strong style={{ color: '#16a34a' }}>{r.pct}% of Earth</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: '0.75rem', color: '#9ca3af',
        marginTop: 8, lineHeight: 1.5,
      }}>
        Sources: Yale EPI 2024 (epi.yale.edu); Global Footprint Network, Country Overshoot Days 2026.
        Countries without an overshoot day have a per-person ecological footprint below global biocapacity per person (1.48 gha).
      </p>
    </div>
  );
}

// ── Overshoot Timeline ─────────────────────────────────────────────────────────
function OvershootTimeline() {
  const [currentDay, setCurrentDay] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION_MS = 30000;
  const TOTAL_DAYS = 365;

  useEffect(() => {
    if (!playing) return;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts - (currentDay / TOTAL_DAYS) * DURATION_MS;
      const elapsed = ts - startRef.current;
      const day = Math.min((elapsed / DURATION_MS) * TOTAL_DAYS, TOTAL_DAYS);
      setCurrentDay(day);
      if (day >= TOTAL_DAYS) {
        setPlaying(false);
        setCompleted(true);
        startRef.current = null;
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, currentDay]);

  const handlePlay = () => {
    if (completed) { setCurrentDay(0); setCompleted(false); startRef.current = null; }
    setPlaying(true);
  };
  const handlePause = () => { setPlaying(false); startRef.current = null; };
  const handleReset = () => { setPlaying(false); setCurrentDay(0); setCompleted(false); startRef.current = null; };

  const pct = (day: number) => `${(day / TOTAL_DAYS * 100).toFixed(2)}%`;

  const rowAbove: Record<1|2|3, number> = { 1: 4, 2: 36, 3: 68 };
  const rowBelow: Record<1|2|3, number> = { 1: 8, 2: 40, 3: 72 };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        {!playing ? (
          <button onClick={handlePlay} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', background: TOPIC_COLOR, color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem',
          }}>
            &#x25B6; {completed ? 'Replay' : 'Play'}
          </button>
        ) : (
          <button onClick={handlePause} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', background: '#6b7280', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem',
          }}>
            &#x23F8; Pause
          </button>
        )}
        <button onClick={handleReset} style={{
          padding: '9px 14px', background: '#f3f4f6', color: '#374151',
          border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'Roboto, sans-serif', fontSize: '0.85rem',
        }}>
          Reset
        </button>
        <span style={{
          fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem', color: '#6b7280',
          marginLeft: 4,
        }}>
          Day {Math.round(currentDay)} / 365
        </span>
      </div>

      {/* Timeline container */}
      <div style={{ position: 'relative' as const, userSelect: 'none' as const }}>

        {/* Country labels above */}
        <div style={{ position: 'relative' as const, height: 110, marginBottom: 0 }}>
          {COUNTRY_MARKERS.map(m => {
            const active = currentDay >= m.dayOfYear;
            const bTop = rowAbove[m.row];
            return (
              <div key={m.name} style={{
                position: 'absolute' as const,
                left: pct(m.dayOfYear),
                bottom: bTop,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                transition: 'opacity 0.3s',
                opacity: active ? 1 : 0.25,
              }}>
                <div style={{
                  background: m.highlight ? TOPIC_COLOR : (active ? '#1f2937' : '#d1d5db'),
                  color: '#fff',
                  borderRadius: 5, padding: '3px 7px',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '0.7rem', fontWeight: m.highlight ? 800 : 600,
                  whiteSpace: 'nowrap' as const,
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}>
                  {m.name} &middot; {m.earths}x
                </div>
                {/* Stem */}
                <div style={{
                  width: 1,
                  height: bTop + 4,
                  background: m.highlight ? TOPIC_COLOR : '#d1d5db',
                  position: 'absolute' as const,
                  bottom: -bTop - 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: active ? 0.6 : 0.2,
                }} />
              </div>
            );
          })}
        </div>

        {/* Main timeline bar */}
        <div style={{ position: 'relative' as const, height: 8, borderRadius: 4, background: '#e5e7eb' }}>
          {/* Filled portion */}
          <div style={{
            position: 'absolute' as const, left: 0, top: 0, bottom: 0,
            width: pct(currentDay),
            background: `linear-gradient(to right, ${TOPIC_COLOR}99, ${TOPIC_COLOR})`,
            borderRadius: 4, transition: 'width 0.05s linear',
          }} />
          {/* Cursor */}
          {currentDay > 0 && currentDay < TOTAL_DAYS && (
            <div style={{
              position: 'absolute' as const,
              left: pct(currentDay),
              top: -8, bottom: -8,
              width: 2,
              background: '#1f2937',
              transform: 'translateX(-50%)',
              borderRadius: 1,
            }} />
          )}
          {/* Month markers */}
          {MONTH_LABELS.map(m => (
            <div key={m.label} style={{
              position: 'absolute' as const,
              left: pct(m.day),
              top: 12,
              transform: 'translateX(-50%)',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.65rem', color: '#9ca3af', whiteSpace: 'nowrap' as const,
            }}>
              {m.label}
            </div>
          ))}
        </div>

        {/* Year markers below */}
        <div style={{ position: 'relative' as const, height: 120, marginTop: 24 }}>
          {YEAR_MARKERS.map(m => {
            const active = currentDay >= m.dayOfYear;
            const topOffset = rowBelow[m.row];
            return (
              <div key={m.year} style={{
                position: 'absolute' as const,
                left: pct(m.dayOfYear),
                top: topOffset,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
                opacity: active ? 1 : 0.2,
                transition: 'opacity 0.3s',
              }}>
                {/* Stem upward */}
                <div style={{
                  width: 1, height: topOffset,
                  background: m.note ? '#f59e0b' : '#d1d5db',
                  position: 'absolute' as const,
                  top: -topOffset, left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: active ? 0.5 : 0.2,
                }} />
                <div style={{
                  background: m.note ? '#f59e0b' : (m.highlight ? TOPIC_COLOR : (active ? '#374151' : '#d1d5db')),
                  color: '#fff', borderRadius: 5, padding: '2px 7px',
                  fontFamily: 'Roboto, sans-serif', fontSize: '0.68rem',
                  fontWeight: m.highlight ? 800 : 600, whiteSpace: 'nowrap' as const,
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                }}>
                  {m.year}{m.note ? ` (${m.note})` : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Within limits panel */}
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          display: 'flex', gap: 12, flexWrap: 'wrap' as const, alignItems: 'center',
          opacity: completed ? 1 : 0.3,
          transition: 'opacity 0.6s',
        }}>
          <span style={{
            fontFamily: 'Roboto, sans-serif', fontSize: '0.78rem',
            fontWeight: 700, color: '#15803d',
          }}>
            &#x2705; Within planetary limits &mdash; no overshoot day:
          </span>
          {WITHIN_LIMITS.map(w => (
            <span key={w.name} style={{
              fontFamily: 'Roboto, sans-serif', fontSize: '0.78rem',
              background: '#dcfce7', borderRadius: 4, padding: '2px 9px',
              color: '#15803d', fontWeight: 600,
            }}>
              {w.name} (EPI #{w.epiRank} &middot; uses {w.pct}% of Earth)
            </span>
          ))}
        </div>

      </div>

      {/* Legend */}
      <div style={{
        marginTop: 14, display: 'flex', gap: 20, flexWrap: 'wrap' as const,
        fontFamily: 'Roboto, sans-serif', fontSize: '0.75rem', color: '#6b7280',
      }}>
        <span><strong style={{ color: TOPIC_COLOR }}>&#9650; above line</strong> = country overshoot days 2026</span>
        <span><strong style={{ color: '#374151' }}>&#9660; below line</strong> = global Earth Overshoot Day by year</span>
        <span><strong style={{ color: '#f59e0b' }}>amber</strong> = 2020 COVID anomaly</span>
      </div>
    </div>
  );
}

// ── EPI Indicator Chart ────────────────────────────────────────────────────────
function EPIIndicatorChart() {
  const [tooltip, setTooltip] = useState<{ code: string; text: string } | null>(null);

  const IndicatorRow = ({
    ind, type,
  }: { ind: EPIIndicator; type: 'strong' | 'weak' }) => {
    const color = type === 'strong' ? '#16a34a' : '#dc2626';
    const bgColor = type === 'strong' ? '#f0fdf4' : '#fef2f2';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', background: bgColor,
        borderRadius: 8, marginBottom: 8,
        flexWrap: 'nowrap' as const,
      }}>
        {/* Name + info */}
        <div style={{ minWidth: 0, width: 200, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem',
              fontWeight: 700, color: '#1a1a1a',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            }}>
              {ind.name}
            </span>
            <div style={{ position: 'relative' as const, flexShrink: 0 }}>
              <button
                onMouseEnter={() => setTooltip({ code: ind.code, text: ind.description })}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', fontSize: '0.75rem', padding: '0 2px',
                  display: 'flex', alignItems: 'center',
                }}
                aria-label={`Info: ${ind.name}`}
              >
                &#x24D8;
              </button>
              {tooltip?.code === ind.code && (
                <div style={{
                  position: 'absolute' as const, left: 20, top: -4, zIndex: 50,
                  background: '#1f2937', color: '#f9fafb', borderRadius: 8,
                  padding: '10px 14px', width: 260,
                  fontFamily: 'Roboto, sans-serif', fontSize: '0.75rem', lineHeight: 1.55,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                }}>
                  <strong style={{ display: 'block', marginBottom: 4, color: '#e5e7eb' }}>{ind.code}</strong>
                  {ind.description}
                </div>
              )}
            </div>
          </div>
          <span style={{
            fontFamily: 'Roboto, sans-serif', fontSize: '0.7rem', color: '#6b7280',
          }}>
            #{ind.rank} / {ind.total} countries
          </span>
        </div>

        {/* Bar */}
        <div style={{ flex: 1, minWidth: 60 }}>
          <div style={{ background: '#e5e7eb', borderRadius: 4, height: 10, overflow: 'hidden' }}>
            <div style={{
              width: `${ind.score}%`, height: '100%',
              background: color, borderRadius: 4,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Score */}
        <div style={{
          width: 42, flexShrink: 0, textAlign: 'right' as const,
          fontFamily: 'Roboto, sans-serif', fontSize: '0.88rem',
          fontWeight: 800, color,
        }}>
          {ind.score}
        </div>
      </div>
    );
  };

  return (
    <div>
      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem', color: '#6b7280',
        marginBottom: 16, lineHeight: 1.5,
      }}>
        Scores run 0&ndash;100 (higher = better). Rank shows Belgium&apos;s position among countries with available data.
        Hover the &#x24D8; icon for a description of the indicator.
      </p>

      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem', fontWeight: 700,
        color: '#15803d', marginBottom: 8, textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
      }}>
        &#x2B06; Strong performers
      </p>
      {EPI_STRONG.map(ind => <IndicatorRow key={ind.code} ind={ind} type="strong" />)}

      <div style={{ height: 12 }} />

      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: '0.82rem', fontWeight: 700,
        color: '#dc2626', marginBottom: 8, textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
      }}>
        &#x2B07; Weak performers
      </p>
      {EPI_WEAK.map(ind => <IndicatorRow key={ind.code} ind={ind} type="weak" />)}

      <p style={{
        fontFamily: 'Roboto, sans-serif', fontSize: '0.72rem', color: '#9ca3af',
        marginTop: 12, lineHeight: 1.5,
      }}>
        Source: Yale EPI 2024, epi2024indicators.zip + epi2024variables2024-12-11.csv (epi.yale.edu).
        Selected from 58 official indicators across all policy objectives.
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EPIVsOvershootPage() {
  return (
    <div className="detail-page">

      {/* ── Header ── */}
      <div
        className="detail-header"
        style={{ background: '#1a1a1a', '--topic-color': TOPIC_COLOR } as React.CSSProperties}
      >
        <div className="detail-header-inner">
          <div style={{ flex: 1 }}>
            <Link href="/blog" className="back-link">&#x2190; Back to Blog</Link>
            <p className="header-eyebrow" style={{ marginTop: 16, color: '#888' }}>
              April 2026
            </p>
            <h1 className="detail-title" style={{ marginTop: 8 }}>
              Environmental leader, ecological debtor:<br />
              the paradox of Belgium&apos;s green scores
            </h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' as const }}>
              {['Climate', 'Biodiversity'].map(t => (
                <span key={t} style={{
                  background: 'rgba(255,255,255,0.12)', color: '#e5e7eb',
                  borderRadius: 20, padding: '3px 12px',
                  fontFamily: 'Roboto, sans-serif', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {t}
                </span>
              ))}
            </div>
            <p style={{
              color: '#b0b0b0', fontSize: '0.92rem', marginTop: 14,
              lineHeight: 1.65, maxWidth: 580,
            }}>
              Belgium ranks 15th in the world for environmental performance.
              It also needs 3.6 planets to sustain its lifestyle. These two facts are not a
              contradiction &mdash; they are a warning.
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          {/* 1 — Introduction */}
          <SectionCard id="intro">
            <SectionTitle>Introduction: two numbers, one question</SectionTitle>
            <Para>
              A LinkedIn post caught my eye recently &mdash; the results of the 2024 Environmental
              Performance Index, ranking 180 countries on their environmental policies.
              Belgium sits at 15th place globally. That is a strong result by any measure: ahead
              of France, the Netherlands, and most of the world.
            </Para>
            <Para>
              But just a few days earlier, Belgium had passed another milestone. Its national
              Overshoot Day &mdash; the date by which Belgium has already consumed more than its
              fair share of the planet&apos;s annual resources. In 2024, that date was{' '}
              <strong>March 23rd</strong>. Not even three months into the year.
            </Para>
            <Para>
              So which picture is true? Is Belgium an environmental leader, or a country living
              far beyond its means? The answer, uncomfortably, is both &mdash; and that
              contradiction is worth unpacking.
            </Para>
            <Callout>
              <strong>The core question:</strong> how can a country score so well on one measure
              and so poorly on the other? The answer lies in what each index actually counts.
            </Callout>
          </SectionCard>

          {/* 2 — Explainers */}
          <SectionCard id="explainers">
            <SectionTitle>The two metrics explained</SectionTitle>
            <Para>
              To understand the paradox, it helps to look at what each metric actually measures.
            </Para>
            <AccordionItem title="What is Earth Overshoot Day?">
              <Para>
                Every year, Global Footprint Network calculates the date on which humanity has
                used up all the ecological resources the Earth can regenerate in that year &mdash;
                forests, fisheries, cropland, freshwater, and the atmosphere&apos;s capacity to
                absorb CO2. From that date onwards, we are running on ecological deficit, drawing
                down natural capital that future generations will not have. In 2024, that date
                fell on <strong>August 1st</strong> globally.
              </Para>
              <Para style={{ marginBottom: 0 }}>
                The concept also applies at country level: if the entire world consumed like
                Belgians do, we would have exhausted the planet&apos;s annual budget by
                <strong> March 23rd</strong> &mdash; barely three months into the year,
                requiring the equivalent of <strong>3.6 Earths</strong>.
              </Para>
            </AccordionItem>
            <AccordionItem title="What is the Environmental Performance Index?">
              <Para>
                The EPI is a biennial ranking published by Yale University that scores 180 countries
                on 58 indicators across 11 issue categories. It measures how close countries are
                to internationally agreed environmental policy targets &mdash; things like air
                quality, access to clean water, species protection, waste management, and progress
                on cutting greenhouse gas emissions.
              </Para>
              <Para style={{ marginBottom: 0 }}>
                In 2024, Belgium ranked <strong>15th out of 180 countries</strong>, placing it
                among the world&apos;s top performers. The EPI captures the quality of a
                country&apos;s environmental policies and the outcomes they deliver for human
                health and ecosystems.
              </Para>
            </AccordionItem>
          </SectionCard>

          {/* 3 — Comparison */}
          <SectionCard id="comparison">
            <SectionTitle>The paradox in numbers</SectionTitle>
            <Para>
              The table below lays out six countries &mdash; three with high EPI scores and early
              overshoot days, and three with low EPI scores but no overshoot day at all.
            </Para>
            <ComparisonTable />
            <Para style={{ marginTop: 18 }}>
              The contrast could hardly be starker. Luxembourg is the second-best environmental
              performer on the planet and simultaneously requires nearly eight Earths to sustain
              its lifestyle. India ranks 176th globally on environmental performance, yet its
              citizens live within the planet&apos;s annual budget. Senegal, at 99% of Earth&apos;s
              budget, is essentially at the boundary of sustainability &mdash; while ranking 100th
              on the EPI.
            </Para>
          </SectionCard>

          {/* 4 — Timeline */}
          <SectionCard id="timeline">
            <SectionTitle>Overshoot through the year</SectionTitle>
            <Para>
              The timeline below shows two things: above the line, the dates on which selected
              countries exhaust their share of the planet&apos;s annual ecological budget; below
              the line, the global Earth Overshoot Day across different years, showing how the
              date has shifted since 1990. Countries with no overshoot day appear at the end.
              Press play to run through the full year.
            </Para>
            <OvershootTimeline />
          </SectionCard>

          {/* 5 — Why the gap */}
          <SectionCard id="why">
            <SectionTitle>Why the gap exists &mdash; and what it means</SectionTitle>
            <Para>
              These numbers expose a fundamental disconnect at the heart of modern
              environmentalism. Europe&apos;s high EPI scores are real and earned &mdash; Belgian
              companies face genuinely stringent regulations on what they can discharge into
              waterways, how they must handle waste, and what emissions their factories can produce.
              A manufacturer in Belgium operates under a level of environmental oversight that a
              comparable facility in Bangladesh or Senegal simply does not face. And it shows:
              Europe&apos;s air is cleaner, its rivers less polluted, its natural areas better
              protected than in most of the world. Within the wealthy world, Europe also stands
              ahead &mdash; the United States, Canada, Japan and Australia all rank lower on the
              EPI, and all have earlier overshoot days than most of their European counterparts.
            </Para>
            <Para>
              But here is the uncomfortable truth: none of this is enough. Luxembourg is the
              second-best environmental performer on the planet and simultaneously requires nearly
              eight Earths to sustain its lifestyle. Belgium ranks 15th globally and still needs
              3.6 planets. The problem is not that these countries lack environmental ambition
              &mdash; it is that their entire model of consumption is structurally incompatible
              with a finite planet. Cleaner factories still produce goods that are bought, used
              briefly, and thrown away. More efficient cars still fill more roads. Renewable
              energy still powers ever-larger homes full of ever-more devices. Environmental
              regulation addresses <em>how</em>{' '} we produce and pollute. It does not address{' '}
              <em>how much</em>{' '} we consume.
            </Para>
            <Para>
              This is where the conversation needs to shift. The circular economy is a vital step
              &mdash; designing products to last, keeping materials in use, eliminating waste at
              the source. But even circularity, pursued seriously, is not sufficient on its own.
              The three R&apos;s of waste management have always been listed in a deliberate order:{' '}
              <strong>Reduce</strong>{' '} first, then reuse, then recycle. Recycling a product
              still requires energy, water, and infrastructure. Reusing it is better. But not
              needing it in the first place is better still. The data from overshoot day make
              this unavoidable: the path to a sustainable Belgium does not run primarily through
              better technology or stricter permits. It runs through consuming less &mdash; less
              meat, fewer flights, smaller homes, longer product lifetimes, and a cultural shift
              away from the idea that a high standard of living requires an ever-growing material
              throughput.
            </Para>
          </SectionCard>

          {/* 6 — EPI Chart */}
          <SectionCard id="epi-chart">
            <SectionTitle>Belgium&apos;s EPI profile: the full picture</SectionTitle>
            <Para>
              Looking at Belgium&apos;s individual indicator scores reveals something telling:
              the areas where Belgium excels are predominantly about <em>managing pollution
              and protecting what already exists</em>. The areas where it struggles are
              predominantly about <em>consumption, intensity, and ecological footprint</em>.
              The EPI is not measuring whether a country lives within planetary limits &mdash;
              it is measuring how well it manages the impacts of a lifestyle that already
              exceeds them.
            </Para>
            <EPIIndicatorChart />
          </SectionCard>

          {/* 7 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            {[
              {
                label: '2024 Environmental Performance Index &mdash; Yale Center for Environmental Law & Policy',
                url:   'https://epi.yale.edu',
                note:  'Full indicator data, country profiles, and methodology. epi.yale.edu. Belgium: rank 15, score 66.8.',
              },
              {
                label: 'Country Overshoot Days 2026 &mdash; Global Footprint Network',
                url:   'https://overshoot.footprintnetwork.org/newsroom/country-overshoot-days/',
                note:  'Annual publication of country-level overshoot dates. Based on National Footprint and Biocapacity Accounts 2025 Edition.',
              },
              {
                label: 'Past Earth Overshoot Days &mdash; Global Footprint Network',
                url:   'https://overshoot.footprintnetwork.org/newsroom/past-earth-overshoot-days/',
                note:  'Historical global overshoot dates 1970-2025, recalculated annually for consistency.',
              },
              {
                label: '2024 EPI Policymakers Summary &mdash; Yale / Columbia University',
                url:   'https://epi.yale.edu/downloads/2024epiexecutivesummary.pdf',
                note:  'Full summary of key findings including the tradeoffs section quoted in this article.',
              },
            ].map(({ label, url, note }) => (
              <div key={url} style={{ borderLeft: `3px solid ${TOPIC_COLOR}40`, paddingLeft: 14, marginBottom: 14 }}>
                <a
                  href={url} target="_blank" rel="noopener noreferrer"
                  style={{
                    fontFamily: 'Roboto, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                    color: '#374151', textDecoration: 'none', display: 'block', marginBottom: 3,
                  }}
                  dangerouslySetInnerHTML={{ __html: `${label} &#x2197;` }}
                />
                <p style={{
                  fontFamily: 'Roboto, sans-serif', fontSize: '0.8rem',
                  color: '#6b7280', margin: 0, lineHeight: 1.5,
                }}>
                  {note}
                </p>
              </div>
            ))}
          </SectionCard>

        </div>{/* detail-main */}
      </div>{/* detail-body */}

    </div>
  );
}
