import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TRAUMA_OPTIONS } from '@/lib/types'
import { InfoLabel } from '@/components/InfoLabel'

interface StressTrackerProps {
  stress: number
  trauma: string[]
  maxStress?: number
  onStressChange: (value: number) => void
  onTraumaOut?: (trauma: string) => void
  onTraumaChange?: (trauma: string[]) => void
  readonly?: boolean
}

const MAX_TRAUMA = 4

export function StressTracker({ stress, trauma, maxStress = 9, onStressChange, onTraumaOut, onTraumaChange, readonly }: StressTrackerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const availableTraumas = TRAUMA_OPTIONS.filter((t) => !trauma.includes(t))

  // The picker doubles as the "trauma out" prompt when stress maxes and as a
  // manual "add a trauma" menu when an empty Trauma box is clicked.
  const stressMaxed = stress >= maxStress
  const pickerVisible = (stressMaxed && !!onTraumaOut && availableTraumas.length > 0) ||
    (showPicker && availableTraumas.length > 0)

  function handleStressClick(index: number) {
    if (readonly) return
    onStressChange(stress === index + 1 ? index : index + 1)
  }

  function removeTrauma(t: string) {
    if (readonly) return
    onTraumaChange?.(trauma.filter((x) => x !== t))
  }

  function pickTrauma(t: string) {
    if (stressMaxed && onTraumaOut) {
      onTraumaOut(t) // resets stress to 0
    } else {
      onTraumaChange?.([...trauma, t])
    }
    setShowPicker(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <InfoLabel label="Stress" tip="Pushing yourself, resisting consequences, and special abilities cost stress. At 9, you trauma out — pick a trauma and reset to 0." />
        <span className="text-sm text-muted-foreground">{stress}/{maxStress}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxStress }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleStressClick(i)}
            disabled={readonly}
            className={cn(
              'h-7 w-7 rounded-sm border-2 transition-colors',
              i < stress
                ? 'border-red-400 bg-red-500'
                : 'border-muted-foreground/50 bg-muted',
              !readonly && 'cursor-pointer hover:border-red-400',
            )}
          />
        ))}
      </div>

      {/* Trauma: four slots. Each acquired trauma fills a slot with its name; the
          first empty slot opens the picker. At four traumas the character is done. */}
      <div className="space-y-1.5 pt-1">
        <InfoLabel label="Trauma" tip="Each time you trauma out you gain a lasting, named trauma. At 4 traumas your character is done — they retire or are lost. Click an empty box to add one, or a filled box to remove it." />
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: MAX_TRAUMA }).map((_, i) => {
            const name = trauma[i]
            if (name) {
              return (
                <button
                  key={i}
                  onClick={() => removeTrauma(name)}
                  disabled={readonly}
                  title={readonly ? name : `${name} — click to remove`}
                  className={cn(
                    'flex h-7 items-center rounded-sm border-2 border-destructive bg-destructive px-2 text-xs font-bold uppercase tracking-wide text-destructive-foreground transition-colors',
                    !readonly && 'cursor-pointer hover:bg-destructive/80',
                  )}
                >
                  {name}
                </button>
              )
            }
            const addable = !readonly && i === trauma.length && availableTraumas.length > 0
            return (
              <button
                key={i}
                onClick={() => addable && setShowPicker(true)}
                disabled={!addable}
                title={addable ? 'Click to add a trauma' : undefined}
                className={cn(
                  'h-7 w-7 rounded-sm border-2 border-muted-foreground/50 bg-muted transition-colors',
                  addable && 'cursor-pointer hover:border-destructive',
                )}
              />
            )
          })}
        </div>
      </div>

      {pickerVisible && (
        <div className="rounded-md border border-red-500/50 bg-red-500/10 p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-red-600">
              {stressMaxed ? 'Trauma out — pick one:' : 'Add a trauma:'}
            </span>
            {showPicker && !stressMaxed && (
              <button
                onClick={() => setShowPicker(false)}
                aria-label="Cancel"
                title="Cancel"
                className="flex h-4 w-4 items-center justify-center rounded-sm text-red-600/70 transition-colors cursor-pointer hover:bg-red-500/20 hover:text-red-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {availableTraumas.map((t) => (
              <button
                key={t}
                onClick={() => pickTrauma(t)}
                className="rounded bg-destructive/20 px-2 py-1 text-xs font-medium uppercase text-destructive transition-colors cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
