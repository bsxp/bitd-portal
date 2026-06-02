import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ClockDisplay } from '@/components/trackers/ClockDisplay'
import { cn } from '@/lib/utils'
import { FACTION_STATUS_LABELS } from '@/lib/types'
import { Minus, Plus, RotateCcw, Flame, TrendingUp, Coins } from 'lucide-react'
import type { Character, Crew, Clock, Faction } from '@/lib/types'

interface OverviewProps {
  characters: Character[]
  crew: Crew | null
  clocks: Clock[]
  factions?: Faction[]
  isGM: boolean
  onCharacterClick: (id: string) => void
  onCharacterUpdate?: (id: string, updates: Partial<Character>) => void
  onCrewUpdate?: (updates: Partial<Crew>) => void
  onClockUpdate?: (id: string, updates: Partial<Clock>) => void
  onEndScore?: () => void
}

function StressPips({ stress, max = 9 }: { stress: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2.5 w-2.5 rounded-sm',
            i < stress ? 'bg-red-500' : 'bg-muted-foreground/20',
          )}
        />
      ))}
    </div>
  )
}

function HarmSummary({ character }: { character: Character }) {
  const harms = [
    character.harm_level3,
    character.harm_level2_a,
    character.harm_level2_b,
    character.harm_level1_a,
    character.harm_level1_b,
  ].filter(Boolean)

  if (harms.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {character.harm_level3 && (
        <Badge variant="destructive" className="text-[10px]">
          Lv3: {character.harm_level3}
        </Badge>
      )}
      {character.harm_level2_a && (
        <Badge variant="secondary" className="bg-orange-500/15 text-orange-700 text-[10px]">
          Lv2: {character.harm_level2_a}
        </Badge>
      )}
      {character.harm_level2_b && (
        <Badge variant="secondary" className="bg-orange-500/15 text-orange-700 text-[10px]">
          Lv2: {character.harm_level2_b}
        </Badge>
      )}
      {character.harm_level1_a && (
        <Badge variant="secondary" className="text-[10px]">
          Lv1: {character.harm_level1_a}
        </Badge>
      )}
      {character.harm_level1_b && (
        <Badge variant="secondary" className="text-[10px]">
          Lv1: {character.harm_level1_b}
        </Badge>
      )}
    </div>
  )
}

