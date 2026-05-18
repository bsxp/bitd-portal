import { cn } from '@/lib/utils'

interface XPTrackerProps {
  label: string
  current: number
  max: number
  onXPChange: (value: number) => void
  readonly?: boolean
}

export function XPTracker({ label, current, max, onXPChange, readonly }: XPTrackerProps) {
  function handleClick(index: number) {
    if (readonly) return
    onXPChange(current === index + 1 ? index : index + 1)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs font-medium uppercase tracking-wider">{label}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={readonly}
            className={cn(
              'h-4 w-4 rounded-full border transition-colors',
              i < current
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/40 bg-transparent',
              !readonly && 'cursor-pointer hover:border-primary/70',
            )}
          />
        ))}
      </div>
      {current >= max && (
        <span className="text-xs font-bold text-primary">ADVANCE!</span>
      )}
    </div>
  )
}
