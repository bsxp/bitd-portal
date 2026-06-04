import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, type Seat } from '@/lib/session'
import { loadOrSeedCampaign } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { KeyRound, Shield, User, Loader2, ArrowLeft, UserPlus } from 'lucide-react'
import type { Character } from '@/lib/types'
import { CharacterCreate } from '@/components/CharacterCreate'
import { CharacterAvatar } from '@/components/CharacterAvatar'

export function LoginGate() {
  const { session } = useSession()
  if (!session) return <CodeEntry />
  return <ClaimSeat />
}

function CodeEntry() {
  const { joinCampaign } = useSession()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    setError(null)
    const res = await joinCampaign(code)
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong.')
      setBusy(false)
    }
    // on success the session updates and the gate advances to ClaimSeat
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Blades in the Dark</CardTitle>
          <p className="text-sm text-muted-foreground">Enter your crew's 4-digit code to join.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={(e) => e.key === 'Enter' && code.length === 4 && submit()}
            placeholder="0000"
            inputMode="numeric"
            autoFocus
            className="text-center text-2xl tracking-[0.5em] tabular-nums"
          />
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <Button className="w-full" disabled={code.length !== 4 || busy} onClick={submit}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join Campaign'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ClaimSeat() {
  const { session, sessionId, claimSeat, leaveCampaign } = useSession()
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // seat keys currently occupied by online players
  const [online, setOnline] = useState<Map<string, string>>(new Map())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const campaignId = session!.campaignId

  // Ensure the campaign has data (seeds the demo on first ever load), then list characters.
  useEffect(() => {
    let cancelled = false
    loadOrSeedCampaign(campaignId)
      .then((data) => { if (!cancelled) setCharacters(data.characters) })
      .catch(() => { if (!cancelled) setError('Could not load this campaign.') })
    return () => { cancelled = true }
  }, [campaignId])

  // Read presence on the campaign channel to show who's already signed in.
  useEffect(() => {
    const ch = supabase.channel(`campaign:${campaignId}`, {
      config: { presence: { key: `lobby-${sessionId}` } },
    })
    channelRef.current = ch
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState() as Record<string, Array<{ seat: string; name: string }>>
      const map = new Map<string, string>()
      for (const entries of Object.values(state)) {
        for (const e of entries) if (e.seat) map.set(e.seat, e.name)
      }
      setOnline(map)
    })
    ch.subscribe()
    return () => { ch.unsubscribe() }
  }, [campaignId, sessionId])

  function claim(seat: Seat, key: string) {
    if (online.has(key)) return // taken
    claimSeat(seat)
  }

  if (creating) {
    return (
      <CharacterCreate
        campaignId={campaignId}
        onCancel={() => setCreating(false)}
        onCreated={(char) => {
          setCharacters((prev) => [...(prev ?? []), char])
          claimSeat({ type: 'character', id: char.id, name: char.name })
        }}
      />
    )
  }

  const SeatRow = ({ seatKey, name, sub, icon, avatar, seat }: {
    seatKey: string; name: string; sub?: string; icon: React.ReactNode; avatar?: React.ReactNode; seat: Seat
  }) => {
    const takenBy = online.get(seatKey)
    const taken = !!takenBy
    return (
      <button
        onClick={() => claim(seat, seatKey)}
        disabled={taken}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors',
          taken
            ? 'cursor-not-allowed border-muted bg-muted/40 opacity-70'
            : 'border-muted-foreground/20 hover:border-primary hover:bg-accent/50',
        )}
      >
        {avatar ?? (
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            taken ? 'bg-muted-foreground/10 text-muted-foreground' : 'bg-primary/10 text-primary',
          )}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium">{name}</div>
          {sub && <div className="text-xs text-muted-foreground capitalize">{sub}</div>}
        </div>
        {taken && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Online
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <button
            onClick={leaveCampaign}
            className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Change code
          </button>
          <CardTitle className="text-xl">{session!.campaignName}</CardTitle>
          <p className="text-sm text-muted-foreground">Choose your seat. Online players are already signed in.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <SeatRow
            seatKey="gm"
            name="Game Master"
            sub="Run the table"
            icon={<Shield className="h-4 w-4" />}
            seat={{ type: 'gm', name: 'Game Master' }}
          />

          <div className="px-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Characters
          </div>

          {characters === null ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading roster…
            </div>
          ) : characters.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No characters yet.</p>
          ) : (
            characters.map((c) => (
              <SeatRow
                key={c.id}
                seatKey={c.id}
                name={c.name}
                sub={[c.alias && `"${c.alias}"`, c.playbook].filter(Boolean).join(' · ') || undefined}
                icon={<User className="h-4 w-4" />}
                avatar={<CharacterAvatar character={c} size="md" className="h-9 w-9" />}
                seat={{ type: 'character', id: c.id, name: c.name }}
              />
            ))
          )}

          <button
            onClick={() => setCreating(true)}
            className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 px-4 py-3 text-left text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10">
              <UserPlus className="h-4 w-4" />
            </div>
            <div className="font-medium">Create a character…</div>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
