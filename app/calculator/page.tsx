// → app/calculator/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT = '#22c55e';

// ── Shared UI components ──────────────────────────────────────────────────────

function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '28px 32px', marginBottom: 20 }}>
      {children}
    </div>
  );
}

function SectionTitle({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #f3f4f6' }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{children}</h2>
    </div>
  );
}

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'disclaimer',  label: 'About this tool', emoji: 'ℹ️' },
  { id: 'housing',     label: 'Housing & heating', emoji: '🏠' },
  { id: 'electricity', label: 'Electricity',       emoji: '⚡' },
  { id: 'car',         label: 'Car travel',        emoji: '🚗' },
  { id: 'flights',     label: 'Flights',           emoji: '✈️' },
  { id: 'public',      label: 'Public transport',  emoji: '🚆' },
  { id: 'food',        label: 'Food & diet',       emoji: '🍽️' },
  { id: 'shopping',    label: 'Shopping',          emoji: '🛍️' },
  { id: 'waste',       label: 'Waste',             emoji: '♻️' },
  { id: 'pets',        label: 'Pets',              emoji: '🐾' },
  { id: 'results',     label: 'Your results',      emoji: '📊' },
];

function Sidebar() {
  return (
    <aside style={{ width: 190, flexShrink: 0, position: 'sticky', top: 'calc(var(--nav-height, 60px) + 24px)', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '14px 0', height: 'fit-content' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', padding: '4px 16px 8px' }}>
        Sections
      </div>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s, background 0.15s' }}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(s.id);
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
          }}
          onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.background = '#f0fdf4'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: 13 }}>{s.emoji}</span>
          {s.label}
        </a>
      ))}
    </aside>
  );
}

// ── Placeholder section ───────────────────────────────────────────────────────

