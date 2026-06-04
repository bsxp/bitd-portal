import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { uploadMediaFile } from '@/lib/db'
import type { Media } from '@/lib/types'
import {
  ImagePlus, ChevronLeft, ChevronRight, Trash2, Plus, Music, Images,
} from 'lucide-react'

function byNewest(a: Media, b: Media) {
  return b.created_at.localeCompare(a.created_at)
}

// GM media uploader + shared carousel for the whole table, shown on the Overview
// tab. Players see the carousel and lightbox but not the upload/delete controls.
export function MediaSection({
  media,
  isGM,
  campaignId,
  onAdd,
  onDelete,
}: {
  media: Media[]
  isGM: boolean
  campaignId: string
  onAdd: (item: Media) => void
  onDelete: (id: string) => void
}) {
  const all = [...media].sort(byNewest)
  const images = all.filter((m) => m.kind === 'image')
  const preview = images.slice(0, 5)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null) // index into `all`

  if (all.length === 0 && !isGM) return null

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Media</h3>
        {isGM && (
          <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
            <Plus /> Add media
          </Button>
        )}
      </div>

      {all.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media yet. Upload images or audio for the table to see.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {preview.map((m) => (
              <button
                key={m.id}
                onClick={() => setLightbox(all.indexOf(m))}
                className="group relative overflow-hidden rounded-md border bg-muted"
                title={m.note ?? undefined}
              >
                <img src={m.url} alt={m.note ?? ''} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {images.length} image{images.length === 1 ? '' : 's'}
              {all.length - images.length > 0 && ` · ${all.length - images.length} audio`}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setLightbox(0)}>
              <Images /> See all
            </Button>
          </div>
        </>
      )}

      {isGM && (
        <UploadDialog
          open={uploadOpen}
          campaignId={campaignId}
          onClose={() => setUploadOpen(false)}
          onAdd={onAdd}
        />
      )}

      {lightbox !== null && all[lightbox] && (
        <Lightbox
          items={all}
          index={lightbox}
          isGM={isGM}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
          onDelete={(id) => {
            onDelete(id)
            // Step back if we removed the last item; close if none remain.
            setLightbox((i) => {
              if (i === null) return null
              if (all.length <= 1) return null
              return Math.max(0, Math.min(i, all.length - 2))
            })
          }}
        />
      )}
    </section>
  )
}

function UploadDialog({
  open,
  campaignId,
  onClose,
  onAdd,
}: {
  open: boolean
  campaignId: string
  onClose: () => void
  onAdd: (item: Media) => void
}) {
  const fileInput = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setFile(null)
    setNote('')
    setError(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/') && !f.type.startsWith('audio/')) {
      setError('Only images and audio are allowed.')
      return
    }
    setError(null)
    setFile(f)
  }

  async function upload() {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const url = await uploadMediaFile(campaignId, file)
      onAdd({
        id: crypto.randomUUID(),
        campaign_id: campaignId,
        url,
        kind: file.type.startsWith('audio/') ? 'audio' : 'image',
        note: note.trim() || null,
        filename: file.name,
        created_at: new Date().toISOString(),
      })
      reset()
      onClose()
    } catch (err) {
      console.error('[bitd media upload]', err)
      setError('Upload failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add media</DialogTitle>
          <DialogDescription>Share an image or audio clip with the whole table.</DialogDescription>
        </DialogHeader>

        <input ref={fileInput} type="file" accept="image/*,audio/*" className="hidden" onChange={pick} />

        {file ? (
          <div className="space-y-2">
            {file.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(file)} alt="" className="max-h-48 w-full rounded-md object-contain" />
            ) : (
              <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <Music className="h-4 w-4 shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
            )}
            <button onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = '' }} className="text-xs text-muted-foreground hover:text-foreground">
              Choose a different file
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInput.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Choose image or audio</span>
          </button>
        )}

        <div>
          <label className="text-xs text-muted-foreground">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A caption or context for this media…"
            className="mt-1 w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose() }} disabled={busy}>Cancel</Button>
          <Button onClick={upload} disabled={busy || !file}>{busy ? 'Uploading…' : 'Upload'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Lightbox({
  items,
  index,
  isGM,
  onIndex,
  onClose,
  onDelete,
}: {
  items: Media[]
  index: number
  isGM: boolean
  onIndex: (i: number) => void
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const item = items[index]
  if (!item) return null
  const prev = () => onIndex((index - 1 + items.length) % items.length)
  const next = () => onIndex((index + 1) % items.length)

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-normal text-muted-foreground">
            {index + 1} / {items.length}{item.filename ? ` · ${item.filename}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="outline" onClick={prev} disabled={items.length < 2} aria-label="Previous">
            <ChevronLeft />
          </Button>
          <div className="flex min-h-[40vh] flex-1 items-center justify-center overflow-hidden rounded-md bg-muted">
            {item.kind === 'image' ? (
              <img src={item.url} alt={item.note ?? ''} className="max-h-[70vh] w-full object-contain" />
            ) : (
              <div className="flex w-full flex-col items-center gap-3 p-6">
                <Music className="h-10 w-10 text-muted-foreground" />
                <audio controls src={item.url} className="w-full" />
              </div>
            )}
          </div>
          <Button size="icon-sm" variant="outline" onClick={next} disabled={items.length < 2} aria-label="Next">
            <ChevronRight />
          </Button>
        </div>

        {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}

        {isGM && (
          <DialogFooter>
            <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
              <Trash2 /> Delete
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
