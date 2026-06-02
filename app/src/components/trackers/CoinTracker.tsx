import { cn } from '@/lib/utils'
import { InfoLabel } from '@/components/InfoLabel'

interface CoinTrackerProps {
  label: string
  tip?: string
  value: number
  max: number
  onChange: (value: number) => void
  readonly?: boolean
  /**
   * When set, coin held above `max` (the tracker's capacity) is rendered as
   * "ephemeral" overflow — distinct, faded, dashed boxes that read as
   * temporary. Ephemeral coin must be spent or stashed during downtime and is
   * wiped before the next score begins. Off by default (e.g. Stash never uses
   * this), in which case the tracker behaves exactly as a fixed-capacity track.
   */
  ephemeral?: boolean
}

export function CoinTracker({ label, tip, value, max, onChange, readonly, ephemeral }: CoinTrackerProps) {
  function handleClick(index: number) {
    if (readonly) return
    onChange(value === index + 1 ? index : index + 1)
  }

  // Overflow coin beyond capacity. Only surfaced when `ephemeral` is enabled.
  const overflow = ephemeral ? Math.max(0, value - max) : 0
  // Render one extra (empty) ephemeral slot so coin can be pushed past capacity
  // manually, up to a sensible ceiling.
  const ephemeralSlots = ephemeral ? Math.min(overflow + 1, Math.max(max, 8)) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        {tip ? (
          <InfoLabel label={label} tip={tip} />
        ) : (
          <span className="text-sm font-semibold uppercase tracking-wider">{label}</span>
        )}
        <span className="text-sm text-muted-foreground">
          {value}
          {overflow > 0 && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">(+{overflow} ephemeral)</span>
          )}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-0.5">
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

        {ephemeral && ephemeralSlots > 0 && (
          <>
            {/* Divider between real capacity and ephemeral overflow */}
            <span
              className="mx-1 h-5 w-px shrink-0 bg-amber-500/50"
              aria-hidden
            />
            {Array.from({ length: ephemeralSlots }).map((_, i) => {
              const slotValue = max + i + 1 // coin value this box represents
              const filled = i < overflow
              return (
                <button
                  key={`eph-${i}`}
                  onClick={() => handleClick(slotValue - 1)}
                  disabled={readonly}
                  title="Ephemeral — spent or stashed during downtime, wiped at next score."
                  className={cn(
                    'h-5 w-5 rounded-sm border border-dashed transition-colors',
                    filled
                      ? 'border-amber-500 bg-amber-500/40'
                      : 'border-amber-500/40 bg-transparent',
                    !readonly && 'cursor-pointer hover:border-amber-400',
                  )}
                />
              )
            })}
          </>
        )}
      </div>

      {overflow > 0 && (
        <p className="text-[10px] leading-tight text-amber-600 dark:text-amber-400">
          +{overflow} ephemeral — spend or stash before the next score, or it's wiped.
        </p>
      )}
    </div>
  )
}
