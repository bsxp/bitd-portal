import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ACTION_RATINGS } from '@/lib/types'
import { InfoLabel } from '@/components/InfoLabel'
import type { Character, AttributeName, ActionName } from '@/lib/types'

const ATTRIBUTE_TIPS: Record<AttributeName, string> = {
  insight: 'Resist with Insight when you face deception, extortion, or supernatural influence. Rating = actions with at least 1 dot.',
  prowess: 'Resist with Prowess when you face physical harm or exhaustion. Rating = actions with at least 1 dot.',
  resolve: 'Resist with Resolve when you face fear, social pressure, or mental strain. Rating = actions with at least 1 dot.',
}

const ATTRIBUTE_XP_TIPS: Record<AttributeName, string> = {
  insight: 'Mark when you roll a desperate Hunt, Study, Survey, or Tinker. Fill all 6 to advance an Insight action.',
  prowess: 'Mark when you roll a desperate Finesse, Prowl, Skirmish, or Wreck. Fill all 6 to advance a Prowess action.',
  resolve: 'Mark when you roll a desperate Attune, Command, Consort, or Sway. Fill all 6 to advance a Resolve action.',
}

const ATTRIBUTE_XP_FIELD: Record<AttributeName, keyof Character> = {
  insight: 'insight_xp',
  prowess: 'prowess_xp',
  resolve: 'resolve_xp',
}

const ATTRIBUTE_XP_MAX = 6
const ACTION_MAX = 4

interface ActionRatingsProps {
  character: Character
  onActionChange: (action: ActionName, value: number) => void
  /** Raw multi-field update — used by the advance flow to bump an action and reset xp together. */
  onUpdate: (updates: Partial<Character>) => void
  readonly?: boolean
  /** GM keeps free editing of dots and XP. Players are gated to the advance flow. */
  isGM?: boolean
}

export function ActionRatings({ character, onActionChange, onUpdate, readonly, isGM }: ActionRatingsProps) {
  // Which attribute currently has its action-picker open (player advance flow).
  const [advancing, setAdvancing] = useState<AttributeName | null>(null)

  // Players may not free-edit action dots; only the GM (or the gated advance flow) can.
  const dotsEditable = !readonly && !!isGM
  const xpEditable = !readonly

  function handleDotClick(action: ActionName, index: number) {
    if (!dotsEditable) return
    const current = character[action] as number
    onActionChange(action, current === index + 1 ? index : index + 1)
  }

  function handleXPClick(attribute: AttributeName, index: number) {
    if (!xpEditable) return
    const field = ATTRIBUTE_XP_FIELD[attribute]
    const current = character[field] as number
    onUpdate({ [field]: current === index + 1 ? index : index + 1 })
  }

  // Advance: +1 to the chosen action and reset that attribute's xp to 0, in one update.
  function applyAdvance(attribute: AttributeName, action: ActionName) {
    const current = character[action] as number
    if (current >= ACTION_MAX) return
    onUpdate({
      [action]: current + 1,
      [ATTRIBUTE_XP_FIELD[attribute]]: 0,
    })
    setAdvancing(null)
  }

  return (
    <div className="space-y-4">
      {(Object.entries(ACTION_RATINGS) as [AttributeName, readonly ActionName[]][]).map(
        ([attribute, actions]) => {
          const attrRating = actions.filter((a) => (character[a] as number) > 0).length
          const xp = character[ATTRIBUTE_XP_FIELD[attribute]] as number
          const xpFull = xp >= ATTRIBUTE_XP_MAX
          const advanceableActions = actions.filter((a) => (character[a] as number) < ACTION_MAX)
          const isOpen = advancing === attribute
          return (
            <div key={attribute} className="space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <InfoLabel label={attribute} tip={ATTRIBUTE_TIPS[attribute]} />
                {/* +up appears only when this attribute's XP track is full. */}
                {!readonly && xpFull && advanceableActions.length > 0 && (
                  <button
                    onClick={() => setAdvancing(isOpen ? null : attribute)}
                    title="Spend the full XP track to raise one action in this category by 1."
                    className={cn(
                      'rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                      isOpen
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-primary bg-primary/10 text-primary hover:bg-primary/20',
                    )}
                  >
                    +up
                  </button>
                )}
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

                {/* Per-attribute XP track, right by the title */}
                <div className="ml-auto flex items-center gap-1.5">
                  <InfoLabel
                    label="XP"
                    tip={ATTRIBUTE_XP_TIPS[attribute]}
                    className="text-[10px]"
                  />
                  <div className="flex gap-0.5">
                    {Array.from({ length: ATTRIBUTE_XP_MAX }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleXPClick(attribute, i)}
                        disabled={!xpEditable}
                        className={cn(
                          'h-3.5 w-3.5 rounded-full border-2 transition-colors',
                          i < xp
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/50 bg-muted',
                          xpEditable && 'cursor-pointer hover:border-primary/70',
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Picker: choose which action in this category gets +1 */}
              {isOpen && !readonly && (
                <div className="flex flex-wrap items-center gap-1 rounded-md border border-primary/40 bg-primary/5 p-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Raise:</span>
                  {advanceableActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => applyAdvance(attribute, action)}
                      className="rounded border border-primary/50 bg-background px-2 py-0.5 text-xs capitalize transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {action}
                    </button>
                  ))}
                  <button
                    onClick={() => setAdvancing(null)}
                    className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {actions.map((action) => {
                const value = character[action] as number
                return (
                  <div key={action} className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: ACTION_MAX }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleDotClick(action, i)}
                          disabled={!dotsEditable}
                          className={cn(
                            'h-4 w-4 rounded-full border-2 transition-colors',
                            i < value
                              ? 'border-foreground bg-foreground'
                              : 'border-muted-foreground/50 bg-muted',
                            dotsEditable && 'cursor-pointer hover:border-foreground/70',
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
