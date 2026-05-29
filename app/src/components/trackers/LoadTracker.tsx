import { cn } from '@/lib/utils'
import { InfoLabel } from '@/components/InfoLabel'
import type { LoadLevel, Playbook } from '@/lib/types'
import { STANDARD_ITEMS, PLAYBOOK_ITEMS, LOAD_LIMITS, type GameItem } from '@/lib/game-data'

interface LoadTrackerProps {
  playbook: Playbook | null
  loadLevel: LoadLevel | null
  itemsCarried: string[]
  onLoadLevelChange: (level: LoadLevel | null) => void
  onItemToggle: (item: string) => void
  readonly?: boolean
}

function LoadBoxes({ count, filled }: { count: number; filled: boolean }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-3.5 w-3.5 rounded-sm border-2 transition-colors',
            filled
              ? 'border-primary bg-primary'
              : 'border-muted-foreground/50 bg-muted',
          )}
        />
      ))}
    </div>
  )
}

function ItemRow({
  item,
  carried,
  onToggle,
  readonly,
}: {
  item: GameItem
  carried: boolean
  onToggle: () => void
  readonly?: boolean
}) {
  return (
    <button
      onClick={() => !readonly && onToggle()}
      disabled={readonly}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors',
        carried
          ? 'bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-muted',
        !readonly && 'cursor-pointer',
      )}
    >
      <LoadBoxes count={item.load || 1} filled={carried} />
      <span className={cn(carried && 'font-medium')}>{item.name}</span>
    </button>
  )
}

export function LoadTracker({
  playbook, loadLevel, itemsCarried,
  onLoadLevelChange, onItemToggle, readonly,
}: LoadTrackerProps) {
  const limits = playbook ? LOAD_LIMITS[playbook] : { light: 3, normal: 5, heavy: 6 }
  const maxLoad = loadLevel ? limits[loadLevel] : 0
  const playbookItems = playbook ? PLAYBOOK_ITEMS[playbook] : []
  const allItems = [...playbookItems, ...STANDARD_ITEMS]

  const itemMap = new Map(allItems.map((i) => [i.name, i]))
  const currentLoad = itemsCarried.reduce((sum, name) => {
    const item = itemMap.get(name)
    return sum + (item ? item.load : 1)
  }, 0)

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
              'rounded-md border-2 px-3 py-1 text-xs font-medium capitalize transition-colors',
              loadLevel === level
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/40 bg-muted hover:border-primary/50',
            )}
          >
            {level} ({limits[level]})
          </button>
        ))}
      </div>

      {loadLevel && (
        <div className="space-y-1">
          {playbookItems.length > 0 && (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {playbook} Items
              </span>
              {playbookItems.map((item) => (
                <ItemRow
                  key={item.name}
                  item={item}
                  carried={itemsCarried.includes(item.name)}
                  onToggle={() => onItemToggle(item.name)}
                  readonly={readonly}
                />
              ))}
              <div className="my-2 border-t border-border" />
            </>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Standard Items
          </span>
          {STANDARD_ITEMS.map((item) => (
            <ItemRow
              key={item.name}
              item={item}
              carried={itemsCarried.includes(item.name)}
              onToggle={() => onItemToggle(item.name)}
              readonly={readonly}
            />
          ))}
        </div>
      )}
    </div>
  )
}
