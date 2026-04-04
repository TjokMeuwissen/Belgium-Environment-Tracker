// → app/calculator/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// VERSION
// ─────────────────────────────────────────────────────────────────────────────

const VERSION = 'v1.0 — April 2026';

// ─────────────────────────────────────────────────────────────────────────────
// COLOURS
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT   = '#15803d';   // dark green
const ACCENT_BG = '#f0fdf4';
const ACCENT_BORDER = '#86efac';

const SECTION_COLORS: Record<string,string> = {
  housing:'#f97316', electricity:'#eab308', food:'#16a34a',
  transport:'#3b82f6', flights:'#06b6d4', shopping:'#8b5cf6',
  waste:'#64748b', pets:'#ec4899',
};

// ─────────────────────────────────────────────────────────────────────────────
// EMISSION FACTORS
// ─────────────────────────────────────────────────────────────────────────────

const EF = {
  heating: {
    natural_gas:0.202, heating_oil:0.267, lpg:0.215,
    wood_logs:0.030, wood_pellets:0.040,
    heat_pump_air:0.055, heat_pump_ground:0.041,
    electric_resistance:0.165, district_heating:0.150,
  } as Record<string,number>,
  insulation:{ poor:175, average:120, good:70, passive:25 } as Record<string,number>,
  homeSize:{ studio:40, small:65, medium:105, large:165, xlarge:230 } as Record<string,number>,

  // Electricity defaults: base (kWh/year) by household size × home-size multiplier
  // Base from Fluvius/VREG reference consumption; size multiplier = engineering estimate
  elecBase:{ 1:1800, 2:2500, 3:3500, 4:4000, 5:5000 } as Record<number,number>,
  elecSizeMult:{ studio:0.85, small:0.90, medium:1.00, large:1.15, xlarge:1.30 } as Record<string,number>,

  electricity:0.165,          // kg CO₂eq/kWh (lifecycle, Belgian grid 2023–24 mix)
  heatPumpCOP:{ heat_pump_air:3.0, heat_pump_ground:4.0 } as Record<string,number>,
  solarLifecyclePerkWp:40,    // kg CO₂eq/kWp manufacturing (crystalline Si LCA)
  solarLifetimeYears:25,
  solarYieldPerKwp:900,       // kWh/kWp/year (Belgium average)
  panelWattPeak:400,          // W per standard panel
  panelM2TokWp:0.20,         // kWp per m²

  car:{
    petrol:0.170, diesel:0.157, lpg:0.155, cng:0.130,
    phev:0.105, electric:0.032, hydrogen:0.075,
  } as Record<string,number>,
  transport:{
    train:0.009, metro:0.010, tram:0.011,
    bus_diesel:0.079, bus_electric:0.025,
    coach:0.027, cycling:0.005, walking:0.000,
  } as Record<string,number>,

  flight:{ short:0.153, long:0.193 } as Record<string,number>,
  flightDetour:1.09,
  flightCabin:{ economy:1.0, business:2.5, first:4.0 } as Record<string,number>,
  flightDefaultKm:{ short:1200, medium:3000, long:8000 } as Record<string,number>,

  food:{
    beef:14.474, lamb:16.28, pork:2.794, chicken:1.926,
    fish:2.059, eggs:3.4, dairy:1.106, cheese:9.8,
    butter:9.0, legumes:1.0, cereals:0.95, rice:4.0,
    pasta:1.2, potatoes:0.092, vegetables:0.5, fruit:0.5,
    nuts:3.0, oils:1.5, snacks:2.0, beverages:0.3,
  } as Record<string,number>,
  dietProfiles:{
    vegan:      {beef:0, lamb:0, pork:0, chicken:0, fish:0, eggs:0, dairy:0, cheese:0, butter:0, legumes:120, cereals:250, rice:50, pasta:60, potatoes:150, vegetables:350, fruit:250, nuts:30, oils:30, snacks:30, beverages:100},
    vegetarian: {beef:0, lamb:0, pork:0, chicken:0, fish:0, eggs:25, dairy:250, cheese:20, butter:10, legumes:80, cereals:220, rice:50, pasta:60, potatoes:130, vegetables:300, fruit:220, nuts:20, oils:35, snacks:35, beverages:110},
    flexitarian:{beef:15, lamb:5, pork:20, chicken:30, fish:25, eggs:30, dairy:220, cheese:15, butter:8, legumes:50, cereals:200, rice:40, pasta:50, potatoes:130, vegetables:250, fruit:200, nuts:15, oils:35, snacks:35, beverages:115},
    omnivore:   {beef:40, lamb:10, pork:45, chicken:50, fish:30, eggs:35, dairy:200, cheese:20, butter:10, legumes:30, cereals:190, rice:40, pasta:50, potatoes:130, vegetables:220, fruit:170, nuts:10, oils:35, snacks:40, beverages:120},
    high_meat:  {beef:80, lamb:25, pork:70, chicken:90, fish:30, eggs:35, dairy:180, cheese:15, butter:10, legumes:15, cereals:180, rice:35, pasta:45, potatoes:130, vegetables:190, fruit:140, nuts:10, oils:35, snacks:45, beverages:125},
  } as Record<string,Record<string,number>>,
  calorieModifiers:{ light:0.80, average:1.00, heavy:1.25 } as Record<string,number>,
  foodWaste:{ low:1.10, average:1.15, high:1.25 } as Record<string,number>,

  waste:{ careful:100, poor:320 } as Record<string,number>,

  pets:{
    dog_large:1300, dog_medium:700, dog_small:380,
    cat:450, rabbit:90, guinea_pig:55, hamster:25,
    bird_large:100, bird_small:20, fish:50, horse:4500,
  } as Record<string,number>,

  // Benchmark: UCLouvain consumption-based footprint (same value as indicator page)
  belgianAvg:15.7,
  euAvg:8.5,
  target2c:4.0,
  target15c:2.0,
};

// ─────────────────────────────────────────────────────────────────────────────
// SHOPPING DATA  (all three lifetime tiers)
// ─────────────────────────────────────────────────────────────────────────────

const CLOTHING_ITEMS = [
  { id:'tshirt',    label:'T-shirt / top',     emoji:'👕', total:6,   ltShort:1,   ltAvg:3,   ltLong:8   },
  { id:'jeans',     label:'Jeans / trousers',  emoji:'👖', total:33,  ltShort:2,   ltAvg:5,   ltLong:10  },
  { id:'jacket',    label:'Jacket / coat',     emoji:'🧥', total:25,  ltShort:2,   ltAvg:6,   ltLong:15  },
  { id:'sweater',   label:'Sweater',           emoji:'🧶', total:20,  ltShort:2,   ltAvg:7,   ltLong:20  },
  { id:'shoes',     label:'Shoes (pair)',       emoji:'👟', total:13,  ltShort:1,   ltAvg:4,   ltLong:8   },
  { id:'dress',     label:'Dress / skirt',     emoji:'👗', total:15,  ltShort:1.5, ltAvg:4,   ltLong:10  },
  { id:'underwear', label:'Underwear / socks', emoji:'🧦', total:2,   ltShort:1,   ltAvg:2,   ltLong:4   },
  { id:'handbag',   label:'Bag / handbag',     emoji:'👜', total:12,  ltShort:2,   ltAvg:5,   ltLong:10  },
];

const ELEC_ITEMS = [
  { id:'smartphone', label:'Smartphone',        emoji:'📱', total:70,  ltShort:1.5, ltAvg:3.5, ltLong:6,  shared:false },
  { id:'laptop',     label:'Laptop',            emoji:'💻', total:350, ltShort:3,   ltAvg:5,   ltLong:8,  shared:false },
  { id:'tablet',     label:'Tablet',            emoji:'📟', total:130, ltShort:2,   ltAvg:4,   ltLong:7,  shared:false },
  { id:'tv',         label:'TV (55")',          emoji:'📺', total:400, ltShort:5,   ltAvg:9,   ltLong:15, shared:true  },
  { id:'earbuds',    label:'Wireless earbuds',  emoji:'🎧', total:25,  ltShort:1.5, ltAvg:3,   ltLong:5,  shared:false },
  { id:'console',    label:'Gaming console',    emoji:'🎮', total:120, ltShort:4,   ltAvg:7,   ltLong:12, shared:true  },
];

const FURN_ITEMS = [
  { id:'sofa',       label:'Sofa',             emoji:'🛋️', total:100, ltShort:5,  ltAvg:13, ltLong:25 },
  { id:'bed',        label:'Bed frame',        emoji:'🛏️', total:150, ltShort:8,  ltAvg:18, ltLong:30 },
  { id:'mattress',   label:'Mattress',         emoji:'🛏️', total:150, ltShort:5,  ltAvg:12, ltLong:20 },
  { id:'wardrobe',   label:'Wardrobe',         emoji:'🚪', total:200, ltShort:8,  ltAvg:20, ltLong:40 },
  { id:'washer',     label:'Washing machine',  emoji:'🫧', total:250, ltShort:7,  ltAvg:13, ltLong:20 },
  { id:'fridge',     label:'Refrigerator',     emoji:'🧊', total:300, ltShort:8,  ltAvg:15, ltLong:25 },
  { id:'dishwasher', label:'Dishwasher',       emoji:'🍽️', total:200, ltShort:6,  ltAvg:12, ltLong:20 },
];

function getLifetime(item: { ltShort:number; ltAvg:number; ltLong:number }, pref: string): number {
  if (pref === 'short') return item.ltShort;
  if (pref === 'long')  return item.ltLong;
  return item.ltAvg;
}

const SPEND_CATS = [
  { id:'clothing_new',    label:'Clothing (new)',        emoji:'🛍️', factor:0.55, avgBE:600  },
  { id:'clothing_second', label:'Clothing (secondhand)', emoji:'♻️', factor:0.03, avgBE:100  },
  { id:'electronics',     label:'Electronics / tech',   emoji:'💻', factor:0.45, avgBE:450  },
  { id:'furniture',       label:'Furniture',            emoji:'🛋️', factor:0.45, avgBE:350  },
  { id:'other',           label:'Other goods',          emoji:'📦', factor:0.44, avgBE:600  },
];

