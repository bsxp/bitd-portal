import { cn } from '@/lib/utils'
import type { Character } from '@/lib/types'

const SIZES = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
} as const

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Circular profile picture for a character. Falls back to initials when no
// avatar has been cropped yet.
export function CharacterAvatar({
  character,
  size = 'md',
  className,
}: {
  character: Pick<Character, 'name' | 'avatar_url'>
  size?: keyof typeof SIZES
  className?: string
}) {
  const base = cn('shrink-0 rounded-full', SIZES[size], className)
  if (character.avatar_url) {
    return (
      <img
        src={character.avatar_url}
        alt={character.name}
        className={cn(base, 'object-cover')}
      />
    )
  }
  return (
    <div className={cn(base, 'flex items-center justify-center bg-muted font-semibold text-muted-foreground')}>
      {initials(character.name) || '?'}
    </div>
  )
}
