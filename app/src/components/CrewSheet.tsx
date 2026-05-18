import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { XPTracker } from '@/components/trackers/XPTracker'
import { CoinTracker } from '@/components/trackers/CoinTracker'
import { ClaimsMap } from '@/components/trackers/ClaimsMap'
import { CREW_XP_TRIGGERS } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import type { Crew } from '@/lib/types'

interface CrewSheetProps {
  crew: Crew
  onUpdate: (updates: Partial<Crew>) => void
  readonly?: boolean
}

export function CrewSheet({ crew, onUpdate, readonly }: CrewSheetProps) {
  function handleRepClick(index: number) {
    if (readonly) return
    onUpdate({ rep: crew.rep === index + 1 ? index : index + 1 })
  }

  function handleHeatClick(index: number) {
    if (readonly) return
    onUpdate({ heat: crew.heat === index + 1 ? index : index + 1 })
  }

  return (
    <div className="space-y-4">
      {/* Crew Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-baseline gap-3">
            <CardTitle className="text-2xl">{crew.name}</CardTitle>
            {crew.crew_type && (
              <span className="rounded bg-primary/10 px-2 py-0.5 text-sm font-semibold uppercase text-primary">
                {crew.crew_type}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Reputation</Label>
              <Input
                value={crew.reputation ?? ''}
                onChange={(e) => onUpdate({ reputation: e.target.value })}
                readOnly={readonly}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Lair</Label>
              <Input
                value={crew.lair_location ?? ''}
                onChange={(e) => onUpdate({ lair_location: e.target.value })}
                readOnly={readonly}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Hunting Grounds</Label>
              <Input
                value={crew.hunting_grounds_location ?? ''}
                onChange={(e) => onUpdate({ hunting_grounds_location: e.target.value })}
                readOnly={readonly}
                className="mt-1 h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier, Hold, Rep */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-4">
            {/* Tier & Hold */}
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider">Tier</span>
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => !readonly && onUpdate({ tier: crew.tier === i + 1 ? i : i + 1 })}
                      disabled={readonly}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded border-2 text-sm font-bold transition-colors',
                        i < crew.tier
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30',
                        !readonly && 'cursor-pointer hover:border-primary/50',
                      )}
                    >
                      {['0', 'I', 'II', 'III', 'IV'][i]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-semibold uppercase tracking-wider">Hold</span>
                <div className="mt-1 flex gap-2">
                  {(['strong', 'weak'] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => !readonly && onUpdate({ hold: h })}
                      disabled={readonly}
                      className={cn(
                        'rounded-md border px-3 py-1 text-sm font-medium capitalize transition-colors',
                        crew.hold === h
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30',
                        !readonly && 'cursor-pointer',
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Rep */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider">Rep</span>
                <span className="text-sm text-muted-foreground">{crew.rep}/12</span>
              </div>
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleRepClick(i)}
                    disabled={readonly}
                    className={cn(
                      'h-5 w-5 rounded-sm border transition-colors',
                      i < crew.rep
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-muted-foreground/30 bg-transparent',
                      !readonly && 'cursor-pointer hover:border-blue-400',
                    )}
                  />
                ))}
              </div>
              {crew.rep >= 12 && (
                <p className="text-xs font-bold text-primary">Ready to advance Tier!</p>
              )}
            </div>

            <Separator />

            {/* Crew XP */}
            <XPTracker
              label="Crew XP"
              current={crew.crew_xp}
              max={8}
              onXPChange={(crew_xp) => onUpdate({ crew_xp })}
              readonly={readonly}
            />
            {crew.crew_type && (
              <p className="text-xs italic text-muted-foreground">
                {CREW_XP_TRIGGERS[crew.crew_type]}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-4">
            {/* Heat & Wanted */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider">Heat</span>
                <span className="text-sm text-muted-foreground">{crew.heat}/9</span>
              </div>
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleHeatClick(i)}
                    disabled={readonly}
                    className={cn(
                      'h-5 w-5 rounded-sm border transition-colors',
                      i < crew.heat
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-muted-foreground/30 bg-transparent',
                      !readonly && 'cursor-pointer hover:border-orange-400',
                    )}
                  />
                ))}
              </div>
              {crew.heat >= 9 && (
                <p className="text-xs font-bold text-destructive">Wanted Level increases!</p>
              )}
            </div>

            <Separator />

            {/* Wanted Level */}
            <div className="space-y-1">
              <span className="text-sm font-semibold uppercase tracking-wider">Wanted Level</span>
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (readonly) return
                      onUpdate({ wanted_level: crew.wanted_level === i + 1 ? i : i + 1 })
                    }}
                    disabled={readonly}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                      i < crew.wanted_level
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-muted-foreground/30',
                      !readonly && 'cursor-pointer hover:border-red-500',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Coin */}
            <CoinTracker
              label="Coin"
              value={crew.coin}
              max={crew.vault_capacity}
              onChange={(coin) => onUpdate({ coin })}
              readonly={readonly}
            />
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={crew.notes ?? ''}
            onChange={(e) => onUpdate({ notes: e.target.value || null })}
            readOnly={readonly}
            placeholder="Crew notes, plans, contacts..."
            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          />
        </CardContent>
      </Card>

      {/* Claims Map */}
      {crew.crew_type && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <ClaimsMap
              crewType={crew.crew_type}
              claimsSeized={crew.claims_seized}
              onToggleClaim={(key) => {
                const seized = crew.claims_seized.includes(key)
                  ? crew.claims_seized.filter((k) => k !== key)
                  : [...crew.claims_seized, key]
                onUpdate({ claims_seized: seized })
              }}
              readonly={readonly}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
