import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { CREW_CLAIMS } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import type { CrewType } from '@/lib/types'

interface ClaimsMapProps {
  crewType: CrewType
  claimsSeized: string[]
  onToggleClaim: (key: string) => void
  readonly?: boolean
}

export function ClaimsMap({ crewType, claimsSeized, onToggleClaim, readonly }: ClaimsMapProps) {
  const claims = CREW_CLAIMS[crewType]
  if (!claims) return null

  const isLair = (r: number, c: number) => r === 1 && c === 2
  const isClaimed = (r: number, c: number) => claimsSeized.includes(`${r},${c}`)
  const claimKey = (r: number, c: number) => `${r},${c}`

  const turfCount = claims.flatMap((row, r) =>
    row.map((claim, c) => ({ claim, r, c }))
  ).filter(({ claim, r, c }) => claim.name === 'Turf' && isClaimed(r, c)).length

  const elements: React.ReactNode[] = []

  for (let gridRow = 0; gridRow < 5; gridRow++) {
    for (let gridCol = 0; gridCol < 9; gridCol++) {
      const isClaimRow = gridRow % 2 === 0
      const isClaimCol = gridCol % 2 === 0

      if (isClaimRow && isClaimCol) {
        const r = gridRow / 2
        const c = gridCol / 2
        const claim = claims[r][c]
        const lair = isLair(r, c)
        const claimed = lair || isClaimed(r, c)

        elements.push(
          <Tooltip key={`cell-${r}-${c}`}>
            <TooltipTrigger
              onClick={() => {
                if (readonly || lair) return
                onToggleClaim(claimKey(r, c))
              }}
              className={cn(
                'flex min-h-14 items-center justify-center rounded-md border-2 px-2 py-1.5 text-center text-[11px] font-bold uppercase leading-tight tracking-wide transition-all',
                lair && 'border-primary bg-primary text-primary-foreground shadow-md',
                !lair && claimed && 'border-emerald-500 bg-emerald-500/15 text-emerald-700 shadow-sm dark:text-emerald-400',
                !lair && !claimed && 'border-muted-foreground/25 text-muted-foreground/60',
                !readonly && !lair && 'cursor-pointer hover:border-primary/50 hover:shadow-sm',
              )}
              style={{
                gridRow: gridRow + 1,
                gridColumn: gridCol + 1,
              }}
            >
              {claim.name}
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-center">
              {claim.description}
            </TooltipContent>
          </Tooltip>
        )
      } else if (isClaimRow && !isClaimCol) {
        const r = gridRow / 2
        const c = (gridCol - 1) / 2
        const leftClaimed = isLair(r, c) || isClaimed(r, c)
        const rightClaimed = isLair(r, c + 1) || isClaimed(r, c + 1)
        const active = leftClaimed || rightClaimed

        elements.push(
          <div
            key={`h-${r}-${c}`}
            className="flex items-center justify-center"
            style={{
              gridRow: gridRow + 1,
              gridColumn: gridCol + 1,
            }}
          >
            <div className={cn(
              'h-0.5 w-full rounded-full transition-colors',
              active ? 'bg-muted-foreground/40' : 'bg-muted-foreground/15',
            )} />
          </div>
        )
      } else if (!isClaimRow && isClaimCol) {
        const r = (gridRow - 1) / 2
        const c = gridCol / 2
        const topClaimed = isLair(r, c) || isClaimed(r, c)
        const bottomClaimed = isLair(r + 1, c) || isClaimed(r + 1, c)
        const active = topClaimed || bottomClaimed

        elements.push(
          <div
            key={`v-${r}-${c}`}
            className="flex items-center justify-center"
            style={{
              gridRow: gridRow + 1,
              gridColumn: gridCol + 1,
            }}
          >
            <div className={cn(
              'h-full w-0.5 rounded-full transition-colors',
              active ? 'bg-muted-foreground/40' : 'bg-muted-foreground/15',
            )} />
          </div>
        )
      } else {
        elements.push(
          <div
            key={`empty-${gridRow}-${gridCol}`}
            style={{
              gridRow: gridRow + 1,
              gridColumn: gridCol + 1,
            }}
          />
        )
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-2">
        <div
          className="inline-grid"
          style={{
            gridTemplateColumns: 'repeat(4, minmax(90px, 1fr) 12px) minmax(90px, 1fr)',
            gridTemplateRows: 'auto 8px auto 8px auto',
            minWidth: '500px',
            width: '100%',
          }}
        >
          {elements}
        </div>
      </div>
      {turfCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Turf held: {turfCount} (reduces rep needed to advance tier)
        </p>
      )}
    </div>
  )
}
