import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface InfoLabelProps {
  label: string
  tip: string
  className?: string
}

export function InfoLabel({ label, tip, className }: InfoLabelProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          'text-sm font-semibold uppercase tracking-wider cursor-help decoration-muted-foreground/40 decoration-dashed underline underline-offset-2',
          className,
        )}
      >
        {label}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px]">{tip}</TooltipContent>
    </Tooltip>
  )
}
