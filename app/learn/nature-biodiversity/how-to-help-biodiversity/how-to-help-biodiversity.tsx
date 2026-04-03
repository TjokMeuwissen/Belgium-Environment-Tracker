// → app/learn/nature-biodiversity/how-to-help-biodiversity/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface Tip {
  id: string;
  emoji: string;
  title: string;
  teaser: string;
  detail: string;
}

interface Theme {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bg: string;
  tips: Tip[];
}

// ── Content ───────────────────────────────────────────────────────────────────

const THEMES: Theme[] = [
  {
    id: 'food',
    emoji: '🍽️',
    label: 'Food',
    color: '#c2410c',
    bg: '#fff7ed',
    tips: [
      {
        id: 'food-1',
        emoji: '🐄',
        title: 'Eat less meat — especially beef and lamb',
        teaser: 'Livestock farming is the largest source of ammonia emissions in Belgium, which deposits nitrogen on surrounding habitats.',
        detail: 'Intensive livestock farming is the single largest source of ammonia emissions in Belgium. Ammonia deposits nitrogen on surrounding land, which acidifies soils and fertilises them — both fatal for the slow-growing, specialised plants that define heathlands, peat bogs, and chalk grasslands. These are precisely the habitats in the worst conservation status in Belgium. Reducing beef consumption is the most direct dietary lever for lowering nitrogen pressure on local nature.',
      },
      {
        id: 'food-2',
        emoji: '🌿',
        title: 'Choose organic food',
        teaser: 'Organic certification prohibits synthetic pesticides, which is critical for Belgium\'s declining pollinator populations.',
        detail: 'Organic certification prohibits synthetic pesticides and limits synthetic fertilisers. This matters most for pollinators: wild bee populations have declined dramatically in Belgium over the past 50 years, driven in large part by the loss of pesticide-free habitat and food sources. Organic farmland supports significantly higher pollinator diversity than conventional farmland. You don\'t need to go fully organic — prioritising organic for fruit, vegetables, and dairy has the greatest impact.',
      },
      {
        id: 'food-3',
        emoji: '🧺',
        title: 'Buy seasonal and local produce',
        teaser: 'Local seasonal food has a lower carbon footprint and is more likely to come from lower-input farming systems.',
        detail: 'Food transported long distances has a higher carbon footprint, contributing to climate change — itself a growing pressure on biodiversity. Seasonal, local food is also more likely to come from farming systems with lower chemical inputs. Belgian farmers\' markets and short-supply-chain vegetable boxes are widely available across all three regions.',
      },
      {
        id: 'food-4',
        emoji: '🗑️',
        title: 'Reduce food waste',
        teaser: 'Every kilogram wasted represents land that was farmed and chemically treated for nothing.',
        detail: 'Every kilogram of food wasted represents land that was cleared, farmed, and chemically treated for nothing. Belgium wastes around 35 kg of food per person per year. Cutting food waste reduces the total land area needed for food production — directly reducing pressure on natural habitats. Meal planning, proper storage, and using leftovers are the most effective tools.',
      },
    ],
  },
  {
    id: 'garden',
    emoji: '🌱',
    label: 'Your Garden',
    color: '#15803d',
    bg: '#f0fdf4',
    tips: [
      {
        id: 'garden-1',
        emoji: '🌸',
        title: 'Replace lawn with native wildflowers',
        teaser: 'A mown lawn is an ecological desert — even a small wildflower strip transforms its value for insects and birds.',
        detail: 'A perfectly mown lawn supports virtually no insects, birds, or wild plants. Even a small section replaced with native wildflowers transforms a garden\'s ecological value. Species-rich meadow strips require less mowing, not more — and all Flemish gardens together cover 9% of the region\'s total surface, larger than all protected nature areas combined. If every garden gave even a corner to wildflowers, the cumulative effect on pollinators would be enormous.',
      },
      {
        id: 'garden-2',
        emoji: '🪴',
        title: 'Plant native species only',
        teaser: 'Native plants are the foundation of local food webs — and some popular garden plants are invasive species in disguise.',
        detail: 'Native plants are the foundation of local food webs — caterpillars, beetles, and pollinators have co-evolved with them over thousands of years. Many ornamental garden plants provide little or no value to wildlife. More seriously, some commonly sold garden plants are invasive: butterfly bush (Buddleja davidii), false indigo (Amorpha fruticosa), and Japanese knotweed (Reynoutria japonica) all spread aggressively into natural areas. Always check before buying — the EU Invasive Species Regulation lists species that should not be planted in Belgium.',
      },
      {
        id: 'garden-3',
        emoji: '🚫',
        title: 'No pesticides or herbicides',
        teaser: 'Alternatives always exist — and pesticides harm far more than their target species.',
        detail: 'Alternatives always exist. Companion planting, physical barriers, and attracting natural predators (ladybirds eat aphids; hedgehogs eat slugs) are effective and wildlife-friendly. The garden soil itself is a living ecosystem — herbicides and pesticides don\'t discriminate between target species and the hundreds of other organisms doing essential work underground and in the vegetation layer.',
      },
      {
        id: 'garden-4',
        emoji: '🪵',
        title: 'Leave a messy corner',
        teaser: 'Log piles, leaf litter, and dead stems are critical overwintering habitat for hedgehogs, beetles, and solitary bees.',
        detail: 'Log piles, leaf litter, and undisturbed soil patches are critical habitat for hedgehogs, stag beetles, solitary bees, and hundreds of other species. A tidy garden is an ecologically poor garden. Leave dead stems standing over winter — many insects overwinter inside them — and only clear them in late March once temperatures have warmed. A single log pile can host hundreds of invertebrate species.',
      },
      {
        id: 'garden-5',
        emoji: '💧',
        title: 'Add water to your garden',
        teaser: 'Even a tiny pond — 1 square metre — is one of the single highest-impact changes you can make.',
        detail: 'A small pond is one of the highest-impact additions you can make to a garden. Amphibians, dragonflies, water beetles, and birds all depend on freshwater. Keep it pesticide-free, avoid adding ornamental fish (which eat amphibian eggs and invertebrates), and place it in a sunny spot. Even a shallow dish of water helps birds and insects during dry periods.',
      },
      {
        id: 'garden-6',
        emoji: '🌍',
        title: 'Avoid peat-based compost',
        teaser: 'Peat extraction destroys raised bogs — already reduced by 87% in Belgium — for a product you can easily replace.',
        detail: 'Peat extraction destroys raised bogs — among the most carbon-rich and species-rich habitats in Europe, and already reduced by around 87% in the Hautes Fagnes region. Peat-free compost alternatives based on wood fibre, composted bark, or green waste are widely available and perform comparably for most garden uses. Check the bag: many budget composts still contain peat.',
      },
    ],
  },
  {
    id: 'transport',
    emoji: '🚗',
    label: 'Getting Around',
    color: '#1d4ed8',
    bg: '#eff6ff',
    tips: [
      {
        id: 'transport-1',
        emoji: '🛣️',
        title: 'Slow down on motorways',
        teaser: 'Driving at 120 instead of 100 km/h raises NOₓ emissions by ~30%, adding nitrogen to already-stressed nature areas.',
        detail: 'Driving at 120 km/h instead of 100 km/h increases NOₓ emissions by around 30%. NOₓ converts in the atmosphere to reactive nitrogen compounds, which deposit on surrounding land. Belgium already has some of the highest nitrogen deposition rates in Europe, and sensitive nature areas — heathlands, peat bogs, chalk grasslands — receive nitrogen loads that exceed critical thresholds across most of Flanders. Slowing down genuinely helps local nature, directly and measurably.',
      },
      {
        id: 'transport-2',
        emoji: '🚲',
        title: 'Drive less — bike, walk, or take public transport',
        teaser: 'Road transport is a major source of both NOₓ (nitrogen) and particulate matter that settles on surrounding vegetation.',
        detail: 'Road transport is a major source of both NOₓ and particulate matter, both of which harm vegetation and soil ecosystems when they settle. Every journey made by bike or public transport instead of a private car reduces this burden. In urban areas, the air quality benefit is immediate and local; on rural roads near nature areas, the impact on nitrogen-sensitive habitats is direct.',
      },
      {
        id: 'transport-3',
        emoji: '✈️',
        title: 'Fly less',
        teaser: 'Aviation contributes disproportionately to climate change, and climate change is an accelerating driver of biodiversity loss.',
        detail: 'Aviation contributes disproportionately to climate change through CO₂ emissions and high-altitude contrail effects. Climate change is an accelerating driver of biodiversity loss — shifting seasons cause phenological mismatches, species cannot track their habitat fast enough, and extreme weather events disturb populations already under pressure from other stressors. Reducing flights is one of the highest-impact individual climate actions available to most people in Belgium.',
      },
    ],
  },
  {
    id: 'pets',
    emoji: '🐕',
    label: 'Pets & Time in Nature',
    color: '#6d28d9',
    bg: '#f5f3ff',
    tips: [
      {
        id: 'pets-1',
        emoji: '🦌',
        title: 'Keep dogs on a leash in forests and nature',
        teaser: 'Deer flee from dogs at distances of up to 70 metres — even calm, quiet dogs cause chronic stress that reduces breeding success.',
        detail: 'Even a calm, well-behaved dog is perceived as a predator by wildlife. Deer flee at distances of up to 70 metres and sustained disturbance causes chronic stress that reduces survival and breeding success. During the breeding season (March–July), off-leash dogs in forests cause significant disturbance to ground-nesting birds including woodcock, nightjar, and skylark. In VEN areas and Natura 2000 sites in Belgium, dogs are legally required to be kept on a leash.',
      },
      {
        id: 'pets-2',
        emoji: '🐱',
        title: 'Keep cats indoors, especially at night',
        teaser: 'Domestic cats are among the leading causes of bird and small mammal mortality in gardens and suburban areas.',
        detail: 'Domestic cats are one of the leading causes of bird and small mammal mortality in urban and suburban environments. Studies estimate that cats in Belgium kill tens of millions of animals per year — the impact is concentrated in spring and early summer when fledglings are most vulnerable. Keeping cats indoors at night, when most hunting occurs, reduces this significantly. It also extends the cat\'s own life expectancy: indoor cats live 10–15 years on average versus 2–5 years for free-roaming cats.',
      },
      {
        id: 'pets-3',
        emoji: '🥾',
        title: 'Stay on the path, especially in spring',
        teaser: 'Leaving marked paths during breeding season (March–July) directly disturbs nesting birds, reptiles, and sensitive plants.',
        detail: 'Leaving marked paths in nature areas during breeding season (March–July) causes direct disturbance to nesting birds, reptiles sunning themselves, and plants with fragile root systems. Even careful footfall can compact soil and damage vegetation structure. Paths exist for good ecological as well as practical reasons — and during peak season they make the difference between a successful breeding attempt and an abandoned nest.',
      },
      {
        id: 'pets-4',
        emoji: '🧹',
        title: 'Clean boots and bikes between nature visits',
        teaser: 'Invasive plant seeds and fungal pathogens travel easily on boots, bike tyres, and dog fur between nature areas.',
        detail: 'Invasive plant seeds, fungal pathogens such as ash dieback (*Hymenoscyphus fraxineus*), and invertebrate eggs travel on boots, bike tyres, and dog fur. Cleaning equipment between visits to different nature areas prevents unintentional introductions — particularly important for aquatic habitats, where invasive species spread rapidly via wetted gear and boat hulls.',
      },
    ],
  },
  {
    id: 'buying',
    emoji: '🛒',
    label: 'What You Buy',
    color: '#0e7490',
    bg: '#ecfeff',
    tips: [
      {
        id: 'buying-1',
        emoji: '🪵',
        title: 'Choose FSC-certified wood and paper',
        teaser: 'FSC certification guarantees timber comes from forests managed to maintain biodiversity and ecological function.',
        detail: 'The Forest Stewardship Council (FSC) certification guarantees timber and paper come from responsibly managed forests that maintain biodiversity. Uncertified tropical timber is frequently linked to deforestation — the leading driver of global biodiversity loss. Look for the FSC logo on furniture, flooring, paper, and packaging. It\'s one of the most credible and independently verified environmental labels available.',
      },
      {
        id: 'buying-2',
        emoji: '🌴',
        title: 'Avoid products with uncertified palm oil',
        teaser: 'Palm oil drives deforestation in Southeast Asia\'s most biodiverse regions — and it\'s in roughly half of all packaged foods.',
        detail: 'Palm oil production is one of the primary drivers of deforestation in Southeast Asia, one of the world\'s most biodiverse regions — home to orangutans, Sumatran tigers, and pygmy elephants. Palm oil is found in roughly half of all packaged food products. Look for RSPO-certified sustainable palm oil, or products that have eliminated palm oil entirely. Many Belgian supermarkets now label this clearly.',
      },
      {
        id: 'buying-3',
        emoji: '🐠',
        title: 'Never release exotic pets or aquarium species into the wild',
        teaser: 'Goldfish, exotic turtles, and aquarium plants released into Belgian waterways can establish invasive populations within years.',
        detail: 'Exotic fish, plants, turtles, and invertebrates released into Belgian waterways can establish invasive populations with devastating consequences. Goldfish introduced into ponds destroy aquatic vegetation and eliminate invertebrate communities within a few years. Signal crayfish, American mink, and Himalayan balsam — all serious invasives in Belgium — arrived through the pet and ornamental trade. Return unwanted pets to a shelter or specialist retailer. Never release anything into a river, pond, or canal.',
      },
      {
        id: 'buying-4',
        emoji: '🧪',
        title: 'Choose natural garden and household products',
        teaser: 'Many cleaning and garden products contain chemicals that reach waterways and harm aquatic biodiversity.',
        detail: 'Many household cleaning products, weed killers, and garden chemicals contain compounds that reach waterways through drainage and runoff, harming aquatic invertebrates, amphibians, and fish. In Belgium, most rivers still fail to meet good ecological status under the Water Framework Directive — household chemical runoff is a contributing factor. Natural alternatives perform well for most applications and are now widely available in mainstream supermarkets.',
      },
    ],
  },
  {
    id: 'involved',
    emoji: '🔭',
    label: 'Get Involved',
    color: '#be185d',
    bg: '#fdf2f8',
    tips: [
      {
        id: 'involved-1',
        emoji: '📱',
        title: 'Report what you see',
        teaser: 'Every species observation submitted to waarnemingen.be or observations.be feeds directly into national biodiversity trend data.',
        detail: 'Every observation of a species submitted to waarnemingen.be (Flanders) or observations.be (Wallonia/Brussels) contributes to the scientific understanding of biodiversity trends. The app ObsIdentify makes identification instant. Sightings of invasive species can be reported via vespa-watch.be (Asian hornet) or exotischeplanten.be (invasive plants). The data you submit is used by INBO, Natagora, and regional governments to track population changes and inform policy.',
      },
      {
        id: 'involved-2',
        emoji: '🦋',
        title: 'Participate in citizen science counts',
        teaser: 'The Tuinvogeltelling, Insectenzomer, and Grote Vlindertelling depend on garden observations to track national biodiversity trends.',
        detail: 'The Tuinvogeltelling (garden bird count), Insectenzomer (insect summer count), and Grote Vlindertelling (butterfly count) are Belgium-wide monitoring programmes run by Natuurpunt and Natagora. Your garden data feeds directly into national trend analyses. These counts have documented the declines described elsewhere on this site — and they depend on observations from thousands of volunteers. No expertise required: the programmes provide simple identification guides.',
      },
      {
        id: 'involved-3',
        emoji: '🤝',
        title: 'Support nature organisations',
        teaser: 'Membership or donation to Natuurpunt, Natagora, or WWF Belgium converts individual concern into systemic change.',
        detail: 'Natuurpunt, Natagora, WWF Belgium, and Ardenne & Gaume collectively manage hundreds of nature reserves, restore habitats, lobby for stronger nature policy, and train thousands of volunteers. Membership or donation is one of the most efficient ways to translate individual concern into systemic change. Natuurpunt alone manages over 500 nature areas in Flanders; its reserves cover more land than all Flemish government-owned nature areas combined.',
      },
      {
        id: 'involved-4',
        emoji: '🗳️',
        title: 'Make nature a voting issue',
        teaser: 'Individual actions matter — but the largest levers for biodiversity are policy decisions about agriculture, transport, and land use.',
        detail: 'Individual actions matter, but the largest levers for biodiversity are policy decisions: nitrogen emission standards for agriculture, pesticide authorisation, spatial planning that protects habitat corridors, and funding for nature restoration. These decisions are made by elected officials. Asking candidates about their biodiversity commitments, voting for parties with credible nature policies, and engaging with public consultations on land use plans are among the highest-leverage actions available.',
      },
    ],
  },
];

