'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ── Topic colour map (matches Learn & Indicators sections) ────────────────────
const TOPIC_COLORS: Record<string, string> = {
  'Nature & Biodiversity': '#16a34a',
  'Climate & Energy':      '#f97316',
  'Circularity & Waste':   '#0e7490',
  'Water & Soil':          '#1d4ed8',
  'Air Quality':           '#8b5cf6',
  'Mobility':              '#ec4899',
};

// ── Blog post registry ────────────────────────────────────────────────────────
interface BlogPost {
  slug: string;
  title: string;
  intro: string;
  topics: string[];
  date: string;
  image: string;
}

const POSTS: BlogPost[] = [
  {
    slug: 'mammal-biomass-wallonia',
    title: 'Who weighs more \u2014 cows or nature? Mapping mammal biomass in Wallonia',
    intro:
      'Wild mammals make up just 0.31% of total mammal biomass in Wallonia \u2014 calculated here for the first time using Statbel livestock data, DNF wildlife estimates, and age-stratified human weights. Livestock outweigh all wildlife by a factor of more than 200 to 1.',
    topics: ['Nature & Biodiversity'],
    date: 'April 2026',
    image: '/images/blog/mammal-biomass.jpg',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function topicCount(topic: string): number {
  return POSTS.filter(p => p.topics.includes(topic)).length;
}

const ALL_TOPICS = Object.keys(TOPIC_COLORS).filter(t => topicCount(t) > 0);

// ── Topic pill (reusable) ─────────────────────────────────────────────────────
function TopicPill({ topic, small = false }: { topic: string; small?: boolean }) {
  const color = TOPIC_COLORS[topic] || '#6b7280';
  return (
    <span
      style={{
        display: 'inline-block',
        background: `${color}18`,
        color,
        border: `1px solid ${color}55`,
        borderRadius: 20,
        padding: small ? '2px 10px' : '3px 12px',
        fontSize: small ? '0.72rem' : '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        marginRight: 6,
        marginBottom: 4,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {topic}
    </span>
  );
}

// ── Individual post card ──────────────────────────────────────────────────────
function PostCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          background: '#fff',
          borderRadius: 12,
          boxShadow: hovered
            ? '0 6px 24px rgba(0,0,0,0.13)'
            : '0 2px 12px rgba(0,0,0,0.07)',
          overflow: 'hidden',
          transition: 'box-shadow 0.18s ease, transform 0.18s ease',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
      >
        {/* Square image — 1:1 ratio, fixed width */}
        <div
          style={{
            width: 220,
            minWidth: 220,
            maxWidth: 220,
            background: 'linear-gradient(135deg, #1e3a5f 0%, #166534 100%)',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '1 / 1',
          }}
        >
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Text content */}
        <div
          style={{
            flex: 1,
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {/* Topics + date */}
          <div style={{ marginBottom: 10 }}>
            {post.topics.map(t => (
              <TopicPill key={t} topic={t} small />
            ))}
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 4 }}>
              {post.date}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 800,
              fontSize: '1.3rem',
              color: '#111827',
              lineHeight: 1.3,
              margin: '0 0 10px',
            }}
          >
            {post.title}
          </h2>

          {/* Intro */}
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.9rem',
              color: '#4b5563',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {post.intro}
          </p>

          <p
            style={{
              marginTop: 14,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: hovered ? '#111827' : '#9ca3af',
              transition: 'color 0.15s',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Read more &rarr;
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [activeTopics, setActiveTopics] = useState<string[]>([]);

  function toggleTopic(topic: string) {
    setActiveTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  }

  const filtered =
    activeTopics.length === 0
      ? POSTS
      : POSTS.filter(p => activeTopics.some(t => p.topics.includes(t)));

  return (
    <div className="shell-page">

      {/* ── Header ── */}
      <div className="shell-header">
        <div className="flag-stripe black" />
        <div className="flag-stripe yellow" />
        <div className="flag-stripe red" />
        <div className="shell-header-inner">
          <p className="shell-eyebrow">Blog</p>
          <h1 className="shell-title">Analysis &amp; updates</h1>
          <p className="shell-desc">
            Commentary on Belgium&apos;s environmental data, policies, and progress.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="shell-body">

        {/* Topic filter bar */}
        <div
          style={{
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: '#9ca3af',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}
          >
            Filter by topic
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, alignItems: 'center' }}>
            {ALL_TOPICS.map(topic => {
              const color = TOPIC_COLORS[topic];
              const active = activeTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: active ? color : '#fff',
                    color: active ? '#fff' : '#374151',
                    border: `2px solid ${active ? color : '#e5e7eb'}`,
                    borderRadius: 24,
                    padding: '6px 14px 6px 10px',
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'Roboto, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: active ? 'rgba(255,255,255,0.75)' : color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {topic}
                  <span
                    style={{
                      background: active ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                      color: active ? '#fff' : '#6b7280',
                      borderRadius: 10,
                      padding: '1px 7px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {topicCount(topic)}
                  </span>
                </button>
              );
            })}

            {activeTopics.length > 0 && (
              <button
                onClick={() => setActiveTopics([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontFamily: 'Roboto, sans-serif',
                  textDecoration: 'underline',
                }}
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Post count line */}
        <p
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '0.82rem',
            color: '#9ca3af',
            marginBottom: 20,
          }}
        >
          {filtered.length === 1 ? '1 post' : `${filtered.length} posts`}
          {activeTopics.length > 0 && ' matching selected topics'}
        </p>

        {/* Post list */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 20 }}>
            {filtered.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center' as const,
              padding: '56px 24px',
              color: '#9ca3af',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            <p style={{ fontSize: '1rem', marginBottom: 6 }}>
              No posts yet for the selected topics.
            </p>
            <p style={{ fontSize: '0.85rem' }}>More posts are on the way.</p>
          </div>
        )}
      </div>

      <footer>
        <p>
          Data sourced from EEA, Eurostat, VMM, ISSeP and other official sources.
          Last updated April 2026.
        </p>
      </footer>
    </div>
  );
}
