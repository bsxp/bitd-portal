import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { FACTION_STATUS_LABELS } from '@/lib/types'
import { CANONICAL_FACTIONS } from '@/lib/game-data'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { Faction, Hold } from '@/lib/types'

interface FactionTrackerProps {
  factions: Faction[]
  onUpdate: (id: string, updates: Partial<Faction>) => void
  onAdd?: (faction: Faction) => void
  onDelete?: (id: string) => void
  readonly?: boolean
}

export function FactionTracker({ factions, onUpdate, onAdd, onDelete, readonly }: FactionTrackerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addMode, setAddMode] = useState<'canonical' | 'custom'>('canonical')
  const [customName, setCustomName] = useState('')
  const [customTier, setCustomTier] = useState('1')
  const [customHold, setCustomHold] = useState<Hold>('weak')
  const [customCategory, setCustomCategory] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const grouped = factions.reduce<Record<string, Faction[]>>((acc, f) => {
    const cat = f.category ?? 'Other'
    ;(acc[cat] ??= []).push(f)
    return acc
  }, {})

  const addedNames = new Set(factions.map((f) => f.name))
  const availableCanonical = CANONICAL_FACTIONS.filter((f) => !addedNames.has(f.name))
  const canonicalByCategory = availableCanonical.reduce<Record<string, typeof availableCanonical>>((acc, f) => {
    ;(acc[f.category] ??= []).push(f)
    return acc
  }, {})

  function handleAddCanonical(name: string) {
    const canonical = CANONICAL_FACTIONS.find((f) => f.name === name)
    if (!canonical || !onAdd) return
    onAdd({
      id: crypto.randomUUID(),
      campaign_id: 'demo',
      name: canonical.name,
      tier: canonical.tier,
      hold: canonical.hold,
      status: 0,
      category: canonical.category,
      description: canonical.description,
      notes: null,
      player_notes: null,
      created_at: new Date().toISOString(),
    })
  }

  function handleAddCustom() {
    if (!customName.trim() || !onAdd) return
    onAdd({
      id: crypto.randomUUID(),
      campaign_id: 'demo',
      name: customName.trim(),
      tier: parseInt(customTier),
      hold: customHold,
      status: 0,
      category: customCategory.trim() || 'Other',
      description: customDescription.trim() || null,
      notes: null,
      player_notes: null,
      created_at: new Date().toISOString(),
    })
    setCustomName('')
    setCustomTier('1')
    setCustomHold('weak')
    setCustomCategory('')
    setCustomDescription('')
    setAddDialogOpen(false)
  }

  function toggleNotes(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryFactions]) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryFactions.map((faction) => (
                <div key={faction.id} className="rounded-md border">
                  <div className="flex items-center gap-3 p-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleNotes(faction.id)}
                          className="flex items-center gap-1"
                        >
                          {expandedNotes.has(faction.id)
                            ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            : <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          }
                          <span className="font-medium">{faction.name}</span>
                        </button>
                        {readonly ? (
                          <span className="text-xs text-muted-foreground">
                            Tier {faction.tier} ({faction.hold[0].toUpperCase()})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            Tier
                            <select
                              value={faction.tier}
                              onChange={(e) => onUpdate(faction.id, { tier: parseInt(e.target.value) })}
                              className="rounded border border-input bg-background px-1 py-0.5 text-xs text-foreground"
                              title="Faction tier"
                            >
                              {[0, 1, 2, 3, 4, 5, 6].map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => onUpdate(faction.id, { hold: faction.hold === 'strong' ? 'weak' : 'strong' })}
                              title={`Hold: ${faction.hold} — click to toggle`}
                              className={cn(
                                'rounded border px-1.5 py-0.5 text-xs font-bold transition-colors',
                                faction.hold === 'strong'
                                  ? 'border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400'
                                  : 'border-yellow-500/40 bg-yellow-500/15 text-yellow-700',
                              )}
                            >
                              {faction.hold[0].toUpperCase()}
                            </button>
                          </span>
                        )}
                      </div>
                      {faction.description && (
                        <p className="ml-4 text-xs text-muted-foreground">{faction.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {[-3, -2, -1, 0, 1, 2, 3].map((s) => (
                        <button
                          key={s}
                          onClick={() => !readonly && onUpdate(faction.id, { status: s })}
                          disabled={readonly}
                          title={FACTION_STATUS_LABELS[s]}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-colors',
                            faction.status === s
                              ? s > 0
                                ? 'bg-green-500 text-white'
                                : s < 0
                                  ? 'bg-red-500 text-white'
                                  : 'bg-muted-foreground text-white'
                              : 'bg-muted text-muted-foreground',
                            !readonly && 'cursor-pointer hover:opacity-80',
                          )}
                        >
                          {s > 0 ? `+${s}` : s}
                        </button>
                      ))}
                    </div>

                    {onDelete && !readonly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(faction.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {expandedNotes.has(faction.id) && (
                    <div className="border-t px-2 py-2 space-y-2">
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Known Info (visible to players)
                        </Label>
                        <textarea
                          value={faction.player_notes ?? ''}
                          onChange={(e) => onUpdate(faction.id, { player_notes: e.target.value || null })}
                          readOnly={readonly}
                          placeholder="Leader, HQ, known operations..."
                          className="mt-1 w-full min-h-[40px] rounded-md border border-input bg-transparent px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                        />
                      </div>
                      {!readonly && (
                        <div>
                          <Label className="text-[10px] uppercase tracking-wider text-amber-600">
                            GM Notes (hidden from players)
                          </Label>
                          <textarea
                            value={faction.notes ?? ''}
                            onChange={(e) => onUpdate(faction.id, { notes: e.target.value || null })}
                            placeholder="Secret plans, hidden agendas..."
                            className="mt-1 w-full min-h-[40px] rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {factions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No factions tracked yet. Add factions as they become relevant to your campaign.
            </p>
          </CardContent>
        </Card>
      )}

      {onAdd && !readonly && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger
            render={<Button variant="outline" className="w-full gap-1" />}
          >
            <Plus className="h-4 w-4" />
            Add Faction
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Faction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setAddMode('canonical')}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    addMode === 'canonical'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30',
                  )}
                >
                  From Doskvol
                </button>
                <button
                  onClick={() => setAddMode('custom')}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    addMode === 'custom'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30',
                  )}
                >
                  Custom Faction
                </button>
              </div>

              {addMode === 'canonical' ? (
                <div className="space-y-3">
                  {availableCanonical.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All canonical factions have been added.</p>
                  ) : (
                    Object.entries(canonicalByCategory).map(([cat, catFactions]) => (
                      <div key={cat}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
                        <div className="space-y-1">
                          {catFactions.map((f) => (
                            <button
                              key={f.name}
                              onClick={() => handleAddCanonical(f.name)}
                              className="flex w-full items-center justify-between rounded-md border p-2 text-left transition-colors hover:bg-muted/50"
                            >
                              <div>
                                <span className="text-sm font-medium">{f.name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  T{f.tier} ({f.hold[0].toUpperCase()})
                                </span>
                                <p className="text-xs text-muted-foreground">{f.description}</p>
                              </div>
                              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Faction name..."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Tier</Label>
                      <Select value={customTier} onValueChange={(v) => { if (v) setCustomTier(v) }}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6].map((t) => (
                            <SelectItem key={t} value={String(t)}>Tier {t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Hold</Label>
                      <Select value={customHold} onValueChange={(v) => { if (v) setCustomHold(v as Hold) }}>
                        <SelectTrigger className="mt-1 capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strong">Strong</SelectItem>
                          <SelectItem value="weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Underworld, Institutions..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Brief description..."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleAddCustom} className="w-full" disabled={!customName.trim()}>
                    Add Custom Faction
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
