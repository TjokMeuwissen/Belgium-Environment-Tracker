'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ── Colours ───────────────────────────────────────────────────────────────────
const TOPIC_COLOR = '#16a34a';
const C_HUMAN     = '#f97316';   // orange
const C_LIVESTOCK = '#eab308';   // amber
const C_WILD      = '#16a34a';   // green

// ── Region data ───────────────────────────────────────────────────────────────
// All percentages. Absolute totals shown separately.
interface RegionData {
  label:      string;
  humans:     number;
  livestock:  number;
  wild:       number;
  totalKt:    number;      // total biomass in kilotonnes (thousands of tonnes)
  wildNote:   string;
  source:     string;
  isEstimate: boolean;
}

const REGIONS: RegionData[] = [
  {
    label:     'Global (reference)',
    humans:    36,
    livestock: 60,
    wild:      4,
    totalKt:   1090000,   // ~1,090 Mt wet mass (Bar-On 2018)
    wildNote:  '4% — includes marine mammals',
    source:    'Bar-On, Phillips & Milo (PNAS 2018)',
    isEstimate: false,
  },
  {
    label:     'Flanders',
    humans:    29,
    livestock: 71,
    wild:      0.07,
    totalKt:   1630,   // estimated
    wildNote:  '<0.1% — INBO Natuurrapport 2020',
    source:    'Wild: INBO Natuurrapport 2020. Humans/livestock split: estimated.',
    isEstimate: true,
  },
  {
    label:     'Wallonia',
    humans:    31.4,
    livestock: 68.3,
    wild:      0.31,
    totalKt:   810,
    wildNote:  '0.31% — this analysis',
    source:    'This analysis (2025/2026). Based on Statbel 2023, DNF wildlife estimates.',
    isEstimate: false,
  },
  {
    label:     'Brussels',
    humans:    99.3,
    livestock: 0.65,
    wild:      0.05,
    totalKt:   84,
    wildNote:  '<0.1% — this analysis (assumed negligible)',
    source:    'This analysis (2025/2026). Wild mammals assumed negligible.',
    isEstimate: false,
  },
];

// ── Sidebar sections ──────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',       label: 'Introduction'            },
  { id: 'belgium',     label: 'What about Belgium?'     },
  { id: 'methodology', label: 'How we calculated it'    },
  { id: 'results',     label: 'Results'                 },
  { id: 'detail',      label: 'Methodology & sources'  },
];

// ── Layout helpers ────────────────────────────────────────────────────────────
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{
      background: '#fff',
      borderRadius: 12,
      padding: '24px 28px 22px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 800,
      fontSize: '1.1rem',
      color: '#1a1a1a',
      marginBottom: 14,
      paddingBottom: 10,
      borderBottom: '2px solid #f3f4f6',
    }}>
      {children}
    </h2>
  );
}

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{
      fontFamily: 'Roboto, sans-serif',
      fontSize: '0.93rem',
      color: '#374151',
      lineHeight: 1.75,
      marginBottom: 14,
      ...style,
    }}>
      {children}
    </p>
  );
}

function Callout({ color = '#16a34a', children }: { color?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: `${color}10`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '0 8px 8px 0',
      padding: '14px 18px',
      marginBottom: 16,
      fontFamily: 'Roboto, sans-serif',
      fontSize: '0.88rem',
      color: '#1a1a1a',
      lineHeight: 1.65,
    }}>
      {children}
    </div>
  );
}

