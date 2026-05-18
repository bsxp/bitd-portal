import { cn } from '@/lib/utils'

interface ClockDisplayProps {
  segments: number
  filled: number
  size?: number
  label?: string
  onSegmentClick?: (index: number) => void
  readonly?: boolean
}

export function ClockDisplay({ segments, filled, size = 64, label, onSegmentClick, readonly }: ClockDisplayProps) {
  const radius = size / 2
  const center = radius

  function handleClick(index: number) {
    if (readonly || !onSegmentClick) return
    onSegmentClick(filled === index + 1 ? index : index + 1)
  }

  function getSegmentPath(index: number): string {
    const startAngle = (index * 360) / segments - 90
    const endAngle = ((index + 1) * 360) / segments - 90
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + (radius - 2) * Math.cos(startRad)
    const y1 = center + (radius - 2) * Math.sin(startRad)
    const x2 = center + (radius - 2) * Math.cos(endRad)
    const y2 = center + (radius - 2) * Math.sin(endRad)

    const largeArcFlag = 360 / segments > 180 ? 1 : 0

    return `M ${center} ${center} L ${x1} ${y1} A ${radius - 2} ${radius - 2} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius - 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-muted-foreground/40"
        />
        {Array.from({ length: segments }).map((_, i) => (
          <path
            key={i}
            d={getSegmentPath(i)}
            className={cn(
              'transition-colors',
              i < filled ? 'fill-primary' : 'fill-transparent',
              !readonly && onSegmentClick && 'cursor-pointer hover:fill-primary/50',
            )}
            stroke="currentColor"
            strokeWidth={1}
            onClick={() => handleClick(i)}
          />
        ))}
      </svg>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}
