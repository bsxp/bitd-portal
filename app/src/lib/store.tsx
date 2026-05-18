import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Character, Crew, Clock, Faction, CampaignRole } from './types'
import { CANONICAL_FACTIONS } from './game-data'

interface GameState {
  role: CampaignRole
  characters: Character[]
  crew: Crew | null
  clocks: Clock[]
  factions: Faction[]
  activeCharacterId: string | null
}

interface GameActions {
  setRole: (role: CampaignRole) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  updateCrew: (updates: Partial<Crew>) => void
  updateClock: (id: string, updates: Partial<Clock>) => void
  addClock: (clock: Clock) => void
  deleteClock: (id: string) => void
  updateFaction: (id: string, updates: Partial<Faction>) => void
  addFaction: (faction: Faction) => void
  deleteFaction: (id: string) => void
  setActiveCharacter: (id: string | null) => void
  endScore: () => void
}

const GameContext = createContext<(GameState & GameActions) | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}

function makeDemoCharacter(overrides: Partial<Character>): Character {
  return {
    id: crypto.randomUUID(),
    crew_id: null,
    user_id: null,
    campaign_id: 'demo',
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
    notes: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

const DEMO_CHARACTERS: Character[] = [
  makeDemoCharacter({
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
    skirmish: 2,
    command: 1,
    wreck: 1,
    prowl: 1,
    hunt: 1,
    armor_available: true,
    heavy_armor_available: true,
    special_armor_available: true,
  }),
  makeDemoCharacter({
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
    attune: 3,
    study: 2,
    survey: 1,
    consort: 1,
  }),
  makeDemoCharacter({
    name: 'Arden Keel',
    alias: 'Silk',
    playbook: 'slide',
    heritage: 'akoros',
    background: 'noble',
    vice: 'luxury',
    vice_purveyor: 'Riven, a private club owner in Brightstone',
    look: 'Impeccable clothes, easy smile, rings on every finger',
    stress: 2,
    sway: 2,
    consort: 2,
    finesse: 1,
    survey: 1,
  }),
]

const DEMO_CREW: Crew = {
  id: crypto.randomUUID(),
  campaign_id: 'demo',
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

const DEMO_CLOCKS: Clock[] = [
  {
    id: crypto.randomUUID(), campaign_id: 'demo',
    name: 'Bluecoat Investigation', segments: 6, filled: 2,
    clock_type: 'danger', scope: 'long-term', visible_to_players: true, active: true,
    notes: null, created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(), campaign_id: 'demo',
    name: "Red Sash Retaliation", segments: 4, filled: 1,
    clock_type: 'faction', scope: 'long-term', visible_to_players: false, active: true,
    notes: 'After the crew stole the artifact', created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(), campaign_id: 'demo',
    name: "Vex's Contact in Ironhook", segments: 8, filled: 3,
    clock_type: 'project', scope: 'long-term', visible_to_players: true, active: true,
    notes: null, created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(), campaign_id: 'demo',
    name: 'Manor Security Alert', segments: 4, filled: 0,
    clock_type: 'danger', scope: 'score', visible_to_players: true, active: true,
    notes: null, created_at: new Date().toISOString(),
  },
]

function makeDemoFaction(name: string, statusOverride?: number, notesOverride?: string): Faction | null {
  const canonical = CANONICAL_FACTIONS.find((f) => f.name === name)
  if (!canonical) return null
  return {
    id: crypto.randomUUID(),
    campaign_id: 'demo',
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

const DEMO_FACTIONS: Faction[] = [
  makeDemoFaction('The Lampblacks', 1, 'Bazso offered work — considering alliance'),
  makeDemoFaction('The Red Sashes', -2),
  makeDemoFaction('The Bluecoats', -1),
  makeDemoFaction('The Hive'),
  makeDemoFaction('The Dimmer Sisters'),
  makeDemoFaction('Inspectors'),
].filter((f): f is Faction => f !== null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<CampaignRole>('gm')
  const [characters, setCharacters] = useState<Character[]>(DEMO_CHARACTERS)
  const [crew, setCrew] = useState<Crew | null>(DEMO_CREW)
  const [clocks, setClocks] = useState<Clock[]>(DEMO_CLOCKS)
  const [factions, setFactions] = useState<Faction[]>(DEMO_FACTIONS)
  const [activeCharacterId, setActiveCharacter] = useState<string | null>(DEMO_CHARACTERS[0].id)

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    )
  }, [])

  const updateCrew = useCallback((updates: Partial<Crew>) => {
    setCrew((prev) => (prev ? { ...prev, ...updates } : prev))
  }, [])

  const updateClock = useCallback((id: string, updates: Partial<Clock>) => {
    setClocks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    )
  }, [])

  const addClock = useCallback((clock: Clock) => {
    setClocks((prev) => [...prev, clock])
  }, [])

  const deleteClock = useCallback((id: string) => {
    setClocks((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateFaction = useCallback((id: string, updates: Partial<Faction>) => {
    setFactions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    )
  }, [])

  const addFaction = useCallback((faction: Faction) => {
    setFactions((prev) => [...prev, faction])
  }, [])

  const deleteFaction = useCallback((id: string) => {
    setFactions((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const endScore = useCallback(() => {
    setCharacters((prev) =>
      prev.map((c) => ({
        ...c,
        load_level: null,
        items_carried: [],
        armor_used: false,
        heavy_armor_used: false,
        special_armor_used: false,
      })),
    )
    setClocks((prev) =>
      prev.map((c) =>
        c.scope === 'score' ? { ...c, active: false } : c,
      ),
    )
  }, [])

  return (
    <GameContext.Provider
      value={{
        role, setRole,
        characters, updateCharacter,
        crew, updateCrew,
        clocks, updateClock, addClock, deleteClock,
        factions, updateFaction, addFaction, deleteFaction,
        activeCharacterId, setActiveCharacter,
        endScore,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
