import { cn } from '@/lib/utils'

interface StressTrackerProps {
  stress: number
  trauma: string[]
  onStressChange: (value: number) => void
  readonly?: boolean
}

export function StressTracker({ stress, trauma, onStressChange, readonly }: StressTrackerProps) {
  const maxStress = 9

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
