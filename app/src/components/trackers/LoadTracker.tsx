import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { InfoLabel } from '@/components/InfoLabel'
import type { LoadLevel, Playbook } from '@/lib/types'
import { STANDARD_ITEMS, PLAYBOOK_ITEMS, LOAD_LIMITS } from '@/lib/game-data'

interface LoadTrackerProps {
  playbook: Playbook | null
  loadLevel: LoadLevel | null
  itemsCarried: string[]
  onLoadLevelChange: (level: LoadLevel | null) => void
  onItemToggle: (item: string) => void
  readonly?: boolean
}

export function LoadTracker({
  playbook, loadLevel, itemsCarried,
  onLoadLevelChange, onItemToggle, readonly,
}: LoadTrackerProps) {
  const limits = playbook ? LOAD_LIMITS[playbook] : { light: 3, normal: 5, heavy: 6 }
  const maxLoad = loadLevel ? limits[loadLevel] : 0
  const currentLoad = itemsCarried.length
  const playbookItems = playbook ? PLAYBOOK_ITEMS[playbook] : []
  const allItems = [...playbookItems, ...STANDARD_ITEMS]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <InfoLabel label="Load" tip="Choose before a score. Light = quick & quiet. Heavy = slow & noisy but well-equipped." />
        {loadLevel && (
          <span className={cn(
            'text-sm font-medium',
            currentLoad > maxLoad ? 'text-destructive' : 'text-muted-foreground',
          )}>
            {currentLoad}/{maxLoad}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {(['light', 'normal', 'heavy'] as const).map((level) => (
          <button
            key={level}
            onClick={() => {
              if (readonly) return
              onLoadLevelChange(loadLevel === level ? null : level)
            }}
            disabled={readonly}
            className={cn(
              'rounded-md border px-3 py-1 text-xs font-medium capitalize transition-colors',
              loadLevel === level
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 hover:border-primary/50',
            )}
          >
            {level} ({limits[level]})
          </button>
        ))}
      </div>

      {loadLevel && (
        <div className="flex flex-wrap gap-1">
          {allItems.map((item) => (
            <Badge
              key={item}
              variant={itemsCarried.includes(item) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs transition-colors',
                !readonly && 'hover:bg-primary/80',
              )}
              onClick={() => !readonly && onItemToggle(item)}
            >
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
