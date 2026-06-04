import { Badge } from '@/components/ui/badge'
import { PLAYBOOK_MAX_STRESS } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import type { Character } from '@/lib/types'

const ACTIONS: { key: keyof Character; label: string }[] = [
  { key: 'hunt', label: 'Hunt' }, { key: 'study', label: 'Study' }, { key: 'survey', label: 'Survey' }, { key: 'tinker', label: 'Tinker' },
  { key: 'finesse', label: 'Finesse' }, { key: 'prowl', label: 'Prowl' }, { key: 'skirmish', label: 'Skirmish' }, { key: 'wreck', label: 'Wreck' },
  { key: 'attune', label: 'Attune' }, { key: 'command', label: 'Command' }, { key: 'consort', label: 'Consort' }, { key: 'sway', label: 'Sway' },
]

function harmLines(c: Character): { level: number; text: string }[] {
  const out: { level: number; text: string }[] = []
  if (c.harm_level3) out.push({ level: 3, text: c.harm_level3 })
  if (c.harm_level2_a) out.push({ level: 2, text: c.harm_level2_a })
  if (c.harm_level2_b) out.push({ level: 2, text: c.harm_level2_b })
  if (c.harm_level1_a) out.push({ level: 1, text: c.harm_level1_a })
  if (c.harm_level1_b) out.push({ level: 1, text: c.harm_level1_b })
  return out
}

function Pips({ filled, total }: { filled: number; total: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn('h-2 w-2 rounded-full', i < filled ? 'bg-red-500' : 'bg-muted-foreground/30')} />
      ))}
    </span>
  )
}

// Compact, read-only at-a-glance view of a character. Sits beside the portrait
// in the sheet header for everyone; for non-owned characters it's the whole view.
export function CharacterSummary({ character }: { character: Character }) {
  const maxStress = character.playbook ? PLAYBOOK_MAX_STRESS[character.playbook] : 9
  const profile = [character.heritage, character.background, character.vice].filter(Boolean) as string[]
  const ratedActions = ACTIONS
    .map((a) => ({ label: a.label, value: character[a.key] as number }))
    .filter((a) => a.value > 0)
  const harms = harmLines(character)
  const armor = [
    character.armor_available && !character.armor_used && 'Armor',
    character.heavy_armor_available && !character.heavy_armor_used && 'Heavy',
    character.special_armor_available && !character.special_armor_used && 'Special',
  ].filter(Boolean) as string[]

  return (
    <div className="min-w-0 flex-1 space-y-3">
      {/* Identity */}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="text-2xl font-bold">{character.name}</h2>
          {character.alias && <span className="text-base text-muted-foreground">"{character.alias}"</span>}
          {character.playbook && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary">
              {character.playbook}
            </span>
          )}
        </div>
        {character.player_name && (
          <p className="text-xs text-muted-foreground">played by {character.player_name}</p>
        )}
      </div>

      {/* Heritage · Background · Vice · Look */}
      {(profile.length > 0 || character.look) && (
        <p className="text-xs text-muted-foreground">
          {profile.map((p, i) => (
            <span key={p} className="capitalize">{i > 0 && ' · '}{p}</span>
          ))}
          {character.look && (
            <span className="italic">{profile.length > 0 && ' · '}{character.look}</span>
          )}
        </p>
      )}

      {/* Stress + trauma */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Stress</span>
          <Pips filled={character.stress} total={maxStress} />
          <span className="text-xs tabular-nums text-muted-foreground">{character.stress}/{maxStress}</span>
        </div>
        {character.trauma.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.trauma.map((t) => (
              <Badge key={t} variant="destructive" className="text-[10px] uppercase">{t}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Harm */}
      <div className="text-xs">
        <span className="font-medium text-muted-foreground">Harm: </span>
        {harms.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          harms.map((h, i) => (
            <span key={i}>
              {i > 0 && ', '}
              <span className="text-muted-foreground">L{h.level}</span> {h.text}
            </span>
          ))
        )}
      </div>

      {/* Coin / Stash / Load / Armor */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span><span className="text-yellow-600">{character.coin}</span> coin</span>
        <span><span className="text-muted-foreground">stash</span> {character.stash}</span>
        {character.load_level && (
          <span className="capitalize"><span className="text-muted-foreground">load</span> {character.load_level}</span>
        )}
        {armor.length > 0 && (
          <span><span className="text-muted-foreground">armor</span> {armor.join(', ')}</span>
        )}
      </div>

      {/* Action ratings (rated only) */}
      {ratedActions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {ratedActions.map((a, i) => (
            <span key={a.label}>{i > 0 && ' · '}<span className="text-foreground">{a.label}</span> {a.value}</span>
          ))}
        </p>
      )}

      {/* Special abilities */}
      {character.special_abilities.length > 0 && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">Abilities</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {character.special_abilities.map((a) => (
              <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
