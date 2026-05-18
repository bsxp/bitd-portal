export type CrewType = 'assassins' | 'bravos' | 'cult' | 'hawkers' | 'shadows' | 'smugglers'
export type Playbook = 'cutter' | 'hound' | 'leech' | 'lurk' | 'slide' | 'spider' | 'whisper'
export type Hold = 'strong' | 'weak'
export type LoadLevel = 'light' | 'normal' | 'heavy'
export type CampaignRole = 'gm' | 'player'
export type ClockScope = 'long-term' | 'score'

export const TRAUMA_OPTIONS = ['cold', 'haunted', 'obsessed', 'paranoid', 'reckless', 'soft', 'unstable', 'vicious'] as const
export const VICE_OPTIONS = ['faith', 'gambling', 'luxury', 'obligation', 'pleasure', 'stupor', 'weird'] as const
export const HERITAGE_OPTIONS = ['akoros', 'the dagger isles', 'iruvia', 'severos', 'skovlan', 'tycheros'] as const
export const BACKGROUND_OPTIONS = ['academic', 'labor', 'law', 'trade', 'military', 'noble', 'underworld'] as const

export const ACTION_RATINGS = {
  insight: ['hunt', 'study', 'survey', 'tinker'],
  prowess: ['finesse', 'prowl', 'skirmish', 'wreck'],
  resolve: ['attune', 'command', 'consort', 'sway'],
} as const

export type ActionName = typeof ACTION_RATINGS[keyof typeof ACTION_RATINGS][number]
export type AttributeName = keyof typeof ACTION_RATINGS

export interface CharacterContact {
  name: string
  relationship: 'friend' | 'rival' | 'other'
  description: string | null
}

export interface Campaign {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface CampaignMember {
  id: string
  campaign_id: string
  user_id: string
  role: CampaignRole
  display_name: string
  created_at: string
}

export interface Crew {
  id: string
  campaign_id: string
  name: string
  crew_type: CrewType | null
  reputation: string | null
  lair_location: string | null
  hunting_grounds_type: string | null
  hunting_grounds_location: string | null
  tier: number
  hold: Hold
  rep: number
  heat: number
  wanted_level: number
  coin: number
  vault_capacity: number
  crew_xp: number
  special_abilities: string[]
  upgrades: string[]
  claims_seized: string[]
  notes: string | null
  created_at: string
}

export interface Character {
  id: string
  crew_id: string | null
  user_id: string | null
  campaign_id: string
  name: string
  alias: string | null
  look: string | null
  playbook: Playbook | null
  heritage: string | null
  heritage_detail: string | null
  background: string | null
  background_detail: string | null
  vice: string | null
  vice_purveyor: string | null
  stress: number
  trauma: string[]
  coin: number
  stash: number
  playbook_xp: number
  insight_xp: number
  prowess_xp: number
  resolve_xp: number
  hunt: number
  study: number
  survey: number
  tinker: number
  finesse: number
  prowl: number
  skirmish: number
  wreck: number
  attune: number
  command: number
  consort: number
  sway: number
  harm_level3: string | null
  harm_level2_a: string | null
  harm_level2_b: string | null
  harm_level1_a: string | null
  harm_level1_b: string | null
  healing_clock: number
  armor_available: boolean
  heavy_armor_available: boolean
  special_armor_available: boolean
  armor_used: boolean
  heavy_armor_used: boolean
  special_armor_used: boolean
  load_level: LoadLevel | null
  items_carried: string[]
  special_abilities: string[]
  contacts: CharacterContact[]
  notes: string | null
  created_at: string
}

export interface Clock {
  id: string
  campaign_id: string
  name: string
  segments: number
  filled: number
  clock_type: string
  scope: ClockScope
  visible_to_players: boolean
  active: boolean
  notes: string | null
  created_at: string
}

export interface Faction {
  id: string
  campaign_id: string
  name: string
  tier: number
  hold: Hold
  status: number
  category: string | null
  description: string | null
  notes: string | null
  player_notes: string | null
  created_at: string
}

export const FACTION_STATUS_LABELS: Record<number, string> = {
  3: 'Allies',
  2: 'Friendly',
  1: 'Helpful',
  0: 'Neutral',
  '-1': 'Interfering',
  '-2': 'Hostile',
  '-3': 'War',
}
