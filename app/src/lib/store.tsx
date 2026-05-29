import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { Character, Crew, Clock, Faction, CampaignRole, MapToken, Score } from './types'
import { supabase } from './supabase'
import {
  loadOrSeedCampaign, getCampaign,
  saveEntity, saveEntities, deleteEntity, setCampaignMap,
} from './db'
import type { Seat } from './session'

// ── Shared game state ──
// Loaded from Postgres on mount, scoped to a campaign. Every mutation applies
// locally, broadcasts to peers over the campaign realtime channel (instant
// sync), and write-throughs to Postgres (durability). Presence on the same
// channel powers "who's online".

export interface OnlinePlayer {
  seat: string // 'gm' or a character id
  name: string
  sessionId: string
}

interface PutPayload {
  characters?: Character[]
  crew?: Crew
  clocks?: Clock[]
  factions?: Faction[]
  score?: Score | null
  mapImageUrl?: string | null
}
interface RemovePayload {
  clockIds?: string[]
  factionIds?: string[]
}

interface GameState {
  loading: boolean
  loadError: string | null
  campaignId: string
  onlinePlayers: OnlinePlayer[]
  role: CampaignRole
  characters: Character[]
  crew: Crew | null
  clocks: Clock[]
  factions: Faction[]
  activeCharacterId: string | null
  mapTokens: MapToken[]
  mapImageUrl: string | null
  currentScore: Score | null
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
  updateMapToken: (id: string, updates: Partial<MapToken>) => void
  addMapToken: (token: MapToken) => void
  removeMapToken: (id: string) => void
  commitMapToken: (id: string) => void
  setMapImage: (url: string | null) => void
  endScore: () => void
  startScore: () => void
  updateScore: (updates: Partial<Score>) => void
  wrapScore: () => void
  abandonScore: () => void
}

const GameContext = createContext<(GameState & GameActions) | null>(null)

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}

function upsertMany<T extends { id: string }>(prev: T[], items: T[]): T[] {
  const map = new Map(prev.map((x) => [x.id, x]))
  for (const it of items) map.set(it.id, it)
  return Array.from(map.values())
}

function resetForNewScore(c: Character): Character {
  return {
    ...c,
    load_level: null,
    items_carried: [],
    armor_used: false,
    heavy_armor_used: false,
    special_armor_used: false,
  }
}

function seatKey(seat: Seat): string {
  return seat.type === 'gm' ? 'gm' : seat.id
}

interface GameProviderProps {
  campaignId: string
  seat: Seat
  sessionId: string
  children: ReactNode
}

