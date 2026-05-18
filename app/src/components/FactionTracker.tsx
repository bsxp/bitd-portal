import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FACTION_STATUS_LABELS } from '@/lib/types'
import type { Faction } from '@/lib/types'

interface FactionTrackerProps {
  factions: Faction[]
  onUpdate: (id: string, updates: Partial<Faction>) => void
  readonly?: boolean
}

export function FactionTracker({ factions, onUpdate, readonly }: FactionTrackerProps) {
  const grouped = factions.reduce<Record<string, Faction[]>>((acc, f) => {
    const cat = f.category ?? 'Other'
    ;(acc[cat] ??= []).push(f)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryFactions]) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryFactions.map((faction) => (
                <div key={faction.id} className="flex items-center gap-3 rounded-md border p-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{faction.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Tier {faction.tier} ({faction.hold[0].toUpperCase()})
                      </span>
                    </div>
                    {faction.description && (
                      <p className="text-xs text-muted-foreground">{faction.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {[-3, -2, -1, 0, 1, 2, 3].map((s) => (
                      <button
                        key={s}
                        onClick={() => !readonly && onUpdate(faction.id, { status: s })}
                        disabled={readonly}
                        title={FACTION_STATUS_LABELS[s]}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-colors',
                          faction.status === s
                            ? s > 0
                              ? 'bg-green-500 text-white'
                              : s < 0
                                ? 'bg-red-500 text-white'
                                : 'bg-muted-foreground text-white'
                            : 'bg-muted text-muted-foreground',
                          !readonly && 'cursor-pointer hover:opacity-80',
                        )}
                      >
                        {s > 0 ? `+${s}` : s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