const TRANSPORT_MODES = [
  { id:'petrol',     emoji:'⛽', label:'Petrol car'   },
  { id:'diesel',     emoji:'🛢️', label:'Diesel car'   },
  { id:'electric',   emoji:'⚡', label:'Electric car' },
  { id:'phev',       emoji:'🔋', label:'Hybrid (PHEV)'},
  { id:'train',      emoji:'🚆', label:'Train'        },
  { id:'bus_diesel', emoji:'🚌', label:'Bus'          },
  { id:'tram',       emoji:'🚃', label:'Tram / metro' },
  { id:'cycling',    emoji:'🚲', label:'Bicycle'      },
  { id:'walking',    emoji:'🚶', label:'Walking'      },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

interface CalcState {
  householdSize:number;
  homeType:string; homeSize:string; useExactArea:boolean; exactM2:number;
  heatingFuel:string; insulation:string;
  elecKnown:boolean; elecKwh:number;
  hpKwhKnown:boolean; hpKwh:number;
  hasSolar:boolean; solarInput:'panels'|'m2'; solarPanels:number; solarM2:number;
  hasEV:boolean; evKwh:number;
  foodMode:'simple'|'advanced';
  dietType:string; calorieLevel:string; foodWasteLevel:string;
  foodGrams:Record<string,number>;
  commuteKm:number; commuteDaysPerWeek:number; commuteHolidays:number; showHolidayPanel:boolean;
  commuteMode:'single'|'multiple'; commuteSingleMode:string;
  commuteModes:{mode:string;share:number}[];
  carpoolCar:boolean; carpoolPeople:number;
  otherTrips:{mode:string;tripsPerWeek:number;kmOneWay:number}[];
  flightMode:'simple'|'advanced';
  flightsSimple:{haul:string;count:number;cabin:string}[];
  shoppingMode:'simple'|'advanced';
  lifetimePref:'short'|'average'|'long';
  clothingItems:{id:string;countPerYear:number}[];
  elecItems:{id:string;count:number}[];
  furnItems:{id:string;count:number}[];
  spendAmounts:Record<string,number>;
  wasteLevel:string;
  pets:{type:string;count:number}[];
}

const DEFAULT:CalcState = {
  householdSize:2,
  homeType:'terraced', homeSize:'medium', useExactArea:false, exactM2:105,
  heatingFuel:'natural_gas', insulation:'average',
  elecKnown:false, elecKwh:2500,
  hpKwhKnown:false, hpKwh:0,
  hasSolar:false, solarInput:'panels', solarPanels:0, solarM2:0,
  hasEV:false, evKwh:2000,
  foodMode:'simple',
  dietType:'omnivore', calorieLevel:'average', foodWasteLevel:'average',
  foodGrams:{...EF.dietProfiles.omnivore},
  commuteKm:15, commuteDaysPerWeek:4, commuteHolidays:30, showHolidayPanel:false,
  commuteMode:'single', commuteSingleMode:'petrol',
  commuteModes:TRANSPORT_MODES.map((m,i)=>({mode:m.id,share:i===0?100:0})),
  carpoolCar:false, carpoolPeople:2,
  otherTrips:[],
  flightMode:'simple', flightsSimple:[],
  shoppingMode:'simple',
  lifetimePref:'average',
  clothingItems:CLOTHING_ITEMS.map(i=>({id:i.id,countPerYear:0})),
  elecItems:ELEC_ITEMS.map(i=>({id:i.id,count:0})),
  furnItems:FURN_ITEMS.map(i=>({id:i.id,count:0})),
  spendAmounts:Object.fromEntries(SPEND_CATS.map(c=>[c.id,0])),
  wasteLevel:'careful',
  pets:[],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function elecDefault(hh:number, homeSize:string):number {
  const base = EF.elecBase[Math.min(hh,5) as keyof typeof EF.elecBase] ?? 3500;
  const mult = EF.elecSizeMult[homeSize] ?? 1.0;
  return Math.round(base * mult / 100) * 100;
}

function getFloorM2(s:CalcState):number {
  return s.useExactArea ? s.exactM2 : (EF.homeSize[s.homeSize] ?? 105);
}

function isHeatPump(fuel:string):boolean {
  return fuel === 'heat_pump_air' || fuel === 'heat_pump_ground';
}

function calcHpKwhDefault(s:CalcState):number {
  const m2     = getFloorM2(s);
  const demand = EF.insulation[s.insulation] ?? 120;
  const cop    = EF.heatPumpCOP[s.heatingFuel] ?? 3.0;
  return Math.round((m2 * demand / cop) / 100) * 100;
}

function getEF(mode:string):number {
  return EF.car[mode] ?? EF.transport[mode] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function calc(s:CalcState) {
  const hh = Math.max(1, s.householdSize);

  // Floor area — exact or from tile
  const m2     = getFloorM2(s);
  const demand = EF.insulation[s.insulation] ?? 120;

  // Housing — heat pump: 0 here (electricity covers it below)
  const hef    = isHeatPump(s.heatingFuel) ? 0 : (EF.heating[s.heatingFuel] ?? 0.202);
  const housing = (m2 * demand * hef) / hh;

  // Electricity
  const baseKwh = (s.elecKnown ? s.elecKwh : elecDefault(hh, s.homeSize)) + (s.hasEV ? s.evKwh : 0);
  // Heat pump electricity (counted here, not in housing)
  const hpKwh = isHeatPump(s.heatingFuel)
    ? (s.hpKwhKnown ? s.hpKwh : calcHpKwhDefault(s))
    : 0;
  const totalElecKwh = baseKwh + hpKwh;
  let solarKwp = 0;
  if (s.hasSolar) solarKwp = s.solarInput==='panels' ? s.solarPanels*(EF.panelWattPeak/1000) : s.solarM2*EF.panelM2TokWp;
  // Solar: total generation displaces grid kWh per person (floored at 0 — no negative/export credit)
  const solarGenPerPerson = (solarKwp * EF.solarYieldPerKwp) / hh;
  const gridPerPerson = Math.max(0, totalElecKwh/hh - solarGenPerPerson);
  const solarLC = solarKwp>0 ? (solarKwp*EF.solarLifecyclePerkWp)/EF.solarLifetimeYears/hh : 0;
  const electricity = gridPerPerson*EF.electricity + solarLC;

  // Food
  const profile = EF.dietProfiles[s.dietType] ?? EF.dietProfiles.omnivore;
  const calMod  = EF.calorieModifiers[s.calorieLevel] ?? 1;
  const wasteMod= EF.foodWaste[s.foodWasteLevel] ?? 1.15;
  const grams   = s.foodMode==='advanced' ? s.foodGrams : profile;
  let food = 0;
  for (const [k,ef] of Object.entries(EF.food)) food += ((grams[k]??0)*calMod/1000)*ef*365;
  food *= wasteMod;

  // Transport — carpool divisor applies to car modes only
  const CAR_MODES = new Set(['petrol','diesel','electric','phev','lpg','cng','hydrogen']);
  const carpoolDiv = (s.carpoolCar && s.carpoolPeople > 1) ? s.carpoolPeople : 1;
  const workDays = Math.max(0, s.commuteDaysPerWeek*52 - s.commuteHolidays);
  let transport = 0;
  if (s.commuteMode==='single') {
    const ef = getEF(s.commuteSingleMode);
    const div = CAR_MODES.has(s.commuteSingleMode) ? carpoolDiv : 1;
    transport = s.commuteKm*2*workDays*ef/div;
  } else {
    for (const cm of s.commuteModes) {
      const ef = getEF(cm.mode);
      const div = CAR_MODES.has(cm.mode) ? carpoolDiv : 1;
      transport += s.commuteKm*2*workDays*(ef/div)*(cm.share/100);
    }
  }
  for (const t of s.otherTrips) transport += t.tripsPerWeek*52*t.kmOneWay*2*getEF(t.mode);

  // Flights
  let flights = 0;
  for (const f of s.flightsSimple) {
    const km  = EF.flightDefaultKm[f.haul] ?? 1200;
    const fef = km<=3700 ? EF.flight.short : EF.flight.long;
    const cab = EF.flightCabin[f.cabin] ?? 1;
    flights += km*EF.flightDetour*2*fef*cab*f.count;
  }

  // Shopping
  let shopping = 0;
  if (s.shoppingMode==='simple') {
    for (const [id,spend] of Object.entries(s.spendAmounts)) {
      const cat = SPEND_CATS.find(c=>c.id===id);
      shopping += spend*(cat?.factor??0.44);
    }
  } else {
    for (const ci of s.clothingItems) {
      const item = CLOTHING_ITEMS.find(i=>i.id===ci.id);
      if (item && ci.countPerYear>0) shopping += ci.countPerYear*(item.total/getLifetime(item,s.lifetimePref));
    }
    for (const ei of s.elecItems) {
      const item = ELEC_ITEMS.find(i=>i.id===ei.id);
      if (item && ei.count>0) {
        const annual = (item.total/getLifetime(item,s.lifetimePref))*ei.count;
        shopping += item.shared ? annual/hh : annual;
      }
    }
    for (const fi of s.furnItems) {
      const item = FURN_ITEMS.find(i=>i.id===fi.id);
      if (item && fi.count>0) shopping += (item.total/getLifetime(item,s.lifetimePref))*fi.count/hh;
    }
  }

  const waste = EF.waste[s.wasteLevel] ?? 100;
  const pets  = s.pets.reduce((sum,p)=>sum+(EF.pets[p.type]??0)*p.count, 0);
  const total = housing+electricity+food+transport+flights+shopping+waste+pets;
  return {housing,electricity,food,transport,flights,shopping,waste,pets,total};
}

// ─────────────────────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Card({id,emoji,title,color,children}:{id:string;emoji:string;title:string;color:string;children:React.ReactNode}) {
  return (
    <div id={id} style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',padding:'28px 32px',marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,paddingBottom:12,borderBottom:`2px solid ${color}25`}}>
        <div style={{width:36,height:36,borderRadius:8,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{emoji}</div>
        <h2 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Lbl({children}:{children:React.ReactNode}) {
  return <div style={{fontSize:14,fontWeight:600,color:'#374151',marginBottom:8}}>{children}</div>;
}

function Caption({children}:{children:React.ReactNode}) {
  return <div style={{fontSize:13,color:'#4b5563',marginBottom:10,lineHeight:1.55}}>{children}</div>;
}

function Tiles({opts,val,onChange,cols=3}:{opts:{id:string;emoji?:string;label:string;sub?:string}[];val:string;onChange:(v:string)=>void;cols?:number}) {
  return (
    <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:8}}>
      {opts.map(o=>(
        <button key={o.id} onClick={()=>onChange(o.id)}
          style={{padding:'10px 8px',borderRadius:8,border:`2px solid ${val===o.id?ACCENT:'#e5e7eb'}`,background:val===o.id?ACCENT_BG:'#fff',cursor:'pointer',textAlign:'center',transition:'all 0.15s'}}>
          {o.emoji && <div style={{fontSize:20,marginBottom:4}}>{o.emoji}</div>}
          <div style={{fontSize:13,fontWeight:700,color:val===o.id?ACCENT:'#374151',lineHeight:1.3}}>{o.label}</div>
          {o.sub && <div style={{fontSize:12,color:'#6b7280',marginTop:2,lineHeight:1.3}}>{o.sub}</div>}
        </button>
      ))}
    </div>
  );
}

function Num({val,onChange,min=0,max=9999,step=1,unit}:{val:number;onChange:(v:number)=>void;min?:number;max?:number;step?:number;unit?:string}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <input type="number" value={val} min={min} max={max} step={step}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:80,padding:'7px 10px',borderRadius:7,border:'1px solid #d1d5db',fontSize:13,outline:'none'}} />
      {unit && <span style={{fontSize:13,color:'#4b5563'}}>{unit}</span>}
    </div>
  );
}

function Toggle({yes,val,onChange}:{yes:string;val:boolean;onChange:(v:boolean)=>void}) {
  return (
    <div style={{display:'flex',gap:8}}>
      {([true,false] as boolean[]).map(v=>(
        <button key={String(v)} onClick={()=>onChange(v)}
          style={{padding:'7px 18px',borderRadius:7,border:`2px solid ${val===v?ACCENT:'#e5e7eb'}`,background:val===v?ACCENT_BG:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,color:val===v?ACCENT:'#374151'}}>
          {v ? yes : 'No'}
        </button>
      ))}
    </div>
  );
}

function ModeBtn({label,active,onClick}:{label:string;active:boolean;onClick:()=>void}) {
  return (
    <button onClick={onClick}
      style={{padding:'7px 16px',borderRadius:8,border:`2px solid ${active?ACCENT:'#e5e7eb'}`,background:active?ACCENT_BG:'#fff',cursor:'pointer',fontSize:13,fontWeight:600,color:active?ACCENT:'#374151'}}>
      {label}
    </button>
  );
}

function Expander({label,open,onToggle,children}:{label:string;open:boolean;onToggle:()=>void;children:React.ReactNode}) {
  return (
    <div style={{marginTop:10,border:'1px solid #e5e7eb',borderRadius:8}}>
      <button onClick={onToggle} style={{width:'100%',padding:'9px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,color:'#4b5563'}}>
        {label}
        <span style={{transform:open?'rotate(180deg)':'none',transition:'transform 0.2s',display:'inline-block'}}>▾</span>
      </button>
      {open && <div style={{padding:'0 14px 14px'}}>{children}</div>}
    </div>
  );
}

function SubHead({label}:{label:string}) {
  return <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a',marginBottom:10,paddingBottom:8,borderBottom:'1px solid #f3f4f6'}}>{label}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const NAV = [
  {id:'disclaimer',  label:'About',         emoji:'ℹ️'},
  {id:'housing',     label:'Housing',       emoji:'🏠'},
  {id:'electricity', label:'Electricity',   emoji:'⚡'},
  {id:'food',        label:'Food & diet',   emoji:'🍽️'},
  {id:'transport',   label:'Transport',     emoji:'🚗'},
  {id:'flights',     label:'Flights',       emoji:'✈️'},
  {id:'shopping',    label:'Shopping',      emoji:'🛍️'},
  {id:'waste',       label:'Waste',         emoji:'♻️'},
  {id:'pets',        label:'Pets',          emoji:'🐾'},
  {id:'results',     label:'Your results',  emoji:'📊'},
  {id:'methodology', label:'Methodology',   emoji:'📖'},
];

function Sidebar({total}:{total:number}) {
  const scrollTo = (id:string) => document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  return (
    <aside style={{width:190,flexShrink:0,position:'sticky',top:'calc(var(--nav-height,60px) + 24px)',background:'#fff',borderRadius:10,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',padding:'14px 0',height:'fit-content'}}>
      <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#9ca3af',padding:'4px 16px 8px'}}>Sections</div>
      {NAV.map(s=>(
        <a key={s.id} href={`#${s.id}`}
          style={{display:'flex',alignItems:'center',gap:8,padding:'6px 16px',fontSize:13,fontWeight:500,color:'#4b5563',textDecoration:'none'}}
          onClick={e=>{e.preventDefault();scrollTo(s.id);}}>
          <span style={{fontSize:13}}>{s.emoji}</span>{s.label}
        </a>
      ))}
      {total>0 && (
        <div style={{margin:'12px 10px 0',padding:'12px',background:ACCENT_BG,borderRadius:8,textAlign:'center',border:`1px solid ${ACCENT_BORDER}`}}>
          <div style={{fontSize:12,color:ACCENT,fontWeight:600,marginBottom:2}}>Your footprint</div>
          <div style={{fontSize:22,fontWeight:900,color:'#14532d',lineHeight:1}}>{(total/1000).toFixed(1)}</div>
          <div style={{fontSize:12,color:ACCENT}}>t CO₂eq/year</div>
        </div>
      )}
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS
// ─────────────────────────────────────────────────────────────────────────────

function Results({r}:{r:ReturnType<typeof calc>}) {
  const cats = [
    {key:'housing',     label:'Housing',     color:SECTION_COLORS.housing,     value:r.housing},
    {key:'electricity', label:'Electricity', color:SECTION_COLORS.electricity, value:r.electricity},
    {key:'food',        label:'Food',        color:SECTION_COLORS.food,        value:r.food},
    {key:'transport',   label:'Transport',   color:SECTION_COLORS.transport,   value:r.transport},
    {key:'flights',     label:'Flights',     color:SECTION_COLORS.flights,     value:r.flights},
    {key:'shopping',    label:'Shopping',    color:SECTION_COLORS.shopping,    value:r.shopping},
    {key:'waste',       label:'Waste',       color:SECTION_COLORS.waste,       value:r.waste},
    {key:'pets',        label:'Pets',        color:SECTION_COLORS.pets,        value:r.pets},
  ].filter(c=>c.value>0);

  const tt = r.total/1000;
  const pieData = cats.map(c=>({name:c.label,value:Math.round(c.value),fill:c.color}));

  return (
    <div id="results" style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',padding:'28px 32px',marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,paddingBottom:12,borderBottom:'2px solid #f3f4f6'}}>
        <div style={{width:36,height:36,borderRadius:8,background:ACCENT_BG,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📊</div>
        <h2 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Your Results</h2>
      </div>

      {r.total===0 ? (
        <div style={{textAlign:'center',padding:'32px 0',color:'#6b7280',fontSize:14}}>Fill in the sections above to see your carbon footprint.</div>
      ) : (
        <>
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{fontSize:64,fontWeight:900,color:'#14532d',lineHeight:1}}>{tt.toFixed(1)}</div>
            <div style={{fontSize:16,color:'#374151',marginTop:4}}>tonnes CO₂eq per year</div>
            <div style={{fontSize:13,color:'#6b7280',marginTop:6,maxWidth:420,margin:'6px auto 0'}}>
              This reflects your direct lifestyle emissions. See the methodology note below for why this is lower than national averages.
            </div>
          </div>

          <div style={{height:300,marginBottom:24}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((e,i)=><Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v:number)=>[`${(v/1000).toFixed(2)} t CO₂eq`,'']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{marginBottom:24}}>
            {cats.sort((a,b)=>b.value-a.value).map(c=>(
              <div key={c.key} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:3}}>
                  <span style={{fontWeight:600,color:'#374151'}}>{c.label}</span>
                  <span style={{color:'#4b5563'}}>{(c.value/1000).toFixed(2)} t</span>
                </div>
                <div style={{background:'#f3f4f6',borderRadius:4,height:8,overflow:'hidden'}}>
                  <div style={{width:`${Math.min(100,(c.value/r.total)*100)}%`,height:'100%',background:c.color,borderRadius:4,transition:'width 0.5s'}} />
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'#f9fafb',borderRadius:10,padding:'16px 20px',marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700,color:'#1a1a1a',marginBottom:14}}>How does this compare?</div>
            {[
              {label:'Your lifestyle footprint', value:tt,             color:'#14532d'},
              {label:'Belgian average (UCLouvain, consumption-based)', value:15.7, color:'#f97316'},
              {label:'EU average (consumption-based)',                  value:8.5,  color:'#3b82f6'},
              {label:'2°C target (2030)',                              value:4.0,  color:'#8b5cf6'},
              {label:'1.5°C target (2050)',                            value:2.0,  color:ACCENT   },
            ].map(b=>(
              <div key={b.label} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:3}}>
                  <span style={{color:'#374151'}}>{b.label}</span>
                  <span style={{fontWeight:700,color:b.color}}>{b.value.toFixed(1)} t</span>
                </div>
                <div style={{background:'#e5e7eb',borderRadius:4,height:7}}>
                  <div style={{width:`${Math.min(100,(b.value/20)*100)}%`,height:'100%',background:b.color,borderRadius:4}} />
                </div>
              </div>
            ))}
            <div style={{fontSize:13,color:'#6b7280',marginTop:10}}>
              ⚠️ This calculator covers direct lifestyle emissions only. The Belgian average of 15.7 t includes collective services and embedded imports not captured here. See the methodology note below.
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {emoji:'✈️', label:`≈ ${Math.round(r.total/380)} Brussels–Barcelona return flights`},
              {emoji:'🚗', label:`≈ ${Math.round(r.total/0.17/1000).toLocaleString()} km by petrol car`},
              {emoji:'🌳', label:`≈ ${Math.round(r.total/10)} trees needed to offset annually`},
              {emoji:'🥩', label:`≈ ${Math.round(r.total/7)} beef steaks (200g each)`},
            ].map(eq=>(
              <div key={eq.emoji} style={{background:ACCENT_BG,borderRadius:8,padding:'12px 14px',display:'flex',gap:10,alignItems:'center'}}>
                <span style={{fontSize:22}}>{eq.emoji}</span>
                <span style={{fontSize:13,color:'#374151',lineHeight:1.4}}>{eq.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METHODOLOGY NOTE
// ─────────────────────────────────────────────────────────────────────────────

function MethodologyNote() {
  return (
    <div id="methodology" style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',padding:'28px 32px',marginBottom:20}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,paddingBottom:12,borderBottom:'2px solid #f3f4f6'}}>
        <div style={{width:36,height:36,borderRadius:8,background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📖</div>
        <h2 style={{fontSize:18,fontWeight:700,color:'#1a1a1a',margin:0}}>Methodological Note</h2>
      </div>

      <div style={{marginBottom:20,background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'16px 20px'}}>
        <div style={{fontWeight:700,fontSize:14,color:'#92400e',marginBottom:8}}>⚠️ Why is my result lower than the Belgian average?</div>
        <p style={{fontSize:13,lineHeight:1.75,color:'#374151',margin:'0 0 10px'}}>
          The Belgian average footprint shown on this website — <strong>15.7 t CO₂eq/capita</strong> (UCLouvain/VITO study, used in the Indicators section) — is a <strong>full consumption-based footprint</strong>. It captures all emissions caused by Belgian consumption patterns, including:
        </p>
        <ul style={{fontSize:13,lineHeight:1.75,color:'#374151',margin:'0 0 10px',paddingLeft:20}}>
          <li><strong>Collective public services</strong> — healthcare, education, public administration, military, policing (~1.5–2 t CO₂eq per person)</li>
          <li><strong>Financial and business services</strong> — banking, insurance, telecoms, hospitality</li>
          <li><strong>Infrastructure and public investment</strong> — roads, public buildings, water networks</li>
          <li><strong>Embedded imports</strong> — emissions from manufacturing goods abroad (electronics, clothing, food) that are not fully captured in the per-item estimates</li>
        </ul>
        <p style={{fontSize:13,lineHeight:1.75,color:'#374151',margin:0}}>
          This calculator covers the emissions individuals can meaningfully influence through lifestyle choices. A typical Belgian user will get a result of <strong>4–8 t CO₂eq/year</strong> from this calculator. The gap to 15.7 t represents the systemic share — emissions embedded in the economic system that are not individually controllable.
        </p>
      </div>


      {([
        {
          title:'🏠 Housing & Heating',
          items:[
            { label:'Fuel emission factors (kg CO₂eq/kWh delivered heat)', url:'https://www.ipcc-nggip.iges.or.jp/public/2006gl/', source:'IPCC 2006 Guidelines for National Greenhouse Gas Inventories' },
            { label:'Natural gas upstream losses: +9% added to combustion factor', url:null, assumption:'Engineering assumption based on EU pipeline upstream emission studies' },
            { label:'Heat pump COP: air-source 3.0, ground-source 4.0', url:null, assumption:'Conservative averages for Belgian climate conditions (IPCC / ADEME)' },
            { label:'Insulation benchmarks (kWh/m²/year by insulation level)', url:'https://www.energuide.be/en/questions-answers/how-much-co2-does-my-home-emit/68/', source:'Energuide.be / EPB regional statistics (Flanders, Wallonia, Brussels)' },
            { label:'Home size defaults (m²)', url:'https://statbel.fgov.be/nl/themas/bouwen-en-wonen/huisvesting', source:'Statbel housing statistics 2023' },
            { label:'Formula: floor area × heating demand × emission factor ÷ household size', url:null, assumption:'Standard per-capita allocation by household size' },
          ],
        },
        {
          title:'⚡ Electricity',
          items:[
            { label:'Grid emission factor: 0.165 kg CO₂eq/kWh (lifecycle, Belgian grid 2023–24). The direct combustion figure from Elia/Ember is ~138 g CO₂/kWh — we add: upstream methane leakage from the gas supply chain (+~15 g, allocated to the ~25% gas share), nuclear fuel cycle including mining, enrichment and waste management (+~6 g, allocated to the ~47% nuclear share), wind and solar panel manufacturing lifecycle (+~4 g, allocated to the ~22% renewables share), and grid transmission and distribution losses (+~2 g). This brings the total to ~165 g CO₂eq/kWh. A lifecycle figure is more appropriate than the direct combustion figure for a personal footprint calculator, as it captures the full system impact of electricity consumption. This value will be reviewed periodically when the Belgian grid mix changes significantly.', url:'https://opendata.elia.be/explore/dataset/ods191/', source:'Elia Open Data — production-based and consumption-based CO₂ intensity' },
            { label:'Green contracts: same factor applied regardless of contract type — unbundled GOs have negligible additionality', url:'https://ghgprotocol.org/scope_2_guidance', source:'GHG Protocol Scope 2 Guidance / Brander et al. 2018 (Energy Research & Social Science)' },
            { label:'Solar yield: 900 kWh/kWp/year (Belgium average)', url:null, assumption:'Engineering estimate based on Belgian irradiation data (PVGIS / Energuide)' },
            { label:'Solar panel lifecycle: 40 kg CO₂eq/kWp manufacturing, 25-year lifetime', url:null, assumption:'Mid-range estimate from crystalline silicon PV lifecycle assessments (NREL / JRC)' },
            { label:'No export credit for surplus solar generation — electricity footprint floors at 0', url:null, assumption:'Methodological choice to avoid false "carbon negative" impression from a personal footprint perspective' },
            { label:'Electricity defaults by household size', url:'https://www.fluvius.be/nl/thema/groene-stroom-en-warmte/typisch-verbruik', source:'Fluvius / VREG reference consumption figures' },
            { label:'Home size multiplier (studio ×0.85 … very large ×1.30)', url:null, assumption:'Engineering interpolation — no published Belgian source cross-references household size and home size simultaneously' },
          ],
        },
        {
          title:'🍽️ Food & Diet',
          items:[
            { label:'Emission factors (kg CO₂eq/kg food) — most items', url:'https://data.ademe.fr/datasets/agribalyse-31-synthese', source:'Agribalyse 3.2, ADEME — French national average, applicable to Belgium given similar production systems' },
            { label:'Emission factors — processed products (cheese, butter, eggs, bread, pasta, tofu, lentils)', url:'https://doi.org/10.1126/science.aaq0216', source:'Poore & Nemecek 2018, Science — used where Agribalyse agricultural file has data gaps' },
            { label:'Default grams/day per food group by diet type', url:'https://doi.org/10.1007/s10584-014-1169-1', source:'Scarborough et al. 2014, Climatic Change — Oxford EPIC cohort, adapted for Belgian dietary patterns' },
            { label:'Calorie modifiers: light ×0.80, average ×1.00, heavy ×1.25', url:null, assumption:'Applied uniformly across all food groups to scale portions proportionally' },
            { label:'Food waste uplift: low ×1.10, average ×1.15, high ×1.25', url:'https://base-empreinte.ademe.fr', source:'ADEME household food waste methodology' },
          ],
        },
        {
          title:'🚗 Transport (non-flight)',
          items:[
            { label:'Car emission factors per km (well-to-wheel, incl. upstream fuel production)', url:'https://base-empreinte.ademe.fr', source:'ADEME Base Empreinte' },
            { label:'Train (SNCB): 0.009 kg CO₂eq/km/pax', url:'https://www.sncb.be/en/sustainability', source:'SNCB sustainability report' },
            { label:'Metro / tram (STIB): 0.010–0.011 kg CO₂eq/km/pax', url:'https://www.stib-mivb.be', source:'STIB environmental report' },
            { label:'Bus (diesel): 0.079 kg CO₂eq/km/pax', url:'https://www.eea.europa.eu/publications/emep-eea-guidebook-2023', source:'EEA / EMEP-EEA Emissions Guidebook 2023' },
            { label:'Working days: (days/week × 52) − holiday days; default 30 holidays/year', url:null, assumption:'Belgian average of ~10 public holidays + ~20 days standard annual leave' },
            { label:'Carpooling: car emission factor divided by number of occupants', url:null, assumption:'Standard allocation principle — each occupant shares the vehicle emission equally' },
          ],
        },
        {
          title:'✈️ Flights',
          items:[
            { label:'Emission factors per km/pax (economy, incl. Radiative Forcing ×2.0)', url:'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', source:'DEFRA GHG Conversion Factors 2024' },
            { label:'Short-haul (≤ 3,700 km): 0.153 kg CO₂eq/km — Long-haul: 0.193 kg CO₂eq/km', url:'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', source:'DEFRA 2024' },
            { label:'Routing detour correction factor: ×1.09', url:'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', source:'DEFRA standard — accounts for ATC routing, weather avoidance, restricted airspace' },
            { label:'Business class ×1.5 (short) / ×2.5 (long); first class ×4.0', url:'https://www.iata.org/en/programs/environment/carbon-offsetting/', source:'IATA CO₂ calculation methodology 2023' },
            { label:'Default one-way distances: short 1,200 km, medium 3,000 km, long 8,000 km', url:null, assumption:'Representative values for typical Belgian travel patterns — short = Barcelona, medium = Canary Islands, long = New York / Thailand' },
          ],
        },
        {
          title:'🛍️ Shopping',
          items:[
            { label:'Product lifecycle CO₂eq per item (advanced mode)', url:'https://base-empreinte.ademe.fr', source:'ADEME Base Empreinte — supplemented by Apple, Dell, Samsung LCA reports and MIT running shoe study' },
            { label:'Three lifetime tiers (short / average / long) per product', url:'https://base-empreinte.ademe.fr', source:'ADEME Base Empreinte product lifetime categories' },
            { label:'Shared items (TV, appliances, furniture) divided by household size', url:null, assumption:'Standard per-capita allocation — shared goods benefit all household members equally' },
            { label:'Spend-based emission factors (kg CO₂eq/€) by category (simple mode)', url:'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', source:'UK BEIS GHG Conversion Factors — applied as proxy for Belgium given similar consumption patterns' },
            { label:'Belgian average annual spend per category', url:'https://statbel.fgov.be/nl/themas/huishoudens/budget-van-de-gezinnen', source:'Statbel household budget survey — per-person estimates' },
          ],
        },
        {
          title:'♻️ Waste',
          items:[
            { label:'Careful recycler: ~100 kg CO₂eq/person/year', url:'https://base-empreinte.ademe.fr', source:'ADEME lifecycle assessment methodology — residual waste < 50 kg/person/year, remainder sorted' },
            { label:'Poor recycler: ~320 kg CO₂eq/person/year', url:'https://base-empreinte.ademe.fr', source:'ADEME / IPCC waste treatment emission factors — most waste in residual bin' },
            { label:'Belgian context: incineration with energy recovery (not landfill) for most residual waste', url:'https://www.fostplus.be/en', source:'Fost Plus Belgium statistics / OVAM' },
            { label:'Middle tier removed — only two values used to avoid false precision', url:null, assumption:'Simplification: Belgian recycling behaviour is strongly bimodal; a three-tier scale overstates precision' },
          ],
        },
        {
          title:'🐾 Pets',
          items:[
            { label:'Annual CO₂eq per pet type (dogs, cats, small animals)', url:'https://doi.org/10.1371/journal.pone.0181301', source:'Okin GS (2017) — PLOS ONE: "Dogs and cats as environmental pollutants"' },
            { label:'Horse footprint', url:'https://doi.org/10.1016/j.scitotenv.2020.143124', source:'Cerdá et al. (2021), Science of the Total Environment' },
            { label:'Values represent mid-range estimates — actual footprint varies with food brand, wet vs. dry, meat content', url:null, assumption:'High variance: a dog on beef-heavy wet food can emit 2× compared to chicken-based dry food' },
          ],
        },
      ] as {title:string; items:{label:string; url:string|null; source?:string; assumption?:string}[]}[]).map(section=>(
        <div key={section.title} style={{marginBottom:20,paddingBottom:20,borderBottom:'1px solid #f3f4f6'}}>
          <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a',marginBottom:10}}>{section.title}</div>
          <ul style={{margin:0,padding:0,listStyle:'none'}}>
            {section.items.map((item,i)=>(
              <li key={i} style={{display:'flex',gap:10,fontSize:13,lineHeight:1.65,color:'#374151',marginBottom:8,alignItems:'flex-start'}}>
                <span style={{color: item.url ? ACCENT : '#f59e0b', flexShrink:0, marginTop:2, fontSize:14}}>
                  {item.url ? '↗' : '⚙️'}
                </span>
                <span>
                  {item.label}
                  {item.source && item.url && (
                    <> — <a href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{color: ACCENT, textDecoration:'none', fontWeight:500}}>{item.source}</a></>
                  )}
                  {item.assumption && (
                    <span style={{color:'#6b7280', fontStyle:'italic'}}> — assumption: {item.assumption}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [s,setS] = useState<CalcState>(DEFAULT);
  const upd = useCallback(<K extends keyof CalcState>(k:K,v:CalcState[K])=>setS(p=>({...p,[k]:v})),[]);

  // Sync food grams when diet changes (simple mode)
  useEffect(()=>{
    if (s.foodMode==='simple') {
      const p = EF.dietProfiles[s.dietType] ?? EF.dietProfiles.omnivore;
      setS(prev=>({...prev,foodGrams:{...p}}));
    }
  },[s.dietType, s.foodMode]);

  // Update electricity default when household size or home size changes
  useEffect(()=>{
    if (!s.elecKnown) upd('elecKwh', elecDefault(s.householdSize, s.homeSize));
  },[s.householdSize, s.homeSize, s.elecKnown]);

  // Update heat pump kWh default when relevant inputs change
  useEffect(()=>{
    if (isHeatPump(s.heatingFuel) && !s.hpKwhKnown) {
      upd('hpKwh', calcHpKwhDefault(s));
    }
  },[s.heatingFuel, s.insulation, s.homeSize, s.useExactArea, s.exactM2, s.hpKwhKnown]);

  const r = calc(s);

  const setMultiCommute = () => {
    const even = Math.round(100/TRANSPORT_MODES.length);
    setS(p=>({...p,commuteMode:'multiple',commuteModes:TRANSPORT_MODES.map((m,i)=>({mode:m.id,share:i===0?100-even*(TRANSPORT_MODES.length-1):even}))}));
  };

  const updateCommuteShare = (idx:number,val:number)=>{
    setS(prev=>{
      const modes = prev.commuteModes.map(m=>({...m}));
      const clamped = Math.max(0,Math.min(100,val));
      const diff = clamped - modes[idx].share;
      modes[idx].share = clamped;
      const others = modes.filter((_,i)=>i!==idx && modes[i].share>0);
      if (others.length>0 && diff!==0) {
        const perOther = Math.round(diff/others.length);
        for (const o of others) o.share = Math.max(0,o.share-perOther);
        const tot = modes.reduce((s,m)=>s+m.share,0);
        if (tot!==100) modes[idx].share += 100-tot;
      }
      return {...prev,commuteModes:modes};
    });
  };

  const FOOD_LABELS:Record<string,string> = {beef:'Beef',lamb:'Lamb',pork:'Pork',chicken:'Chicken',fish:'Fish',eggs:'Eggs',dairy:'Dairy (milk)',cheese:'Cheese',butter:'Butter',legumes:'Legumes/tofu',cereals:'Cereals/bread',rice:'Rice',pasta:'Pasta',potatoes:'Potatoes',vegetables:'Vegetables',fruit:'Fruit',nuts:'Nuts',oils:'Oils',snacks:'Snacks',beverages:'Beverages'};
  const FOOD_MAX:Record<string,number>  = {beef:200,lamb:100,pork:150,chicken:200,fish:150,eggs:100,dairy:600,cheese:80,butter:30,legumes:250,cereals:400,rice:200,pasta:200,potatoes:400,vegetables:600,fruit:500,nuts:80,oils:80,snacks:150,beverages:500};

  return (
    <div style={{minHeight:'100vh',background:'var(--bg,#f4f4f2)'}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#052e16 0%,#14532d 50%,#15803d 100%)',padding:'40px 0 36px'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px 0 calc(24px + 190px + 32px)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <Link href="/" style={{color:'#86efac',fontSize:14,fontWeight:600,textDecoration:'none'}}>← Back to home</Link>
            <span style={{fontSize:12,color:'#4ade80',fontFamily:'monospace'}}>{VERSION}</span>
          </div>
          <h1 style={{fontFamily:'Roboto,sans-serif',fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:900,color:'#fff',margin:'0 0 10px',lineHeight:1.1,letterSpacing:'-0.02em'}}>Carbon Footprint Calculator</h1>
          <p style={{fontSize:16,color:'#bbf7d0',maxWidth:600,lineHeight:1.6,margin:0}}>Estimate your personal yearly CO₂ footprint — category by category, in minutes.</p>
        </div>
      </div>

      {/* Body */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 24px 80px',display:'flex',gap:32,alignItems:'flex-start'}}>
        <Sidebar total={r.total} />
        <div style={{flex:1,minWidth:0}}>

          {/* Disclaimer */}
          <div id="disclaimer" style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',padding:'22px 32px',marginBottom:20}}>
            <div style={{background:ACCENT_BG,border:`1px solid ${ACCENT_BORDER}`,borderRadius:10,padding:'16px 20px'}}>
              <div style={{fontWeight:700,fontSize:14,color:'#14532d',marginBottom:8}}>ℹ️ A simplified tool for a good estimate</div>
              <p style={{fontSize:13,lineHeight:1.75,color:'#374151',margin:'0 0 10px'}}>
                This calculator gives you a reliable estimate of your personal yearly carbon footprint — not a scientifically precise measurement.
              </p>
              <p style={{fontSize:13,lineHeight:1.75,color:'#374151',margin:'0 0 10px'}}>
                ⚠️ <strong>Your result will be significantly lower than Belgium&apos;s average footprint of 15.7 t CO₂eq/capita</strong> shown on the Indicators page. This is expected and not an error: this calculator covers only the emissions you can directly control through lifestyle choices — heating, transport, food, shopping, and personal consumption. It does not include collective services (healthcare, public administration, military), financial services, infrastructure investment, or the full embedded emissions of imports. These systemic emissions account for roughly half of the national average.
              </p>
              <p style={{fontSize:13,lineHeight:1.75,color:'#374151',margin:0}}>
                More detail on this difference — and on the sources and assumptions used in each section — is provided in the <a href="#methodology" style={{color:ACCENT,fontWeight:600}} onClick={e=>{e.preventDefault();document.getElementById('methodology')?.scrollIntoView({behavior:'smooth'});}}>methodological note</a> at the bottom of this page. All calculations run in your browser. <strong>No personal data is sent to any server.</strong>
              </p>
            </div>
          </div>

          {/* Household size */}
          <div style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',padding:'18px 32px',marginBottom:20,display:'flex',alignItems:'center',gap:20}}>
            <div style={{fontSize:14,fontWeight:600,color:'#374151',flexShrink:0}}>People in your household:</div>
            <div style={{display:'flex',gap:7}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>upd('householdSize',n)}
                  style={{width:40,height:40,borderRadius:8,border:`2px solid ${s.householdSize===n?ACCENT:'#e5e7eb'}`,background:s.householdSize===n?ACCENT_BG:'#fff',fontWeight:700,fontSize:15,color:s.householdSize===n?ACCENT:'#374151',cursor:'pointer'}}>
                  {n}{n===5?'+':''}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Housing */}
          <Card id="housing" emoji="🏠" title="Housing & Heating" color={SECTION_COLORS.housing}>
            <div style={{marginBottom:16}}><Lbl>Home type</Lbl><Tiles cols={4} val={s.homeType} onChange={v=>upd('homeType',v)} opts={[{id:'apartment',emoji:'🏢',label:'Apartment'},{id:'terraced',emoji:'🏘️',label:'Terraced'},{id:'semi',emoji:'🏠',label:'Semi-detached'},{id:'detached',emoji:'🏡',label:'Detached'}]} /></div>
            <div style={{marginBottom:16}}>
              <Lbl>Floor area</Lbl>
              {!s.useExactArea && <Tiles cols={3} val={s.homeSize} onChange={v=>upd('homeSize',v)} opts={[{id:'studio',label:'Studio',sub:'< 50 m²'},{id:'small',label:'Small',sub:'50–80 m²'},{id:'medium',label:'Medium',sub:'80–130 m²'},{id:'large',label:'Large',sub:'130–200 m²'},{id:'xlarge',label:'Very large',sub:'> 200 m²'}]} />}
              {s.useExactArea && (
                <div style={{display:'flex',alignItems:'center',gap:12,marginTop:4}}>
                  <Num val={s.exactM2} onChange={v=>upd('exactM2',v)} min={10} max={1000} unit="m²" />
                  <span style={{fontSize:13,color:'#4b5563'}}>exact floor area</span>
                </div>
              )}
              <button onClick={()=>{ upd('useExactArea',!s.useExactArea); if (!s.useExactArea) upd('exactM2', EF.homeSize[s.homeSize]??105); }}
                style={{marginTop:8,padding:'5px 12px',borderRadius:6,border:'1px solid #d1d5db',background:'#f9fafb',cursor:'pointer',fontSize:12,color:'#4b5563'}}>
                {s.useExactArea ? '← Back to categories' : 'Enter exact m² →'}
              </button>
            </div>
            <div style={{marginBottom:16}}><Lbl>Heating fuel</Lbl><Tiles cols={3} val={s.heatingFuel} onChange={v=>upd('heatingFuel',v)} opts={[{id:'natural_gas',emoji:'🔥',label:'Natural gas'},{id:'heating_oil',emoji:'🛢️',label:'Heating oil'},{id:'heat_pump_air',emoji:'♨️',label:'Heat pump (air)'},{id:'heat_pump_ground',emoji:'🌡️',label:'Heat pump (ground)'},{id:'wood_logs',emoji:'🪵',label:'Wood logs'},{id:'wood_pellets',emoji:'⚪',label:'Wood pellets'},{id:'electric_resistance',emoji:'⚡',label:'Electric (direct)'},{id:'district_heating',emoji:'🏙️',label:'District heating'},{id:'lpg',emoji:'🟡',label:'LPG / propane'}]} /></div>
            {isHeatPump(s.heatingFuel) && (
              <div style={{background:'#ecfeff',border:'1px solid #a5f3fc',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:13,color:'#164e63'}}>
                ♨️ Heat pump electricity is tracked in the <strong>Electricity</strong> section below.
              </div>
            )}
            <div><Lbl>Insulation level</Lbl><Tiles cols={2} val={s.insulation} onChange={v=>upd('insulation',v)} opts={[{id:'poor',emoji:'🥶',label:'Poorly insulated',sub:'Pre-1980, no upgrades'},{id:'average',emoji:'🏠',label:'Average',sub:'1980–2010, some upgrades'},{id:'good',emoji:'✅',label:'Well insulated',sub:'Post-2010 or major renovation'},{id:'passive',emoji:'⭐',label:'Near-passive',sub:'BEN / passief label'}]} /></div>
          </Card>

          {/* 2. Electricity */}
          <Card id="electricity" emoji="⚡" title="Electricity" color={SECTION_COLORS.electricity}>
            <div style={{marginBottom:16}}>
              <Lbl>Household electricity (lighting, appliances, etc.)</Lbl>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <Toggle yes="Yes — I'll enter my kWh" val={s.elecKnown} onChange={v=>upd('elecKnown',v)} />
                {!s.elecKnown && <span style={{fontSize:13,color:'#4b5563'}}>Using default: <strong>{elecDefault(s.householdSize,s.homeSize).toLocaleString()} kWh/year</strong></span>}
              </div>
              {s.elecKnown && <div style={{marginTop:10}}><Num val={s.elecKwh} onChange={v=>upd('elecKwh',v)} min={0} max={20000} step={100} unit="kWh/year" /></div>}
            </div>

            {/* Heat pump electricity — only shown when heat pump selected */}
            {isHeatPump(s.heatingFuel) && (
              <div style={{marginBottom:16,background:'#ecfeff',border:'1px solid #a5f3fc',borderRadius:10,padding:'14px 16px'}}>
                <Lbl>♨️ Heat pump electricity</Lbl>
                <Caption>
                  Estimated from your floor area ({getFloorM2(s)} m²), insulation level, and COP {EF.heatPumpCOP[s.heatingFuel] ?? 3.0}.
                  This replaces the heating emission factor — no double-counting.
                </Caption>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <Toggle yes="I know my heat pump kWh" val={s.hpKwhKnown} onChange={v=>{upd('hpKwhKnown',v); if(!v) upd('hpKwh', calcHpKwhDefault(s));}} />
                  {!s.hpKwhKnown && <span style={{fontSize:13,color:'#164e63'}}>Estimated: <strong>{calcHpKwhDefault(s).toLocaleString()} kWh/year</strong></span>}
                </div>
                {s.hpKwhKnown && <div style={{marginTop:10}}><Num val={s.hpKwh} onChange={v=>upd('hpKwh',v)} min={0} max={30000} step={100} unit="kWh/year" /></div>}
              </div>
            )}
            <div style={{marginBottom:16}}>
              <Lbl>Do you have rooftop solar panels?</Lbl>
              <Toggle yes="Yes" val={s.hasSolar} onChange={v=>upd('hasSolar',v)} />
              {s.hasSolar && (
                <div style={{background:'#f9fafb',borderRadius:8,padding:'12px 14px',marginTop:10}}>
                  <div style={{display:'flex',gap:8,marginBottom:10}}>
                    <ModeBtn label="Number of panels" active={s.solarInput==='panels'} onClick={()=>upd('solarInput','panels')} />
                    <ModeBtn label="Area in m²" active={s.solarInput==='m2'} onClick={()=>upd('solarInput','m2')} />
                  </div>
                  {s.solarInput==='panels'
                    ? <Num val={s.solarPanels} onChange={v=>upd('solarPanels',v)} min={0} max={100} unit={`panels ≈ ${(s.solarPanels*0.4).toFixed(1)} kWp`} />
                    : <Num val={s.solarM2} onChange={v=>upd('solarM2',v)} min={0} max={200} unit={`m² ≈ ${(s.solarM2*0.2).toFixed(1)} kWp`} />}
                </div>
              )}
            </div>
            <div>
              <Lbl>Do you charge an electric vehicle at home?</Lbl>
              <Toggle yes="Yes" val={s.hasEV} onChange={v=>upd('hasEV',v)} />
              {s.hasEV && <div style={{marginTop:10}}><Num val={s.evKwh} onChange={v=>upd('evKwh',v)} min={0} max={10000} step={100} unit="kWh/year for EV charging" /></div>}
            </div>
          </Card>

          {/* 3. Food */}
          <Card id="food" emoji="🍽️" title="Food & Diet" color={SECTION_COLORS.food}>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              <ModeBtn label="Simple — diet type" active={s.foodMode==='simple'} onClick={()=>upd('foodMode','simple')} />
              <ModeBtn label="Advanced — adjust per food group" active={s.foodMode==='advanced'} onClick={()=>upd('foodMode','advanced')} />
            </div>

            {s.foodMode==='simple' ? (
              <>
                <div style={{marginBottom:16}}><Lbl>Diet type</Lbl><Tiles cols={3} val={s.dietType} onChange={v=>upd('dietType',v)} opts={[{id:'vegan',emoji:'🌱',label:'Vegan',sub:'No animal products'},{id:'vegetarian',emoji:'🥗',label:'Vegetarian',sub:'Dairy & eggs, no meat'},{id:'flexitarian',emoji:'🍳',label:'Flexitarian',sub:'Meat 1–3×/week'},{id:'omnivore',emoji:'🍖',label:'Omnivore',sub:'Meat most days'},{id:'high_meat',emoji:'🥩',label:'High meat',sub:'Meat every meal'}]} /></div>
                <div style={{marginBottom:16}}><Lbl>How much do you eat?</Lbl><Tiles cols={3} val={s.calorieLevel} onChange={v=>upd('calorieLevel',v)} opts={[{id:'light',emoji:'🍱',label:'Light',sub:'~1,600 kcal/day'},{id:'average',emoji:'🍽️',label:'Average',sub:'~2,000 kcal/day'},{id:'heavy',emoji:'🍔',label:'Large',sub:'~2,500 kcal/day'}]} /></div>
                <div><Lbl>Food waste</Lbl><Tiles cols={3} val={s.foodWasteLevel} onChange={v=>upd('foodWasteLevel',v)} opts={[{id:'low',emoji:'✅',label:'Very little',sub:'Meal planning'},{id:'average',emoji:'🗑️',label:'Some',sub:'Belgian average'},{id:'high',emoji:'❌',label:'A lot',sub:'Often discard food'}]} /></div>
              </>
            ) : (
              <>
                <Caption>Adjust each food group using the sliders. Values are in grams per day.</Caption>
                <div style={{marginBottom:16}}><Lbl>How much do you eat overall?</Lbl><Tiles cols={3} val={s.calorieLevel} onChange={v=>upd('calorieLevel',v)} opts={[{id:'light',emoji:'🍱',label:'Light',sub:'~1,600 kcal/day'},{id:'average',emoji:'🍽️',label:'Average',sub:'~2,000 kcal/day'},{id:'heavy',emoji:'🍔',label:'Large',sub:'~2,500 kcal/day'}]} /></div>
                <div style={{marginBottom:16}}><Lbl>Food waste</Lbl><Tiles cols={3} val={s.foodWasteLevel} onChange={v=>upd('foodWasteLevel',v)} opts={[{id:'low',emoji:'✅',label:'Very little',sub:'Meal planning'},{id:'average',emoji:'🗑️',label:'Some',sub:'Belgian average'},{id:'high',emoji:'❌',label:'A lot',sub:'Often discard food'}]} /></div>
                {Object.entries(s.foodGrams).map(([k,g])=>(
                  <div key={k} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <div style={{width:120,fontSize:13,color:'#374151',flexShrink:0}}>{FOOD_LABELS[k]??k}</div>
                    <input type="range" min={0} max={FOOD_MAX[k]??300} step={5} value={g}
                      onChange={e=>setS(p=>({...p,foodGrams:{...p.foodGrams,[k]:Number(e.target.value)}}))}
                      style={{flex:1,accentColor:ACCENT}} />
                    <div style={{width:80,fontSize:13,color:'#4b5563',textAlign:'right',whiteSpace:'nowrap'}}>{g} g/day</div>
                  </div>
                ))}
              </>
            )}
          </Card>

          {/* 4. Transport */}
          <Card id="transport" emoji="🚗" title="Transport" color={SECTION_COLORS.transport}>
            <SubHead label="🏢 Commuting" />
            <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:14}}>
              <div><Lbl>One-way distance to work</Lbl><Num val={s.commuteKm} onChange={v=>upd('commuteKm',v)} min={0} max={300} unit="km" /></div>
              <div>
                <Lbl>Days per week in the office</Lbl>
                <div style={{display:'flex',gap:6}}>
                  {[0,1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>upd('commuteDaysPerWeek',n)}
                      style={{width:36,height:36,borderRadius:6,border:`2px solid ${s.commuteDaysPerWeek===n?ACCENT:'#e5e7eb'}`,background:s.commuteDaysPerWeek===n?ACCENT_BG:'#fff',fontWeight:700,fontSize:13,color:s.commuteDaysPerWeek===n?ACCENT:'#374151',cursor:'pointer'}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Expander label={`Adjust working days/year — currently ${Math.max(0,s.commuteDaysPerWeek*52-s.commuteHolidays)} days`} open={s.showHolidayPanel} onToggle={()=>upd('showHolidayPanel',!s.showHolidayPanel)}>
              <div style={{marginTop:8}}><Lbl>Holiday + public holiday days per year</Lbl><Num val={s.commuteHolidays} onChange={v=>upd('commuteHolidays',v)} min={0} max={120} unit="days" /></div>
            </Expander>
            <div style={{marginTop:16}}>
              <Lbl>How do you get to work?</Lbl>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <ModeBtn label="One main mode" active={s.commuteMode==='single'} onClick={()=>upd('commuteMode','single')} />
                <ModeBtn label="Multiple modes" active={s.commuteMode==='multiple'} onClick={setMultiCommute} />
              </div>
              {s.commuteMode==='single'
                ? <>
                    <Tiles cols={3} val={s.commuteSingleMode} onChange={v=>upd('commuteSingleMode',v)} opts={TRANSPORT_MODES} />
                    {/* Carpool — only for car modes */}
                    {['petrol','diesel','electric','phev','lpg','cng','hydrogen'].includes(s.commuteSingleMode) && (
                      <div style={{marginTop:14,background:'#f9fafb',borderRadius:8,padding:'12px 14px'}}>
                        <Lbl>Do you carpool?</Lbl>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <Toggle yes="Yes" val={s.carpoolCar} onChange={v=>upd('carpoolCar',v)} />
                          {s.carpoolCar && (
                            <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:8}}>
                              <span style={{fontSize:13,color:'#374151'}}>Total people in car (incl. you):</span>
                              <div style={{display:'flex',gap:5}}>
                                {[2,3,4,5].map(n=>(
                                  <button key={n} onClick={()=>upd('carpoolPeople',n)}
                                    style={{width:32,height:32,borderRadius:6,border:`2px solid ${s.carpoolPeople===n?ACCENT:'#e5e7eb'}`,background:s.carpoolPeople===n?ACCENT_BG:'#fff',fontWeight:700,fontSize:13,color:s.carpoolPeople===n?ACCENT:'#374151',cursor:'pointer'}}>
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                : (
                  <div style={{background:'#f9fafb',borderRadius:8,padding:'14px 16px'}}>
                    <Caption>Enter the share (%) for each transport mode. Total must equal 100%.</Caption>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                      {s.commuteModes.map((cm,idx)=>{
                        const opt = TRANSPORT_MODES.find(o=>o.id===cm.mode);
                        if (!opt) return null;
                        const isActive = cm.share > 0;
                        return (
                          <div key={cm.mode}
                            style={{background:isActive?ACCENT_BG:'#fff',borderRadius:8,padding:'10px 12px',border:`2px solid ${isActive?ACCENT:'#e5e7eb'}`,textAlign:'center'}}>
                            <div style={{fontSize:20,marginBottom:4}}>{opt.emoji}</div>
                            <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8}}>{opt.label}</div>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                              <input type="number" value={cm.share} min={0} max={100} step={5}
                                onChange={e=>updateCommuteShare(idx,Number(e.target.value))}
                                style={{width:52,padding:'5px 6px',borderRadius:6,border:`1px solid ${isActive?ACCENT:'#d1d5db'}`,fontSize:13,textAlign:'center',outline:'none'}} />
                              <span style={{fontSize:13,color:'#4b5563'}}>%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:s.commuteModes.reduce((t,m)=>t+m.share,0)===100?ACCENT:'#dc2626',marginBottom:s.carpoolCar?10:0}}>
                      Total: {s.commuteModes.reduce((t,m)=>t+m.share,0)}% {s.commuteModes.reduce((t,m)=>t+m.share,0)===100?'✓':'(must equal 100%)'}
                    </div>
                    {/* Carpool — only shown if any car mode has share > 0 */}
                    {s.commuteModes.some(m=>m.share>0 && ['petrol','diesel','electric','phev','lpg','cng','hydrogen'].includes(m.mode)) && (
                      <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #e5e7eb'}}>
                        <Lbl>Do you carpool for the car portion?</Lbl>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <Toggle yes="Yes" val={s.carpoolCar} onChange={v=>upd('carpoolCar',v)} />
                          {s.carpoolCar && (
                            <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:8}}>
                              <span style={{fontSize:13,color:'#374151'}}>Total people in car (incl. you):</span>
                              <div style={{display:'flex',gap:5}}>
                                {[2,3,4,5].map(n=>(
                                  <button key={n} onClick={()=>upd('carpoolPeople',n)}
                                    style={{width:32,height:32,borderRadius:6,border:`2px solid ${s.carpoolPeople===n?ACCENT:'#e5e7eb'}`,background:s.carpoolPeople===n?ACCENT_BG:'#fff',fontWeight:700,fontSize:13,color:s.carpoolPeople===n?ACCENT:'#374151',cursor:'pointer'}}>
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div style={{marginTop:24}}>
              <SubHead label="🗺️ Other regular trips" />
              <Caption>Add regular non-commute trips. One-way distance entered — return trip calculated automatically.</Caption>
              {s.otherTrips.map((t,idx)=>(
                <div key={idx} style={{background:'#f9fafb',borderRadius:8,padding:'12px 14px',marginBottom:8,display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
                  <div><Lbl>Mode</Lbl><select value={t.mode} onChange={e=>{const trips=[...s.otherTrips];trips[idx]={...trips[idx],mode:e.target.value};upd('otherTrips',trips);}} style={{padding:'7px 10px',borderRadius:6,border:'1px solid #d1d5db',fontSize:13}}>{TRANSPORT_MODES.map(o=><option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}</select></div>
                  <div><Lbl>Times/week</Lbl><Num val={t.tripsPerWeek} onChange={v=>{const trips=[...s.otherTrips];trips[idx]={...trips[idx],tripsPerWeek:v};upd('otherTrips',trips);}} min={0} max={14} step={0.5} /></div>
                  <div><Lbl>One-way km</Lbl><Num val={t.kmOneWay} onChange={v=>{const trips=[...s.otherTrips];trips[idx]={...trips[idx],kmOneWay:v};upd('otherTrips',trips);}} min={0} max={500} unit="km" /></div>
                  <button onClick={()=>upd('otherTrips',s.otherTrips.filter((_,i)=>i!==idx))} style={{padding:'7px 12px',borderRadius:6,border:'1px solid #fca5a5',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:13}}>Remove</button>
                </div>
              ))}
              <button onClick={()=>upd('otherTrips',[...s.otherTrips,{mode:'petrol',tripsPerWeek:1,kmOneWay:10}])} style={{padding:'8px 16px',borderRadius:8,border:`2px dashed ${ACCENT}`,background:'transparent',color:ACCENT,cursor:'pointer',fontSize:13,fontWeight:600,width:'100%',marginTop:4}}>+ Add a trip</button>
            </div>
          </Card>

          {/* 5. Flights */}
          <Card id="flights" emoji="✈️" title="Flights" color={SECTION_COLORS.flights}>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              <ModeBtn label="Simple — by haul type" active={s.flightMode==='simple'} onClick={()=>upd('flightMode','simple')} />
              <ModeBtn label="Advanced — enter airports" active={s.flightMode==='advanced'} onClick={()=>upd('flightMode','advanced')} />
            </div>
            {s.flightMode==='simple' ? (
              <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  {[
                    {haul:'short', emoji:'🏖️',label:'Short-haul', sub:'Europe, < 3,700 km',example:'e.g. Barcelona'},
                    {haul:'medium',emoji:'🌍',label:'Medium-haul',sub:'~3,000 km',           example:'e.g. Canary Islands'},
                    {haul:'long',  emoji:'🌏',label:'Long-haul',  sub:'> 3,700 km',           example:'e.g. New York'},
                  ].map(h=>{
                    const ex = s.flightsSimple.find(f=>f.haul===h.haul);
                    const count = ex?.count??0;
                    return (
                      <div key={h.haul} style={{background:count>0?'#ecfeff':'#f9fafb',borderRadius:10,padding:'14px 12px',border:`1px solid ${count>0?'#a5f3fc':'#e5e7eb'}`}}>
                        <div style={{fontSize:24,marginBottom:4}}>{h.emoji}</div>
                        <div style={{fontSize:13,fontWeight:700,color:'#1a1a1a',marginBottom:1}}>{h.label}</div>
                        <div style={{fontSize:13,color:'#4b5563',marginBottom:2}}>{h.sub}</div>
                        <div style={{fontSize:13,color:'#6b7280',marginBottom:10}}>{h.example}</div>
                        <Lbl>Return flights/year</Lbl>
                        <Num val={count} min={0} max={50} onChange={v=>{const fl=s.flightsSimple.filter(f=>f.haul!==h.haul);if(v>0)fl.push({haul:h.haul,count:v,cabin:ex?.cabin??'economy'});upd('flightsSimple',fl);}} />
                        {count>0 && (
                          <div style={{marginTop:10}}>
                            <Lbl>Cabin class</Lbl>
                            <select value={ex?.cabin??'economy'} onChange={e=>{const fl=s.flightsSimple.map(f=>f.haul===h.haul?{...f,cabin:e.target.value}:f);upd('flightsSimple',fl);}} style={{padding:'5px 8px',borderRadius:6,border:'1px solid #d1d5db',fontSize:13,width:'100%'}}>
                              <option value="economy">Economy</option>
                              <option value="business">Business (×2.5)</option>
                              <option value="first">First (×4.0)</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{background:'#f9fafb',borderRadius:8,padding:'20px',textAlign:'center',color:'#6b7280',fontSize:13,border:'2px dashed #e5e7eb'}}>
                🔧 Airport search (advanced mode) coming soon. Use simple mode for now.
              </div>
            )}
          </Card>

          {/* 6. Shopping */}
          <Card id="shopping" emoji="🛍️" title="Shopping" color={SECTION_COLORS.shopping}>
            <div style={{display:'flex',gap:8,marginBottom:16}}>
              <ModeBtn label="Simple — annual spend" active={s.shoppingMode==='simple'} onClick={()=>upd('shoppingMode','simple')} />
              <ModeBtn label="Advanced — item by item" active={s.shoppingMode==='advanced'} onClick={()=>upd('shoppingMode','advanced')} />
            </div>

            {s.shoppingMode==='simple' ? (
              <div>
                <Caption>Enter your approximate annual spending by category.</Caption>
                {SPEND_CATS.map(cat=>(
                  <div key={cat.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                    <span style={{fontSize:18,width:24,flexShrink:0}}>{cat.emoji}</span>
                    <div style={{flex:1,fontSize:13,color:'#374151'}}>{cat.label}</div>
                    <Num val={s.spendAmounts[cat.id]??0} onChange={v=>upd('spendAmounts',{...s.spendAmounts,[cat.id]:v})} min={0} max={10000} step={50} unit="€/year" />
                    <div style={{fontSize:12,color:'#9ca3af',whiteSpace:'nowrap',minWidth:80}}>avg. ~€{cat.avgBE}/yr</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{fontSize:13,color:'#374151',marginBottom:16,background:'#fefce8',border:'1px solid #fde68a',borderRadius:7,padding:'10px 14px'}}>
                  ⭐ Better accuracy: footprint allocated over product lifetime. Items shared by household (🏠) are divided by household size.
                </div>

                {/* Lifetime preference */}
                <div style={{marginBottom:20}}>
                  <Lbl>How long do you typically keep your products?</Lbl>
                  <Tiles cols={3} val={s.lifetimePref} onChange={v=>upd('lifetimePref',v as 'short'|'average'|'long')} opts={[
                    {id:'short',  emoji:'🔄', label:'Short',   sub:'Upgrade often, follow trends'},
                    {id:'average',emoji:'⏱️', label:'Average', sub:'Replace when broken'},
                    {id:'long',   emoji:'♻️', label:'Long',    sub:'Keep until worn out'},
                  ]} />
                </div>

                <SubHead label="👕 Clothing — items bought per year" />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
                  {CLOTHING_ITEMS.map(item=>{
                    const ci = s.clothingItems.find(c=>c.id===item.id);
                    return (
                      <div key={item.id} style={{background:'#f9fafb',borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:18,flexShrink:0}}>{item.emoji}</span>
                        <div style={{flex:1,fontSize:13,color:'#374151'}}>{item.label}</div>
                        <Num val={ci?.countPerYear??0} min={0} max={50} onChange={v=>{const items=s.clothingItems.map(c=>c.id===item.id?{...c,countPerYear:v}:c);upd('clothingItems',items);}} unit="/yr" />
                      </div>
                    );
                  })}
                </div>

                <SubHead label="💻 Electronics — items currently owned" />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
                  {ELEC_ITEMS.map(item=>{
                    const ei = s.elecItems.find(e=>e.id===item.id);
                    return (
                      <div key={item.id} style={{background:'#f9fafb',borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:18,flexShrink:0}}>{item.emoji}</span>
                        <div style={{flex:1,fontSize:13,color:'#374151'}}>{item.label}{item.shared?' 🏠':''}</div>
                        <Num val={ei?.count??0} min={0} max={10} onChange={v=>{const items=s.elecItems.map(e=>e.id===item.id?{...e,count:v}:e);upd('elecItems',items);}} />
                      </div>
                    );
                  })}
                </div>

                <SubHead label="🛋️ Furniture & appliances — currently owned (🏠 shared by household)" />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {FURN_ITEMS.map(item=>{
                    const fi = s.furnItems.find(f=>f.id===item.id);
                    return (
                      <div key={item.id} style={{background:'#f9fafb',borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:18,flexShrink:0}}>{item.emoji}</span>
                        <div style={{flex:1,fontSize:13,color:'#374151'}}>{item.label}</div>
                        <Num val={fi?.count??0} min={0} max={10} onChange={v=>{const items=s.furnItems.map(f=>f.id===item.id?{...f,count:v}:f);upd('furnItems',items);}} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* 7. Waste */}
          <Card id="waste" emoji="♻️" title="Waste & Recycling" color={SECTION_COLORS.waste}>
            <Caption>How well do you sort and recycle your household waste?</Caption>
            <Tiles cols={2} val={s.wasteLevel} onChange={v=>upd('wasteLevel',v)} opts={[
              {id:'careful',emoji:'✅',label:'Careful recycler',sub:'PMD, glass, organic all sorted correctly (~100 kg CO₂eq/yr)'},
              {id:'poor',   emoji:'🗑️',label:'Mostly residual bin',sub:'Little sorting, most waste in black bag (~320 kg CO₂eq/yr)'},
            ]} />
          </Card>

          {/* 8. Pets */}
          <Card id="pets" emoji="🐾" title="Pets" color={SECTION_COLORS.pets}>
            <Caption>~80–90% of a pet&apos;s carbon footprint comes from their food — primarily its meat content.</Caption>
            {s.pets.map((pet,idx)=>(
              <div key={idx} style={{background:'#f9fafb',borderRadius:8,padding:'12px 14px',marginBottom:8,display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
                <div><Lbl>Pet type</Lbl>
                  <select value={pet.type} onChange={e=>{const pets=[...s.pets];pets[idx]={...pets[idx],type:e.target.value};upd('pets',pets);}} style={{padding:'7px 10px',borderRadius:6,border:'1px solid #d1d5db',fontSize:13}}>
                    {[['dog_large','🐕 Large dog (>25 kg)'],['dog_medium','🐕 Medium dog (10–25 kg)'],['dog_small','🐕 Small dog (<10 kg)'],['cat','🐈 Cat'],['rabbit','🐇 Rabbit'],['guinea_pig','🐹 Guinea pig'],['hamster','🐹 Hamster'],['bird_large','🦜 Parrot / large bird'],['bird_small','🐦 Budgie / small bird'],['fish','🐠 Aquarium fish'],['horse','🐴 Horse']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div><Lbl>Count</Lbl><Num val={pet.count} onChange={v=>{const pets=[...s.pets];pets[idx]={...pets[idx],count:v};upd('pets',pets);}} min={1} max={20} /></div>
                <button onClick={()=>upd('pets',s.pets.filter((_,i)=>i!==idx))} style={{padding:'7px 12px',borderRadius:6,border:'1px solid #fca5a5',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:13}}>Remove</button>
              </div>
            ))}
            <button onClick={()=>upd('pets',[...s.pets,{type:'cat',count:1}])} style={{padding:'8px 16px',borderRadius:8,border:`2px dashed ${SECTION_COLORS.pets}`,background:'transparent',color:SECTION_COLORS.pets,cursor:'pointer',fontSize:13,fontWeight:600,width:'100%',marginTop:4}}>+ Add a pet</button>
          </Card>

          {/* Results */}
          <Results r={r} />

          {/* Methodology */}
          <MethodologyNote />

        </div>
      </div>
      <footer><p>Data sourced from EEA, Eurostat, ADEME, IPCC, DEFRA and other official sources. Last updated April 2026.</p></footer>
    </div>
  );
}
