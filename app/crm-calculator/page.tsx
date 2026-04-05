// → app/crm-calculator/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────

const TEAL = '#0891b2';
const TEAL_BG = '#ecfeff';
const TEAL_BORDER = '#a5f3fc';
const AMBER = '#f59e0b';
const AMBER_BG = '#fffbeb';

// ─────────────────────────────────────────────────────────────────────────────
// DATA — device composition (grams per unit)
// Source: JRC Critical Materials 2020, OEKO-Institut, IEA Critical Minerals 2023
// ─────────────────────────────────────────────────────────────────────────────

type MatKey = 'cobalt'|'lithium'|'neodymium'|'dysprosium'|'praseodymium'|'terbium'|'indium'|'gallium'|'germanium'|'tantalum'|'gold'|'silver'|'copper';

const DEVICE_COMPOSITION: Record<string, Record<MatKey, number>> = {
  smartphone: { cobalt:7,    lithium:3.5,  neodymium:0.40,  dysprosium:0.030, praseodymium:0.080, terbium:0.002, indium:0.060, gallium:0.015, germanium:0.005, tantalum:0.130, gold:0.030, silver:0.15,  copper:16    },
  laptop:     { cobalt:30,   lithium:15,   neodymium:0.70,  dysprosium:0.070, praseodymium:0.150, terbium:0.005, indium:0.400, gallium:0.070, germanium:0.020, tantalum:0.700, gold:0.120, silver:0.70,  copper:200   },
  tablet:     { cobalt:12,   lithium:6,    neodymium:0.30,  dysprosium:0.030, praseodymium:0.060, terbium:0.002, indium:0.300, gallium:0.040, germanium:0.010, tantalum:0.400, gold:0.080, silver:0.40,  copper:80    },
  tv:         { cobalt:3,    lithium:0,    neodymium:2.00,  dysprosium:0.150, praseodymium:0.400, terbium:0.010, indium:4.000, gallium:0.300, germanium:0.050, tantalum:1.500, gold:0.250, silver:3.00,  copper:1000  },
  earbuds:    { cobalt:0.7,  lithium:0.3,  neodymium:0.15,  dysprosium:0.008, praseodymium:0.030, terbium:0.001, indium:0,     gallium:0.003, germanium:0.001, tantalum:0.015, gold:0.008, silver:0.03,  copper:7     },
  console:    { cobalt:4,    lithium:1.5,  neodymium:1.50,  dysprosium:0.150, praseodymium:0.300, terbium:0.010, indium:0,     gallium:0.150, germanium:0.040, tantalum:3.000, gold:0.200, silver:1.50,  copper:500   },
  ebike:      { cobalt:700,  lithium:500,  neodymium:200,   dysprosium:20,    praseodymium:40,    terbium:1.500, indium:0,     gallium:0.300, germanium:0.050, tantalum:1.500, gold:0.700, silver:2.00,  copper:3000  },
  ev:         { cobalt:10000,lithium:9000, neodymium:1500,  dysprosium:200,   praseodymium:300,   terbium:15,    indium:1,     gallium:2,     germanium:0.5,   tantalum:7,     gold:3,     silver:20,    copper:80000 },
};

const CONSUMER_DEVICES = [
  { id:'smartphone', emoji:'📱', label:'Smartphone'       },
  { id:'laptop',     emoji:'💻', label:'Laptop'           },
  { id:'tablet',     emoji:'📟', label:'Tablet'           },
  { id:'tv',         emoji:'📺', label:'Smart TV (55")'   },
  { id:'earbuds',    emoji:'🎧', label:'Wireless earbuds' },
  { id:'console',    emoji:'🎮', label:'Gaming console'   },
];

