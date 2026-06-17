import { useState } from 'react'
import { useGame } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DebouncedText } from '@/components/DebouncedText'
import { cn } from '@/lib/utils'
import { CODEX_TAGS } from '@/lib/types'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import type { CodexEntry, CodexTag } from '@/lib/types'

// Subtle per-tag colors, reused by the filter chips and each note's tag badge.
const TAG_COLOR: Record<CodexTag, string> = {
  people: 'border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-400',
  places: 'border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400',
  items: 'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400',
  factions: 'border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-400',
  lore: 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-400',
  other: 'border-border bg-muted text-muted-foreground',
}
const UNTAGGED_COLOR = 'border-border bg-muted text-muted-foreground'

type Filter = CodexTag | 'all' | 'untagged'

// The crew "Codex": a shared, free-form knowledge base. Anyone at the table can
// add notes (people, places, rumors — whatever) and everyone can edit them.
// Notes sync in realtime; each is its own row so simultaneous adds never clash.
export function CodexPanel() {
  const { codex, addCodexEntry, updateCodexEntry, deleteCodexEntry, campaignId } = useGame()
  const [filter, setFilter] = useState<Filter>('all')

  function handleAdd() {
    addCodexEntry({
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      title: '',
      body: '',
      tag: filter === 'all' || filter === 'untagged' ? null : filter,
      created_at: new Date().toISOString(),
    })
  }

  // Newest first so a freshly-added note lands at the top, ready to fill in.
  const notes = [...codex].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const visible = notes.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'untagged') return !n.tag
    return n.tag === filter
  })

  const counts = notes.reduce<Record<string, number>>((acc, n) => {
    const key = n.tag ?? 'untagged'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-5 w-5" />
            Codex
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Shared notes — people, places, anything worth remembering. Anyone can add or edit.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add note
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All <span className="opacity-60">{notes.length}</span>
        </FilterChip>
        {CODEX_TAGS.map((t) => (
          <FilterChip
            key={t.value}
            active={filter === t.value}
            color={TAG_COLOR[t.value]}
            onClick={() => setFilter(t.value)}
          >
            {t.label} <span className="opacity-60">{counts[t.value] ?? 0}</span>
          </FilterChip>
        ))}
        {(counts.untagged ?? 0) > 0 && (
          <FilterChip active={filter === 'untagged'} onClick={() => setFilter('untagged')}>
            Untagged <span className="opacity-60">{counts.untagged}</span>
          </FilterChip>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          {notes.length === 0
            ? "No notes yet. Add the first one to start your crew's knowledge base."
            : 'No notes with this tag.'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={(updates) => updateCodexEntry(note.id, updates)}
              onDelete={() => deleteCodexEntry(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? color
            ? color
            : 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:bg-muted/50',
      )}
    >
      {children}
    </button>
  )
}

function NoteCard({
  note,
  onUpdate,
  onDelete,
}: {
  note: CodexEntry
  onUpdate: (updates: Partial<CodexEntry>) => void
  onDelete: () => void
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-start gap-2">
          <DebouncedText
            value={note.title}
            onCommit={(v) => onUpdate({ title: v ?? '' })}
            placeholder="Title..."
            className="h-8 flex-1 border-0 bg-transparent px-0 text-base font-semibold shadow-none focus-visible:ring-0"
          />
          <button
            onClick={() => {
              if (window.confirm('Delete this note? This affects everyone.')) onDelete()
            }}
            className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <select
          value={note.tag ?? ''}
          onChange={(e) => onUpdate({ tag: (e.target.value || null) as CodexTag | null })}
          title="Tag this note"
          className={cn(
            'w-fit cursor-pointer rounded-full border px-2 py-0.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            note.tag ? TAG_COLOR[note.tag] : UNTAGGED_COLOR,
          )}
        >
          <option value="">Untagged</option>
          {CODEX_TAGS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <DebouncedText
          value={note.body}
          onCommit={(v) => onUpdate({ body: v ?? '' })}
          multiline
          placeholder="Write anything..."
          className="min-h-[120px] w-full flex-1 resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </CardContent>
    </Card>
  )
}
