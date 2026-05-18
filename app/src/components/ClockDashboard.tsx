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

export function ClockDashboard({ clocks, onUpdate, onDelete, isGM }: ClockDashboardProps) {
  const activeClocks = clocks.filter((c) => c.active)
  const completedClocks = clocks.filter((c) => !c.active || c.filled >= c.segments)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Active Clocks</CardTitle>
        </CardHeader>
        <CardContent>
          {activeClocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active clocks.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {activeClocks.map((clock) => (
                <div key={clock.id} className="flex flex-col items-center gap-1">
                  <ClockDisplay
                    segments={clock.segments}
                    filled={clock.filled}
                    size={72}
                    onSegmentClick={(filled) => {
                      onUpdate(clock.id, { filled })
                    }}
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
        </CardContent>
      </Card>

      {completedClocks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {completedClocks.map((clock) => (
                <div key={clock.id} className="flex items-center gap-2 opacity-50">
                  <ClockDisplay segments={clock.segments} filled={clock.filled} size={32} readonly />
                  <span className="text-xs">{clock.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