// ── Biomass bar chart ─────────────────────────────────────────────────────────
function BiomassBar({ region }: { region: RegionData }) {
  const segments = [
    { label: 'Humans',    pct: region.humans,    color: C_HUMAN },
    { label: 'Livestock', pct: region.livestock, color: C_LIVESTOCK },
    { label: 'Wild mammals', pct: region.wild,   color: C_WILD },
  ];

  return (
    <div>
      {/* Stacked horizontal bar */}
      <div style={{
        height: 48,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {segments.map(s => (
          <div
            key={s.label}
            style={{
              width: `${s.pct}%`,
              background: s.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'width 0.5s ease',
              overflow: 'hidden',
              minWidth: s.pct > 3 ? undefined : 0,
            }}
            title={`${s.label}: ${s.pct}%`}
          >
            {s.pct > 8 && (
              <span style={{
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 700,
                fontFamily: 'Roboto, sans-serif',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
              }}>
                {s.pct >= 1 ? `${s.pct.toFixed(s.pct < 10 ? 1 : 0)}%` : ''}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend + values */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const, marginBottom: 16 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 12, height: 12,
              borderRadius: 3,
              background: s.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.83rem',
              color: '#374151',
            }}>
              <strong>{s.label}</strong>
              {' — '}
              <span style={{ color: s.color, fontWeight: 700 }}>
                {s.pct < 0.1 ? '<0.1%' : `${s.pct.toFixed(s.pct < 1 ? 2 : 1)}%`}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Wild mammals callout */}
      <div style={{
        background: `${C_WILD}10`,
        border: `1px solid ${C_WILD}30`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: '0.82rem',
        color: '#374151',
        fontFamily: 'Roboto, sans-serif',
      }}>
        <strong style={{ color: C_WILD }}>Wild mammals:</strong>{' '}
        {region.wildNote}
        {region.isEstimate && (
          <span style={{ color: '#6b7280', marginLeft: 6 }}>(partial estimate — see notes)</span>
        )}
      </div>

      {/* Source */}
      <p style={{
        fontSize: '0.72rem',
        color: '#6b7280',
        fontFamily: 'Roboto, sans-serif',
        marginTop: 8,
        lineHeight: 1.4,
      }}>
        Source: {region.source}
      </p>
    </div>
  );
}

function ResultsChart() {
  const [activeIdx, setActiveIdx] = useState(2); // default: Wallonia

  return (
    <div>
      {/* Region switcher */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: 6,
        marginBottom: 24,
      }}>
        {REGIONS.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setActiveIdx(i)}
            style={{
              padding: '7px 16px',
              borderRadius: 24,
              border: `2px solid ${activeIdx === i ? TOPIC_COLOR : '#e5e7eb'}`,
              background: activeIdx === i ? TOPIC_COLOR : '#fff',
              color: activeIdx === i ? '#fff' : '#374151',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.83rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <BiomassBar region={REGIONS[activeIdx]} />
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const [active, setActive] = useState(SECTIONS[0].id);

  React.useEffect(() => {
    const onScroll = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(s.id);
          return;
        }
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MammalBiomassWallonia() {
  return (
    <div className="detail-page">

      {/* Header */}
      <div
        className="detail-header"
        style={{
          background: '#1a1a1a',
          '--topic-color': TOPIC_COLOR,
        } as React.CSSProperties}
      >
        <div className="detail-header-inner" style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 32,
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 24px 0 calc(24px + 190px + 32px)',
        }}>
          <div style={{ flex: 1 }}>
            <Link href="/blog" className="back-link">&#x2190; Back to Blog</Link>
            <p className="header-eyebrow" style={{ marginTop: 16, color: '#888' }}>
              April 2026
            </p>
            <h1 className="detail-title" style={{ marginTop: 8 }}>
              Who weighs more &mdash; cows or nature?<br />
              Mapping mammal biomass in Wallonia
            </h1>
            <p style={{
              color: '#b0b0b0',
              fontSize: '0.95rem',
              marginTop: 12,
              lineHeight: 1.6,
              maxWidth: 580,
            }}>
              Wild mammals make up just 0.31% of total mammal biomass in Wallonia.
              We calculated this for the first time using Statbel livestock data,
              DNF wildlife estimates, and age-stratified human weights.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          {/* 1 — Introduction */}
          <SectionCard id="intro">
            <SectionTitle>Introduction: a planet dominated by livestock</SectionTitle>
            <Para>
              In 2018, a landmark paper by Bar-On, Phillips and Milo in the Proceedings of the
              National Academy of Sciences published the first comprehensive census of life on Earth
              by weight. The results were striking: of all mammal biomass on the planet,{' '}
              <strong>humans account for 36%, livestock for 60%, and all wild mammals combined for
              just 4%</strong>. That 4% includes everything &mdash; elephants and whales, wolves and
              deer, bats and bears &mdash; across all continents and oceans.
            </Para>
            <Para>
              This number has become one of the most cited statistics in environmental science,
              because it captures in a single figure just how thoroughly humanity has reshaped
              the living world. A hundred thousand years ago, wild mammals made up essentially
              100% of mammal biomass. Today they are a rounding error.
            </Para>
            <Callout color="#f97316">
              <strong>The global picture (Bar-On et al., 2018):</strong> of all mammal biomass on
              Earth, 36% is human, 60% is livestock (mostly cattle), and just 4% is wild mammals
              &mdash; spanning every species from blue whales to field mice.
            </Callout>
            <Para>
              The global figure, however, masks enormous regional variation. A country with dense
              intensive agriculture and few natural areas will show a far more extreme imbalance
              than the global average. Belgium &mdash; one of the most densely populated and
              intensively farmed countries in the world &mdash; is a strong candidate for an even
              more extreme ratio. But until now, this had never been calculated at the regional level
              for Wallonia or Brussels.
            </Para>
          </SectionCard>

          {/* 2 — Belgium */}
          <SectionCard id="belgium">
            <SectionTitle>What about Belgium?</SectionTitle>
            <Para>
              Belgium is divided into three regions with very different land-use profiles.
              Flanders is highly urbanised and hosts one of the densest livestock sectors in Europe,
              particularly for pigs and poultry. Wallonia is more rural, with large forested areas
              in the Ardennes and a cattle-dominated farming sector. Brussels is almost entirely urban,
              with negligible agricultural land.
            </Para>
            <Para>
              In 2020, the Flemish Institute for Nature and Forest Research (INBO) calculated the
              mammal biomass breakdown for Flanders as part of the{' '}
              <a
                href="https://www.vlaanderen.be/inbo/backgroundindicatoren/algemene-toestand-en-trends-in-vlaanderen-biomassa-grote-zoogdieren"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#374151', fontWeight: 600 }}
              >
                Natuurrapport 2020
              </a>
              , following the methodology of Bar-On et al. Their finding was remarkable:{' '}
              <strong>wild mammals represent less than 0.1% of total mammal biomass in Flanders</strong>
              &mdash; roughly 40 times lower than the global average of 4%. The main wild species
              counted were roe deer, red deer, wild boar, and a handful of other large mammals.
              Even at maximum plausible population estimates, the wild mammal share remained below 0.1%.
            </Para>
            <Para>
              No equivalent calculation existed for Wallonia or Brussels. Given Wallonia&apos;s
              larger forests and much higher wild ungulate populations (particularly red deer in
              the Ardennes), we expected its figure to be somewhat higher than Flanders &mdash;
              though still dramatically lower than the global average. We set out to calculate it.
            </Para>
          </SectionCard>

          {/* 3 — Methodology */}
          <SectionCard id="methodology">
            <SectionTitle>How we calculated it</SectionTitle>
            <Para>
              The approach is straightforward: for each mammal category, estimate the total
              population and multiply by the average body weight to get total biomass. We followed
              the same methodology used by INBO for Flanders, covering three groups.
            </Para>

            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1a1a1a',
              margin: '18px 0 8px',
            }}>
              &#x1F9D1; Humans
            </p>
            <Para>
              Population counts come from official Statbel census data for Wallonia and Brussels.
              Rather than applying a single flat weight to everyone, we broke the population into
              12 age groups and assigned each group an average body weight based on the Belgian
              Health Interview Survey &mdash; because children weigh far less than adults, and
              body weight peaks in middle age before declining in old age.
            </Para>

            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1a1a1a',
              margin: '18px 0 8px',
            }}>
              &#x1F404; Livestock
            </p>
            <Para>
              Headcounts come from the Statbel agricultural census and the SANITEL animal
              registration system. Cattle dominate the picture &mdash; Wallonia has over a million
              head, ranging from lightweight calves to heavy adult beef cows &mdash; so we used
              disaggregated weight categories rather than a single average. Pigs, horses, and
              sheep and goats were included with standard reference weights.
            </Para>

            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#1a1a1a',
              margin: '18px 0 8px',
            }}>
              &#x1F98C; Wild mammals
            </p>
            <Para>
              Wild mammal numbers are the most uncertain part. We included the main large wild
              species present in Wallonia &mdash; red deer, roe deer, wild boar, badger, wildcat,
              pine marten, and wolf &mdash; using population estimates from official DNF hunting
              statistics and wildlife monitoring reports. Bats and small rodents were excluded,
              as their individual weights are so low that even large populations contribute
              negligible biomass. To account for the uncertainty in wildlife counts, we tested
              a wide range of scenarios: even at the most generous possible estimates, wild
              mammals remain well below 1% of total biomass.
            </Para>
            <Callout color="#6b7280">
              <strong>Brussels</strong> was calculated separately. As a dense urban region with
              almost no farmland, it has virtually no livestock and its wild mammal population
              is negligible &mdash; making humans by far the dominant mammal by weight.
            </Callout>
          </SectionCard>

          {/* 4 — Results */}
          <SectionCard id="results">
            <SectionTitle>Results: wild mammals are a fraction of a percent</SectionTitle>
            <Para>
              Select a region below to see the mammal biomass breakdown. The global figure from
              Bar-On et al. (2018) is included as a reference point.
            </Para>

            <ResultsChart />

            <Para style={{ marginTop: 20 }}>
              The results confirm that Belgium is dramatically more extreme than the global
              average. In Wallonia &mdash; the most &ldquo;natural&rdquo; of the three Belgian
              regions, with its Ardennes forests and large wild ungulate populations &mdash;
              wild mammals still represent just <strong>0.31%</strong> of total mammal biomass.
              That is about 13 times lower than the global average of 4%.
            </Para>
            <Para>
              Flanders is even more extreme at less than 0.1%, driven by its much larger livestock
              sector (particularly pigs, which number roughly 2.8 million in Flanders versus
              342,000 in Wallonia). Brussels sits at a unique extreme: with virtually no livestock,
              humans make up over 99% of all mammal biomass in the capital region.
            </Para>
            <Callout color={TOPIC_COLOR}>
              <strong>The key finding:</strong> in Wallonia, livestock outweigh all wild mammals
              combined by a factor of more than <strong>200 to 1</strong>. Red deer, roe deer,
              wild boar, and all other wild species together weigh roughly 2,500 tonnes.
              Wallonia&apos;s cattle alone weigh over 460,000 tonnes.
            </Callout>
          </SectionCard>

          {/* 5 — Methodology notes & sources */}
          <SectionCard id="detail">
            <SectionTitle>Methodology notes &amp; sources</SectionTitle>

            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#1a1a1a',
              marginBottom: 8,
            }}>
              Key data sources
            </p>

            {[
              {
                label: 'Bar-On YM, Phillips R, Milo R (2018). The biomass distribution on Earth.',
                url:   'https://doi.org/10.1073/pnas.1711842115',
                note:  'PNAS 115(25):6506–6511. The global benchmark: humans 36%, livestock 60%, wild 4%.',
              },
              {
                label: 'INBO Natuurrapport 2020 — Biomassa grote zoogdieren (Flanders indicator)',
                url:   'https://www.vlaanderen.be/inbo/backgroundindicatoren/algemene-toestand-en-trends-in-vlaanderen-biomassa-grote-zoogdieren',
                note:  'Wild mammals <0.1% in Flanders. Open-source R methodology used as template.',
              },
              {
                label: 'Statbel — Agricultural census 2023 (cattle, pigs, sheep, goats)',
                url:   'https://statbel.fgov.be/fr/themes/agriculture-peche/recensement-agricole',
                note:  'Wallonia: 1,009,060 cattle; 342,382 pigs; ~135,000 sheep & goats.',
              },
              {
                label: 'Statbel Census 2021 — Population by age group, Wallonia & Brussels',
                url:   'https://statbel.fgov.be/fr/themes/population/structure-de-la-population',
                note:  'Used for age-stratified human biomass (12 age brackets).',
              },
              {
                label: 'Sciensano Health Interview Survey (HIS) 2018 — Body weight by age and sex',
                url:   'https://his.wiv-isp.be/',
                note:  'Average body weight per 10-year age bracket, Belgium.',
              },
              {
                label: 'SPW ARNE-DNF — Rapport Cerf 2022–2023',
                url:   'https://biodiversite.wallonie.be/fr/cerf-elaphe.html',
                note:  'Red deer population estimate: 8,000 individuals in Wallonia (central).',
              },
              {
                label: 'État de l\'environnement wallon — Évolution des populations d\'ongulés (FFH10)',
                url:   'https://etat.environnement.wallonie.be/contents/indicatorsheets/FFH%2010.html',
                note:  'Roe deer and wild boar spring population estimates.',
              },
              {
                label: 'SPW ARNE-DEMNA — Équidés en Wallonie 2023',
                url:   'https://etat.environnement.wallonie.be/contents/indicatorsheets/AGRI%203.html',
                note:  '101,000 equids registered in Wallonia.',
              },
              {
                label: 'INBO (2024) — Livestock weight reference table (Vlaamse veestapel)',
                url:   'https://www.vlaanderen.be/inbo/backgroundindicatoren/algemene-toestand-en-trends-in-vlaanderen-biomassa-grote-zoogdieren',
                note:  'Category-specific live weights for cattle subcategories (calves, heifers, cows, bulls).',
              },
            ].map(({ label, url, note }) => (
              <div key={url} style={{
                borderLeft: `3px solid ${TOPIC_COLOR}40`,
                paddingLeft: 14,
                marginBottom: 14,
              }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#374151',
                    textDecoration: 'none',
                    display: 'block',
                    marginBottom: 3,
                  }}
                >
                  {label} &#x2197;
                </a>
                <p style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {note}
                </p>
              </div>
            ))}

            <div style={{
              marginTop: 24,
              background: '#f0fdf4',
              border: `1px solid ${TOPIC_COLOR}40`,
              borderRadius: 10,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}>
              <span style={{ fontSize: '1.8rem' }}>&#x1F4CA;</span>
              <div>
                <p style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: '#1a1a1a',
                  marginBottom: 4,
                }}>
                  Download the full calculation
                </p>
                <p style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '0.82rem',
                  color: '#4b5563',
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}>
                  The Excel workbook contains all input data, age-stratified human biomass
                  calculations, livestock breakdown by category, wild mammal estimates,
                  and a sensitivity analysis for Wallonia and Brussels.
                </p>
                <a
                  href="/data/wallonia_mammal_biomass.xlsx"
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: TOPIC_COLOR,
                    color: '#fff',
                    borderRadius: 8,
                    padding: '8px 18px',
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '0.83rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  &#x2B07; Download Excel workbook
                </a>
              </div>
            </div>

            <p style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.78rem',
              color: '#6b7280',
              marginTop: 20,
              lineHeight: 1.55,
              borderTop: '1px solid #f3f4f6',
              paddingTop: 16,
            }}>
              <strong>Methodological caveats:</strong> Wild mammal population estimates carry
              significant uncertainty (&plusmn;100% margin applied throughout). The Flanders
              human/livestock split is estimated, not directly sourced from INBO. Brussels wild
              mammal biomass is assumed negligible and was not calculated. All biomass figures
              are in wet weight (live body weight), consistent with Bar-On et al. (2018) and
              the INBO Flemish analysis. Poultry, pets, and captive animals are excluded from
              all calculations, consistent with INBO scope.
            </p>
          </SectionCard>

        </div>{/* detail-main */}
      </div>{/* detail-body */}
    </div>
  );
}
