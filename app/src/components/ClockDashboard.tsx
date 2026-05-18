import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClockDisplay } from '@/components/trackers/ClockDisplay'
import { Eye, EyeOff } from 'lucide-react'
import type { Clock } from '@/lib/types'

interface ClockDashboardProps {
  clocks: Clock[]
  onUpdate: (id: string, updates: Partial<Clock>) => void
  onDelete?: (id: string) => void
  isGM?: boolean
}

function ClockGroup({
  title,
  description,
  clocks,
  onUpdate,
  onDelete,
  isGM,
}: {
  title: string
  description: string
  clocks: Clock[]
  onUpdate: (id: string, updates: Partial<Clock>) => void
  onDelete?: (id: string) => void
  isGM?: boolean
}) {
  const active = clocks.filter((c) => c.active && c.filled < c.segments)
  const completed = clocks.filter((c) => !c.active || c.filled >= c.segments)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        {active.length === 0 && completed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No clocks.</p>
        ) : (
          <div className="space-y-4">
            {active.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {active.map((clock) => (
                  <div key={clock.id} className="flex flex-col items-center gap-1">
                    <ClockDisplay
                      segments={clock.segments}
                      filled={clock.filled}
                      size={72}
                      onSegmentClick={(filled) => onUpdate(clock.id, { filled })}
                      readonly={!isGM}
                    />
                    <span className="max-w-24 truncate text-center text-xs font-medium">
                      {clock.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {clock.clock_type && clock.clock_type !== 'general' && (
                        <Badge variant="secondary" className="text-[10px]">
                          {clock.clock_type}
                        </Badge>
                      )}
                      {isGM && !clock.visible_to_players && (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      {isGM && clock.visible_to_players && (
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    {isGM && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive"
                        onClick={() => onDelete(clock.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Completed</p>
                <div className="flex flex-wrap gap-4">
                  {completed.map((clock) => (
                    <div key={clock.id} className="flex items-center gap-2 opacity-50">
                      <ClockDisplay segments={clock.segments} filled={clock.filled} size={32} readonly />
                      <span className="text-xs">{clock.name}</span>
                      {isGM && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1 text-[10px] text-destructive"
                          onClick={() => onDelete(clock.id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ClockDashboard({ clocks, onUpdate, onDelete, isGM }: ClockDashboardProps) {
  const longTerm = clocks.filter((c) => c.scope === 'long-term')
  const score = clocks.filter((c) => c.scope === 'score')

  return (
    <div className="space-y-4">
      <ClockGroup
        title="Score Clocks"
        description="Temporary clocks for the current operation. Cleared when the score ends."
        clocks={score}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isGM={isGM}
      />
      <ClockGroup
        title="Long-Term Clocks"
        description="Persistent clocks that carry over between sessions."
        clocks={longTerm}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isGM={isGM}
      />
    </div>
  )
}
