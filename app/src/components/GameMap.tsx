import { useState, useRef, useEffect, useCallback } from 'react'
import { useGame } from '@/lib/store'
import { useSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Plus, Minus, RotateCcw, Upload, Trash2, X, Users, ChevronDown, ImageIcon, Hand, Pencil, Radio } from 'lucide-react'
import type { MapToken } from '@/lib/types'

const TOKEN_PALETTE = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

const BUILT_IN_MAPS = [
  { id: 'doskvol-detailed', label: 'Doskvol (Detailed)', src: '/maps/doskvol-detailed.png' },
  { id: 'doskvol-labeled', label: 'Doskvol (Labeled)', src: '/maps/doskvol-labeled.png' },
  { id: 'doskvol-clean', label: 'Continent', src: '/maps/doskvol-clean.png' },
]

const DEFAULT_SURFACE = { width: 1200, height: 800 }

// Ephemeral overlay lifetimes (ms)
const STROKE_HOLD = 3000
const STROKE_FADE = 3000
const STROKE_LIFE = STROKE_HOLD + STROKE_FADE
const PING_LIFE = 1300
const CURSOR_STALE = 5000

type Tool = 'move' | 'draw' | 'ping'
type Pt = { x: number; y: number }
interface RemoteCursor { name: string; color: string; x: number; y: number; vx: number; vy: number; t: number }
interface Stroke { id: string; color: string; points: Pt[]; addedAt: number }
interface MapPing { id: string; x: number; y: number; color: string; addedAt: number }

function colorFromId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return TOKEN_PALETTE[h % TOKEN_PALETTE.length]
}

