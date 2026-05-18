import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'
import type { CharacterContact } from '@/lib/types'

interface ContactsListProps {
  contacts: CharacterContact[]
  onChange: (contacts: CharacterContact[]) => void
  readonly?: boolean
}

export function ContactsList({ contacts, onChange, readonly }: ContactsListProps) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRelationship, setNewRelationship] = useState<CharacterContact['relationship']>('friend')

  function handleAdd() {
    if (!newName.trim()) return
    onChange([...contacts, { name: newName.trim(), relationship: newRelationship, description: null }])
    setNewName('')
    setNewRelationship('friend')
    setAdding(false)
  }

  function handleRemove(index: number) {
    onChange(contacts.filter((_, i) => i !== index))
  }

  const friends = contacts.filter((c) => c.relationship === 'friend')
  const rivals = contacts.filter((c) => c.relationship === 'rival')
  const others = contacts.filter((c) => c.relationship === 'other')

  return (
    <div className="space-y-2">
      {contacts.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No contacts yet.</p>
      )}

      {friends.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400">Friends</span>
          {friends.map((c, i) => {
            const idx = contacts.indexOf(c)
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="flex-1">{c.name}</span>
                {!readonly && (
                  <button onClick={() => handleRemove(idx)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {rivals.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Rivals</span>
          {rivals.map((c, i) => {
            const idx = contacts.indexOf(c)
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="flex-1">{c.name}</span>
                {!readonly && (
                  <button onClick={() => handleRemove(idx)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Other</span>
          {others.map((c, i) => {
            const idx = contacts.indexOf(c)
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/70" />
                <span className="flex-1">
                  {c.name}
                  {c.description && <span className="text-xs text-muted-foreground"> — {c.description}</span>}
                </span>
                {!readonly && (
                  <button onClick={() => handleRemove(idx)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!readonly && (
        adding ? (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name & role..."
              className="h-7 flex-1 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <div className="flex gap-1">
              {(['friend', 'rival', 'other'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setNewRelationship(r)}
                  className={cn(
                    'rounded border-2 px-2 py-0.5 text-[10px] font-medium capitalize transition-colors',
                    newRelationship === r
                      ? r === 'friend'
                        ? 'border-green-400 bg-green-500/20 text-green-400'
                        : r === 'rival'
                        ? 'border-red-400 bg-red-500/20 text-red-400'
                        : 'border-muted-foreground bg-muted text-muted-foreground'
                      : 'border-muted-foreground/40 bg-muted',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAdd}>
              Add
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-3 w-3" />
            Add Contact
          </Button>
        )
      )}
    </div>
  )
}
