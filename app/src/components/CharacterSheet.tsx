import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StressTracker } from '@/components/trackers/StressTracker'
import { HarmTracker } from '@/components/trackers/HarmTracker'
import { ClockDisplay } from '@/components/trackers/ClockDisplay'
import { XPTracker } from '@/components/trackers/XPTracker'
import { ActionRatings } from '@/components/trackers/ActionRatings'
import { LoadTracker } from '@/components/trackers/LoadTracker'
import { CoinTracker } from '@/components/trackers/CoinTracker'
import { ArmorTracker } from '@/components/trackers/ArmorTracker'
import { ContactsList } from '@/components/trackers/ContactsList'
import { CharacterArt } from '@/components/CharacterArt'
import { CharacterSummary } from '@/components/CharacterSummary'
import { DebouncedText } from '@/components/DebouncedText'
import { PLAYBOOK_XP_TRIGGERS, PLAYBOOK_ABILITIES, ABILITY_INPUTS, SPECIAL_ARMOR_ABILITIES, PLAYBOOK_MAX_STRESS } from '@/lib/game-data'
import { HERITAGE_OPTIONS, BACKGROUND_OPTIONS, VICE_OPTIONS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronDown, User, Skull } from 'lucide-react'
import type { Character, CharacterContact, ActionName, LoadLevel } from '@/lib/types'

// Special armor is granted by abilities: true if any selected ability grants it,
// including a Veteran pick that itself grants special armor.
function derivesSpecialArmor(abilities: string[], details: Record<string, string>): boolean {
  if (abilities.some((a) => SPECIAL_ARMOR_ABILITIES.has(a))) return true
  if (abilities.includes('Veteran') && SPECIAL_ARMOR_ABILITIES.has(details['Veteran:pick'] ?? '')) return true
  return false
}

interface CharacterSheetProps {
  character: Character
  onUpdate: (updates: Partial<Character>) => void
  readonly?: boolean
  /** GM gets free editing of action dots / XP; players are gated to the advance flow. */
  isGM?: boolean
}

function SectionHeader({ label, className }: { label: string; className?: string }) {
  return (
    <h3 className={cn(
      'text-[10px] font-bold uppercase tracking-widest text-muted-foreground',
      className,
    )}>
      {label}
    </h3>
  )
}

