import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
import { PLAYBOOK_XP_TRIGGERS } from '@/lib/game-data'
import { HERITAGE_OPTIONS, BACKGROUND_OPTIONS, VICE_OPTIONS } from '@/lib/types'
import type { Character, CharacterContact, ActionName, LoadLevel } from '@/lib/types'

interface CharacterSheetProps {
  character: Character
  onUpdate: (updates: Partial<Character>) => void
  readonly?: boolean
}

export function CharacterSheet({ character, onUpdate, readonly }: CharacterSheetProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-baseline gap-3">
            <CardTitle className="text-2xl">{character.name}</CardTitle>
            {character.alias && (
              <span className="text-lg text-muted-foreground">"{character.alias}"</span>
            )}
            {character.playbook && (
              <span className="rounded bg-primary/10 px-2 py-0.5 text-sm font-semibold uppercase text-primary">
                {character.playbook}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs text-muted-foreground">Heritage</Label>
              <Select
                value={character.heritage ?? undefined}
                onValueChange={(v) => { if (v) onUpdate({ heritage: v }) }}
                disabled={readonly}
              >
                <SelectTrigger className="mt-1 h-8 capitalize">
                  <SelectValue placeholder="Select heritage..." />
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
                  <SelectValue placeholder="Select background..." />
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
                  <SelectValue placeholder="Select vice..." />
                </SelectTrigger>
                <SelectContent>
                  {VICE_OPTIONS.map((v) => (
                    <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground">Vice Purveyor</Label>
            <Input
              value={character.vice_purveyor ?? ''}
              onChange={(e) => onUpdate({ vice_purveyor: e.target.value || null })}
              readOnly={readonly}
              placeholder="Who do you go to for your vice?"
              className="mt-1 h-8"
            />
          </div>
          {character.look && (
            <p className="mt-2 text-sm text-muted-foreground">{character.look}</p>
          )}
        </CardContent>
      </Card>

      {/* Volatile State - the stuff that changes constantly */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <StressTracker
              stress={character.stress}
              trauma={character.trauma}
              onStressChange={(stress) => onUpdate({ stress })}
              onTraumaOut={(newTrauma) => onUpdate({
                stress: 0,
                trauma: [...character.trauma, newTrauma],
              })}
              readonly={readonly}
            />
            <Separator />
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
            <Separator />
            <div className="flex items-center gap-6">
              <ClockDisplay
                segments={4}
                filled={character.healing_clock}
                size={56}
                label="Healing"
                onSegmentClick={(filled) => onUpdate({ healing_clock: filled })}
                readonly={readonly}
              />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-4">
            <CoinTracker
              label="Coin"
              tip="Spend on gear, lifestyle, and downtime activities. Stash for retirement."
              value={character.coin}
              max={4}
              onChange={(coin) => onUpdate({ coin })}
              readonly={readonly}
            />
            <CoinTracker
              label="Stash"
              tip="Long-term savings. At 40 stash, your character retires in comfort."
              value={character.stash}
              max={40}
              onChange={(stash) => onUpdate({ stash })}
              readonly={readonly}
            />
            <Separator />
            <div className="space-y-2">
              <XPTracker
                label="Playbook"
                tip="Mark at end of session for your playbook trigger. At max, take a new special ability."
                current={character.playbook_xp}
                max={8}
                onXPChange={(playbook_xp) => onUpdate({ playbook_xp })}
                readonly={readonly}
              />
              {character.playbook && (
                <p className="text-xs italic text-muted-foreground">
                  {PLAYBOOK_XP_TRIGGERS[character.playbook]}
                </p>
              )}
              <XPTracker
                label="Insight"
                tip="Mark when you roll a desperate action with Hunt, Study, Survey, or Tinker."
                current={character.insight_xp}
                max={6}
                onXPChange={(insight_xp) => onUpdate({ insight_xp })}
                readonly={readonly}
              />
              <XPTracker
                label="Prowess"
                tip="Mark when you roll a desperate action with Finesse, Prowl, Skirmish, or Wreck."
                current={character.prowess_xp}
                max={6}
                onXPChange={(prowess_xp) => onUpdate({ prowess_xp })}
                readonly={readonly}
              />
              <XPTracker
                label="Resolve"
                tip="Mark when you roll a desperate action with Attune, Command, Consort, or Sway."
                current={character.resolve_xp}
                max={6}
                onXPChange={(resolve_xp) => onUpdate({ resolve_xp })}
                readonly={readonly}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Ratings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionRatings
            character={character}
            onActionChange={(action: ActionName, value: number) =>
              onUpdate({ [action]: value })
            }
            readonly={readonly}
          />
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactsList
            contacts={character.contacts}
            onChange={(contacts: CharacterContact[]) => onUpdate({ contacts })}
            readonly={readonly}
          />
        </CardContent>
      </Card>

      {/* Load - only visible during scores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Load & Items</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={character.notes ?? ''}
            onChange={(e) => onUpdate({ notes: e.target.value || null })}
            readOnly={readonly}
            placeholder="Session notes, contacts, plans..."
            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          />
        </CardContent>
      </Card>
    </div>
  )
}