// ── Expandable tip card ───────────────────────────────────────────────────────

function TipCard({ tip, color, bg, isOpen, onToggle }: {
  tip: Tip;
  color: string;
  bg: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${isOpen ? color : '#e5e7eb'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        background: isOpen ? bg : '#fff',
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{tip.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: isOpen ? color : '#1a1a1a', marginBottom: 3, lineHeight: 1.3 }}>
            {tip.title}
          </div>
          {!isOpen && (
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
              {tip.teaser}
            </div>
          )}
        </div>
        <span style={{ color: isOpen ? color : '#9ca3af', fontSize: 16, flexShrink: 0, marginTop: 2, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {/* Expanded detail */}
      {isOpen && (
        <div style={{ padding: '0 16px 16px 48px' }}>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: '#374151', margin: 0 }}>
            {tip.detail}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Theme section ─────────────────────────────────────────────────────────────

function ThemeSection({ theme, openTips, onToggle }: {
  theme: Theme;
  openTips: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div id={theme.id} style={{ marginBottom: 32 }}>
      {/* Theme header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: theme.bg, border: `2px solid ${theme.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {theme.emoji}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.color, margin: 0 }}>
          {theme.label}
        </h2>
      </div>

      {/* Tips grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {theme.tips.map((tip) => (
          <TipCard
            key={tip.id}
            tip={tip}
            color={theme.color}
            bg={theme.bg}
            isOpen={openTips.has(tip.id)}
            onToggle={() => onToggle(tip.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="detail-sidebar">
      <div className="detail-sidebar-title">On this page</div>
      {THEMES.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className={`detail-sidebar-link${active === t.id ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(t.id);
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
          }}
        >
          {t.emoji} {t.label}
        </a>
      ))}
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HowToHelpBiodiversityPage() {
  const [openTips, setOpenTips] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState(THEMES[0].id);

  function toggleTip(id: string) {
    setOpenTips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    const handler = () => {
      const offsets = THEMES.map((t) => {
        const el = document.getElementById(t.id);
        return { id: t.id, top: el ? el.getBoundingClientRect().top : Infinity };
      });
      const current = offsets.filter((o) => o.top <= 140).at(-1);
      if (current) setActiveSection(current.id);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const totalTips = THEMES.reduce((n, t) => n + t.tips.length, 0);

  return (
    <div className="detail-page">

      {/* ── Header ── */}
      <div className="detail-header" style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}>
        <div className="detail-header-inner">
          <Link href="/learn" className="back-link">← Back to Learn</Link>
          <div className="header-eyebrow" style={{ color: '#86efac' }}>🌿 Nature &amp; Biodiversity</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '8px 0 12px', lineHeight: 1.2 }}>
            How to Help Biodiversity
          </h1>
          <p style={{ fontSize: 16, color: '#bbf7d0', maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
            {totalTips} actions across 6 themes — from what you eat to how you drive.
            Click any tip to learn more.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">
        <div className="detail-main">

          {/* Intro card */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '24px 32px', marginBottom: 28 }}>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: '#374151', margin: 0 }}>
              Biodiversity loss feels like a problem for governments and international bodies. But
              many of the pressures driving it — nitrogen pollution, pesticide use, habitat
              fragmentation, invasive species — are directly connected to everyday choices about
              what we eat, how we travel, how we manage our gardens, and how we spend time in
              nature. None of the actions below will single-handedly reverse the crisis. But
              collectively, across millions of households, they add up. The total area of private
              gardens in Flanders alone is larger than all the region&#39;s protected nature areas
              combined.
            </p>
          </div>

          {/* Theme sections */}
          {THEMES.map((theme) => (
            <ThemeSection
              key={theme.id}
              theme={theme}
              openTips={openTips}
              onToggle={toggleTip}
            />
          ))}

        </div>
        <Sidebar active={activeSection} />
      </div>
    </div>
  );
}
