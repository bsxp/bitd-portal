import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AvatarCropper } from '@/components/AvatarCropper'
import { uploadCharacterImage } from '@/lib/db'
import type { Character } from '@/lib/types'
import { ImagePlus, Crop, Trash2 } from 'lucide-react'

// Full character art with upload / re-crop / remove controls, shown at the top
// of the character sheet. Uploading new art opens the cropper to also set the
// circular profile picture; both the original and the crop go to storage.
export function CharacterArt({
  character,
  onUpdate,
  readonly,
}: {
  character: Character
  onUpdate: (updates: Partial<Character>) => void
  readonly?: boolean
}) {
  const fileInput = useRef<HTMLInputElement | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  // A freshly picked file still needs uploading; a re-crop reuses existing art.
  const pendingArt = useRef<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Revoke any object URL we created for the cropper.
  useEffect(() => {
    return () => { if (cropSrc?.startsWith('blob:')) URL.revokeObjectURL(cropSrc) }
  }, [cropSrc])

  function pickArt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setError(null)
    pendingArt.current = file
    setCropSrc(URL.createObjectURL(file)) // local URL → no CORS taint on the canvas
  }

  function recrop() {
    if (!character.art_url) return
    pendingArt.current = null
    setError(null)
    // Cache-buster so the CORS-enabled fetch isn't served from a non-CORS cache
    // entry (which would taint the canvas on export).
    const sep = character.art_url.includes('?') ? '&' : '?'
    setCropSrc(`${character.art_url}${sep}cors=1`)
  }

  function closeCropper() {
    if (cropSrc?.startsWith('blob:')) URL.revokeObjectURL(cropSrc)
    pendingArt.current = null
    setCropSrc(null)
  }

  async function saveCrop(blob: Blob) {
    setBusy(true)
    setError(null)
    try {
      const updates: Partial<Character> = {}
      if (pendingArt.current) {
        updates.art_url = await uploadCharacterImage(character.id, pendingArt.current, 'art')
      }
      updates.avatar_url = await uploadCharacterImage(character.id, blob, 'avatar')
      onUpdate(updates)
      closeCropper()
    } catch (err) {
      console.error('[bitd character art]', err)
      setError('Upload failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function removeArt() {
    onUpdate({ art_url: null, avatar_url: null })
  }

  return (
    <div className="w-2/5 shrink-0">
      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={pickArt} />

      {character.art_url ? (
        <div className="group relative overflow-hidden rounded-lg border bg-muted">
          <img src={character.art_url} alt={character.name} className="aspect-[3/4] w-full object-cover object-top" />
          {!readonly && (
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button size="icon-sm" variant="secondary" onClick={recrop} disabled={busy} title="Re-crop profile picture">
                <Crop />
              </Button>
              <Button size="icon-sm" variant="secondary" onClick={() => fileInput.current?.click()} disabled={busy} title="Replace art">
                <ImagePlus />
              </Button>
              <Button size="icon-sm" variant="secondary" onClick={removeArt} disabled={busy} title="Remove art">
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
      ) : (
        !readonly && (
          <button
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-50"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">{busy ? 'Uploading…' : 'Upload art'}</span>
          </button>
        )
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {cropSrc && (
        <AvatarCropper src={cropSrc} open={!!cropSrc} onCancel={closeCropper} onSave={saveCrop} />
      )}
    </div>
  )
}
