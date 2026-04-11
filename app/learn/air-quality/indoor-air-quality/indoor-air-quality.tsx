'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const TOPIC_COLOR = '#8b5cf6';

const SECTIONS = [
  { id: 'intro',    label: 'Why it matters'          },
  { id: 'rooms',    label: 'Pollution by room'        },
  { id: 'sources',  label: 'Sources'                  },
];

// ── Layout components ─────────────────────────────────────────────────────────

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

function Para({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.75, marginBottom: 12, ...style }}>{children}</p>;
}

// ── House explorer ────────────────────────────────────────────────────────────

const ROOM_DATA: Record<string, {
  name: string;
  pollutants: string[];
  sources: { title: string; bullets: string[] }[];
  tips: string[];
}> = {
  bathroom: {
    name: 'Bathroom & laundry',
    pollutants: ['VOCs', 'Terpenes', 'Formaldehyde', 'Mould spores'],
    sources: [
      {
        title: 'Cleaning products & VOCs',
        bullets: [
          'Sprays, disinfectants, bleach, and descalers release VOCs during and after use',
          'Some VOCs (benzene, formaldehyde) are classified carcinogens with no safe threshold',
          'Scented products contain terpenes that react with indoor ozone to form formaldehyde and ultrafine particles',
          'Air fresheners add VOCs without improving air quality — they mask odours while worsening pollution',
        ],
      },
      {
        title: 'Mould',
        bullets: [
          'Bathrooms are the most common site — warm, moist air condenses on tiles, ceilings, and grout',
          'Mould releases spores and mycotoxins that trigger asthma, rhinitis, and lung inflammation',
          'Once established in wall cavities, surface cleaning is insufficient — the root cause is always excess moisture',
        ],
      },
    ],
    tips: [
      'Run the extractor fan during and for 15 minutes after showering — this single habit prevents most bathroom mould.',
      'Switch to fragrance-free cleaning products. White vinegar, bicarbonate of soda, and unscented soap handle most tasks at far lower VOC levels.',
      'If mould keeps returning to the same spot, the cause is structural (thermal bridge, slow leak, blocked grille) — surface cleaning alone will not solve it.',
    ],
  },
  living: {
    name: 'Living room',
    pollutants: ['PM2.5', 'Black carbon', 'PAHs', 'VOCs'],
    sources: [
      {
        title: 'Wood stoves & open fireplaces',
        bullets: [
          'The single most polluting household activity — releases PM2.5, black carbon, and carcinogenic PAHs',
          'Open fireplaces are worst: smoke re-enters through downdrafts and gaps around the hearth',
          'Wet or green wood produces far more toxic compounds than dry, well-seasoned wood',
          'Even certified stoves spike emissions during lighting and refuelling',
        ],
      },
      {
        title: 'Candles',
        bullets: [
          'Produce fine particles, soot, and VOCs — paraffin emits more benzene than beeswax or soy',
          'Scented candles: fragrance compounds react with indoor ozone to form formaldehyde and ultrafine particles',
          'Several candles in a poorly ventilated room can raise particle levels to roadside concentrations',
        ],
      },
    ],
    tips: [
      'Only burn dry, well-seasoned wood (below 20% moisture) and have the flue cleaned annually — wet wood produces up to four times more particles.',
      'Trim candle wicks to 5 mm before use and choose beeswax or soy over paraffin. Always open a window while burning.',
      'Open a window briefly before and after using the wood stove to flush out any backdraft smoke.',
    ],
  },
  bedroom: {
    name: 'Bedroom',
    pollutants: ['VOCs', 'Formaldehyde', 'Dust mite allergens', 'Fine particles'],
    sources: [
      {
        title: 'Furniture & materials off-gassing',
        bullets: [
          'New flatpack furniture (MDF, particleboard) releases formaldehyde from urea-formaldehyde adhesive resins',
          'Formaldehyde is a Group 1 IARC carcinogen — emissions peak in the first weeks but continue for years',
          'Synthetic carpets, vinyl flooring, paints, and varnishes also off-gas VOCs',
          'The bedroom matters most: 6–8 hours of close exposure per night to mattresses, pillows, and furniture',
        ],
      },
      {
        title: 'Dust mites & allergens',
        bullets: [
          'Mites thrive in warm, humid bedding — their faecal particles become airborne when bedding is disturbed',
          'Affect 10–15% of the Belgian population with rhinitis, eczema, or asthma symptoms',
          'Mattresses and pillows accumulate the highest mite loads in the home',
        ],
      },
    ],
    tips: [
      'Wash bedding at 60°C or above weekly — lower temperatures do not reliably kill mites. Use allergen-barrier covers on mattress and pillows.',
      'Air out new furniture for several days in a well-ventilated space before placing it in a bedroom.',
      'Keep the bedroom cool and well-ventilated during sleep — dust mites and mould both thrive in warm, humid conditions.',
    ],
  },
  kitchen: {
    name: 'Kitchen',
    pollutants: ['PM2.5', 'NO₂', 'CO', 'Acrolein', 'VOCs'],
    sources: [
      {
        title: 'Cooking emissions',
        bullets: [
          'Frying, grilling, and roasting at high heat generate large quantities of PM2.5 and acrolein (a toxic aldehyde)',
          'Oils with low smoke points (butter, unrefined oils) break down earlier, producing more harmful compounds',
          'Grilling meat produces PAHs and heterocyclic amines linked to elevated cancer risk',
        ],
      },
      {
        title: 'Gas hobs & boilers',
        bullets: [
          'Produce NO₂ and CO as combustion byproducts even when functioning normally',
          'NO₂ from a gas hob can exceed outdoor air quality guidelines within minutes in a poorly ventilated kitchen',
          'Unflued gas heaters are the leading cause of CO poisoning in Belgian homes',
          'Induction hobs produce zero combustion emissions',
        ],
      },
    ],
    tips: [
      'Use the extractor hood every time you cook — vented to outside, not recirculating. A recirculating hood filters grease but not NO₂ or CO.',
      'Open a window while cooking, even in winter. The pollution from a single frying session outweighs the heat loss.',
      'If replacing a hob, choose induction — it eliminates the NO₂ and CO contribution from cooking entirely.',
    ],
  },
  wholehome: {
    name: 'Whole home',
    pollutants: ['Mould spores', 'Radon', 'CO₂', 'VOCs', 'Outdoor pollutants'],
    sources: [
      {
        title: 'Ventilation & accumulation',
        bullets: [
          'The core indoor pollution problem: outdoors pollutants disperse, indoors they build up',
          'Modern airtight Belgian homes trap pollutants at far higher concentrations than older buildings',
          'New construction requires type C or D mechanical ventilation — many older homes rely on passive grilles that residents block',
          'CO₂ build-up in bedrooms and living rooms reduces alertness and sleep quality',
        ],
      },
      {
        title: 'Radon',
        bullets: [
          'A radioactive gas seeping from granite, shale, and uranium-bearing soils through foundations and floor cracks',
          'Highest levels in Belgium: the Ardennes and parts of the Campine',
          'Second leading cause of lung cancer in Belgium after tobacco smoke',
          'Ground-floor and basement rooms in high-radon areas need particular attention',
        ],
      },
    ],
    tips: [
      'Never block ventilation grilles. In homes without mechanical ventilation, open windows in opposing rooms for 5–10 minutes twice daily to cross-ventilate.',
      'In new airtight homes, ensure your type C or D ventilation system is serviced and filters replaced regularly.',
      'If you live in the Ardennes or Campine, test for radon — measurement kits are available from SCK-CEN and the risk is significant but entirely addressable.',
    ],
  },
};

