import { useGame } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DebouncedText } from '@/components/DebouncedText'
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import type { CodexEntry } from '@/lib/types'

// The crew "Codex": a shared, free-form knowledge base. Anyone at the table can
// add notes (people, places, rumors — whatever) and everyone can edit them.
// Notes sync in realtime; each is its own row so simultaneous adds never clash.
export function CodexPanel() {
  const { codex, addCodexEntry, updateCodexEntry, deleteCodexEntry, campaignId } = useGame()

  function handleAdd() {
    addCodexEntry({
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      title: '',
      body: '',
      created_at: new Date().toISOString(),
    })
  }

  // Newest first so a freshly-added note lands at the top, ready to fill in.
  const notes = [...codex].sort((a, b) => b.created_at.localeCompare(a.created_at))

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

      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No notes yet. Add the first one to start your crew's knowledge base.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
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
