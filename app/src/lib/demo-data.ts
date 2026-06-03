import type { Character, Crew, Clock, Faction, Score, MapToken } from './types'
import { CANONICAL_FACTIONS } from './game-data'

// Builds a fresh copy of the demo campaign's contents, scoped to a campaign id.
// Used to seed a brand-new campaign on first load.

function makeCharacter(campaignId: string, overrides: Partial<Character>): Character {
  return {
    id: crypto.randomUUID(),
    crew_id: null,
    user_id: null,
    campaign_id: campaignId,
    name: 'Unnamed',
    alias: null,
    look: null,
    playbook: null,
    heritage: null,
    heritage_detail: null,
    background: null,
    background_detail: null,
    vice: null,
    vice_purveyor: null,
    stress: 0,
    trauma: [],
    coin: 0,
    stash: 0,
    playbook_xp: 0,
    insight_xp: 0,
    prowess_xp: 0,
    resolve_xp: 0,
    hunt: 0, study: 0, survey: 0, tinker: 0,
    finesse: 0, prowl: 0, skirmish: 0, wreck: 0,
    attune: 0, command: 0, consort: 0, sway: 0,
    harm_level3: null,
    harm_level2_a: null,
    harm_level2_b: null,
    harm_level1_a: null,
    harm_level1_b: null,
    healing_clock: 0,
    armor_available: true,
    heavy_armor_available: false,
    special_armor_available: true,
    armor_used: false,
    heavy_armor_used: false,
    special_armor_used: false,
    load_level: null,
    items_carried: [],
    special_abilities: [],
    ability_details: {},
    contacts: [],
    notes: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeFaction(campaignId: string, name: string, statusOverride?: number, notesOverride?: string): Faction | null {
  const canonical = CANONICAL_FACTIONS.find((f) => f.name === name)
  if (!canonical) return null
  return {
    id: crypto.randomUUID(),
    campaign_id: campaignId,
    name: canonical.name,
    tier: canonical.tier,
    hold: canonical.hold,
    status: statusOverride ?? 0,
    category: canonical.category,
    description: canonical.description,
    notes: notesOverride ?? null,
    player_notes: null,
    created_at: new Date().toISOString(),
  }
}

export interface CampaignData {
  characters: Character[]
  crew: Crew | null
  clocks: Clock[]
  factions: Faction[]
  currentScore: Score | null
  scoreHistory: Score[]
  mapTokens: MapToken[]
}

export function makeDemoData(campaignId: string): CampaignData {
  const characters: Character[] = [
    makeCharacter(campaignId, {
      name: 'Coran Vale',
      alias: 'Cross',
      playbook: 'cutter',
      heritage: 'skovlan',
      background: 'military',
      vice: 'pleasure',
      vice_purveyor: 'Helene, a singer at the Songbird Lounge in Silkshore',
      look: 'Scarred forearms, military posture, cold pale eyes',
      stress: 4,
      harm_level1_a: 'Bruised ribs',
      skirmish: 2, command: 1, wreck: 1, prowl: 1, hunt: 1,
      armor_available: true, heavy_armor_available: true, special_armor_available: true,
      contacts: [
        { name: 'Marlane, a pugilist', relationship: 'friend', description: null },
        { name: 'Chael, a vicious thug', relationship: 'rival', description: null },
      ],
    }),
    makeCharacter(campaignId, {
      name: 'Melvir Dalmore',
      alias: 'Moth',
      playbook: 'whisper',
      heritage: 'iruvia',
      background: 'underworld',
      vice: 'weird',
      vice_purveyor: 'Jezelle, a forgotten shrine in the Deathlands near Whitecrown',
      look: 'Gaunt, wild dark hair, eyes that catch the light wrong',
      stress: 6,
      trauma: ['haunted'],
      attune: 3, study: 2, survey: 1, consort: 1,
      contacts: [
        { name: 'Nyryx, a possessor ghost', relationship: 'friend', description: null },
        { name: 'Scurlock, a vampire', relationship: 'rival', description: null },
      ],
    }),
    makeCharacter(campaignId, {
      name: 'Arden Keel',
      alias: 'Silk',
      playbook: 'slide',
      heritage: 'akoros',
      background: 'noble',
      vice: 'luxury',
      vice_purveyor: 'Riven, a private club owner in Brightstone',
      look: 'Impeccable clothes, easy smile, rings on every finger',
      stress: 2,
      sway: 2, consort: 2, finesse: 1, survey: 1,
      contacts: [
        { name: 'Riven, a club owner', relationship: 'friend', description: null },
        { name: 'Bazso Baz, Lampblack boss', relationship: 'other', description: 'Uneasy business acquaintance' },
      ],
    }),
  ]

  const crew: Crew = {
    id: crypto.randomUUID(),
    campaign_id: campaignId,
    name: 'The Phantom Knives',
    crew_type: 'shadows',
    reputation: 'Daring',
    lair_location: "Crow's Foot - abandoned watch tower",
    hunting_grounds_type: 'Burglary',
    hunting_grounds_location: 'Brightstone manors',
    tier: 0,
    hold: 'strong',
    rep: 3,
    heat: 2,
    wanted_level: 0,
    coin: 2,
    vault_capacity: 4,
    crew_xp: 2,
    special_abilities: [],
    upgrades: [],
    claims_seized: [],
    notes: null,
    created_at: new Date().toISOString(),
  }

  const clocks: Clock[] = [
    {
      id: crypto.randomUUID(), campaign_id: campaignId,
      name: 'Bluecoat Investigation', segments: 6, filled: 2,
      clock_type: 'danger', scope: 'long-term', visible_to_players: true, active: true,
      notes: null, created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), campaign_id: campaignId,
      name: 'Red Sash Retaliation', segments: 4, filled: 1,
      clock_type: 'faction', scope: 'long-term', visible_to_players: false, active: true,
      notes: 'After the crew stole the artifact', created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), campaign_id: campaignId,
      name: "Vex's Contact in Ironhook", segments: 8, filled: 3,
      clock_type: 'project', scope: 'long-term', visible_to_players: true, active: true,
      notes: null, created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(), campaign_id: campaignId,
      name: 'Manor Security Alert', segments: 4, filled: 0,
      clock_type: 'danger', scope: 'score', visible_to_players: true, active: true,
      notes: null, created_at: new Date().toISOString(),
    },
  ]

  const factions = [
    makeFaction(campaignId, 'The Lampblacks', 1, 'Bazso offered work — considering alliance'),
    makeFaction(campaignId, 'The Red Sashes', -2),
    makeFaction(campaignId, 'The Bluecoats', -1),
    makeFaction(campaignId, 'The Hive'),
    makeFaction(campaignId, 'The Dimmer Sisters'),
    makeFaction(campaignId, 'Inspectors'),
  ].filter((f): f is Faction => f !== null)

  const currentScore: Score = {
    id: crypto.randomUUID(),
    campaign_id: campaignId,
    title: 'The Brightstone Job',
    target: "Lord Strangford's manor — steal the Tycherosi heirloom",
    plan_type: 'Stealth',
    plan_detail: "Servants' entrance during the masquerade ball",
    position: 'risky',
    status: 'active',
    outcome: null,
    payoff_coin: 0,
    rep_gained: 0,
    heat_gained: 0,
    notes: null,
    outcome_notes: null,
    completed_at: null,
    created_at: new Date().toISOString(),
  }

  const scoreHistory: Score[] = [
    {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      title: 'The Lampblack Warehouse',
      target: 'Bazso Baz — torch the rival smuggling cache',
      plan_type: 'Assault',
      plan_detail: 'Front door, lanterns and fists',
      position: 'desperate',
      status: 'completed',
      outcome: 'success',
      payoff_coin: 4,
      rep_gained: 2,
      heat_gained: 5,
      notes: 'Cross took a nasty cut to the arm holding the line at the door.',
      outcome_notes: 'The cache went up in flames, but a Bluecoat patrol caught a good look at Moth on the way out — expect heat.',
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ]

  // No default map chips — players/GM add their own via the map's Add Token.
  const mapTokens: MapToken[] = []

  return { characters, crew, clocks, factions, currentScore, scoreHistory, mapTokens }
}
