'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ── Blog-specific topic labels & colours ─────────────────────────────────────
// These are shorter labels than the Learn/Indicators topics.
// Mapping to the same colour family as those sections.
const BLOG_TOPIC_COLORS: Record<string, string> = {
  'Biodiversity':      '#16a34a',   // Nature & Biodiversity green
  'Climate':           '#f97316',   // Climate & Energy orange
  'Circular Economy':  '#0e7490',   // Circularity & Waste teal
  'Water & Soil':      '#1d4ed8',   // Water & Soil blue
  'Air Quality':       '#8b5cf6',   // Air Quality purple
  'Mobility':          '#ec4899',   // Mobility pink
};

// ── Blog post registry ────────────────────────────────────────────────────────
interface BlogPost {
  slug: string;
  title: string;
  intro: string;   // keep to ~120 chars for clean 2-line display
  topics: string[];
  date: string;
  image: string;
}

const POSTS: BlogPost[] = [
  {
    slug: 'mammal-biomass-wallonia',
    title: 'Who weighs more \u2014 cows or nature? Mapping mammal biomass in Wallonia',
    intro:
      'Wild mammals make up just 0.31% of total mammal biomass in Wallonia. Livestock outweigh all wildlife by more than 200 to 1 \u2014 calculated here for the first time.',
    topics: ['Biodiversity'],
    date: 'April 2026',
    image: '/images/blog/ree.jpg',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function topicCount(topic: string): number {
  return POSTS.filter(p => p.topics.includes(topic)).length;
}

const ALL_TOPICS = Object.keys(BLOG_TOPIC_COLORS).filter(t => topicCount(t) > 0);

// ── Topic pill ────────────────────────────────────────────────────────────────
function TopicPill({ topic }: { topic: string }) {
  const color = BLOG_TOPIC_COLORS[topic] || '#6b7280';
  return (
    <span
      style={{
        display: 'inline-block',
        background: `${color}18`,
        color,
        border: `1px solid ${color}55`,
        borderRadius: 20,
        padding: '2px 10px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        marginRight: 6,
        whiteSpace: 'nowrap' as const,
      }}
    >
      {topic}
    </span>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          background: '#fff',
          borderRadius: 10,
          boxShadow: hovered
            ? '0 4px 20px rgba(0,0,0,0.12)'
            : '0 1px 6px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          transition: 'box-shadow 0.18s ease, transform 0.18s ease',
          transform: hovered ? 'translateY(-1px)' : 'none',
          minHeight: 0,
        }}
      >
        {/* Square image — 1:1, compact */}
        <div
          style={{
            width: 120,
            minWidth: 120,
            background: 'linear-gradient(135deg, #1e3a5f 0%, #166534 100%)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={post.image}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 6,
            minWidth: 0,
          }}
        >
          {/* Topics left — date right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 4 }}>
            <div>
              {post.topics.map(t => <TopicPill key={t} topic={t} />)}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#4b5563',
                fontFamily: 'Roboto, sans-serif',
                whiteSpace: 'nowrap' as const,
              }}
            >
              {post.date}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#111827',
              lineHeight: 1.3,
              margin: 0,
              textAlign: 'left' as const,
            }}
          >
            {post.title}
          </h2>

          {/* Intro — clamped to 2 lines */}
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.85rem',
              color: '#4b5563',
              lineHeight: 1.55,
              margin: 0,
              textAlign: 'left' as const,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            } as React.CSSProperties}
          >
            {post.intro}
          </p>

          {/* Read more */}
          <p
            style={{
              margin: 0,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: hovered ? '#111827' : '#6b7280',
              transition: 'color 0.15s',
              fontFamily: 'Roboto, sans-serif',
              textAlign: 'left' as const,
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
      <div className="blog-body">

        {/* Topic filter bar */}
        <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: '1px solid #e5e7eb' }}>
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
              color: '#6b7280',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Filter by topic
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, alignItems: 'center' }}>
            {ALL_TOPICS.map(topic => {
              const color = BLOG_TOPIC_COLORS[topic];
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
                    padding: '5px 12px 5px 9px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'Roboto, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
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
                      padding: '1px 6px',
                      fontSize: '0.7rem',
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
                  color: '#6b7280',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  fontFamily: 'Roboto, sans-serif',
                  textDecoration: 'underline',
                }}
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Post count */}
        <p
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: '0.8rem',
            color: '#6b7280',
            marginBottom: 16,
          }}
        >
          {filtered.length === 1 ? '1 post' : `${filtered.length} posts`}
          {activeTopics.length > 0 && ' matching selected topics'}
        </p>

        {/* Post list */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
            {filtered.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'left' as const,
              padding: '40px 0',
              color: '#6b7280',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            <p style={{ fontSize: '0.95rem', marginBottom: 4 }}>No posts yet for these topics.</p>
            <p style={{ fontSize: '0.82rem' }}>More posts are on the way.</p>
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
