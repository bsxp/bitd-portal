import { cn } from '@/lib/utils'

interface ArmorTrackerProps {
  armorAvailable: boolean
  heavyArmorAvailable: boolean
  specialArmorAvailable: boolean
  armorUsed: boolean
  heavyArmorUsed: boolean
  specialArmorUsed: boolean
  onToggle: (field: string, value: boolean) => void
  readonly?: boolean
}

const ARMOR_SLOTS = [
  { key: 'armor', label: 'Armor', availableField: 'armor_available', usedField: 'armor_used' },
  { key: 'heavy', label: 'Heavy', availableField: 'heavy_armor_available', usedField: 'heavy_armor_used' },
  { key: 'special', label: 'Special', availableField: 'special_armor_available', usedField: 'special_armor_used' },
] as const

export function ArmorTracker({
  armorAvailable, heavyArmorAvailable, specialArmorAvailable,
  armorUsed, heavyArmorUsed, specialArmorUsed,
  onToggle, readonly,
}: ArmorTrackerProps) {
  const state: Record<string, boolean> = {
    armor_available: armorAvailable,
    heavy_armor_available: heavyArmorAvailable,
    special_armor_available: specialArmorAvailable,
    armor_used: armorUsed,
    heavy_armor_used: heavyArmorUsed,
    special_armor_used: specialArmorUsed,
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold uppercase tracking-wider">Armor</span>
      <div className="flex gap-3">
        {ARMOR_SLOTS.map(({ label, availableField, usedField }) => {
          const available = state[availableField]
          const used = state[usedField]

          if (!available) return null

          return (
            <button
              key={label}
              onClick={() => !readonly && onToggle(usedField, !used)}
              disabled={readonly}
              className={cn(
                'rounded-md border-2 px-3 py-1 text-xs font-medium transition-colors',
                used
                  ? 'border-muted-foreground/30 bg-muted text-muted-foreground line-through'
                  : 'border-primary bg-primary/10 text-primary',
                !readonly && 'cursor-pointer',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