function CursorArrow({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
      <path d="M4 2 L20 11 L12.5 12.5 L9.5 20 Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function GameMap({ isGM }: { isGM: boolean }) {
  const {
    mapTokens, updateMapToken, addMapToken, removeMapToken, commitMapToken,
    mapImageUrl, setMapImage, campaignId,
  } = useGame()
  const { session, sessionId } = useSession()
  const myName = session?.seat?.name ?? 'Player'
  const myColor = colorFromId(sessionId)

  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastBroadcastRef = useRef(0)
  const cursorThrottleRef = useRef(0)
  const strokeRef = useRef<Stroke | null>(null)
  // Smoothed/interpolated render positions for remote cursors, advanced each
  // animation frame toward the latest received target (decoupled from network).
  const cursorDisplayRef = useRef<Record<string, Pt>>({})
  const remoteCursorsRef = useRef<Record<string, RemoteCursor>>({})
  const lastTickRef = useRef(0)

  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const [surface, setSurface] = useState(DEFAULT_SURFACE)
  const [drag, setDrag] = useState<{
    mode: 'token' | 'pan'
    id?: string
    sx: number
    sy: number
    tx?: number
    ty?: number
    vx?: number
    vy?: number
  } | null>(null)
  const [panel, setPanel] = useState(true)
  const [mapPicker, setMapPicker] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState(TOKEN_PALETTE[0])

  const [tool, setTool] = useState<Tool>('move')
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({})
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [drawing, setDrawing] = useState<Stroke | null>(null)
  const [pings, setPings] = useState<MapPing[]>([])
  const [localCursor, setLocalCursor] = useState<Pt | null>(null)
  const [clock, setClock] = useState(0)

  const cbRef = useRef({ updateMapToken, addMapToken, removeMapToken })
  useEffect(() => {
    cbRef.current = { updateMapToken, addMapToken, removeMapToken }
  })

  useEffect(() => {
    try {
      const ch = supabase.channel(`map:${campaignId}`)
      channelRef.current = ch
      ch.on('broadcast', { event: 'token-move' }, ({ payload }) => {
        cbRef.current.updateMapToken(payload.id, { x: payload.x, y: payload.y })
      })
        .on('broadcast', { event: 'token-add' }, ({ payload }) => {
          cbRef.current.addMapToken(payload)
        })
        .on('broadcast', { event: 'token-remove' }, ({ payload }) => {
          cbRef.current.removeMapToken(payload.id)
        })
        .on('broadcast', { event: 'cursor' }, ({ payload }) => {
          if (payload.id === sessionId) return
          setRemoteCursors((prev) => {
            const prevC = prev[payload.id]
            const now = Date.now()
            let vx = 0, vy = 0
            if (prevC) {
              const dt = now - prevC.t
              if (dt > 0 && dt < 200) { // velocity (percent/ms) from recent samples only
                vx = (payload.x - prevC.x) / dt
                vy = (payload.y - prevC.y) / dt
              }
            }
            return {
              ...prev,
              [payload.id]: { name: payload.name, color: payload.color, x: payload.x, y: payload.y, vx, vy, t: now },
            }
          })
        })
        .on('broadcast', { event: 'cursor-leave' }, ({ payload }) => {
          setRemoteCursors((prev) => {
            if (!prev[payload.id]) return prev
            const n = { ...prev }
            delete n[payload.id]
            return n
          })
        })
        .on('broadcast', { event: 'stroke' }, ({ payload }) => {
          setStrokes((prev) => [...prev, { id: payload.id, color: payload.color, points: payload.points, addedAt: Date.now() }])
        })
        .on('broadcast', { event: 'ping' }, ({ payload }) => {
          setPings((prev) => [...prev, { id: payload.id, x: payload.x, y: payload.y, color: payload.color, addedAt: Date.now() }])
        })
        .subscribe()
      return () => {
        try { ch.send({ type: 'broadcast', event: 'cursor-leave', payload: { id: sessionId } }) } catch { /* ignore */ }
        ch.unsubscribe()
      }
    } catch { /* realtime unavailable */ }
  }, [campaignId, sessionId])

  function broadcast(event: string, payload: object) {
    try {
      channelRef.current?.send({ type: 'broadcast', event, payload })
    } catch { /* ignore */ }
  }

  // Animation loop: advance the clock for fade calculations and prune expired
  // ephemeral overlays. Runs only while something ephemeral exists.
  remoteCursorsRef.current = remoteCursors
  const ephemeralActive = strokes.length > 0 || pings.length > 0 || Object.keys(remoteCursors).length > 0
  useEffect(() => {
    if (!ephemeralActive) return
    let raf = 0
    lastTickRef.current = 0
    const loop = () => {
      const t = Date.now()

      // Interpolate remote cursors toward their latest (lightly predicted) target.
      const prevTick = lastTickRef.current || t
      const dt = Math.min(80, t - prevTick)
      lastTickRef.current = t
      const a = 1 - Math.exp(-dt / 60) // exponential smoothing, ~60ms time constant
      const targets = remoteCursorsRef.current
      const disp = cursorDisplayRef.current
      for (const id in targets) {
        const c = targets[id]
        const stale = t - c.t
        // predict ahead using velocity, but ramp the prediction down as the
        // sample goes stale so the cursor settles (no overshoot) when it stops
        const decay = Math.max(0, 1 - stale / 150)
        const lead = Math.min(stale, 80) * decay
        const tx = c.x + c.vx * lead
        const ty = c.y + c.vy * lead
        const d = disp[id]
        if (!d) disp[id] = { x: tx, y: ty }
        else { d.x += (tx - d.x) * a; d.y += (ty - d.y) * a }
      }
      for (const id in disp) if (!targets[id]) delete disp[id]

      setClock(t)
      setStrokes((prev) => {
        const f = prev.filter((s) => t - s.addedAt < STROKE_LIFE)
        return f.length === prev.length ? prev : f
      })
      setPings((prev) => {
        const f = prev.filter((p) => t - p.addedAt < PING_LIFE)
        return f.length === prev.length ? prev : f
      })
      setRemoteCursors((prev) => {
        let changed = false
        const n: Record<string, RemoteCursor> = {}
        for (const k in prev) {
          if (t - prev[k].t < CURSOR_STALE) n[k] = prev[k]
          else changed = true
        }
        return changed ? n : prev
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [ephemeralActive])

  const fit = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return
    const sc = Math.min(r.width / surface.width, r.height / surface.height) * 0.95
    setView({
      scale: sc,
      x: (r.width - surface.width * sc) / 2,
      y: (r.height - surface.height * sc) / 2,
    })
  }, [surface])

  useEffect(() => { fit() }, [fit])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      const f = e.deltaY > 0 ? 0.9 : 1.1
      setView(v => {
        const ns = Math.max(0.05, Math.min(10, v.scale * f))
        const ratio = ns / v.scale
        return { scale: ns, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio }
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // Convert a screen point to map-surface percent coords (pan/zoom independent).
  function toPct(clientX: number, clientY: number): Pt {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const r = el.getBoundingClientRect()
    return {
      x: ((clientX - r.left - view.x) / view.scale / surface.width) * 100,
      y: ((clientY - r.top - view.y) / view.scale / surface.height) * 100,
    }
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.target as HTMLImageElement
    setSurface({ width: img.naturalWidth, height: img.naturalHeight })
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setMapImage(URL.createObjectURL(file))
  }

  function dropPing(pct: Pt) {
    const id = crypto.randomUUID()
    setPings((prev) => [...prev, { id, x: pct.x, y: pct.y, color: myColor, addedAt: Date.now() }])
    broadcast('ping', { id, x: pct.x, y: pct.y, color: myColor })
  }

  function onDown(e: React.PointerEvent) {
    if (e.button !== 0) return
    const pct = toPct(e.clientX, e.clientY)

    if (tool === 'ping') {
      dropPing(pct)
      return
    }
    if (tool === 'draw') {
      strokeRef.current = { id: crypto.randomUUID(), color: myColor, points: [pct], addedAt: 0 }
      setDrawing({ ...strokeRef.current })
      containerRef.current?.setPointerCapture(e.pointerId)
      return
    }

    const tok = (e.target as HTMLElement).closest('[data-token-id]') as HTMLElement | null
    if (tok) {
      const t = mapTokens.find(t => t.id === tok.dataset.tokenId)
      if (!t) return
      setDrag({ mode: 'token', id: t.id, sx: e.clientX, sy: e.clientY, tx: t.x, ty: t.y })
    } else {
      setDrag({ mode: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y })
    }
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  function onMove(e: React.PointerEvent) {
    // Live cursor tracking (always, regardless of tool/drag)
    const el = containerRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      setLocalCursor({ x: e.clientX - r.left, y: e.clientY - r.top })
      const now = Date.now()
      if (now - cursorThrottleRef.current > 30) {
        cursorThrottleRef.current = now
        const pct = toPct(e.clientX, e.clientY)
        broadcast('cursor', { id: sessionId, name: myName, color: myColor, x: pct.x, y: pct.y })
      }
    }

    // Drawing
    if (strokeRef.current) {
      strokeRef.current.points.push(toPct(e.clientX, e.clientY))
      setDrawing({ ...strokeRef.current })
      return
    }

    if (!drag) return
    if (drag.mode === 'pan') {
      setView(v => ({
        ...v,
        x: drag.vx! + e.clientX - drag.sx,
        y: drag.vy! + e.clientY - drag.sy,
      }))
    } else if (drag.id) {
      const dx = (e.clientX - drag.sx) / view.scale / surface.width * 100
      const dy = (e.clientY - drag.sy) / view.scale / surface.height * 100
      const nx = Math.max(0, Math.min(100, drag.tx! + dx))
      const ny = Math.max(0, Math.min(100, drag.ty! + dy))
      updateMapToken(drag.id, { x: nx, y: ny })
      const now = Date.now()
      if (now - lastBroadcastRef.current > 50) {
        lastBroadcastRef.current = now
        broadcast('token-move', { id: drag.id, x: nx, y: ny })
      }
    }
  }

  function onUp() {
    // Finish a stroke
    if (strokeRef.current) {
      const s: Stroke = { ...strokeRef.current, addedAt: Date.now() }
      if (s.points.length > 1) {
        setStrokes((prev) => [...prev, s])
        broadcast('stroke', { id: s.id, color: s.color, points: s.points })
      }
      strokeRef.current = null
      setDrawing(null)
      return
    }
    if (drag?.mode === 'token' && drag.id) {
      const t = mapTokens.find(t => t.id === drag.id)
      if (t) broadcast('token-move', { id: t.id, x: t.x, y: t.y })
      commitMapToken(drag.id) // persist final position to Postgres
    }
    setDrag(null)
  }

  function onLeave() {
    setLocalCursor(null)
    broadcast('cursor-leave', { id: sessionId })
  }

  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault() // right-click pings, regardless of the active tool
    dropPing(toPct(e.clientX, e.clientY))
  }

  function zoomButton(factor: number) {
    const el = containerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.width / 2
    const cy = r.height / 2
    setView(v => {
      const ns = Math.max(0.05, Math.min(10, v.scale * factor))
      const ratio = ns / v.scale
      return { scale: ns, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio }
    })
  }

  function handleAdd() {
    const t: MapToken = {
      id: crypto.randomUUID(),
      label: newLabel || 'Token',
      color: newColor,
      x: 50,
      y: 50,
    }
    addMapToken(t)
    broadcast('token-add', t)
    setNewLabel('')
    setAdding(false)
  }

  function handleRemove(id: string) {
    removeMapToken(id)
    broadcast('token-remove', { id })
  }

  function strokeOpacity(s: Stroke): number {
    const age = (clock || Date.now()) - s.addedAt
    if (age < STROKE_HOLD) return 0.85
    return Math.max(0, 0.85 * (1 - (age - STROKE_HOLD) / STROKE_FADE))
  }

  // Is a point (map %) close to my own cursor? (used to reveal a cursor's name)
  function nearLocal(x: number, y: number): boolean {
    if (!localCursor) return false
    const rx = view.x + (x / 100 * surface.width) * view.scale
    const ry = view.y + (y / 100 * surface.height) * view.scale
    const dx = rx - localCursor.x
    const dy = ry - localCursor.y
    return dx * dx + dy * dy < 36 * 36
  }

  const toolCursor = tool === 'draw' ? 'cursor-crosshair' : tool === 'ping' ? 'cursor-pointer'
    : drag?.mode === 'pan' ? 'cursor-grabbing' : drag ? 'cursor-default' : 'cursor-grab'

  const TOOLS: { id: Tool; icon: typeof Hand; label: string }[] = [
    { id: 'move', icon: Hand, label: 'Move & pan' },
    { id: 'draw', icon: Pencil, label: 'Draw (fades out)' },
    { id: 'ping', icon: Radio, label: 'Ping a spot' },
  ]

  return (
    <div className="relative h-[calc(100vh-8rem)] select-none">
      {/* Zoom controls */}
      <div
        className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg border bg-background/90 p-1 backdrop-blur"
        onPointerDown={e => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomButton(1.25)}>
          <Plus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(view.scale * 100)}%
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => zoomButton(1 / 1.25)}>
          <Minus className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-4 w-px bg-border" />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fit}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tool palette */}
      <div
        className="absolute left-2 top-14 z-10 flex flex-col gap-1 rounded-lg border bg-background/90 p-1 backdrop-blur"
        onPointerDown={e => e.stopPropagation()}
      >
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => setTool(id)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              tool === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Map picker (GM) */}
      {isGM && (
        <div
          className="absolute right-2 top-2 z-10 rounded-lg border bg-background/90 backdrop-blur"
          onPointerDown={e => e.stopPropagation()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs m-1" onClick={() => setMapPicker(p => !p)}>
            <ImageIcon className="h-3.5 w-3.5" />
            Change Map
            <ChevronDown className={cn('h-3 w-3 transition-transform', mapPicker && 'rotate-180')} />
          </Button>
          {mapPicker && (
            <div className="border-t px-1 pb-1">
              {BUILT_IN_MAPS.map(m => (
                <button
                  key={m.id}
                  className={cn(
                    'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent/50',
                    mapImageUrl === m.src && 'bg-accent text-accent-foreground',
                  )}
                  onClick={() => { setMapImage(m.src); setMapPicker(false) }}
                >
                  {m.label}
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/50"
                onClick={() => { fileInputRef.current?.click(); setMapPicker(false) }}
              >
                <Upload className="h-3 w-3" />
                Upload custom image...
              </button>
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn('h-full w-full overflow-hidden rounded-lg border bg-slate-900', toolCursor)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
        onContextMenu={onContextMenu}
      >
        <div
          className="absolute origin-top-left"
          style={{
            width: surface.width,
            height: surface.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
        >
          {/* Grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: [
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              ].join(','),
              backgroundSize: '50px 50px',
            }}
          />

          {/* Image */}
          {mapImageUrl && (
            <img
              src={mapImageUrl}
              alt="Game map"
              className="absolute inset-0 h-full w-full"
              onLoad={handleImageLoad}
              draggable={false}
            />
          )}

          {/* Drawings (highlight strokes) */}
          <svg
            className="pointer-events-none absolute inset-0"
            width={surface.width}
            height={surface.height}
          >
            {strokes.map((s) => (
              <polyline
                key={s.id}
                points={s.points.map((p) => `${(p.x / 100) * surface.width},${(p.y / 100) * surface.height}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={strokeOpacity(s)}
              />
            ))}
            {drawing && drawing.points.length > 1 && (
              <polyline
                points={drawing.points.map((p) => `${(p.x / 100) * surface.width},${(p.y / 100) * surface.height}`).join(' ')}
                fill="none"
                stroke={drawing.color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.85}
              />
            )}
          </svg>

          {/* Tokens */}
          {mapTokens.map(token => (
            <div
              key={token.id}
              data-token-id={token.id}
              className={cn(
                'absolute flex flex-col items-center',
                drag?.id === token.id ? 'z-50 cursor-grabbing' : 'cursor-grab',
              )}
              style={{
                left: `${token.x}%`,
                top: `${token.y}%`,
                transform: `translate(-50%, -50%) scale(${1 / view.scale})`,
                transition: drag?.id === token.id ? 'none' : 'left 120ms ease-out, top 120ms ease-out',
              }}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 text-sm font-bold text-white shadow-lg shadow-black/40',
                  drag?.id === token.id && 'ring-2 ring-white/60 scale-110',
                )}
                style={{ backgroundColor: token.color }}
              >
                {token.label.slice(0, 2).toUpperCase()}
              </div>
              <span className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {token.label}
              </span>
            </div>
          ))}

          {/* Pings */}
          {pings.map((p) => (
            <div
              key={p.id}
              className="pointer-events-none absolute z-40"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%, -50%) scale(${1 / view.scale})` }}
            >
              <span className="map-ping-ring" style={{ borderColor: p.color }} />
              <span className="map-ping-ring" style={{ borderColor: p.color, animationDelay: '0.18s' }} />
              <span className="map-ping-dot" style={{ backgroundColor: p.color }} />
            </div>
          ))}

          {/* Remote cursors (rendered at smoothed/interpolated positions) */}
          {Object.entries(remoteCursors).map(([id, c]) => {
            const dp = cursorDisplayRef.current[id] ?? { x: c.x, y: c.y }
            return (
              <div
                key={id}
                className="pointer-events-none absolute z-[60]"
                style={{ left: `${dp.x}%`, top: `${dp.y}%`, transform: `scale(${1 / view.scale})`, transformOrigin: 'top left' }}
              >
                <CursorArrow color={c.color} />
                {nearLocal(dp.x, dp.y) && (
                  <span
                    className="absolute left-4 top-4 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-md"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty state hint */}
        {!mapImageUrl && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-background/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            {isGM ? 'Upload a map to get started' : 'No map loaded'}
          </div>
        )}
      </div>

      {/* Token panel */}
      <div
        className="absolute bottom-2 right-2 z-10 w-48 rounded-lg border bg-background/90 backdrop-blur"
        onPointerDown={e => e.stopPropagation()}
      >
        <button
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
          onClick={() => setPanel(p => !p)}
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Tokens ({mapTokens.length})
          </span>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', panel && 'rotate-180')} />
        </button>

        {panel && (
          <div className="border-t px-2 py-1.5">
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {mapTokens.map(token => (
                <div key={token.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-accent/50">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full border border-white/20"
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="flex-1 truncate">{token.label}</span>
                  {isGM && (
                    <button
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(token.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isGM && (
              adding ? (
                <div className="mt-2 space-y-2 border-t pt-2">
                  <Input
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="Token name..."
                    className="h-7 text-xs"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  />
                  <div className="flex flex-wrap gap-1">
                    {TOKEN_PALETTE.map(c => (
                      <button
                        key={c}
                        className={cn(
                          'h-5 w-5 rounded-full border-2',
                          newColor === c ? 'border-white' : 'border-transparent',
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setNewColor(c)}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 flex-1 text-xs" onClick={handleAdd}>
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setAdding(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="mt-1.5 flex w-full items-center justify-center gap-1 rounded border border-dashed border-muted-foreground/30 py-1 text-[10px] text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                  onClick={() => setAdding(true)}
                >
                  <Plus className="h-3 w-3" />
                  Add Token
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