const LARGE_DEVICES = [
  { id:'ebike', emoji:'🚲', label:'Electric bicycle',      subtitle:'~400 Wh battery' },
  { id:'ev',    emoji:'🔋', label:'Electric vehicle',      subtitle:'~60 kWh battery' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MATERIALS
// ─────────────────────────────────────────────────────────────────────────────

type Tier = 'strategic'|'critical'|'reference';

const MATERIALS: { id:MatKey; label:string; symbol:string; group:string; tier:Tier; color:string; recycleRate:number }[] = [
  { id:'cobalt',       label:'Cobalt',       symbol:'Co', group:'battery',    tier:'strategic', color:'#f97316', recycleRate:0.15 },
  { id:'lithium',      label:'Lithium',      symbol:'Li', group:'battery',    tier:'strategic', color:'#fb923c', recycleRate:0.01 },
  { id:'neodymium',    label:'Neodymium',    symbol:'Nd', group:'ree',        tier:'strategic', color:'#ef4444', recycleRate:0.01 },
  { id:'dysprosium',   label:'Dysprosium',   symbol:'Dy', group:'ree',        tier:'strategic', color:'#dc2626', recycleRate:0.01 },
  { id:'praseodymium', label:'Praseodymium', symbol:'Pr', group:'ree',        tier:'strategic', color:'#b91c1c', recycleRate:0.01 },
  { id:'terbium',      label:'Terbium',      symbol:'Tb', group:'ree',        tier:'strategic', color:'#991b1b', recycleRate:0.01 },
  { id:'indium',       label:'Indium',       symbol:'In', group:'semi',       tier:'critical',  color:'#8b5cf6', recycleRate:0.01 },
  { id:'gallium',      label:'Gallium',      symbol:'Ga', group:'semi',       tier:'strategic', color:'#7c3aed', recycleRate:0.01 },
  { id:'germanium',    label:'Germanium',    symbol:'Ge', group:'semi',       tier:'strategic', color:'#6d28d9', recycleRate:0.01 },
  { id:'tantalum',     label:'Tantalum',     symbol:'Ta', group:'capacitor',  tier:'critical',  color:'#3b82f6', recycleRate:0.30 },
  { id:'gold',         label:'Gold',         symbol:'Au', group:'precious',   tier:'reference', color:'#eab308', recycleRate:0.15 },
  { id:'silver',       label:'Silver',       symbol:'Ag', group:'precious',   tier:'reference', color:'#a3a3a3', recycleRate:0.25 },
  { id:'copper',       label:'Copper',       symbol:'Cu', group:'precious',   tier:'reference', color:'#92400e', recycleRate:0.50 },
];

const TIER_LABELS: Record<Tier,string> = {
  strategic: '⭐ Strategic CRM',
  critical:  '🔶 Critical CRM',
  reference: '⬜ Reference',
};

const GROUP_LABELS: Record<string,string> = {
  battery:'🔋 Battery materials', ree:'🧲 REE permanent magnets',
  semi:'💡 Semiconductors & displays', capacitor:'⚡ Capacitors', precious:'💰 Precious metals (reference)',
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmt(g: number): string {
  if (g === 0) return '0';
  if (g < 0.001) return `${(g*1000000).toFixed(0)} μg`;
  if (g < 1)     return `${(g*1000).toFixed(1)} mg`;
  if (g < 1000)  return `${g.toFixed(2)} g`;
  return `${(g/1000).toFixed(2)} kg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

type Counts = Record<string, { active:number; idle:number }>;

function defaultCounts(): Counts {
  const all = [...CONSUMER_DEVICES, ...LARGE_DEVICES];
  return Object.fromEntries(all.map(d => [d.id, { active:0, idle:0 }]));
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ id, children }: { id:string; children:React.ReactNode }) {
  return (
    <div id={id} style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', padding:'24px 28px', marginBottom:16 }}>
      {children}
    </div>
  );
}

function SectionTitle({ emoji, children }: { emoji:string; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, paddingBottom:10, borderBottom:`2px solid ${TEAL}20` }}>
      <div style={{ width:34, height:34, borderRadius:8, background:`${TEAL}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{emoji}</div>
      <h2 style={{ fontSize:17, fontWeight:700, color:'#1a1a1a', margin:0 }}>{children}</h2>
    </div>
  );
}

function CountStepper({ val, onChange, max=10 }: { val:number; onChange:(v:number)=>void; max?:number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <button onClick={()=>onChange(Math.max(0,val-1))}
        style={{ width:26, height:26, borderRadius:6, border:'1px solid #d1d5db', background:'#f9fafb', cursor:'pointer', fontSize:14, fontWeight:700, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
      <span style={{ fontSize:15, fontWeight:700, minWidth:20, textAlign:'center', color:'#1a1a1a' }}>{val}</span>
      <button onClick={()=>onChange(Math.min(max,val+1))}
        style={{ width:26, height:26, borderRadius:6, border:'1px solid #d1d5db', background:'#f9fafb', cursor:'pointer', fontSize:14, fontWeight:700, color:'#374151', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
    </div>
  );
}

function DeviceRow({
  device, active, idle,
  onActiveChange, onIdleChange,
  accentActive, accentIdle,
}: {
  device:{id:string;emoji:string;label:string;subtitle?:string};
  active:number; idle:number;
  onActiveChange:(v:number)=>void;
  onIdleChange:(v:number)=>void;
  accentActive:string; accentIdle:string;
}) {
  const hasAny = active > 0 || idle > 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8,
      background: hasAny ? '#f0fdf4' : '#f9fafb',
      border: `1px solid ${hasAny ? TEAL_BORDER : '#e5e7eb'}`,
      marginBottom:8 }}>
      <span style={{ fontSize:22, flexShrink:0 }}>{device.emoji}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a' }}>{device.label}</div>
        {device.subtitle && <div style={{ fontSize:11, color:'#6b7280' }}>{device.subtitle}</div>}
      </div>
      <div style={{ display:'flex', gap:20, flexShrink:0 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:600, color:accentActive, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>In use</div>
          <CountStepper val={active} onChange={onActiveChange} />
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, fontWeight:600, color:accentIdle, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>In drawer</div>
          <CountStepper val={idle} onChange={onIdleChange} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MaterialCard({ mat, activeG, idleG }: { mat:typeof MATERIALS[0]; activeG:number; idleG:number }) {
  const total = activeG + idleG;
  if (total === 0) return null;
  const idlePct = total > 0 ? Math.round((idleG/total)*100) : 0;
  const recovered = idleG * mat.recycleRate;

  return (
    <div style={{ background:'#fff', borderRadius:10, border:`1px solid #e5e7eb`, padding:'14px 16px',
      borderLeft:`4px solid ${mat.color}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:'#1a1a1a' }}>
            {mat.label} <span style={{ fontFamily:'monospace', fontSize:11, color:'#6b7280' }}>({mat.symbol})</span>
          </div>
          <div style={{ fontSize:11, color:mat.tier==='strategic'?'#dc2626':mat.tier==='critical'?'#d97706':'#6b7280', fontWeight:600 }}>
            {TIER_LABELS[mat.tier]}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:15, fontWeight:800, color:'#1a1a1a' }}>{fmt(total)}</div>
          <div style={{ fontSize:11, color:'#6b7280' }}>total</div>
        </div>
      </div>
      {/* Active vs idle bar */}
      <div style={{ background:'#f3f4f6', borderRadius:4, height:6, overflow:'hidden', marginBottom:6 }}>
        <div style={{ display:'flex', height:'100%' }}>
          <div style={{ width:`${100-idlePct}%`, background:mat.color, borderRadius:'4px 0 0 4px' }} />
          <div style={{ width:`${idlePct}%`, background:`${mat.color}60` }} />
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6b7280' }}>
        <span>In use: {fmt(activeG)}</span>
        {idleG > 0 && <span style={{ color:'#d97706', fontWeight:600 }}>⚠️ Idle: {fmt(idleG)} ({idlePct}%)</span>}
      </div>
      {idleG > 0 && (
        <div style={{ marginTop:6, fontSize:11, color:'#6b7280', background:'#f9fafb', borderRadius:6, padding:'5px 8px' }}>
          At current {Math.round(mat.recycleRate*100)}% recycling rate → only <strong>{fmt(recovered)}</strong> recoverable if brought to Recupel
        </div>
      )}
    </div>
  );
}

function GroupedBarChart({ data, title }: { data:{name:string;active:number;idle:number;color:string}[]; title:string }) {
  if (data.every(d => d.active+d.idle === 0)) return null;
  const hasData = data.filter(d => d.active+d.idle > 0);
  return (
    <div style={{ background:'#f9fafb', borderRadius:10, padding:'16px', marginBottom:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:12 }}>{title}</div>
      <ResponsiveContainer width="100%" height={hasData.length * 44 + 20}>
        <BarChart data={hasData} layout="vertical" margin={{ left:10, right:60, top:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize:10 }} tickFormatter={v => fmt(v)} />
          <YAxis type="category" dataKey="name" tick={{ fontSize:12 }} width={100} />
          <Tooltip formatter={(v:number, name:string) => [fmt(v as number), name==='active'?'In use':'Idle (at risk)']} />
          <Bar dataKey="active" name="active" stackId="a" radius={[0,0,0,0]} legendType="none">
            {hasData.map((e,i) => <Cell key={i} fill={e.color} />)}
          </Bar>
          <Bar dataKey="idle" name="idle" stackId="a" radius={[0,4,4,0]} legendType="none">
            {hasData.map((e,i) => <Cell key={i} fill={`${e.color}50`} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Custom legend */}
      <div style={{ display:'flex', gap:16, marginTop:10, justifyContent:'center' }}>
        {hasData.slice(0,1).map(e => ([
          <div key="active" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#4b5563' }}>
            <div style={{ width:14, height:10, borderRadius:2, background:e.color }} />
            In use
          </div>,
          <div key="idle" style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#4b5563' }}>
            <div style={{ width:14, height:10, borderRadius:2, background:`${e.color}50`, border:`1px solid ${e.color}` }} />
            Idle (at risk)
          </div>,
        ]))}
      </div>
    </div>
  );
}

function RecoveryChart({ totals }: { totals:{ active:Partial<Record<MatKey,number>>; idle:Partial<Record<MatKey,number>> } }) {
  const rows = MATERIALS
    .map(mat => ({
      mat,
      idle: totals.idle[mat.id] ?? 0,
      recovered: (totals.idle[mat.id] ?? 0) * mat.recycleRate,
      lost: (totals.idle[mat.id] ?? 0) * (1 - mat.recycleRate),
    }))
    .filter(r => r.idle > 0)
    .sort((a,b) => b.idle - a.idle);

  if (rows.length === 0) return null;

  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#1a1a1a', marginBottom:4 }}>
        ♻️ What could be recovered if you bring all idle devices to Recupel?
      </div>
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:14 }}>
        Based on current global end-of-life recycling rates per material — see <a href="#methodology" style={{ color:TEAL }} onClick={e=>{e.preventDefault();document.getElementById('methodology')?.scrollIntoView({behavior:'smooth'});}}>methodology note</a> for sources.
      </div>
      <div style={{ background:'#f9fafb', borderRadius:10, overflow:'hidden', border:'1px solid #e5e7eb' }}>
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'160px 1fr 120px 120px', gap:0, background:'#f1f5f9', padding:'9px 16px', fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>
          <div>Material</div>
          <div>Idle stock</div>
          <div style={{ textAlign:'right' }}>Recoverable</div>
          <div style={{ textAlign:'right' }}>Lost</div>
        </div>
        {rows.map((r, idx) => (
          <div key={r.mat.id} style={{ display:'grid', gridTemplateColumns:'160px 1fr 120px 120px', gap:0, padding:'11px 16px', alignItems:'center', background: idx%2===0?'#fff':'#f9fafb', borderTop:'1px solid #f1f5f9' }}>
            {/* Material name + tier */}
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#1a1a1a' }}>
                <span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:r.mat.color, marginRight:6, verticalAlign:'middle' }} />
                {r.mat.label}
              </div>
              <div style={{ fontSize:10, color: r.mat.tier==='strategic'?'#dc2626':r.mat.tier==='critical'?'#d97706':'#6b7280', marginTop:1 }}>
                {r.mat.tier==='strategic'?'⭐ Strategic CRM':r.mat.tier==='critical'?'🔶 Critical CRM':'reference'}
              </div>
            </div>
            {/* Idle bar */}
            <div style={{ paddingRight:16 }}>
              <div style={{ fontSize:12, color:'#374151', marginBottom:4 }}>{fmt(r.idle)}</div>
              <div style={{ background:'#e5e7eb', borderRadius:4, height:6, overflow:'hidden' }}>
                <div style={{ display:'flex', height:'100%' }}>
                  <div style={{ width:`${r.mat.recycleRate*100}%`, background:r.mat.color, borderRadius:'4px 0 0 4px' }} />
                  <div style={{ flex:1, background:`${r.mat.color}25` }} />
                </div>
              </div>
            </div>
            {/* Recoverable */}
            <div style={{ textAlign:'right' }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#15803d' }}>{fmt(r.recovered)}</span>
            </div>
            {/* Lost */}
            <div style={{ textAlign:'right' }}>
              <span style={{ fontSize:12, color:'#dc2626' }}>{fmt(r.lost)}</span>
            </div>
          </div>
        ))}
        {/* Legend row */}
        <div style={{ padding:'8px 16px', background:'#f8fafc', borderTop:'1px solid #e5e7eb', display:'flex', gap:20, fontSize:11, color:'#6b7280' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:12,height:8,borderRadius:2,background:'#15803d' }} />Recoverable (Recupel)</div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:12,height:8,borderRadius:2,background:'#e5e7eb' }} />Lost (current recycling limits)</div>
        </div>
      </div>
    </div>
  );
}

function PreciousMetalsTable({ totals }: { totals:{ active:Partial<Record<MatKey,number>>; idle:Partial<Record<MatKey,number>> } }) {
  const metals = (['gold','silver','copper'] as MatKey[]).map(id => {
    const mat = MATERIALS.find(m=>m.id===id)!;
    const active = totals.active[id]??0;
    const idle   = totals.idle[id]??0;
    return { mat, active, idle };
  }).filter(r => r.active+r.idle > 0);

  if (metals.length === 0) return null;
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10 }}>💰 Precious metals in your devices (reference)</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {metals.map(({ mat, active, idle }) => (
          <div key={mat.id} style={{ background:'#fff', borderRadius:8, border:`1px solid #e5e7eb`, padding:'12px 14px', borderLeft:`3px solid ${mat.color}` }}>
            <div style={{ fontWeight:700, fontSize:13, color:'#1a1a1a' }}>{mat.label} <span style={{ fontSize:11, color:'#6b7280', fontFamily:'monospace' }}>({mat.symbol})</span></div>
            <div style={{ fontSize:20, fontWeight:900, color:mat.color, margin:'6px 0 4px' }}>{fmt(active+idle)}</div>
            <div style={{ fontSize:12, color:'#4b5563' }}>In use: {fmt(active)}</div>
            {idle > 0 && <div style={{ fontSize:12, color:AMBER, fontWeight:600 }}>⚠️ Idle: {fmt(idle)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const NAV = [
  { id:'about',       label:'About',           emoji:'ℹ️' },
  { id:'consumer',    label:'Consumer devices', emoji:'📱' },
  { id:'large',       label:'EV & e-bike',      emoji:'🔋' },
  { id:'results',     label:'Your inventory',   emoji:'📊' },
  { id:'methodology', label:'Methodology',      emoji:'📖' },
];

function Sidebar({ hasAny }: { hasAny:boolean }) {
  const scrollTo = (id:string) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
  return (
    <aside style={{ width:190, flexShrink:0, position:'sticky', top:'calc(var(--nav-height,60px) + 24px)', background:'#fff', borderRadius:10, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'14px 0', height:'fit-content' }}>
      <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', padding:'4px 16px 8px' }}>Sections</div>
      {NAV.map(s => (
        <a key={s.id} href={`#${s.id}`}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 16px', fontSize:13, fontWeight:500, color:'#4b5563', textDecoration:'none' }}
          onClick={e => { e.preventDefault(); scrollTo(s.id); }}>
          <span style={{ fontSize:12 }}>{s.emoji}</span>{s.label}
        </a>
      ))}
      {hasAny && (
        <a href="#results" onClick={e=>{e.preventDefault();scrollTo('results');}}
          style={{ display:'block', margin:'12px 10px 0', padding:'10px 14px', background:TEAL, borderRadius:8, textAlign:'center', textDecoration:'none', color:'#fff', fontSize:13, fontWeight:700 }}>
          See results →
        </a>
      )}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CRMCalculatorPage() {
  const [counts, setCounts] = useState<Counts>(defaultCounts());

  const setCount = (deviceId:string, type:'active'|'idle', val:number) => {
    setCounts(prev => ({ ...prev, [deviceId]: { ...prev[deviceId], [type]: val } }));
  };

  // Compute total grams per material (active vs idle separately)
  const totals = useMemo(() => {
    const active: Partial<Record<MatKey,number>> = {};
    const idle:   Partial<Record<MatKey,number>> = {};
    for (const [devId, cnt] of Object.entries(counts)) {
      const comp = DEVICE_COMPOSITION[devId];
      if (!comp) continue;
      for (const [matId, grams] of Object.entries(comp) as [MatKey, number][]) {
        active[matId] = (active[matId] ?? 0) + cnt.active * grams;
        idle[matId]   = (idle[matId]   ?? 0) + cnt.idle   * grams;
      }
    }
    return { active, idle };
  }, [counts]);

  const hasAny = Object.values(counts).some(c => c.active > 0 || c.idle > 0);
  const hasIdle = Object.values(counts).some(c => c.idle > 0);
  const totalIdleDevices = Object.values(counts).reduce((s,c) => s + c.idle, 0);

  // Chart data by group
  const batteryChart = ['cobalt','lithium'].map(id => {
    const mat = MATERIALS.find(m=>m.id===id)!;
    return { name:mat.label, active: totals.active[id as MatKey]??0, idle: totals.idle[id as MatKey]??0, color:mat.color };
  });

  const reeChart = ['neodymium','dysprosium','praseodymium','terbium'].map(id => {
    const mat = MATERIALS.find(m=>m.id===id)!;
    return { name:mat.label, active: totals.active[id as MatKey]??0, idle: totals.idle[id as MatKey]??0, color:mat.color };
  });

  const semiChart = ['indium','gallium','germanium','tantalum'].map(id => {
    const mat = MATERIALS.find(m=>m.id===id)!;
    return { name:mat.label, active: totals.active[id as MatKey]??0, idle: totals.idle[id as MatKey]??0, color:mat.color };
  });

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg,#f4f4f2)' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg,#083344 0%,#0e7490 55%,#0891b2 100%)', padding:'36px 0 0' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 0 calc(24px + 190px + 32px)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <Link href="/" style={{ color:'#a5f3fc', fontSize:14, fontWeight:600, textDecoration:'none' }}>← Back to home</Link>
            <span style={{ fontSize:12, color:'#67e8f9', fontFamily:'monospace' }}>v1.0 — April 2026</span>
          </div>
          <h1 style={{ fontFamily:'Roboto,sans-serif', fontSize:'clamp(1.6rem,3.5vw,2.3rem)', fontWeight:900, color:'#fff', margin:'0 0 8px', lineHeight:1.1, letterSpacing:'-0.02em' }}>
            Calculators
          </h1>
          <p style={{ fontSize:15, color:'#a5f3fc', maxWidth:560, lineHeight:1.6, margin:0 }}>
            Two tools to understand your environmental footprint.
          </p>
          {/* Tab switcher */}
          <div style={{ display:'flex', gap:4, marginTop:20 }}>
            {[
              { href:'/calculator',     label:'🌿 Carbon Footprint',    active:false },
              { href:'/crm-calculator', label:'⚙️ Critical Materials',  active:true  },
            ].map(tab => (
              <Link key={tab.href} href={tab.href}
                style={{ padding:'8px 20px', borderRadius:'8px 8px 0 0', textDecoration:'none', fontSize:13, fontWeight:700,
                  background: tab.active ? '#fff' : 'rgba(255,255,255,0.12)',
                  color: tab.active ? TEAL : '#e0f7fa',
                  transition:'all 0.15s' }}>
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* White tab bar continuation */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', height:4 }} />

      {/* ── Body ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 80px', display:'flex', gap:32, alignItems:'flex-start' }}>
        <Sidebar hasAny={hasAny} />
        <div style={{ flex:1, minWidth:0 }}>

          {/* About */}
          <div id="about" style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', padding:'22px 28px', marginBottom:16 }}>
            <div style={{ background:TEAL_BG, border:`1px solid ${TEAL_BORDER}`, borderRadius:10, padding:'16px 20px' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#164e63', marginBottom:8 }}>⚙️ What this tool does</div>
              <p style={{ fontSize:13, lineHeight:1.75, color:'#374151', margin:'0 0 10px' }}>
                This calculator estimates the <strong>critical raw materials (CRMs)</strong> physically embedded in your electronic devices — phones, laptops, TVs, and more. It shows how much of each material you hold in active use versus sitting unused in a drawer, and what would be recoverable if you brought idle devices to a Recupel collection point.
              </p>
              <p style={{ fontSize:13, lineHeight:1.75, color:'#374151', margin:0 }}>
                ⚠️ <strong>Idle electronics are a hidden resource.</strong> The average EU household holds 2.5 idle smartphones and 9 unused small electronic items (WEEE Forum 2022). At current recycling rates below 1% for most critical minerals, virtually none of this material is recovered.
              </p>
            </div>
          </div>

          {/* Consumer devices */}
          <SectionCard id="consumer">
            <SectionTitle emoji="📱">Consumer electronics</SectionTitle>
            {CONSUMER_DEVICES.map(dev => (
              <DeviceRow key={dev.id} device={dev}
                active={counts[dev.id]?.active ?? 0}
                idle={counts[dev.id]?.idle ?? 0}
                onActiveChange={v => setCount(dev.id,'active',v)}
                onIdleChange={v => setCount(dev.id,'idle',v)}
                accentActive={TEAL} accentIdle={AMBER} />
            ))}
            <div style={{ fontSize:12, color:'#6b7280', marginTop:10, background:'#f9fafb', borderRadius:6, padding:'8px 12px' }}>
              "In a drawer" = broken, old, or unused devices no longer in active use. These are at risk of never being recycled.
            </div>
          </SectionCard>

          {/* EV & e-bike */}
          <SectionCard id="large">
            <SectionTitle emoji="🔋">Electric vehicle & e-bike</SectionTitle>
            <div style={{ background:AMBER_BG, border:'1px solid #fde68a', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#92400e' }}>
              ⚠️ <strong>Scale note:</strong> An EV battery contains ~10 kg of cobalt — 1,400× more than a smartphone. These devices will dominate the results chart. They are shown separately to avoid making phone/laptop contributions invisible.
            </div>
            {LARGE_DEVICES.map(dev => (
              <DeviceRow key={dev.id} device={dev}
                active={counts[dev.id]?.active ?? 0}
                idle={counts[dev.id]?.idle ?? 0}
                onActiveChange={v => setCount(dev.id,'active',v)}
                onIdleChange={v => setCount(dev.id,'idle',v)}
                accentActive={TEAL} accentIdle={AMBER} />
            ))}
          </SectionCard>

          {/* Results */}
          <div id="results" style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', padding:'24px 28px', marginBottom:16 }}>
            <SectionTitle emoji="📊">Your critical materials inventory</SectionTitle>

            {!hasAny ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:14 }}>
                Enter your devices above to see which critical materials you hold.
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
                  {[
                    { label:'Total devices tracked', value: Object.values(counts).reduce((s,c)=>s+c.active+c.idle,0), unit:'devices', color:TEAL },
                    { label:'Idle (in drawer)', value: totalIdleDevices, unit:'devices', color:AMBER },
                    { label:'EU average idle phones', value:2.5, unit:'per household', color:'#6b7280' },
                  ].map(card => (
                    <div key={card.label} style={{ background:'#f9fafb', borderRadius:8, padding:'14px', borderTop:`3px solid ${card.color}` }}>
                      <div style={{ fontSize:22, fontWeight:900, color:card.color }}>{card.value}</div>
                      <div style={{ fontSize:12, color:'#374151', fontWeight:600, marginTop:2 }}>{card.unit}</div>
                      <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Charts by group */}
                <GroupedBarChart data={batteryChart} title="🔋 Battery materials (Cobalt & Lithium)" />
                <GroupedBarChart data={reeChart} title="🧲 Rare earth elements — permanent magnets" />
                <GroupedBarChart data={semiChart} title="💡 Semiconductors, displays & capacitors" />

                {/* Precious metals — simple table, no chart */}
                <PreciousMetalsTable totals={totals} />

                {/* Recovery table — replaces material cards */}
                {hasIdle && <RecoveryChart totals={totals} />}

                {/* Benchmark */}
                <div style={{ background:'#f9fafb', borderRadius:10, padding:'16px 20px', marginBottom:16 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'#1a1a1a', marginBottom:10 }}>🌍 How does this compare to EU averages?</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:13, color:'#374151' }}>
                    <div style={{ background:'#fff', borderRadius:8, padding:'12px', border:'1px solid #e5e7eb' }}>
                      <div style={{ fontWeight:700, marginBottom:4 }}>Your idle devices</div>
                      <div style={{ fontSize:20, fontWeight:900, color:AMBER }}>{totalIdleDevices}</div>
                      <div style={{ fontSize:11, color:'#6b7280' }}>devices in drawer</div>
                    </div>
                    <div style={{ background:'#fff', borderRadius:8, padding:'12px', border:'1px solid #e5e7eb' }}>
                      <div style={{ fontWeight:700, marginBottom:4 }}>EU average household</div>
                      <div style={{ fontSize:20, fontWeight:900, color:'#6b7280' }}>2.5 + 9</div>
                      <div style={{ fontSize:11, color:'#6b7280' }}>idle phones + small electronics</div>
                    </div>
                  </div>
                </div>

                {/* Recupel CTA */}
                {hasIdle && (
                  <div style={{ background:'linear-gradient(135deg,#083344,#0e7490)', borderRadius:10, padding:'18px 22px', color:'#fff' }}>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>♻️ What to do with your idle devices</div>
                    <p style={{ fontSize:13, lineHeight:1.7, margin:'0 0 12px', color:'#a5f3fc' }}>
                      Bringing your unused electronics to a <strong style={{color:'#fff'}}>Recupel collection point</strong> is the most important action you can take. It keeps materials in the recycling system — and recovery technology is improving rapidly with Umicore's facilities in Hoboken, Antwerp.
                    </p>
                    <p style={{ fontSize:13, lineHeight:1.7, margin:'0 0 14px', color:'#a5f3fc' }}>
                      <strong style={{color:'#fff'}}>Every year a device stays in a drawer</strong>, it becomes harder to recycle (batteries degrade, data concerns grow) and more likely to end up in general waste. Drop-off points are at most supermarkets, post offices and electronics retailers.
                    </p>
                    <a href="https://www.recupel.be/en/"
                      target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', color:TEAL, padding:'9px 18px', borderRadius:8, textDecoration:'none', fontSize:13, fontWeight:700 }}>
                      ♻️ Visit Recupel →
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Methodology */}
          <div id="methodology" style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', padding:'24px 28px' }}>
            <SectionTitle emoji="📖">Methodology & sources</SectionTitle>

            <div style={{ background:AMBER_BG, border:'1px solid #fde68a', borderRadius:8, padding:'14px 16px', marginBottom:16, fontSize:13, color:'#78350f', lineHeight:1.7 }}>
              <strong>Scope:</strong> This tool estimates the critical raw material content of devices based on published lifecycle assessment data for typical consumer models. Values are averages — actual content varies by manufacturer, model year and specification. The tool is designed for awareness and education, not precise material accounting.
            </div>

            {[
              {
                title: '📊 Device composition data',
                items: [
                  { text: 'JRC — Critical Raw Materials for Strategic Technologies and Sectors in the EU (2020)', url: 'https://data.europa.eu/doi/10.2760/366770' },
                  { text: 'OEKO-Institut — Ressourceneffizienz von Unterhaltungselektronik (2021)', url: 'https://www.oeko.de' },
                  { text: 'IEA — The Role of Critical Minerals in Clean Energy Transitions (2021)', url: 'https://www.iea.org/reports/the-role-of-critical-minerals-in-clean-energy-transitions' },
                  { text: 'Buchert et al. (2012) — Critical metals in mobile phones, Fraunhofer IZM', url: 'https://www.oeko.de/oekodoc/1537/2012-449-de.pdf' },
                  { text: 'Graedel et al. (2015) — On the materials basis of modern society, PNAS', url: 'https://doi.org/10.1073/pnas.1312752110' },
                  { text: 'Assumption: values represent typical flagship/mainstream models 2022–2024. EV = 60 kWh NMC battery + permanent magnet motor. E-bike = 400 Wh battery + hub motor.', url: null },
                ],
              },
              {
                title: '♻️ End-of-life recycling rates',
                items: [
                  { text: 'UNEP — Recycling Rates of Metals: A Status Report (2011, Global Metal Flows Working Group)', url: 'https://www.resourcepanel.org/reports/recycling-rates-metals' },
                  { text: 'IEA — Critical Minerals Market Review 2023 (EoL recycling rates by material)', url: 'https://www.iea.org/reports/critical-minerals-market-review-2023' },
                  { text: 'Assumption: EoL recycling rates reflect current global averages for WEEE streams, not optimistic scenarios. For REEs and lithium: <1%. Tantalum: ~30%. Copper: ~50%.', url: null },
                ],
              },
              {
                title: '🏠 Idle device benchmarks',
                items: [
                  { text: 'WEEE Forum — Hoarding Position Paper 2022: EU households hold average 2.5 idle phones (separate count from other small electronics)', url: 'https://www.weee-forum.org/app/uploads/2022/10/WEEE-Forum-Position-Paper-Hoarding.pdf' },
                  { text: 'WEEE Forum — 9 small electrical items per household (hoarded, excluding smartphones — confirmed as non-overlapping count)', url: 'https://www.weee-forum.org' },
                  { text: 'Recupel — Annual Report 2022 (Belgian WEEE collection data)', url: 'https://www.recupel.be/en/annual-report/' },
                ],
              },
              {
                title: '⚙️ EU Critical Raw Materials classification',
                items: [
                  { text: 'European Commission — Critical Raw Materials Act 2024 (Annex I: Strategic, Annex II: Critical)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1252' },
                  { text: 'JRC — Study on Critical Raw Materials 2023 (supply risk and economic importance scores)', url: 'https://op.europa.eu/en/publication-detail/-/publication/57318397-fdd4-11ed-a05c-01aa75ed71a1' },
                  { text: 'Umicore Battery Recycling Campus — Hoboken, Antwerp (world-class NMC battery recycling)', url: 'https://www.umicore.com/en/industries/battery-recycling/' },
                ],
              },
            ].map(section => (
              <div key={section.title} style={{ marginBottom:16, paddingBottom:16, borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#1a1a1a', marginBottom:8 }}>{section.title}</div>
                <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:6 }}>
                  {section.items.map((item, i) => (
                    <li key={i} style={{ display:'flex', gap:10, fontSize:13, lineHeight:1.65, color:'#374151', alignItems:'flex-start' }}>
                      <span style={{ color: item.url ? TEAL : AMBER, flexShrink:0, marginTop:2 }}>
                        {item.url ? '↗' : '⚙️'}
                      </span>
                      <span>
                        {item.url
                          ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color:TEAL, textDecoration:'none', fontWeight:500 }}>{item.text}</a>
                          : <em style={{ color:'#6b7280' }}>{item.text}</em>
                        }
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </div>

      <footer>
        <p>Data sourced from JRC, OEKO-Institut, IEA, WEEE Forum and other official sources. Last updated April 2026.</p>
      </footer>
    </div>
  );
}
