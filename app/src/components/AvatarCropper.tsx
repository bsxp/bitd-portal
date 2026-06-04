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

const VIEW = 288 // on-screen crop viewport (px)
const EXPORT = 320 // exported avatar size (px)

type Pt = { x: number; y: number }

// Modal for choosing the circular profile-picture region of a character's art.
// The user pans (drag) and zooms (slider); on save we render the visible square
// to a canvas and hand back a webp Blob ready to upload.
export function AvatarCropper({
  src,
  open,
  onCancel,
  onSave,
}: {
  src: string
  open: boolean
  onCancel: () => void
  onSave: (blob: Blob) => void | Promise<void>
}) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const drag = useRef<{ start: Pt; off: Pt } | null>(null)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const [minScale, setMinScale] = useState(1)
  const [scale, setScale] = useState(1)
  const [off, setOff] = useState<Pt>({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)

  function clamp(x: number, y: number, s: number, n = nat): Pt {
    if (!n) return { x, y }
    const minX = VIEW - n.w * s
    const minY = VIEW - n.h * s
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) }
  }

  function handleLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const w = e.currentTarget.naturalWidth
    const h = e.currentTarget.naturalHeight
    const s = Math.max(VIEW / w, VIEW / h) // "cover" the viewport
    const n = { w, h }
    setNat(n)
    setMinScale(s)
    setScale(s)
    setOff(clamp((VIEW - w * s) / 2, (VIEW - h * s) / 2, s, n))
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { start: { x: e.clientX, y: e.clientY }, off }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return
    const nx = drag.current.off.x + (e.clientX - drag.current.start.x)
    const ny = drag.current.off.y + (e.clientY - drag.current.start.y)
    setOff(clamp(nx, ny, scale))
  }
  function onPointerUp() {
    drag.current = null
  }

  function onZoom(e: React.ChangeEvent<HTMLInputElement>) {
    const s = Number(e.target.value)
    // Keep the point under the viewport centre fixed while zooming.
    const cx = VIEW / 2
    const imgX = (cx - off.x) / scale
    const imgY = (cx - off.y) / scale
    setScale(s)
    setOff(clamp(cx - imgX * s, cx - imgY * s, s))
  }

  async function save() {
    if (!nat || !imgRef.current) return
    setSaving(true)
    try {
      const sSize = VIEW / scale
      const sx = -off.x / scale
      const sy = -off.y / scale
      const canvas = document.createElement('canvas')
      canvas.width = EXPORT
      canvas.height = EXPORT
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, EXPORT, EXPORT)
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.9))
      if (blob) await onSave(blob)
    } catch (err) {
      console.error('[bitd avatar crop]', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose profile picture</DialogTitle>
          <DialogDescription>Drag to reposition, slide to zoom. The circle is what others see.</DialogDescription>
        </DialogHeader>
        <div
          className="relative mx-auto touch-none select-none overflow-hidden rounded-md bg-muted"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            onLoad={handleLoad}
            className="absolute origin-top-left"
            style={{
              left: off.x,
              top: off.y,
              width: nat ? nat.w * scale : undefined,
              height: nat ? nat.h * scale : undefined,
              maxWidth: 'none',
            }}
          />
          {/* Circular guide: darkens everything outside the inscribed circle. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}
          />
        </div>
        <input
          type="range"
          min={minScale}
          max={minScale * 5}
          step="any"
          value={scale}
          onChange={onZoom}
          disabled={!nat}
          className="w-full accent-primary"
          aria-label="Zoom"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || !nat}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
