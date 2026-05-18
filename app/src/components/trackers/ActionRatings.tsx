import { cn } from '@/lib/utils'
import { ACTION_RATINGS } from '@/lib/types'
import type { Character, AttributeName, ActionName } from '@/lib/types'

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
    <div className="grid gap-4 sm:grid-cols-3">
      {(Object.entries(ACTION_RATINGS) as [AttributeName, readonly ActionName[]][]).map(
        ([attribute, actions]) => (
          <div key={attribute} className="space-y-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider">{attribute}</h4>
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
                          'h-3.5 w-3.5 rounded-full border transition-colors',
                          i < value
                            ? 'border-foreground bg-foreground'
                            : 'border-muted-foreground/40 bg-transparent',
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
        ),
      )}
    </div>
  )
}
