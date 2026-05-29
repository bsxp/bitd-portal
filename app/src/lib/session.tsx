import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { findCampaignByCode } from './db'

// A "seat" is what a connected client has claimed: either the GM chair or a
// specific player character.
export type Seat =
  | { type: 'gm'; name: string }
  | { type: 'character'; id: string; name: string }

export interface Session {
  campaignId: string
  campaignName: string
  seat: Seat | null
}

interface SessionContextValue {
  session: Session | null
  sessionId: string
  joinCampaign: (code: string) => Promise<{ ok: boolean; error?: string }>
  claimSeat: (seat: Seat) => void
  releaseSeat: () => void
  leaveCampaign: () => void
}

const STORAGE_KEY = 'bitd.session'
const SESSION_ID_KEY = 'bitd.sessionId'

const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}

function loadStored(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function persist(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

// A per-tab client id so presence/realtime can distinguish connections.
// Uses sessionStorage (NOT localStorage) so two windows of the same browser
// profile are treated as distinct clients — otherwise they'd share one id and
// filter out each other's cursors, presence, and broadcasts as "self".
// sessionStorage still survives a refresh within the same tab.
function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_ID_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadStored)
  const [sessionId] = useState(getSessionId)

  const joinCampaign = useCallback(async (code: string) => {
    const trimmed = code.trim()
    if (!/^\d{4}$/.test(trimmed)) {
      return { ok: false, error: 'Enter a 4-digit code.' }
    }
    try {
      const campaign = await findCampaignByCode(trimmed)
      if (!campaign) return { ok: false, error: 'No campaign found for that code.' }
      const next: Session = { campaignId: campaign.id, campaignName: campaign.name, seat: null }
      setSession(next)
      persist(next)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Could not reach the server. Try again.' }
    }
  }, [])

  const claimSeat = useCallback((seat: Seat) => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, seat }
      persist(next)
      return next
    })
  }, [])

  const releaseSeat = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev
      const next = { ...prev, seat: null }
      persist(next)
      return next
    })
  }, [])

  const leaveCampaign = useCallback(() => {
    setSession(null)
    persist(null)
  }, [])

  return (
    <SessionContext.Provider value={{ session, sessionId, joinCampaign, claimSeat, releaseSeat, leaveCampaign }}>
      {children}
    </SessionContext.Provider>
  )
}
