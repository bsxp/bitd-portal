import { cn } from '@/lib/utils'
import { ACTION_RATINGS } from '@/lib/types'
import { InfoLabel } from '@/components/InfoLabel'
import type { Character, AttributeName, ActionName } from '@/lib/types'

const ATTRIBUTE_TIPS: Record<AttributeName, string> = {
  insight: 'Resist with Insight when you face deception, extortion, or supernatural influence. Rating = actions with at least 1 dot.',
  prowess: 'Resist with Prowess when you face physical harm or exhaustion. Rating = actions with at least 1 dot.',
  resolve: 'Resist with Resolve when you face fear, social pressure, or mental strain. Rating = actions with at least 1 dot.',
}

interface ActionRatingsProps {
  character: Character
  onActionChange: (action: ActionName, value: number) => void
  readonly?: boolean
}

export function ActionRatings({ character, onActionChange, readonly }: ActionRatingsProps) {
  function handleDotClick(action: ActionName, index: number) {
    if (readonly) return
    const current = character[action] as number
    onActionChange(action, current === index + 1 ? index : index + 1)
  }

  return (
    <div className="space-y-4">
      {(Object.entries(ACTION_RATINGS) as [AttributeName, readonly ActionName[]][]).map(
        ([attribute, actions]) => {
          const attrRating = actions.filter((a) => (character[a] as number) > 0).length
          return (
            <div key={attribute} className="space-y-1">
              <div className="flex items-center gap-2">
                <InfoLabel label={attribute} tip={ATTRIBUTE_TIPS[attribute]} />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-3 w-3 rounded-full',
                        i < attrRating
                          ? 'bg-primary'
                          : 'border-2 border-muted-foreground/50 bg-muted',
                      )}
                    />
                  ))}
                </div>
              </div>
              {actions.map((action) => {
                const value = character[action] as number
                return (
                  <div key={action} className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleDotClick(action, i)}
                          disabled={readonly}
                          className={cn(
                            'h-4 w-4 rounded-full border-2 transition-colors',
                            i < value
                              ? 'border-foreground bg-foreground'
                              : 'border-muted-foreground/50 bg-muted',
                            !readonly && 'cursor-pointer hover:border-foreground/70',
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm capitalize">{action}</span>
                  </div>
                )
              })}
            </div>
          )
        },
      )}
    </div>
  )
}
