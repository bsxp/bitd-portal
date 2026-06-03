import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ArrowLeft, Loader2, Plus, Minus } from 'lucide-react'
import { saveEntity } from '@/lib/db'
import { PLAYBOOK_ABILITIES } from '@/lib/game-data'
import {
  ACTION_RATINGS, HERITAGE_OPTIONS, BACKGROUND_OPTIONS, VICE_OPTIONS,
  type Playbook, type ActionName, type Character,
} from '@/lib/types'

const PLAYBOOKS: { id: Playbook; blurb: string }[] = [
  { id: 'cutter', blurb: 'A dangerous & intimidating fighter' },
  { id: 'hound', blurb: 'A deadly sharpshooter & tracker' },
  { id: 'leech', blurb: 'A saboteur & technician' },
  { id: 'lurk', blurb: 'A stealthy infiltrator & burglar' },
  { id: 'slide', blurb: 'A subtle manipulator & spy' },
  { id: 'spider', blurb: 'A devious mastermind' },
  { id: 'whisper', blurb: 'An arcane adept & channeler' },
]

const ALL_ACTIONS: { attr: keyof typeof ACTION_RATINGS; actions: readonly ActionName[] }[] = [
  { attr: 'insight', actions: ACTION_RATINGS.insight },
  { attr: 'prowess', actions: ACTION_RATINGS.prowess },
  { attr: 'resolve', actions: ACTION_RATINGS.resolve },
]

const MAX_ACTION = 3 // creation cap (Mastery upgrade lifts it later, in-game)

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize shadow-sm focus-visible:border-ring focus-visible:outline-none'

interface Props {
  campaignId: string
  onCancel: () => void
  onCreated: (character: Character) => void
}