function GMQuickActions({
  characters,
  crew,
  onCharacterUpdate,
  onCrewUpdate,
  onEndScore,
}: {
  characters: Character[]
  crew: Crew | null
  onCharacterUpdate: (id: string, updates: Partial<Character>) => void
  onCrewUpdate: (updates: Partial<Crew>) => void
  onEndScore: () => void
}) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">GM Quick Actions</CardTitle>
          <div className="flex flex-wrap gap-4">
            {crew && (
              <>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium">Rep</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    disabled={crew.rep <= 0}
                    onClick={() => onCrewUpdate({ rep: Math.max(0, crew.rep - 1) })}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums">{crew.rep}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    disabled={crew.rep >= 12}
                    onClick={() => onCrewUpdate({ rep: Math.min(12, crew.rep + 1) })}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs font-medium">Heat</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    disabled={crew.heat <= 0}
                    onClick={() => onCrewUpdate({ heat: Math.max(0, crew.heat - 1) })}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums">{crew.heat}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      const newHeat = crew.heat + 1
                      if (newHeat >= 9) {
                        onCrewUpdate({
                          heat: 0,
                          wanted_level: Math.min(crew.wanted_level + 1, 4),
                        })
                      } else {
                        onCrewUpdate({ heat: newHeat })
                      }
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={onEndScore}
            >
              <RotateCcw className="h-3 w-3" />
              End Score
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {characters.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-md border bg-background p-2"
            >
              {/* Name + playbook */}
              <div className="w-28 shrink-0">
                <span className="text-sm font-medium">{c.name}</span>
                {c.playbook && (
                  <span className="ml-1 text-xs text-muted-foreground capitalize">
                    ({c.playbook})
                  </span>
                )}
              </div>

              {/* Stress +/- */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground w-10">Stress</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  disabled={c.stress <= 0}
                  onClick={() =>
                    onCharacterUpdate(c.id, { stress: Math.max(0, c.stress - 1) })
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-5 text-center text-sm font-bold tabular-nums">
                  {c.stress}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  disabled={c.stress >= 9}
                  onClick={() =>
                    onCharacterUpdate(c.id, { stress: Math.min(9, c.stress + 1) })
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Quick harm entry */}
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <span className="text-xs text-muted-foreground w-8 shrink-0">Harm</span>
                <Input
                  data-harm-input={c.id}
                  placeholder="Description..."
                  className="h-6 min-w-0 flex-1 text-xs"
                />
                {[1, 2, 3].map((level) => {
                  const full = level === 3
                    ? !!c.harm_level3
                    : level === 2
                    ? !!c.harm_level2_a && !!c.harm_level2_b
                    : !!c.harm_level1_a && !!c.harm_level1_b
                  return (
                    <button
                      key={level}
                      disabled={full}
                      onClick={() => {
                        const input = document.querySelector(
                          `[data-harm-input="${c.id}"]`
                        ) as HTMLInputElement
                        const val = input?.value.trim()
                        if (!val) return
                        if (level === 1) {
                          if (!c.harm_level1_a) onCharacterUpdate(c.id, { harm_level1_a: val })
                          else if (!c.harm_level1_b) onCharacterUpdate(c.id, { harm_level1_b: val })
                        } else if (level === 2) {
                          if (!c.harm_level2_a) onCharacterUpdate(c.id, { harm_level2_a: val })
                          else if (!c.harm_level2_b) onCharacterUpdate(c.id, { harm_level2_b: val })
                        } else {
                          if (!c.harm_level3) onCharacterUpdate(c.id, { harm_level3: val })
                        }
                        if (input) input.value = ''
                      }}
                      className={cn(
                        'h-6 w-6 rounded border text-[10px] font-bold transition-colors',
                        full
                          ? 'border-muted-foreground/20 text-muted-foreground/30'
                          : level === 3
                          ? 'border-red-500/50 text-red-600 hover:bg-red-500/10 cursor-pointer'
                          : level === 2
                          ? 'border-orange-500/50 text-orange-600 hover:bg-orange-500/10 cursor-pointer'
                          : 'border-yellow-500/50 text-yellow-700 hover:bg-yellow-500/10 cursor-pointer',
                      )}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Coin +/- */}
              <div className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-yellow-600" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  disabled={c.coin <= 0}
                  onClick={() =>
                    onCharacterUpdate(c.id, { coin: Math.max(0, c.coin - 1) })
                  }
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-5 text-center text-sm font-bold tabular-nums text-yellow-600">
                  {c.coin}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    onCharacterUpdate(c.id, { coin: c.coin + 1 })
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Harm: type a description, then click the level button (1/2/3) to place it.
          End Score resets load, items, and armor for all characters.
        </p>
      </CardContent>
    </Card>
  )
}

function CharacterCard({
  character,
  onClick,
}: {
  character: Character
  onClick: () => void
}) {
  const armorStatus = [
    character.armor_available && !character.armor_used && 'Armor',
    character.heavy_armor_available && !character.heavy_armor_used && 'Heavy',
    character.special_armor_available && !character.special_armor_used && 'Special',
  ].filter(Boolean)

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-lg">{character.name}</CardTitle>
            {character.alias && (
              <span className="text-sm text-muted-foreground">"{character.alias}"</span>
            )}
          </div>
          {character.playbook && (
            <Badge variant="outline" className="text-xs capitalize">
              {character.playbook}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stress */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Stress</span>
          <div className="flex items-center gap-2">
            <StressPips stress={character.stress} />
            <span className="text-xs tabular-nums text-muted-foreground">{character.stress}/9</span>
          </div>
        </div>

        {/* Trauma */}
        {character.trauma.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.trauma.map((t) => (
              <Badge key={t} variant="destructive" className="text-[10px] uppercase">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {/* Harm — only shown when the character is actually harmed */}
        {(character.harm_level3 || character.harm_level2_a || character.harm_level2_b ||
          character.harm_level1_a || character.harm_level1_b) && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Harm</span>
            <HarmSummary character={character} />
          </div>
        )}

        <Separator />

        {/* Bottom row: healing, armor, coin */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {character.healing_clock > 0 && (
              <div className="flex items-center gap-1">
                <ClockDisplay segments={4} filled={character.healing_clock} size={24} readonly />
                <span className="text-[10px] text-muted-foreground">Healing</span>
              </div>
            )}
            {armorStatus.length > 0 && (
              <div className="flex gap-1">
                {armorStatus.map((a) => (
                  <Badge key={a as string} variant="outline" className="text-[10px]">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {character.coin > 0 && (
              <span className="text-xs">
                <span className="text-yellow-600">{character.coin}</span> coin
              </span>
            )}
            {character.load_level && (
              <Badge className="text-[10px] capitalize">{character.load_level} load</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Overview({
  characters,
  crew,
  clocks,
  factions,
  isGM,
  onCharacterClick,
  onCharacterUpdate,
  onCrewUpdate,
  onClockUpdate,
  onEndScore,
}: OverviewProps) {
  const activeClocks = clocks.filter((c) => c.active && c.filled < c.segments)

  return (
    <div className="space-y-6">
      {/* GM Quick Actions */}
      {isGM && onCharacterUpdate && onCrewUpdate && onEndScore && (
        <GMQuickActions
          characters={characters}
          crew={crew}
          onCharacterUpdate={onCharacterUpdate}
          onCrewUpdate={onCrewUpdate}
          onEndScore={onEndScore}
        />
      )}

      {/* Character cards */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Scoundrels</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              onClick={() => onCharacterClick(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Active clocks summary */}
      {activeClocks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Active Clocks</h2>
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-5">
                {activeClocks.map((clock) => (
                  <div key={clock.id} className="flex items-center gap-2">
                    <ClockDisplay
                      segments={clock.segments}
                      filled={clock.filled}
                      size={36}
                      onSegmentClick={isGM && onClockUpdate
                        ? (filled) => onClockUpdate(clock.id, { filled })
                        : undefined}
                      readonly={!isGM || !onClockUpdate}
                    />
                    <div>
                      <span className="text-sm font-medium">{clock.name}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {clock.filled}/{clock.segments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Faction status at a glance (GM only) */}
      {isGM && factions && factions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Faction Status</h2>
          <Card>
            <CardContent className="py-4">
              <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {factions
                  .filter((f) => f.status !== 0)
                  .sort((a, b) => a.status - b.status)
                  .map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-sm">
                      <span>{f.name}</span>
                      <span className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        f.status > 0 && 'bg-green-500/15 text-green-700',
                        f.status < 0 && 'bg-red-500/15 text-red-700',
                      )}>
                        {f.status > 0 ? '+' : ''}{f.status} {FACTION_STATUS_LABELS[f.status]}
                      </span>
                    </div>
                  ))}
                {factions.filter((f) => f.status === 0).length > 0 && (
                  <div className="text-xs text-muted-foreground sm:col-span-full">
                    +{factions.filter((f) => f.status === 0).length} neutral factions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
