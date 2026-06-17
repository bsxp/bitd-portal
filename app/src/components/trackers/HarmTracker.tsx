import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { InfoLabel } from '@/components/InfoLabel'
import { cn } from '@/lib/utils'

interface HarmTrackerProps {
  harmLevel3: string | null
  harmLevel2a: string | null
  harmLevel2b: string | null
  harmLevel1a: string | null
  harmLevel1b: string | null
  onHarmChange: (field: string, value: string) => void
  readonly?: boolean
}

const HARM_PENALTIES = [
  { level: 3, label: 'Need Help', reminder: 'Need help to act', slots: 1, tip: 'Fatal or catastrophic. You need help from a crewmate to do anything.' },
  { level: 2, label: '-1d', reminder: '−1d to related rolls', slots: 2, tip: 'Serious injury. Take -1d to any action related to this harm.' },
  { level: 1, label: 'Less Effect', reminder: 'Reduced effect', slots: 2, tip: 'Lesser injury. You have reduced effect for actions related to this harm.' },
]

export function HarmTracker({
  harmLevel3, harmLevel2a, harmLevel2b, harmLevel1a, harmLevel1b,
  onHarmChange, readonly,
}: HarmTrackerProps) {
  const harmValues: Record<string, string | null> = {
    harm_level3: harmLevel3,
    harm_level2_a: harmLevel2a,
    harm_level2_b: harmLevel2b,
    harm_level1_a: harmLevel1a,
    harm_level1_b: harmLevel1b,
  }

  return (
    <div className="space-y-2">
      <InfoLabel label="Harm" tip="Injuries from consequences. Each level applies a different penalty to your actions." />
      <div className="space-y-1">
        {HARM_PENALTIES.map(({ level, label, reminder, slots, tip }) => {
          const fields = level === 3
            ? ['harm_level3']
            : [`harm_level${level}_a`, `harm_level${level}_b`]
          // The penalty only applies once the whole row is full: both slots at
          // level 1 / level 2 (or the single slot at level 3). A half-filled row
          // shows its text but doesn't trigger the red penalty.
          const rowFilled = fields.every((f) => (harmValues[f] ?? '').trim() !== '')
          return (
            <div
              key={level}
              className={cn(
                'flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors',
                rowFilled && 'bg-red-500/15 ring-1 ring-red-500/40',
              )}
            >
              <Tooltip>
                <TooltipTrigger className="w-8 text-center cursor-help">
                  <span className={cn('text-lg font-bold', rowFilled && 'text-red-600')}>{level}</span>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[200px]">{tip}</TooltipContent>
              </Tooltip>
              <span className={cn('w-20 text-xs', rowFilled ? 'font-bold text-red-600' : 'text-muted-foreground')}>
                {label}
              </span>
              <div className="flex flex-1 gap-1">
                {Array.from({ length: slots }).map((_, i) => {
                  const field = level === 3
                    ? 'harm_level3'
                    : `harm_level${level}_${i === 0 ? 'a' : 'b'}`
                  return (
                    <Input
                      key={field}
                      value={harmValues[field] ?? ''}
                      onChange={(e) => onHarmChange(field, e.target.value)}
                      readOnly={readonly}
                      placeholder="—"
                      className={cn('h-8 text-sm', rowFilled && 'border-red-500/50')}
                    />
                  )
                })}
              </div>
              {rowFilled && (
                <span className="shrink-0 whitespace-nowrap rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {reminder}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
