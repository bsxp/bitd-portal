import { cn } from '@/lib/utils'
import { TRAUMA_OPTIONS } from '@/lib/types'

interface StressTrackerProps {
  stress: number
  trauma: string[]
  onStressChange: (value: number) => void
  onTraumaOut?: (trauma: string) => void
  readonly?: boolean
}

export function StressTracker({ stress, trauma, onStressChange, onTraumaOut, readonly }: StressTrackerProps) {
  const maxStress = 9
  const availableTraumas = TRAUMA_OPTIONS.filter((t) => !trauma.includes(t))

  function handleClick(index: number) {
    if (readonly) return
    onStressChange(stress === index + 1 ? index : index + 1)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider">Stress</span>
        <span className="text-sm text-muted-foreground">{stress}/{maxStress}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: maxStress }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={readonly}
            className={cn(
              'h-7 w-7 rounded-sm border-2 transition-colors',
              i < stress
                ? 'border-red-500 bg-red-500'
                : 'border-muted-foreground/30 bg-transparent',
              !readonly && 'cursor-pointer hover:border-red-400',
            )}
          />
        ))}
      </div>
      {stress >= maxStress && onTraumaOut && availableTraumas.length > 0 && (
        <div className="rounded-md border border-red-500/50 bg-red-500/10 p-2 space-y-1.5">
          <span className="text-xs font-bold uppercase text-red-600">Trauma out — pick one:</span>
          <div className="flex flex-wrap gap-1">
            {availableTraumas.map((t) => (
              <button
                key={t}
                onClick={() => onTraumaOut(t)}
                className="rounded bg-destructive/20 px-2 py-1 text-xs font-medium uppercase text-destructive transition-colors cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      {trauma.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {trauma.map((t) => (
            <span key={t} className="rounded bg-destructive/20 px-2 py-0.5 text-xs font-medium uppercase text-destructive">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
