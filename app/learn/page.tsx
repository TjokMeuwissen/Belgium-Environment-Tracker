'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// ── Topic + tile data ─────────────────────────────────────────────────────────
const TOPICS = [
  {
    id: 'climate-energy',
    label: 'Climate & Energy',
    emoji: '🌡️',
    color: '#f97316',
    tiles: [
      { slug: 'climate-change',                     title: 'Climate Change',                        image: '/images/learn/climate-change.jpg' },
      { slug: 'carbon-footprint',                   title: 'Carbon Footprint',                      image: '/images/learn/carbon-footprint.jpg' },
      { slug: 'how-to-reduce-your-carbon-footprint', title: 'How to Reduce Your Carbon Footprint',  image: '/images/learn/tips.jpg' },
      { slug: 'renewables-the-basics',              title: 'Renewables: The Basics',                image: '/images/learn/renewables.jpg' },
    ],
  },
  {
    id: 'nature-biodiversity',
    label: 'Nature & Biodiversity',
    emoji: '🌿',
    color: '#22c55e',
    tiles: [
      { slug: 'what-is-biodiversity',         title: 'What is Biodiversity?',         image: '/images/learn/biodiversity.jpg'       },
      { slug: 'why-are-species-disappearing', title: 'Why Are Species Disappearing?', image: '/images/learn/biodiversity-loss.jpg'  },
      { slug: 'ecosystem-services',           title: 'Ecosystem Services',            image: '/images/learn/ecosystem-services.jpg' },
      { slug: 'protected-areas-in-belgium',   title: 'Protected Areas in Belgium',   image: '/images/learn/natura2000.jpg'         },
      { slug: 'how-to-help-biodiversity',     title: 'How to Help Biodiversity',      image: '/images/learn/tips.jpg'               },
    ],
  },
  {
    id: 'circularity-waste',
    label: 'Circularity & Waste',
    emoji: '♻️',
    color: '#06b6d4',
    tiles: [
      { slug: 'what-is-a-circular-economy',       title: 'What is a Circular Economy?'           },
      { slug: 'belgiums-waste-system-explained',  title: "Belgium's Waste System Explained"       },
      { slug: 'plastic-the-recycling-reality',    title: 'Plastic: The Recycling Reality'         },
      { slug: 'from-linear-to-circular',          title: 'From Linear to Circular: How It Works'  },
    ],
  },
  {
    id: 'water-soil',
    label: 'Water & Soil',
    emoji: '💧',
    color: '#3b82f6',
    tiles: [
      { slug: 'belgiums-water-challenge',         title: "Belgium's Water Challenge"              },
      { slug: 'nitrates-and-agriculture',         title: 'Nitrates and Agriculture'               },
      { slug: 'what-is-soil-sealing',             title: 'What is Soil Sealing?'                  },
      { slug: 'pfas-the-forever-chemicals',       title: 'PFAS: The Forever Chemicals'            },
    ],
  },
  {
    id: 'air-quality',
    label: 'Air Quality',
    emoji: '💨',
    color: '#8b5cf6',
    tiles: [
      { slug: 'what-makes-air-unhealthy',         title: 'What Makes Air Unhealthy?'              },
      { slug: 'traffic-and-air-pollution',        title: 'Traffic and Air Pollution'              },
      { slug: 'the-invisible-cost-of-wood-burning', title: 'The Invisible Cost of Wood Burning'  },
      { slug: 'how-belgium-compares-in-europe',   title: 'How Belgium Compares in Europe'         },
    ],
  },
  {
    id: 'mobility-transport',
    label: 'Mobility & Transport',
    emoji: '🚗',
    color: '#ec4899',
    tiles: [
      { slug: 'belgiums-car-culture-explained',   title: "Belgium's Car Culture Explained"        },
      { slug: 'the-rise-of-the-electric-car',     title: 'The Rise of the Electric Car'           },
      { slug: 'why-public-transport-matters',     title: 'Why Public Transport Matters'           },
      { slug: 'freight-the-forgotten-emitter',    title: 'Freight: The Forgotten Emitter'         },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function LearnSidebar({ activeId }: { activeId: string }) {
  const activeColor = TOPICS.find(t => t.id === activeId)?.color ?? '#f97316';

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    <div className="climate-sidebar" style={{ '--topic-color': activeColor } as React.CSSProperties}>
      <div className="sidebar-group-label">Topics</div>
      {TOPICS.map(t => (
        <button
          key={t.id}
          className={`sidebar-link${activeId === t.id ? ' active' : ''}`}
          onClick={() => scrollTo(t.id)}
          style={{
            background: 'none', border: 'none', width: '100%',
            textAlign: 'left', cursor: 'pointer', fontFamily: 'Epilogue, sans-serif',
            ...(activeId === t.id ? { '--topic-color': t.color } as React.CSSProperties : {}),
          }}
        >
          {t.emoji}  {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const [activeId, setActiveId] = useState(TOPICS[0].id);

  // Scroll spy — update active topic as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      for (const t of [...TOPICS].reverse()) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveId(t.id);
          return;
        }
      }
      setActiveId(TOPICS[0].id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Dark header */}
      <div style={{ background: '#1a1a1a', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 36px', paddingLeft: 'calc(24px + 160px + 32px)' }}>
          <p style={{ fontFamily: 'Epilogue, sans-serif', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FAE042', marginBottom: 8 }}>
            Belgium Environment Tracker
          </p>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10 }}>
            Learn
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.95rem', maxWidth: 520 }}>
            Explore the environmental topics that shape Belgium&#39;s climate and nature challenges.
          </p>
        </div>
      </div>

      {/* Sidebar + content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <LearnSidebar activeId={activeId} />

        {/* Topic sections */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 48 }}>
          {TOPICS.map(topic => (
            <section key={topic.id} id={topic.id}>
              <div style={{ maxWidth: 688 }}>

              {/* Topic header */}
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 22, borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                  {topic.emoji}  {topic.label}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888', marginLeft: 4 }}>
                  {topic.tiles.length} articles
                </span>
              </div>

              {/* Tile grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 160px)', gap: 16 }}>
                {topic.tiles.map(tile => (
                  <Link
                    key={tile.slug}
                    href={`/learn/${topic.id}/${tile.slug}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#fff',
                      borderRadius: 10,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                      textDecoration: 'none',
                      borderTop: `4px solid ${topic.color}`,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {(tile as any).image && (
                      <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={(tile as any).image}
                          alt={tile.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}
                    <div style={{ padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#1a1a1a', lineHeight: 1.35 }}>
                        {tile.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              </div>{/* /maxWidth wrapper */}
            </section>
          ))}
        </div>

      </div>

      <footer>
        <p>Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources. Last updated March 2026.</p>
      </footer>
    </div>
  );
}