export function CharacterSheet({ character, onUpdate, readonly, isGM }: CharacterSheetProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  const abilities = character.playbook ? PLAYBOOK_ABILITIES[character.playbook] : []

  return (
    <div className="space-y-3">
      {/* ── MEMORIAL: shown to everyone once a character has fallen ── */}
      {character.deceased && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-red-600">
              <Skull className="h-4 w-4" />
              Deceased
            </span>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={() => onUpdate({ deceased: false })}>
                Revive
              </Button>
            )}
          </div>
          <div className="mt-2">
            <Label className="text-xs text-muted-foreground">Cause of death</Label>
            <DebouncedText
              value={character.cause_of_death ?? ''}
              onCommit={(v) => onUpdate({ cause_of_death: v || null })}
              readonly={readonly}
              placeholder="How did they meet their end?"
              className="mt-1 h-8"
            />
          </div>
        </div>
      )}

      {/* ── HEADER: [ portrait (2/5) | summary ] — shown to everyone ── */}
      <div className="flex gap-4">
        {(character.art_url || !readonly) && (
          <CharacterArt character={character} onUpdate={onUpdate} readonly={readonly} />
        )}
        <CharacterSummary character={character} />
      </div>

      {/* The full sheet renders for everyone; non-owners see it read-only. */}

      {/* ── PROFILE EDITOR (set-and-forget) — owner/GM only ── */}
      {!readonly && (
      <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setProfileOpen(p => !p)}
          className={cn(
            'flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
            profileOpen && 'bg-accent text-foreground',
          )}
        >
          <User className="h-3.5 w-3.5" />
          Profile
          <ChevronDown className={cn('h-3 w-3 transition-transform', profileOpen && 'rotate-180')} />
        </button>
        {!character.deceased && (
          <button
            onClick={() => {
              if (window.confirm(`Mark ${character.name} as deceased? They'll move to the Graveyard.`)) {
                onUpdate({ deceased: true })
              }
            }}
            className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-600"
          >
            <Skull className="h-3.5 w-3.5" />
            Mark deceased
          </button>
        )}
      </div>

      {/* ── COLLAPSIBLE PROFILE FIELDS ── */}
      {profileOpen && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs text-muted-foreground">Heritage</Label>
                <Select
                  value={character.heritage ?? undefined}
                  onValueChange={(v) => { if (v) onUpdate({ heritage: v }) }}
                  disabled={readonly}
                >
                  <SelectTrigger className="mt-1 h-8 capitalize">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {HERITAGE_OPTIONS.map((h) => (
                      <SelectItem key={h} value={h} className="capitalize">{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Background</Label>
                <Select
                  value={character.background ?? undefined}
                  onValueChange={(v) => { if (v) onUpdate({ background: v }) }}
                  disabled={readonly}
                >
                  <SelectTrigger className="mt-1 h-8 capitalize">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Vice</Label>
                <Select
                  value={character.vice ?? undefined}
                  onValueChange={(v) => { if (v) onUpdate({ vice: v }) }}
                  disabled={readonly}
                >
                  <SelectTrigger className="mt-1 h-8 capitalize">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VICE_OPTIONS.map((v) => (
                      <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Vice Purveyor</Label>
                <DebouncedText
                  value={character.vice_purveyor ?? ''}
                  onCommit={(vice_purveyor) => onUpdate({ vice_purveyor })}
                  readonly={readonly}
                  placeholder="NPC name..."
                  className="mt-1 h-8"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Played by</Label>
                <DebouncedText
                  value={character.player_name ?? ''}
                  onCommit={(player_name) => onUpdate({ player_name })}
                  readonly={readonly}
                  placeholder="Real player's name..."
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Look</Label>
                <DebouncedText
                  value={character.look ?? ''}
                  onCommit={(look) => onUpdate({ look })}
                  readonly={readonly}
                  placeholder="Describe your character's appearance..."
                  className="mt-1 h-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </>
      )}

      {/* ══════════════════════════════════════════════
           TIER 1: ALWAYS VISIBLE — the "during a score" zone
           Action Ratings + Stress/Harm/Armor side by side
         ══════════════════════════════════════════════ */}
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">

        {/* LEFT: Stress, Harm, Armor stacked */}
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-4">
              <StressTracker
                stress={character.stress}
                trauma={character.trauma}
                maxStress={character.playbook ? PLAYBOOK_MAX_STRESS[character.playbook] : 9}
                onStressChange={(stress) => onUpdate({ stress })}
                onTraumaOut={(newTrauma) => onUpdate({
                  stress: 0,
                  trauma: [...character.trauma, newTrauma],
                })}
                onTraumaChange={(trauma) => onUpdate({ trauma })}
                readonly={readonly}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <HarmTracker
                harmLevel3={character.harm_level3}
                harmLevel2a={character.harm_level2_a}
                harmLevel2b={character.harm_level2_b}
                harmLevel1a={character.harm_level1_a}
                harmLevel1b={character.harm_level1_b}
                onHarmChange={(field, value) =>
                  onUpdate({ [field]: value || null })
                }
                readonly={readonly}
              />
              <Separator className="my-3" />
              <div className="flex items-center gap-4">
                <ClockDisplay
                  segments={4}
                  filled={character.healing_clock}
                  size={48}
                  label="Healing"
                  onSegmentClick={(filled) => onUpdate({ healing_clock: filled })}
                  readonly={readonly}
                />
                {!readonly && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={character.healing_clock < 4}
                    title={character.healing_clock < 4 ? 'Fill the healing clock (4/4) to apply' : undefined}
                    onClick={() => {
                      // Only fires on a full clock: consume it (reset to 0/4) and
                      // reduce every harm one level — L3 -> L2, L2 -> L1, L1 disperses.
                      // Old L2 harms (up to 2) fill the two L1 slots.
                      const downgradedToL1 = [character.harm_level2_a, character.harm_level2_b]
                        .filter((h): h is string => !!h)
                      onUpdate({
                        harm_level3: null,
                        harm_level2_a: character.harm_level3,
                        harm_level2_b: null,
                        harm_level1_a: downgradedToL1[0] ?? null,
                        harm_level1_b: downgradedToL1[1] ?? null,
                        healing_clock: 0,
                      })
                    }}
                  >
                    Apply heal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Action Ratings + Experience (vertical) */}
        <Card>
          <CardContent className="pt-4">
            <SectionHeader label="Actions & Experience" className="mb-3" />
            <ActionRatings
              character={character}
              onActionChange={(action: ActionName, value: number) =>
                onUpdate({ [action]: value })
              }
              onUpdate={onUpdate}
              readonly={readonly}
              isGM={isGM}
            />
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════
           TIER 1B: SPECIAL ABILITIES
           Always visible — players check these mid-action
         ══════════════════════════════════════════════ */}
      {abilities.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold uppercase tracking-wide capitalize">
                  {character.playbook} Abilities
                </h3>
                {character.playbook_xp >= 8 && (
                  <span className="rounded border border-primary bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Advance ready — take a new ability
                  </span>
                )}
              </div>
              <div className="ml-auto">
                <XPTracker
                  label="Playbook"
                  tip={`Mark at end of session for your playbook trigger${character.playbook ? `: ${PLAYBOOK_XP_TRIGGERS[character.playbook]}` : ''} At max (8), take a new special ability.`}
                  current={character.playbook_xp}
                  max={8}
                  onXPChange={(playbook_xp) => onUpdate({ playbook_xp })}
                  readonly={readonly}
                />
              </div>
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              {abilities.map((ability) => {
                const selected = character.special_abilities.includes(ability.name)
                const details = character.ability_details ?? {}
                const inputs = selected ? ABILITY_INPUTS[ability.name] : undefined
                return (
                  <div
                    key={ability.name}
                    className={cn(
                      'rounded-md border transition-colors',
                      selected ? 'border-primary/40 bg-primary/5' : 'border-transparent bg-muted/30',
                    )}
                  >
                    <button
                      onClick={() => {
                        if (readonly) return
                        const taking = !selected
                        const next = selected
                          ? character.special_abilities.filter(a => a !== ability.name)
                          : [...character.special_abilities, ability.name]
                        onUpdate({
                          special_abilities: next,
                          special_armor_available: derivesSpecialArmor(next, details),
                          // Taking a new ability while the playbook XP track is full
                          // spends the advance: reset the track to 0.
                          ...(taking && character.playbook_xp >= 8 ? { playbook_xp: 0 } : {}),
                        })
                      }}
                      disabled={readonly}
                      className={cn(
                        'group flex w-full gap-2 px-3 py-2 text-left transition-opacity',
                        !selected && 'opacity-50',
                        !readonly && 'cursor-pointer hover:opacity-100',
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors',
                        selected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/40',
                      )} />
                      <div className="min-w-0">
                        <span className={cn(
                          'text-sm font-semibold',
                          selected ? 'text-foreground' : 'text-muted-foreground',
                        )}>
                          {ability.name}
                        </span>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {ability.description}
                        </p>
                      </div>
                    </button>
                    {inputs && (
                      <div className="space-y-2 border-t border-primary/20 px-3 py-2">
                        {inputs.map((field) => {
                          const dkey = `${ability.name}:${field.key}`
                          const listId = `${ability.name}-${field.key}`.replace(/[^a-zA-Z0-9]+/g, '-')
                          return (
                            <div key={field.key} className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{field.label}</Label>
                              <Input
                                value={details[dkey] ?? ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  const nextDetails = { ...details }
                                  if (value) nextDetails[dkey] = value
                                  else delete nextDetails[dkey]
                                  onUpdate({
                                    ability_details: nextDetails,
                                    ...(ability.name === 'Veteran'
                                      ? { special_armor_available: derivesSpecialArmor(character.special_abilities, nextDetails) }
                                      : {}),
                                  })
                                }}
                                list={field.options ? listId : undefined}
                                placeholder={field.placeholder}
                                readOnly={readonly}
                                className="h-8 text-sm"
                              />
                              {field.options && (
                                <datalist id={listId}>
                                  {field.options.map((opt) => <option key={opt} value={opt} />)}
                                </datalist>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
           TIER 2: FREQUENTLY USED
           Load/Items + Coin/XP side by side
         ══════════════════════════════════════════════ */}
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">

        {/* LEFT: Load & Items */}
        <Card>
          <CardContent className="pt-4">
            <SectionHeader label="Load & Items" className="mb-2" />
            <LoadTracker
              playbook={character.playbook}
              loadLevel={character.load_level}
              itemsCarried={character.items_carried}
              onLoadLevelChange={(load_level: LoadLevel | null) => onUpdate({ load_level })}
              onItemToggle={(item: string) => {
                const items = character.items_carried.includes(item)
                  ? character.items_carried.filter((i) => i !== item)
                  : [...character.items_carried, item]
                onUpdate({ items_carried: items })
              }}
              readonly={readonly}
            />
            <Separator className="my-3" />
            <ArmorTracker
              armorAvailable={character.armor_available}
              heavyArmorAvailable={character.heavy_armor_available}
              specialArmorAvailable={character.special_armor_available}
              armorUsed={character.armor_used}
              heavyArmorUsed={character.heavy_armor_used}
              specialArmorUsed={character.special_armor_used}
              onToggle={(field, value) => onUpdate({ [field]: value })}
              readonly={readonly}
            />
          </CardContent>
        </Card>

        {/* RIGHT: Coin & Stash */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <CoinTracker
                label="Coin"
                tip="Spend on gear, lifestyle, and downtime activities. Coin above capacity is ephemeral — spend or stash it during downtime or it's wiped before the next score."
                value={character.coin}
                max={4}
                onChange={(coin) => onUpdate({ coin })}
                readonly={readonly}
                ephemeral
              />
              <div className="space-y-1">
                <CoinTracker
                  label="Stash"
                  tip="Long-term savings. Every full row of 10 raises your Wealth Level. At 40, your character retires."
                  value={character.stash}
                  max={40}
                  onChange={(stash) => onUpdate({ stash })}
                  readonly={readonly}
                />
                <p className="text-xs text-muted-foreground">
                  Wealth Level <span className="font-bold text-foreground">{Math.floor(character.stash / 10)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════
           TIER 3: OCCASIONAL — Contacts & Notes
         ══════════════════════════════════════════════ */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <SectionHeader label="Contacts" className="mb-2" />
            <ContactsList
              contacts={character.contacts}
              onChange={(contacts: CharacterContact[]) => onUpdate({ contacts })}
              readonly={readonly}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <SectionHeader label="Notes" className="mb-2" />
            <DebouncedText
              value={character.notes ?? ''}
              onCommit={(notes) => onUpdate({ notes })}
              readonly={readonly}
              multiline
              placeholder="Session notes, plans, reminders..."
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