export function CharacterCreate({ campaignId, onCancel, onCreated }: Props) {
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [look, setLook] = useState('')
  const [heritage, setHeritage] = useState('')
  const [heritageDetail, setHeritageDetail] = useState('')
  const [background, setBackground] = useState('')
  const [backgroundDetail, setBackgroundDetail] = useState('')
  const [vice, setVice] = useState('')
  const [vicePurveyor, setVicePurveyor] = useState('')
  const [playbook, setPlaybook] = useState<Playbook | ''>('')
  const [actions, setActions] = useState<Record<string, number>>({})
  const [abilities, setAbilities] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const playbookAbilities = useMemo(
    () => (playbook ? PLAYBOOK_ABILITIES[playbook] : []),
    [playbook],
  )

  function bumpAction(a: string, d: number) {
    setActions((prev) => {
      const next = Math.max(0, Math.min(MAX_ACTION, (prev[a] ?? 0) + d))
      return { ...prev, [a]: next }
    })
  }

  function toggleAbility(name: string) {
    setAbilities((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  async function submit() {
    if (!name.trim()) { setError('Give your character a name.'); return }
    if (!playbook) { setError('Choose a playbook.'); return }
    setSaving(true)
    setError(null)

    const char: Character = {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      user_id: null,
      crew_id: null,
      created_at: new Date().toISOString(),
      name: name.trim(),
      alias: alias.trim() || null,
      look: look.trim() || null,
      playbook,
      heritage: heritage || null,
      heritage_detail: heritageDetail.trim() || null,
      background: background || null,
      background_detail: backgroundDetail.trim() || null,
      vice: vice || null,
      vice_purveyor: vicePurveyor.trim() || null,
      stress: 0,
      trauma: [],
      coin: 0,
      stash: 0,
      playbook_xp: 0,
      insight_xp: 0,
      prowess_xp: 0,
      resolve_xp: 0,
      hunt: actions.hunt ?? 0, study: actions.study ?? 0, survey: actions.survey ?? 0, tinker: actions.tinker ?? 0,
      finesse: actions.finesse ?? 0, prowl: actions.prowl ?? 0, skirmish: actions.skirmish ?? 0, wreck: actions.wreck ?? 0,
      attune: actions.attune ?? 0, command: actions.command ?? 0, consort: actions.consort ?? 0, sway: actions.sway ?? 0,
      harm_level3: null,
      harm_level2_a: null,
      harm_level2_b: null,
      harm_level1_a: null,
      harm_level1_b: null,
      healing_clock: 0,
      armor_available: true,
      heavy_armor_available: false,
      special_armor_available: true,
      armor_used: false,
      heavy_armor_used: false,
      special_armor_used: false,
      load_level: null,
      items_carried: [],
      special_abilities: abilities,
      ability_details: {},
      contacts: [],
      notes: notes.trim() || null,
    }

    try {
      await saveEntity('characters', campaignId, char)
      onCreated(char)
    } catch (e) {
      console.error('[bitd create character]', e)
      setError('Could not save. Try again.')
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <button
            onClick={onCancel}
            className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to seats
          </button>
          <CardTitle className="text-xl">Create a character</CardTitle>
          <p className="text-sm text-muted-foreground">Build your scoundrel and add them to the crew.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Clave Clermont" autoFocus />
            </Field>
            <Field label="Alias">
              <Input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Racer" />
            </Field>
          </div>
          <Field label="Look">
            <Input value={look} onChange={(e) => setLook(e.target.value)} placeholder="Young, privileged, rebellious" />
          </Field>

          {/* Playbook */}
          <Field label="Playbook">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PLAYBOOKS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlaybook(p.id)}
                  title={p.blurb}
                  className={cn(
                    'rounded-md border-2 px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors',
                    playbook === p.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/20 hover:border-primary/50',
                  )}
                >
                  {p.id}
                </button>
              ))}
            </div>
          </Field>

          {/* Heritage / Background / Vice */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Heritage">
              <select className={SELECT_CLASS} value={heritage} onChange={(e) => setHeritage(e.target.value)}>
                <option value="">—</option>
                {HERITAGE_OPTIONS.map((h) => <option key={h} value={h}>{cap(h)}</option>)}
              </select>
            </Field>
            <Field label="Heritage detail">
              <Input value={heritageDetail} onChange={(e) => setHeritageDetail(e.target.value)} placeholder="e.g. Akoros" />
            </Field>
            <Field label="Background">
              <select className={SELECT_CLASS} value={background} onChange={(e) => setBackground(e.target.value)}>
                <option value="">—</option>
                {BACKGROUND_OPTIONS.map((b) => <option key={b} value={b}>{cap(b)}</option>)}
              </select>
            </Field>
            <Field label="Background detail">
              <Input value={backgroundDetail} onChange={(e) => setBackgroundDetail(e.target.value)} placeholder="e.g. Noble" />
            </Field>
            <Field label="Vice">
              <select className={SELECT_CLASS} value={vice} onChange={(e) => setVice(e.target.value)}>
                <option value="">—</option>
                {VICE_OPTIONS.map((v) => <option key={v} value={v}>{cap(v)}</option>)}
              </select>
            </Field>
            <Field label="Purveyor">
              <Input value={vicePurveyor} onChange={(e) => setVicePurveyor(e.target.value)} placeholder="Where / who" />
            </Field>
          </div>

          {/* Action ratings */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action ratings</div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-3">
              {ALL_ACTIONS.map(({ attr, actions: list }) => (
                <div key={attr} className="space-y-1">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{attr}</div>
                  {list.map((a) => (
                    <div key={a} className="flex items-center justify-between gap-2">
                      <span className="text-sm capitalize">{a}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="rounded border px-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          onClick={() => bumpAction(a, -1)} disabled={(actions[a] ?? 0) === 0}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-3 text-center text-sm tabular-nums">{actions[a] ?? 0}</span>
                        <button type="button" className="rounded border px-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          onClick={() => bumpAction(a, 1)} disabled={(actions[a] ?? 0) >= MAX_ACTION}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Special abilities */}
          {playbook && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Special abilities</div>
              <div className="space-y-1">
                {playbookAbilities.map((ab) => {
                  const on = abilities.includes(ab.name)
                  return (
                    <button
                      key={ab.name}
                      type="button"
                      onClick={() => toggleAbility(ab.name)}
                      className={cn(
                        'flex w-full gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors',
                        on ? 'border-primary bg-primary/5' : 'border-muted-foreground/15 hover:border-primary/40',
                      )}
                    >
                      <span className={cn('mt-0.5 h-4 w-4 shrink-0 rounded-full border-2', on ? 'border-primary bg-primary' : 'border-muted-foreground/40')} />
                      <span><span className="font-semibold">{ab.name}.</span>{' '}<span className="text-muted-foreground">{ab.description}</span></span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Drives, beliefs, anything else…"
              className="w-full rounded-md border border-input bg-transparent p-2 text-sm shadow-sm focus-visible:border-ring focus-visible:outline-none"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>Cancel</Button>
            <Button className="flex-1" onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create & play'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