function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 8, padding: '24px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14, border: '2px dashed #e5e7eb' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>🔧</div>
      <div>{label} — coming soon</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f4f4f2)' }}>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #15803d 60%, #22c55e 100%)', padding: '40px 0 36px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 0 calc(24px + 190px + 32px)' }}>
          <Link href="/" style={{ color: '#86efac', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            ← Back to home
          </Link>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Carbon Footprint Calculator
          </h1>
          <p style={{ fontSize: '1rem', color: '#bbf7d0', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            Estimate your personal yearly CO₂ footprint — category by category, in minutes.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        <Sidebar />

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Disclaimer ── */}
          <SectionCard id="disclaimer">
            <SectionTitle emoji="ℹ️">About this tool</SectionTitle>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '18px 22px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#14532d', marginBottom: 8 }}>
                A simplified tool for a good estimate
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#374151', margin: '0 0 10px' }}>
                This calculator gives you a reliable <strong>estimate</strong> of your personal yearly carbon footprint —
                not a scientifically precise measurement. It is designed to be quick and easy to use by anyone,
                without requiring technical knowledge or detailed utility bills.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#374151', margin: '0 0 10px' }}>
                All calculations are based on <strong>peer-reviewed emission factors</strong> and official Belgian and
                EU sources (IPCC, DEFRA, Agribalyse, EEA, Energuide). A full list of sources is provided at the
                bottom of this page. The calculation runs entirely in your browser — <strong>no personal data is
                sent to any server</strong>.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: '#374151', margin: 0 }}>
                Because the tool simplifies complex realities, the result will not match a detailed lifecycle
                assessment. Typical accuracy: <strong>±20–30%</strong> of a full consumption-based footprint.
                That is precise enough to identify your largest sources of emissions and prioritise action.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '⚡', label: 'Instant', desc: 'Results update live as you fill in each section.' },
                { icon: '🔒', label: 'Private', desc: 'Everything stays in your browser — nothing is stored or shared.' },
                { icon: '🇧🇪', label: 'Belgium-specific', desc: 'Emission factors are calibrated for Belgian energy, transport, and food systems.' },
              ].map((f) => (
                <div key={f.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Placeholder sections (to be built) ── */}
          <SectionCard id="housing">
            <SectionTitle emoji="🏠">Housing &amp; Heating</SectionTitle>
            <ComingSoon label="Housing & heating section" />
          </SectionCard>

          <SectionCard id="electricity">
            <SectionTitle emoji="⚡">Electricity</SectionTitle>
            <ComingSoon label="Electricity section" />
          </SectionCard>

          <SectionCard id="car">
            <SectionTitle emoji="🚗">Car Travel</SectionTitle>
            <ComingSoon label="Car travel section" />
          </SectionCard>

          <SectionCard id="flights">
            <SectionTitle emoji="✈️">Flights</SectionTitle>
            <ComingSoon label="Flights section" />
          </SectionCard>

          <SectionCard id="public">
            <SectionTitle emoji="🚆">Public Transport</SectionTitle>
            <ComingSoon label="Public transport section" />
          </SectionCard>

          <SectionCard id="food">
            <SectionTitle emoji="🍽️">Food &amp; Diet</SectionTitle>
            <ComingSoon label="Food & diet section" />
          </SectionCard>

          <SectionCard id="shopping">
            <SectionTitle emoji="🛍️">Shopping</SectionTitle>
            <ComingSoon label="Shopping section" />
          </SectionCard>

          <SectionCard id="waste">
            <SectionTitle emoji="♻️">Waste</SectionTitle>
            <ComingSoon label="Waste section" />
          </SectionCard>

          <SectionCard id="pets">
            <SectionTitle emoji="🐾">Pets</SectionTitle>
            <ComingSoon label="Pets section" />
          </SectionCard>

          {/* ── Results placeholder ── */}
          <SectionCard id="results">
            <SectionTitle emoji="📊">Your Results</SectionTitle>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '32px 24px', textAlign: 'center', border: '2px dashed #e5e7eb' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
                Fill in the sections above to see your results
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                Your total CO₂ footprint will appear here, broken down by category and compared to Belgian and EU averages.
              </div>
            </div>
          </SectionCard>

          {/* ── Sources ── */}
          <SectionCard id="sources">
            <SectionTitle emoji="📚">Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'IPCC 2006 Guidelines — fuel emission factors', url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/' },
                { label: 'DEFRA GHG Conversion Factors 2024 — flights', url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting' },
                { label: 'Agribalyse 3.2 — food emission factors (ADEME)', url: 'https://data.ademe.fr/datasets/agribalyse-31-synthese' },
                { label: 'ADEME Base Empreinte — shopping & appliances', url: 'https://base-empreinte.ademe.fr' },
                { label: 'Poore & Nemecek 2018 — food system emissions (Science)', url: 'https://doi.org/10.1126/science.aaq0216' },
                { label: 'EEA — Belgian electricity grid emission factor', url: 'https://www.eea.europa.eu/en/analysis/maps-and-charts/co2-emission-intensity-15' },
                { label: 'Energuide.be — Belgian housing insulation benchmarks', url: 'https://www.energuide.be/en/questions-answers/how-much-co2-does-my-home-emit/68/' },
                { label: 'Statbel — Belgian housing and mobility statistics', url: 'https://statbel.fgov.be/nl/themas/mobiliteit' },
                { label: 'SNCB sustainability report — train emission factors', url: 'https://www.sncb.be/en/sustainability' },
                { label: 'Okin 2017 — pet carbon footprints (PLOS ONE)', url: 'https://doi.org/10.1371/journal.pone.0181301' },
                { label: 'OurAirports — airport coordinates dataset', url: 'https://ourairports.com/data/' },
                { label: 'Scarborough et al. 2014 — dietary emission profiles (Climatic Change)', url: 'https://doi.org/10.1007/s10584-014-1169-1' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.85rem', fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
                >
                  <span style={{ color: ACCENT, fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>↗</span>
                  {link.label}
                </a>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>

      <footer>
        <p>Data sourced from EEA, Eurostat, ADEME, IPCC, DEFRA and other official sources. Last updated April 2026.</p>
      </footer>
    </div>
  );
}