export function GameProvider({ campaignId, seat, sessionId, children }: GameProviderProps) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([])

  const [role, setRole] = useState<CampaignRole>(seat.type === 'gm' ? 'gm' : 'player')
  const [characters, setCharacters] = useState<Character[]>([])
  const [crew, setCrew] = useState<Crew | null>(null)
  const [clocks, setClocks] = useState<Clock[]>([])
  const [factions, setFactions] = useState<Faction[]>([])
  const [activeCharacterId, setActiveCharacter] = useState<string | null>(
    seat.type === 'character' ? seat.id : null,
  )
  const [mapTokens, setMapTokens] = useState<MapToken[]>([])
  const [mapImageUrl, setMapImage] = useState<string | null>(null)
  const [currentScore, setCurrentScore] = useState<Score | null>(null)

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const stateRef = useRef({ characters, crew, clocks, factions, currentScore, mapTokens })
  useEffect(() => {
    stateRef.current = { characters, crew, clocks, factions, currentScore, mapTokens }
  })

  // ── Local appliers (used for our own actions and peer broadcasts) ──
  const applyPut = useCallback((p: PutPayload) => {
    if (p.characters) setCharacters((prev) => upsertMany(prev, p.characters!))
    if (p.crew) setCrew(p.crew)
    if (p.clocks) setClocks((prev) => upsertMany(prev, p.clocks!))
    if (p.factions) setFactions((prev) => upsertMany(prev, p.factions!))
    if ('score' in p) setCurrentScore(p.score ?? null)
    if ('mapImageUrl' in p) setMapImage(p.mapImageUrl ?? null)
  }, [])

  const applyRemove = useCallback((p: RemovePayload) => {
    if (p.clockIds) setClocks((prev) => prev.filter((c) => !p.clockIds!.includes(c.id)))
    if (p.factionIds) setFactions((prev) => prev.filter((f) => !p.factionIds!.includes(f.id)))
  }, [])

  const applyAction = useCallback((action: string, p: PutPayload & RemovePayload) => {
    if (action === 'put') applyPut(p)
    else if (action === 'remove') applyRemove(p)
  }, [applyPut, applyRemove])

  const broadcast = useCallback((action: string, p: PutPayload | RemovePayload) => {
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'op',
        payload: { sender: sessionId, action, p },
      })
    } catch { /* realtime unavailable */ }
  }, [sessionId])

  // ── Persistence helpers (only the originating client writes) ──
  const onErr = (e: unknown) => { console.error('[bitd persist]', e) }
  const persistChars = useCallback((cs: Character[]) => { saveEntities('characters', campaignId, cs).catch(onErr) }, [campaignId])
  const persistCrew = useCallback((c: Crew) => { saveEntity('crews', campaignId, c).catch(onErr) }, [campaignId])
  const persistClocks = useCallback((cs: Clock[]) => { saveEntities('clocks', campaignId, cs).catch(onErr) }, [campaignId])
  const persistFactions = useCallback((fs: Faction[]) => { saveEntities('factions', campaignId, fs).catch(onErr) }, [campaignId])
  const persistScore = useCallback((s: Score) => { saveEntity('scores', campaignId, s).catch(onErr) }, [campaignId])

  // ── Public mutators ──
  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    const cur = stateRef.current.characters.find((c) => c.id === id)
    if (!cur) return
    const next = { ...cur, ...updates }
    const p = { characters: [next] }
    applyPut(p); broadcast('put', p); persistChars([next])
  }, [applyPut, broadcast, persistChars])

  const updateCrew = useCallback((updates: Partial<Crew>) => {
    const cur = stateRef.current.crew
    if (!cur) return
    const next = { ...cur, ...updates }
    const p = { crew: next }
    applyPut(p); broadcast('put', p); persistCrew(next)
  }, [applyPut, broadcast, persistCrew])

  const updateClock = useCallback((id: string, updates: Partial<Clock>) => {
    const cur = stateRef.current.clocks.find((c) => c.id === id)
    if (!cur) return
    const next = { ...cur, ...updates }
    const p = { clocks: [next] }
    applyPut(p); broadcast('put', p); persistClocks([next])
  }, [applyPut, broadcast, persistClocks])

  const addClock = useCallback((clock: Clock) => {
    const p = { clocks: [clock] }
    applyPut(p); broadcast('put', p); persistClocks([clock])
  }, [applyPut, broadcast, persistClocks])

  const deleteClock = useCallback((id: string) => {
    const p = { clockIds: [id] }
    applyRemove(p); broadcast('remove', p); deleteEntity('clocks', id).catch(onErr)
  }, [applyRemove, broadcast])

  const updateFaction = useCallback((id: string, updates: Partial<Faction>) => {
    const cur = stateRef.current.factions.find((f) => f.id === id)
    if (!cur) return
    const next = { ...cur, ...updates }
    const p = { factions: [next] }
    applyPut(p); broadcast('put', p); persistFactions([next])
  }, [applyPut, broadcast, persistFactions])

  const addFaction = useCallback((faction: Faction) => {
    const p = { factions: [faction] }
    applyPut(p); broadcast('put', p); persistFactions([faction])
  }, [applyPut, broadcast, persistFactions])

  const deleteFaction = useCallback((id: string) => {
    const p = { factionIds: [id] }
    applyRemove(p); broadcast('remove', p); deleteEntity('factions', id).catch(onErr)
  }, [applyRemove, broadcast])

  // Map tokens: live drag sync runs on a dedicated channel inside GameMap
  // (throttled). Here we keep local state and persist on discrete events.
  const updateMapToken = useCallback((id: string, updates: Partial<MapToken>) => {
    setMapTokens((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const addMapToken = useCallback((token: MapToken) => {
    setMapTokens((prev) => (prev.some((t) => t.id === token.id) ? prev : [...prev, token]))
    saveEntity('map_tokens', campaignId, token).catch(onErr)
  }, [campaignId])

  const removeMapToken = useCallback((id: string) => {
    setMapTokens((prev) => prev.filter((t) => t.id !== id))
    deleteEntity('map_tokens', id).catch(onErr)
  }, [])

  const commitMapToken = useCallback((id: string) => {
    const t = stateRef.current.mapTokens.find((tok) => tok.id === id)
    if (t) saveEntity('map_tokens', campaignId, t).catch(onErr)
  }, [campaignId])

  const setMapImageSynced = useCallback((url: string | null) => {
    const p = { mapImageUrl: url }
    applyPut(p); broadcast('put', p); setCampaignMap(campaignId, url).catch(onErr)
  }, [applyPut, broadcast, campaignId])

  const endScore = useCallback(() => {
    const resetChars = stateRef.current.characters.map(resetForNewScore)
    const resetScoreClocks = stateRef.current.clocks.filter((c) => c.scope === 'score').map((c) => ({ ...c, active: false }))
    const p: PutPayload = { characters: resetChars, clocks: resetScoreClocks }
    applyPut(p); broadcast('put', p)
    persistChars(resetChars); persistClocks(resetScoreClocks)
  }, [applyPut, broadcast, persistChars, persistClocks])

  const startScore = useCallback(() => {
    const score: Score = {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      title: 'New Score',
      target: null,
      plan_type: null,
      plan_detail: null,
      position: null,
      status: 'planning',
      payoff_coin: 0,
      rep_gained: 0,
      heat_gained: 0,
      notes: null,
      created_at: new Date().toISOString(),
    }
    const p = { score }
    applyPut(p); broadcast('put', p); persistScore(score)
  }, [applyPut, broadcast, persistScore, campaignId])

  const updateScore = useCallback((updates: Partial<Score>) => {
    const cur = stateRef.current.currentScore
    if (!cur) return
    const next = { ...cur, ...updates }
    const p = { score: next }
    applyPut(p); broadcast('put', p); persistScore(next)
  }, [applyPut, broadcast, persistScore])

  const wrapScore = useCallback(() => {
    const score = stateRef.current.currentScore
    const crew = stateRef.current.crew
    const resetChars = stateRef.current.characters.map(resetForNewScore)
    const resetScoreClocks = stateRef.current.clocks.filter((c) => c.scope === 'score').map((c) => ({ ...c, active: false }))
    let newCrew: Crew | null = crew
    if (crew && score) {
      const totalHeat = crew.heat + score.heat_gained
      newCrew = {
        ...crew,
        coin: crew.coin + score.payoff_coin,
        rep: Math.min(12, crew.rep + score.rep_gained),
        heat: totalHeat % 9,
        wanted_level: Math.min(4, crew.wanted_level + Math.floor(totalHeat / 9)),
      }
    }
    const p: PutPayload = { characters: resetChars, clocks: resetScoreClocks, score: null }
    if (newCrew) p.crew = newCrew
    applyPut(p); broadcast('put', p)
    persistChars(resetChars); persistClocks(resetScoreClocks)
    if (newCrew) persistCrew(newCrew)
    if (score) deleteEntity('scores', score.id).catch(onErr)
  }, [applyPut, broadcast, persistChars, persistClocks, persistCrew])

  const abandonScore = useCallback(() => {
    const score = stateRef.current.currentScore
    const resetChars = stateRef.current.characters.map(resetForNewScore)
    const resetScoreClocks = stateRef.current.clocks.filter((c) => c.scope === 'score').map((c) => ({ ...c, active: false }))
    const p: PutPayload = { characters: resetChars, clocks: resetScoreClocks, score: null }
    applyPut(p); broadcast('put', p)
    persistChars(resetChars); persistClocks(resetScoreClocks)
    if (score) deleteEntity('scores', score.id).catch(onErr)
  }, [applyPut, broadcast, persistChars, persistClocks])

  // ── Load campaign data from Postgres ──
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    loadOrSeedCampaign(campaignId)
      .then((data) => {
        if (cancelled) return
        setCharacters(data.characters)
        setCrew(data.crew)
        setClocks(data.clocks)
        setFactions(data.factions)
        setCurrentScore(data.currentScore)
        setMapTokens(data.mapTokens)
        setActiveCharacter((prev) => prev ?? data.characters[0]?.id ?? null)
        setLoading(false)
      })
      .catch((e) => {
        console.error('[bitd load]', e)
        if (cancelled) return
        setLoadError('Could not load this campaign.')
        setLoading(false)
      })
    getCampaign(campaignId)
      .then((c) => { if (!cancelled && c) setMapImage(c.map_image_url) })
      .catch(() => { /* non-fatal */ })
    return () => { cancelled = true }
  }, [campaignId])

  // ── Realtime channel: peer ops + presence ──
  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel>
    try {
      ch = supabase.channel(`campaign:${campaignId}`, {
        config: { presence: { key: sessionId } },
      })
      channelRef.current = ch

      ch.on('broadcast', { event: 'op' }, ({ payload }) => {
        if (!payload || payload.sender === sessionId) return
        applyAction(payload.action as string, (payload.p ?? {}) as PutPayload & RemovePayload)
      })
        .on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState() as Record<string, Array<{ seat: string; name: string; sessionId: string }>>
          const players = Object.values(state).flat().map((m) => ({ seat: m.seat, name: m.name, sessionId: m.sessionId }))
          setOnlinePlayers(players)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            try {
              ch.track({ seat: seatKey(seat), name: seat.name, sessionId })
            } catch { /* ignore */ }
          }
        })
      return () => { ch.unsubscribe() }
    } catch {
      return () => { /* realtime unavailable */ }
    }
  }, [campaignId, sessionId, seat, applyAction])

  return (
    <GameContext.Provider
      value={{
        loading, loadError, campaignId, onlinePlayers,
        role, setRole,
        characters, updateCharacter,
        crew, updateCrew,
        clocks, updateClock, addClock, deleteClock,
        factions, updateFaction, addFaction, deleteFaction,
        activeCharacterId, setActiveCharacter,
        mapTokens, updateMapToken, addMapToken, removeMapToken, commitMapToken,
        mapImageUrl, setMapImage: setMapImageSynced,
        endScore,
        currentScore, startScore, updateScore, wrapScore, abandonScore,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
