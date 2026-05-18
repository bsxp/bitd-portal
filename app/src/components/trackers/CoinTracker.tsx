import { cn } from '@/lib/utils'
import { InfoLabel } from '@/components/InfoLabel'

interface CoinTrackerProps {
  label: string
  tip?: string
  value: number
  max: number
  onChange: (value: number) => void
  readonly?: boolean
}

export function CoinTracker({ label, tip, value, max, onChange, readonly }: CoinTrackerProps) {
  function handleClick(index: number) {
    if (readonly) return
    onChange(value === index + 1 ? index : index + 1)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        {tip ? (
          <InfoLabel label={label} tip={tip} />
        ) : (
          <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
        )}
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={readonly}
            className={cn(
              'h-5 w-5 rounded-sm border transition-colors',
              i < value
                ? 'border-yellow-600 bg-yellow-500'
                : 'border-muted-foreground/30 bg-transparent',
              !readonly && 'cursor-pointer hover:border-yellow-500',
            )}
          />
        ))}
      </div>
    </div>
  )
}
