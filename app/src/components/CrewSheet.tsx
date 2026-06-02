import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { XPTracker } from '@/components/trackers/XPTracker'
import { CoinTracker } from '@/components/trackers/CoinTracker'
import { ClaimsMap } from '@/components/trackers/ClaimsMap'
import { InfoLabel } from '@/components/InfoLabel'
import {
  CREW_XP_TRIGGERS,
  CREW_ABILITIES,
  CREW_CLAIMS,
  claimKey,
  COMMON_CREW_UPGRADES,
  CREW_SPECIFIC_UPGRADES,
  CREW_UPGRADE_UNLOCKS,
} from '@/lib/game-data'
import type { CrewUpgrade } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import { COIN_CAPACITY } from '@/lib/store'
import type { Crew } from '@/lib/types'

const MAX_REP = 12

interface CrewSheetProps {
  crew: Crew
  onUpdate: (updates: Partial<Crew>) => void
  readonly?: boolean
}

export function CrewSheet({ crew, onUpdate, readonly }: CrewSheetProps) {
  // Count seized claims named exactly "Turf". Each turf reduces the rep needed
  // to advance tier by one.
  const turfCount = crew.crew_type
    ? CREW_CLAIMS[crew.crew_type].reduce(
        (acc, row, r) =>
          acc +
          row.filter(
            (claim, c) => claim.name === 'Turf' && crew.claims_seized.includes(claimKey(r, c)),
          ).length,
        0,
      )
    : 0
  const repNeeded = MAX_REP - turfCount
  const canAdvanceTier = crew.rep >= repNeeded && crew.tier < 5

  function handleUpgradeTier() {
    if (readonly || !canAdvanceTier) return
    onUpdate({ tier: Math.min(5, crew.tier + 1), rep: 0 })
  }

  function handleRepClick(index: number) {
    if (readonly) return
    onUpdate({ rep: crew.rep === index + 1 ? index : index + 1 })
  }

  function handleHeatClick(index: number) {
    if (readonly) return
    onUpdate({ heat: crew.heat === index + 1 ? index : index + 1 })
  }

  // Filled boxes for an upgrade = the count of its name in crew.upgrades.
  function filledBoxes(name: string): number {
    return crew.upgrades.filter((u) => u === name).length
  }

  // Clicking the next empty box appends the name; clicking the last filled box
  // removes one occurrence. boxIndex is 0-based.
  function handleUpgradeBoxClick(name: string, boxIndex: number, total: number) {
    if (readonly) return
    const filled = filledBoxes(name)
    if (boxIndex < filled) {
      // Removing — only allow removing the last filled box.
      if (boxIndex !== filled - 1) return
      const next = [...crew.upgrades]
      next.splice(next.lastIndexOf(name), 1)
      onUpdate({ upgrades: next })
    } else {
      // Adding — only allow filling the next empty box (and not past the max).
      if (boxIndex !== filled || filled >= total) return
      onUpdate({ upgrades: [...crew.upgrades, name] })
    }
  }

  function renderUpgrade(upgrade: CrewUpgrade) {
    const filled = filledBoxes(upgrade.name)
    const hasSecond = upgrade.boxes === 2 && filled >= 2
    return (
      <div
        key={upgrade.name}
        className={cn(
          'rounded-md border px-3 py-2 transition-colors',
          filled > 0 ? 'border-primary/40 bg-primary/5' : 'border-transparent bg-muted/30',
        )}
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex shrink-0 gap-1">
            {Array.from({ length: upgrade.boxes }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleUpgradeBoxClick(upgrade.name, i, upgrade.boxes)}
                disabled={readonly}
                className={cn(
                  'h-4 w-4 rounded-sm border-2 transition-colors',
                  i < filled
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40 bg-transparent',
                  !readonly && 'cursor-pointer hover:border-primary/60',
                )}
              />
            ))}
          </div>
          <div className="min-w-0">
            <span
              className={cn(
                'text-sm font-semibold',
                filled > 0 ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {upgrade.name}
            </span>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {upgrade.description}
            </p>
            {upgrade.secondBenefit && (
              <p
                className={cn(
                  'mt-1 text-xs leading-relaxed',
                  hasSecond ? 'font-medium text-primary' : 'italic text-muted-foreground/70',
                )}
              >
                2nd box: {upgrade.secondBenefit}
              </p>
            )}
          </div>
        </div>
      </div>
    )
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

      {/* Special Abilities */}
      {crew.crew_type && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <CardTitle className="text-lg capitalize">{crew.crew_type} Abilities</CardTitle>
              <XPTracker
                label="Crew XP"
                tip={`Mark at end of session for your crew trigger: ${CREW_XP_TRIGGERS[crew.crew_type]} At max (8), take a crew advance.`}
                current={crew.crew_xp}
                max={8}
                onXPChange={(crew_xp) => onUpdate({ crew_xp })}
                readonly={readonly}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 sm:grid-cols-2">
              {CREW_ABILITIES[crew.crew_type].map((ability) => {
                const selected = crew.special_abilities.includes(ability.name)
                return (
                  <button
                    key={ability.name}
                    onClick={() => {
                      if (readonly) return
                      const next = selected
                        ? crew.special_abilities.filter((a) => a !== ability.name)
                        : [...crew.special_abilities, ability.name]
                      onUpdate({ special_abilities: next })
                    }}
                    disabled={readonly}
                    className={cn(
                      'group flex w-full gap-2 rounded-md border px-3 py-2 text-left transition-colors',
                      selected
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-transparent bg-muted/30 opacity-50',
                      !readonly && 'cursor-pointer hover:opacity-100',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors',
                        selected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
                      )}
                    />
                    <div className="min-w-0">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          selected ? 'text-foreground' : 'text-muted-foreground',
                        )}
                      >
                        {ability.name}
                      </span>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {ability.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier, Hold, Rep */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-4">
            {/* Tier & Hold */}
            <div className="flex items-center gap-6">
              <div>
                <InfoLabel label="Tier" tip="Crew power level. Determines quality of equipment, cohorts, and the scale of your operations." />
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
                      {['I', 'II', 'III', 'IV', 'V'][i]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <InfoLabel label="Hold" tip="Strong: confident, expanding. Weak: struggling, vulnerable to takeover." />
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
                <InfoLabel label="Rep" tip="Earn from successful scores. When the track is full, spend to advance your Tier. Each Turf held reduces the rep needed by one (shown green)." />
                <span className="text-sm text-muted-foreground">
                  {crew.rep}/{repNeeded}
                  {turfCount > 0 && <span className="text-emerald-600 dark:text-emerald-400"> ({turfCount} turf)</span>}
                </span>
              </div>
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: MAX_REP }).map((_, i) => {
                  // The last `turfCount` boxes are discounted by held turf — shown
                  // green to indicate they don't need filling to advance.
                  const isTurfBox = i >= MAX_REP - turfCount
                  return (
                    <button
                      key={i}
                      onClick={() => handleRepClick(i)}
                      disabled={readonly}
                      className={cn(
                        'h-5 w-5 rounded-sm border transition-colors',
                        i < crew.rep
                          ? 'border-blue-500 bg-blue-500'
                          : isTurfBox
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-muted-foreground/30 bg-transparent',
                        !readonly && 'cursor-pointer hover:border-blue-400',
                      )}
                    />
                  )
                })}
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                {crew.rep >= repNeeded ? (
                  <p className="text-xs font-bold text-primary">Ready to advance Tier!</p>
                ) : (
                  <span />
                )}
                <button
                  onClick={handleUpgradeTier}
                  disabled={readonly || !canAdvanceTier}
                  className={cn(
                    'rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
                    canAdvanceTier
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground/50',
                    !readonly && canAdvanceTier && 'cursor-pointer hover:bg-primary/90',
                  )}
                >
                  Upgrade Tier
                </button>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-4">
            {/* Heat & Wanted */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <InfoLabel label="Heat" tip="Accumulates from scores. At 9, wanted level increases and heat resets to 0." />
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
              <InfoLabel label="Wanted Level" tip="Attracts Bluecoat and Inspector attention. At 4, expect serious trouble." />
              <div className="flex gap-1">
                <button
                  onClick={() => { if (!readonly) onUpdate({ wanted_level: 0 }) }}
                  disabled={readonly}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                    crew.wanted_level === 0
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-muted-foreground/30',
                    !readonly && 'cursor-pointer hover:border-foreground/60',
                  )}
                >
                  0
                </button>
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
              tip="Crew treasury. Coin above capacity is ephemeral — spend it (e.g. to advance Tier or acquire assets) during downtime or it's wiped before the next score."
              value={crew.coin}
              max={COIN_CAPACITY}
              onChange={(coin) => onUpdate({ coin })}
              readonly={readonly}
              ephemeral
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

      {/* Crew Upgrades */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Crew Upgrades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {COMMON_CREW_UPGRADES.map((group) => {
            const unlockDef = CREW_UPGRADE_UNLOCKS[group.group]
            const unlockGranted =
              unlockDef !== undefined &&
              unlockDef.prerequisites.every((name) => filledBoxes(name) >= 1)
            return (
              <div key={group.group}>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.group}
                </h4>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {group.upgrades.map(renderUpgrade)}
                </div>
                {unlockDef && (
                  <div
                    className={cn(
                      'mt-1.5 rounded-md border px-3 py-2',
                      unlockGranted
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-dashed border-muted-foreground/30 bg-muted/20',
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        unlockGranted ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {unlockDef.unlock}
                      {unlockGranted ? ' — granted' : ' (fill all 4 boxes to unlock)'}
                    </span>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {unlockDef.description}
                    </p>
                  </div>
                )}
              </div>
            )
          })}

          {crew.crew_type && (
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="capitalize">{crew.crew_type}</span> Upgrades
              </h4>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {CREW_SPECIFIC_UPGRADES[crew.crew_type].map(renderUpgrade)}
              </div>
            </div>
          )}
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
