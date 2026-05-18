import { Input } from '@/components/ui/input'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { InfoLabel } from '@/components/InfoLabel'

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
  { level: 3, label: 'Need Help', slots: 1, tip: 'Fatal or catastrophic. You need help from a crewmate to do anything.' },
  { level: 2, label: '-1d', slots: 2, tip: 'Serious injury. Take -1d to any action related to this harm.' },
  { level: 1, label: 'Less Effect', slots: 2, tip: 'Lesser injury. You have reduced effect for actions related to this harm.' },
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
        {HARM_PENALTIES.map(({ level, label, slots, tip }) => (
          <div key={level} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger className="w-8 text-center cursor-help">
                <span className="text-lg font-bold">{level}</span>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">{tip}</TooltipContent>
            </Tooltip>
            <span className="w-20 text-xs text-muted-foreground">{label}</span>
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
                    className="h-8 text-sm"
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
