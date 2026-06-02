import { cn } from '@/lib/utils'
import { InfoLabel } from '@/components/InfoLabel'

interface XPTrackerProps {
  label: string
  tip?: string
  current: number
  max: number
  onXPChange: (value: number) => void
  readonly?: boolean
  /** When the track is full and this is provided, render an advance button in place of "ADVANCE!". */
  onAdvance?: () => void
  advanceLabel?: string
}

export function XPTracker({ label, tip, current, max, onXPChange, readonly, onAdvance, advanceLabel }: XPTrackerProps) {
  function handleClick(index: number) {
    if (readonly) return
    onXPChange(current === index + 1 ? index : index + 1)
  }

  const full = current >= max

  return (
    <div className="flex items-center gap-2">
      {tip ? (
        <InfoLabel label={label} tip={tip} className="w-20 text-xs" />
      ) : (
        <span className="w-20 text-xs font-medium uppercase tracking-wider">{label}</span>
      )}
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={readonly}
            className={cn(
              'h-4 w-4 rounded-full border-2 transition-colors',
              i < current
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/50 bg-muted',
              !readonly && 'cursor-pointer hover:border-primary/70',
            )}
          />
        ))}
      </div>
      {full && (
        onAdvance && !readonly ? (
          <button
            onClick={onAdvance}
            className="rounded border border-primary bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
          >
            {advanceLabel ?? 'Advance!'}
          </button>
        ) : (
          <span className="text-xs font-bold text-primary">ADVANCE!</span>
        )
      )}
    </div>
  )
}