function HouseExplorer() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const room = activeRoom ? ROOM_DATA[activeRoom] : null;

  const roomStyle = (id: string): React.CSSProperties => ({
    cursor: 'pointer',
    opacity: activeRoom && activeRoom !== id ? 0.85 : 1,
    transition: 'opacity 0.15s',
  });

  const hlStyle = (id: string): React.CSSProperties => ({
    position: 'absolute' as const,
    inset: 0,
    background: activeRoom === id ? 'rgba(139,92,246,0.18)' : 'transparent',
    transition: 'background 0.15s',
    pointerEvents: 'none',
  });

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* SVG house */}
      <div style={{ flex: '0 0 340px', maxWidth: 340 }}>
        <svg viewBox="0 0 340 370" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>

          {/* background */}
          <rect width="340" height="370" fill="#f7f6f2"/>

          {/* ── ROOF ── */}
          <polygon points="170,18 318,108 22,108" fill="#2a9d8f"/>
          <polygon points="170,22 314,108 26,108" fill="#1d7a6e"/>
          <rect x="155" y="16" width="30" height="8" rx="3" fill="#1a6a5e"/>

          {/* dormer left */}
          <polygon points="82,58 82,88 112,88 112,58 97,46" fill="#2a9d8f"/>
          <polygon points="82,58 97,46 112,58" fill="#1d7a6e"/>
          <rect x="84" y="60" width="26" height="26" rx="1" fill="#2c2c2c"/>
          <rect x="86" y="62" width="10" height="22" rx="1" fill="#a8d8ea" opacity=".85"/>
          <rect x="98" y="62" width="10" height="22" rx="1" fill="#a8d8ea" opacity=".85"/>
          <line x1="97" y1="62" x2="97" y2="86" stroke="#1a1a1a" strokeWidth="1.5"/>
          <line x1="84" y1="73" x2="110" y2="73" stroke="#1a1a1a" strokeWidth="1.5"/>

          {/* dormer centre */}
          <polygon points="145,48 145,88 195,88 195,48 170,32" fill="#2a9d8f"/>
          <polygon points="145,48 170,32 195,48" fill="#1d7a6e"/>
          <rect x="147" y="50" width="46" height="36" rx="1" fill="#2c2c2c"/>
          <rect x="149" y="52" width="19" height="30" rx="1" fill="#a8d8ea" opacity=".85"/>
          <rect x="172" y="52" width="19" height="30" rx="1" fill="#a8d8ea" opacity=".85"/>
          <line x1="170" y1="52" x2="170" y2="82" stroke="#1a1a1a" strokeWidth="1.5"/>
          <line x1="147" y1="66" x2="193" y2="66" stroke="#1a1a1a" strokeWidth="1.5"/>

          {/* dormer right */}
          <polygon points="228,58 228,88 258,88 258,58 243,46" fill="#2a9d8f"/>
          <polygon points="228,58 243,46 258,58" fill="#1d7a6e"/>
          <rect x="230" y="60" width="26" height="26" rx="1" fill="#2c2c2c"/>
          <rect x="232" y="62" width="10" height="22" rx="1" fill="#a8d8ea" opacity=".85"/>
          <rect x="244" y="62" width="10" height="22" rx="1" fill="#a8d8ea" opacity=".85"/>
          <line x1="243" y1="62" x2="243" y2="86" stroke="#1a1a1a" strokeWidth="1.5"/>
          <line x1="230" y1="73" x2="256" y2="73" stroke="#1a1a1a" strokeWidth="1.5"/>

          {/* ── WALLS & STRUCTURE ── */}
          <rect x="22" y="108" width="296" height="222" fill="#f0ede4"/>
          <rect x="22" y="108" width="296" height="222" fill="none" stroke="#2c2c2c" strokeWidth="5"/>
          <rect x="168" y="108" width="5" height="222" fill="#2c2c2c"/>
          <rect x="22" y="218" width="296" height="5" fill="#2c2c2c"/>
          <rect x="22" y="106" width="296" height="6" fill="#2c2c2c"/>

          {/* ── ROOM FILLS ── */}
          <rect x="24" y="110" width="142" height="106" fill="#e8f4f8"/>
          <rect x="175" y="110" width="141" height="106" fill="#fdf5e8"/>
          <rect x="24" y="225" width="142" height="103" fill="#fdf0f5"/>
          <rect x="175" y="225" width="141" height="103" fill="#eaf5ea"/>

          {/* ── BATHROOM furniture ── */}
          <rect x="28" y="112" width="38" height="56" rx="1" fill="#c5e8f2" stroke="#8abdd0" strokeWidth="1"/>
          <rect x="30" y="114" width="34" height="52" rx="1" fill="#d8f0f8" opacity=".6"/>
          <rect x="55" y="115" width="2" height="10" rx="1" fill="#888"/>
          <rect x="50" y="123" width="12" height="3" rx="1" fill="#999"/>
          <rect x="76" y="112" width="30" height="20" rx="1" fill="#c0dcea" stroke="#88b8cc" strokeWidth="1"/>
          <line x1="91" y1="112" x2="91" y2="132" stroke="#a0ccd8" strokeWidth=".5"/>
          <rect x="80" y="132" width="22" height="4" rx="1" fill="#b8c8d0"/>
          <ellipse cx="91" cy="140" rx="18" ry="10" fill="#d4e8f0" stroke="#9abccc" strokeWidth="1"/>
          <ellipse cx="91" cy="139" rx="14" ry="7" fill="#c0d8e8"/>
          <circle cx="91" cy="136" r="2" fill="#888"/>
          <line x1="68" y1="128" x2="78" y2="128" stroke="#aaa" strokeWidth="2"/>
          <rect x="70" y="128" width="6" height="16" rx="1" fill="#e89060" opacity=".9"/>
          <rect x="118" y="128" width="28" height="10" rx="2" fill="#e0e0e0" stroke="#c0c0c0" strokeWidth="1"/>
          <rect x="120" y="138" width="24" height="18" rx="3" fill="#e8e8e8" stroke="#c0c0c0" strokeWidth="1"/>
          <ellipse cx="132" cy="156" rx="15" ry="9" fill="#e0e0e0" stroke="#c0c0c0" strokeWidth="1"/>

          {/* ── LIVING ROOM furniture ── */}
          <rect x="245" y="112" width="42" height="32" rx="1" fill="#a8d8ea" opacity=".8" stroke="#2c2c2c" strokeWidth="1.5"/>
          <line x1="266" y1="112" x2="266" y2="144" stroke="#2c2c2c" strokeWidth="1.5"/>
          <line x1="245" y1="128" x2="287" y2="128" stroke="#2c2c2c" strokeWidth="1.5"/>
          <line x1="220" y1="110" x2="220" y2="124" stroke="#888" strokeWidth="1.5"/>
          <ellipse cx="220" cy="127" rx="10" ry="6" fill="#e8c060" stroke="#c8a040" strokeWidth="1"/>
          <rect x="178" y="114" width="24" height="18" rx="1" fill="#e8a870" stroke="#c08850" strokeWidth="1"/>
          <rect x="180" y="116" width="9" height="7" fill="#2a9d8f" opacity=".7"/>
          <rect x="191" y="116" width="9" height="7" fill="#e8c860" opacity=".7"/>
          <rect x="192" y="172" width="90" height="32" rx="3" fill="#e8c060" stroke="#c8a040" strokeWidth="1.5"/>
          <rect x="192" y="163" width="90" height="12" rx="2" fill="#d0a830" stroke="#c8a040" strokeWidth="1.5"/>
          <rect x="195" y="202" width="6" height="6" rx="1" fill="#a08020"/>
          <rect x="272" y="202" width="6" height="6" rx="1" fill="#a08020"/>
          <rect x="188" y="166" width="22" height="10" rx="2" fill="#f0d870"/>
          <rect x="218" y="166" width="22" height="10" rx="2" fill="#f0d870"/>
          <rect x="248" y="166" width="18" height="10" rx="2" fill="#f0d870"/>
          <rect x="178" y="175" width="26" height="24" rx="2" fill="#e05050" stroke="#c03030" strokeWidth="1"/>
          <rect x="178" y="168" width="26" height="10" rx="2" fill="#c84040" stroke="#c03030" strokeWidth="1"/>
          <rect x="290" y="183" width="10" height="14" rx="1" fill="#c89050"/>
          <ellipse cx="295" cy="177" rx="10" ry="13" fill="#2a9d8f" opacity=".85"/>

          {/* ── BEDROOM furniture ── */}
          <line x1="60" y1="225" x2="60" y2="238" stroke="#888" strokeWidth="1.5"/>
          <ellipse cx="60" cy="241" rx="11" ry="6" fill="#2c2c2c" stroke="#111" strokeWidth="1"/>
          <line x1="120" y1="225" x2="120" y2="238" stroke="#888" strokeWidth="1.5"/>
          <ellipse cx="120" cy="241" rx="9" ry="5" fill="#e05050" stroke="#c03030" strokeWidth="1"/>
          <rect x="28" y="229" width="28" height="22" rx="1" fill="#f0e8d0" stroke="#c8b890" strokeWidth="1"/>
          <rect x="30" y="231" width="11" height="9" fill="#a8c8e8" opacity=".7"/>
          <rect x="43" y="231" width="11" height="9" fill="#e8c880" opacity=".7"/>
          <rect x="30" y="266" width="128" height="58" rx="3" fill="#e05050" stroke="#c03030" strokeWidth="1.5"/>
          <rect x="30" y="256" width="128" height="14" rx="3" fill="#c84040" stroke="#c03030" strokeWidth="1.5"/>
          <rect x="32" y="268" width="124" height="54" rx="2" fill="#f8e8e0" opacity=".5"/>
          <rect x="38" y="260" width="34" height="18" rx="2" fill="#faf4ee" stroke="#e0d8d0" strokeWidth="1"/>
          <rect x="86" y="260" width="34" height="18" rx="2" fill="#faf4ee" stroke="#e0d8d0" strokeWidth="1"/>
          <rect x="24" y="272" width="16" height="22" rx="2" fill="#c88828" stroke="#a86820" strokeWidth="1"/>
          <rect x="150" y="272" width="16" height="22" rx="2" fill="#c88828" stroke="#a86820" strokeWidth="1"/>
          <line x1="32" y1="272" x2="32" y2="264" stroke="#999" strokeWidth="1"/>
          <ellipse cx="32" cy="262" rx="6" ry="3" fill="#e8c860" opacity=".85"/>
          <line x1="158" y1="272" x2="158" y2="264" stroke="#999" strokeWidth="1"/>
          <ellipse cx="158" cy="262" rx="6" ry="3" fill="#e8c860" opacity=".85"/>

          {/* ── KITCHEN furniture ── */}
          <rect x="177" y="227" width="30" height="64" rx="2" fill="#f2f2f2" stroke="#d0d0d0" strokeWidth="1.5"/>
          <rect x="180" y="230" width="24" height="26" rx="1" fill="#e8e8e8"/>
          <rect x="180" y="259" width="24" height="28" rx="1" fill="#e4e4e4"/>
          <line x1="192" y1="243" x2="192" y2="247" stroke="#bbb" strokeWidth="1"/>
          <line x1="192" y1="272" x2="192" y2="276" stroke="#bbb" strokeWidth="1"/>
          <rect x="212" y="227" width="102" height="36" rx="2" fill="#4aada0" stroke="#2a8d80" strokeWidth="1.5"/>
          <line x1="246" y1="227" x2="246" y2="263" stroke="#2a8d80" strokeWidth="1.5"/>
          <line x1="280" y1="227" x2="280" y2="263" stroke="#2a8d80" strokeWidth="1.5"/>
          <line x1="230" y1="245" x2="240" y2="245" stroke="#1a7060" strokeWidth="1.5"/>
          <line x1="260" y1="245" x2="270" y2="245" stroke="#1a7060" strokeWidth="1.5"/>
          <line x1="288" y1="245" x2="298" y2="245" stroke="#1a7060" strokeWidth="1.5"/>
          <rect x="212" y="263" width="102" height="20" fill="#f2f0e8"/>
          <line x1="234" y1="263" x2="234" y2="283" stroke="#ddd" strokeWidth=".5"/>
          <line x1="256" y1="263" x2="256" y2="283" stroke="#ddd" strokeWidth=".5"/>
          <line x1="278" y1="263" x2="278" y2="283" stroke="#ddd" strokeWidth=".5"/>
          <line x1="212" y1="273" x2="314" y2="273" stroke="#ddd" strokeWidth=".5"/>
          <rect x="212" y="281" width="102" height="8" rx="1" fill="#c8c8b8" stroke="#a8a898" strokeWidth="1"/>
          <rect x="212" y="289" width="102" height="38" rx="2" fill="#4aada0" stroke="#2a8d80" strokeWidth="1.5"/>
          <line x1="246" y1="289" x2="246" y2="327" stroke="#2a8d80" strokeWidth="1.5"/>
          <line x1="280" y1="289" x2="280" y2="327" stroke="#2a8d80" strokeWidth="1.5"/>
          <line x1="228" y1="308" x2="240" y2="308" stroke="#1a7060" strokeWidth="1.5"/>
          <line x1="260" y1="308" x2="272" y2="308" stroke="#1a7060" strokeWidth="1.5"/>
          <line x1="290" y1="308" x2="302" y2="308" stroke="#1a7060" strokeWidth="1.5"/>
          <rect x="248" y="277" width="28" height="10" rx="1" fill="#b0b0a0" stroke="#989888" strokeWidth="1"/>
          <line x1="262" y1="268" x2="262" y2="280" stroke="#888" strokeWidth="1.5"/>
          <circle cx="265" cy="276" r="2" fill="#666"/>

          {/* ── FOUNDATION ── */}
          <rect x="10" y="328" width="320" height="14" fill="#c8b89a"/>
          <rect x="10" y="340" width="320" height="6" fill="#b8a88a"/>

          {/* ── CLICKABLE OVERLAYS ── */}
          {/* Bathroom */}
          <g onClick={() => setActiveRoom(activeRoom === 'bathroom' ? null : 'bathroom')} style={roomStyle('bathroom')} role="button" aria-label="Bathroom and laundry">
            <rect x="24" y="110" width="142" height="106" fill={activeRoom === 'bathroom' ? `${TOPIC_COLOR}28` : 'transparent'} style={{ transition: 'fill 0.15s' }}/>
            <text x="95" y="203" textAnchor="middle" fontSize="12" fontWeight="500" fill="#374151" fontFamily="Roboto, sans-serif" style={{ pointerEvents: 'none' }}>Bathroom &amp; laundry</text>
          </g>
          {/* Living room */}
          <g onClick={() => setActiveRoom(activeRoom === 'living' ? null : 'living')} style={roomStyle('living')} role="button" aria-label="Living room">
            <rect x="175" y="110" width="141" height="106" fill={activeRoom === 'living' ? `${TOPIC_COLOR}28` : 'transparent'} style={{ transition: 'fill 0.15s' }}/>
            <text x="245" y="203" textAnchor="middle" fontSize="12" fontWeight="500" fill="#374151" fontFamily="Roboto, sans-serif" style={{ pointerEvents: 'none' }}>Living room</text>
          </g>
          {/* Bedroom */}
          <g onClick={() => setActiveRoom(activeRoom === 'bedroom' ? null : 'bedroom')} style={roomStyle('bedroom')} role="button" aria-label="Bedroom">
            <rect x="24" y="225" width="142" height="103" fill={activeRoom === 'bedroom' ? `${TOPIC_COLOR}28` : 'transparent'} style={{ transition: 'fill 0.15s' }}/>
            <text x="95" y="316" textAnchor="middle" fontSize="12" fontWeight="500" fill="#374151" fontFamily="Roboto, sans-serif" style={{ pointerEvents: 'none' }}>Bedroom</text>
          </g>
          {/* Kitchen */}
          <g onClick={() => setActiveRoom(activeRoom === 'kitchen' ? null : 'kitchen')} style={roomStyle('kitchen')} role="button" aria-label="Kitchen">
            <rect x="175" y="225" width="141" height="103" fill={activeRoom === 'kitchen' ? `${TOPIC_COLOR}28` : 'transparent'} style={{ transition: 'fill 0.15s' }}/>
            <text x="245" y="316" textAnchor="middle" fontSize="12" fontWeight="500" fill="#374151" fontFamily="Roboto, sans-serif" style={{ pointerEvents: 'none' }}>Kitchen</text>
          </g>
          {/* Whole home — roof strip */}
          <g onClick={() => setActiveRoom(activeRoom === 'wholehome' ? null : 'wholehome')} style={{ cursor: 'pointer' }} role="button" aria-label="Whole home">
            <polygon points="22,108 318,108 290,80 50,80" fill={activeRoom === 'wholehome' ? 'rgba(139,92,246,0.2)' : 'transparent'} style={{ transition: 'fill 0.15s' }}/>
            <text x="170" y="98" textAnchor="middle" fontSize="11" fontWeight="500" fill="#ffffffcc" fontFamily="Roboto, sans-serif" style={{ pointerEvents: 'none' }}>Whole home — ventilation &amp; radon</text>
          </g>
        </svg>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, minWidth: 260, background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {!room ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, fontSize: '0.88rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.7 }}>
            Click a room to see<br />indoor air quality sources &amp; tips
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', marginBottom: 4 }}>{room.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {room.pollutants.map(p => (
                <span key={p} style={{ fontSize: '0.72rem', padding: '2px 9px', borderRadius: 20, background: `${TOPIC_COLOR}14`, color: TOPIC_COLOR, fontWeight: 600 }}>{p}</span>
              ))}
            </div>
            {room.sources.map((src, si) => (
              <div key={si} style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, marginTop: 10 }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginBottom: 7 }}>{src.title}</div>
                {src.bullets.map((b, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: 7, fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, marginBottom: 5, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, marginTop: 6, width: 4, height: 4, borderRadius: '50%', background: '#9ca3af', display: 'inline-block' }} />
                    {b}
                  </div>
                ))}
              </div>
            ))}
            <div style={{ borderTop: `2px solid ${TOPIC_COLOR}22`, paddingTop: 12, marginTop: 14 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: TOPIC_COLOR, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                What you can do
              </div>
              {room.tips.map((tip, ti) => (
                <div key={ti} style={{ display: 'flex', gap: 9, fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, marginBottom: 7, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, color: TOPIC_COLOR, fontWeight: 700, fontSize: '0.9rem', marginTop: 1 }}>&#x2713;</span>
                  {tip}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Key figures ───────────────────────────────────────────────────────────────

function KeyFigures() {
  const figs = [
    { value: '~90%', label: 'of time spent indoors', sub: 'Europeans spend the vast majority of their lives inside homes, offices, and schools', color: TOPIC_COLOR },
    { value: '2\u20135\u00d7', label: 'more polluted indoors', sub: 'Indoor air can be 2 to 5 times more polluted than outdoor air, according to the US EPA', color: '#ef4444' },
    { value: '1,000+', label: 'chemical compounds', sub: 'Studies have detected over a thousand different VOCs inside typical European homes', color: '#f59e0b' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
      {figs.map(f => (
        <div key={f.value} style={{ background: '#fff', borderRadius: 12, padding: '20px 20px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderTop: `4px solid ${f.color}` }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.75rem', fontWeight: 900, color: f.color, lineHeight: 1.1 }}>{f.value}</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#1a1a1a', marginTop: 6, lineHeight: 1.3 }}>{f.label}</div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{f.sub}</div>
        </div>
      ))}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IndoorAirQuality() {
  return (
    <div className="detail-page">

      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)' }}>
        <div className="detail-header-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <Link href="/learn" className="back-link">&#x2190; Back to Learn</Link>
            <p className="header-eyebrow" style={{ marginTop: 16 }}>&#x1F32C;&#xFE0F;  Air Quality</p>
            <h1 className="detail-title">Indoor Air Quality</h1>
          </div>
          <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 8, overflow: 'hidden', alignSelf: 'center' }}>
            <img src="/images/learn/indoor-air.PNG" alt="Indoor air quality" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </div>

      <div className="detail-body">
        <Sidebar />
        <div className="detail-main">

          <KeyFigures />

          {/* 1 — Why it matters */}
          <SectionCard id="intro">
            <SectionTitle>Why indoor air quality matters</SectionTitle>
            <Para>
              When people think about air pollution, they picture traffic fumes or factory smokestacks. But
              for most people, the air they breathe most is inside their own home. Europeans spend roughly
              90% of their lives indoors &mdash; sleeping, cooking, working, and relaxing in spaces where
              pollutant concentrations can build up far beyond what would be acceptable outdoors.
            </Para>
            <Para>
              Unlike outdoor air, which is regulated by European directives with mandatory monitoring and
              limit values, indoor air quality has no binding legal standards in Belgium. There is no
              obligation to measure it, and no authority that will intervene if your living room air is
              heavily polluted. The responsibility falls almost entirely on residents themselves.
            </Para>
            <Para>
              The sources are varied and often surprising. Some &mdash; like wood stoves and gas cookers
              &mdash; are obvious combustion sources. Others are chemical: the paints on your walls,
              the cleaning spray under your sink, the scented candle on your coffee table. And some are
              biological: mould spores, dust mite allergens, and pet dander that accumulate wherever
              ventilation is poor. Understanding what produces what, and in which room, is the first step
              toward breathing better air at home.
            </Para>
          </SectionCard>

          {/* 2 — House explorer */}
          <SectionCard id="rooms">
            <SectionTitle>Indoor air pollution by room</SectionTitle>
            <Para>
              Click on a room in the house below to see the main sources of indoor air pollution, their health effects, and practical tips.
            </Para>
            <HouseExplorer />
          </SectionCard>

          {/* 3 — Sources */}
          <SectionCard id="sources">
            <SectionTitle>Sources</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'WHO \u2014 WHO guidelines for indoor air quality: selected pollutants, 2010',          url: 'https://www.who.int/publications/i/item/9789289002134' },
                { label: 'European Environment Agency \u2014 Indoor air quality, 2023',                          url: 'https://www.eea.europa.eu/en/topics/in-depth/indoor-air-quality' },
                { label: 'IARC \u2014 Formaldehyde classified as Group 1 carcinogen',                           url: 'https://www.iarc.who.int/news-events/iarc-monographs-volume-100c-formaldehyde/' },
                { label: 'Sciensano \u2014 Indoor air quality in Belgian homes',                                 url: 'https://www.sciensano.be/en/health-topics/indoor-environment' },
                { label: 'SCK-CEN \u2014 Radon in Belgium',                                                     url: 'https://www.sckcen.be/en/radon' },
                { label: 'VITO / Flanders \u2014 Luchtkwaliteit binnenshuis',                                   url: 'https://www.vito.be/nl/onderzoek-resultaten/binnenluchtkwaliteit' },
                { label: 'Healthy Belgium / Sciensano \u2014 Indoor environment indicator sheet',                url: 'https://www.healthybelgium.be/en/health-status/determinants-of-health/indoor-environment' },
                { label: 'US EPA \u2014 Introduction to Indoor Air Quality',                                     url: 'https://www.epa.gov/indoor-air-quality-iaq/introduction-indoor-air-quality' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: '0.88rem', fontWeight: 500 }}
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
