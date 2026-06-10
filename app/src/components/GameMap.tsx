import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useGame } from '@/lib/store'
import { useSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { uploadMapImage } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Plus, Minus, RotateCcw, Upload, Trash2, X, Users, ChevronDown, ImageIcon, Hand, Pencil, Radio, Home, Star, Skull, Flame, MapPin, Crown, Crosshair, Eye } from 'lucide-react'
import { CharacterAvatar } from '@/components/CharacterAvatar'
import type { MapToken } from '@/lib/types'

const TOKEN_PALETTE = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

// Icons a chip can show instead of its label's initials. Keyed by a stable
// string stored on the token (MapToken.icon); empty/absent = initials.
const TOKEN_ICONS: Record<string, typeof Home> = {
  house: Home,
  x: X,
  star: Star,
  skull: Skull,
  flame: Flame,
  pin: MapPin,
  crown: Crown,
  target: Crosshair,
  eye: Eye,
}

// Icons whose closed shapes read well solid-filled; the rest stay outline so
// their internal detail (e.g. crosshair lines, eye iris) survives.
const FILLED_ICONS = new Set(['house', 'star', 'skull', 'pin', 'crown'])

// Marker dimensions per token size (box = avatar/initials circle, text = the
// initials, icon = a standalone icon chip).
const TOKEN_SIZES: Record<'sm' | 'md' | 'lg', { box: string; text: string; icon: string }> = {
  sm: { box: 'h-4 w-4', text: 'text-[8px]', icon: 'h-5 w-5' },
  md: { box: 'h-6 w-6', text: 'text-[10px]', icon: 'h-7 w-7' },
  lg: { box: 'h-9 w-9', text: 'text-[13px]', icon: 'h-11 w-11' },
}

// A row of icon choices (plus an "Aa" letters option) shared by the chip
// editor and the add-chip panel.
function IconPicker({ value, onChange }: { value?: string; onChange: (icon: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        title="Letters"
        onClick={() => onChange('')}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded border-2 text-[10px] font-bold',
          !value ? 'border-white' : 'border-transparent bg-muted text-muted-foreground',
        )}
      >
        Aa
      </button>
      {Object.entries(TOKEN_ICONS).map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          title={key}
          onClick={() => onChange(key)}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded border-2',
            value === key ? 'border-white' : 'border-transparent bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

const BUILT_IN_MAPS = [
  { id: 'doskvol-detailed', label: 'Doskvol (Detailed)', src: '/maps/doskvol-detailed.png' },
  { id: 'doskvol-labeled', label: 'Doskvol (Labeled)', src: '/maps/doskvol-labeled.png' },
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

// Black or white text for legibility on a given hex background (perceived
// luminance). Used for the colored label pills under map tokens.
function textOn(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length < 6) return '#fff'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#000' : '#fff'
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
    mapTokens, updateMapToken, addMapToken, removeMapToken, commitMapToken, editMapToken,
    mapImageUrl, setMapImage, campaignId, onlinePlayers, characters,
  } = useGame()
  const { session, sessionId } = useSession()
  // Label cursors with the character's nickname (alias) when they have one,
  // falling back to their full name / seat name.
  const myName = useMemo(() => {
    const seat = session?.seat
    if (!seat) return 'Player'
    if (seat.type === 'character') {
      const me = characters.find((c) => c.id === seat.id)
      return me?.alias || me?.name || seat.name
    }
    return seat.name
  }, [session, characters])
  // The character this client controls (null for the GM seat); used to gate
  // who may move each character token.
  const mySeatCharId = session?.seat?.type === 'character' ? session.seat.id : null
  // Give each online person a distinct cursor color: take a stable palette slot
  // by this session's index among the (sorted) online session ids, so no two
  // people collide. Falls back to a hash of the id before presence has synced.
  const myColor = useMemo(() => {
    const ids = [...new Set(onlinePlayers.map((p) => p.sessionId).filter(Boolean))].sort()
    const idx = ids.indexOf(sessionId)
    return idx >= 0 ? TOKEN_PALETTE[idx % TOKEN_PALETTE.length] : colorFromId(sessionId)
  }, [onlinePlayers, sessionId])

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
  const [uploading, setUploading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState(TOKEN_PALETTE[0])
  const [newIcon, setNewIcon] = useState('')

  const [tool, setTool] = useState<Tool>('move')
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({})
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [drawing, setDrawing] = useState<Stroke | null>(null)
  const [pings, setPings] = useState<MapPing[]>([])
  const [clock, setClock] = useState(0)

  // Chip editor: the id of the chip whose rename/recolor/delete menu is open
  // (opened by tapping a chip rather than dragging it), plus its draft label.
  const [editing, setEditing] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const dragMovedRef = useRef(false) // did the current token drag actually move?

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
        .on('broadcast', { event: 'token-update' }, ({ payload }) => {
          cbRef.current.updateMapToken(payload.id, payload.updates)
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

  // Make sure every character has a movable avatar token on the map. A player
  // spawns their own; the GM backfills all (covers players who never open the
  // map). The deterministic `char:<id>` id keeps this idempotent — concurrent
  // clients converge on the same row, and once one exists it's never re-created.
  useEffect(() => {
    if (!characters.length) return
    const targets = isGM ? characters : characters.filter((c) => c.id === mySeatCharId)
    for (const char of targets) {
      const id = `char:${char.id}`
      if (mapTokens.some((t) => t.id === id)) continue
      const i = characters.findIndex((c) => c.id === char.id)
      const token: MapToken = {
        id,
        characterId: char.id,
        label: char.name,
        color: colorFromId(char.id),
        // Tidy starting cluster in the top-left so they don't stack exactly.
        x: 8 + (i % 6) * 6,
        y: 10 + Math.floor(i / 6) * 8,
      }
      addMapToken(token)
      broadcast('token-add', token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters, mapTokens, isGM, mySeatCharId])

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

  // Keep current surface readable from stable callbacks (wheel handler, clamp).
  const surfaceRef = useRef(surface)
  useEffect(() => { surfaceRef.current = surface })

  // Constrain pan/zoom so the map can't be moved out of the frame: when the
  // scaled map is larger than the viewport its edges stay pinned to the frame
  // edges; when smaller it stays centered. Prevents zooming/panning into empty
  // space outside the map area.
  const clampView = useCallback((v: { scale: number; x: number; y: number }) => {
    const el = containerRef.current
    if (!el) return v
    const r = el.getBoundingClientRect()
    const s = surfaceRef.current
    const sw = s.width * v.scale
    const sh = s.height * v.scale
    const x = sw <= r.width ? (r.width - sw) / 2 : Math.min(0, Math.max(r.width - sw, v.x))
    const y = sh <= r.height ? (r.height - sh) / 2 : Math.min(0, Math.max(r.height - sh, v.y))
    return { scale: v.scale, x, y }
  }, [])

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
        return clampView({ scale: ns, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio })
      })
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [clampView])

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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    // Upload to the shared `maps` bucket and broadcast/persist its public URL,
    // so every player (and this browser after a reload) actually loads the same
    // image. A local blob: URL would only render in the uploader's own tab.
    setUploading(true)
    try {
      const url = await uploadMapImage(campaignId, file)
      setMapImage(url)
    } catch (err) {
      console.error('[bitd map upload]', err)
    } finally {
      setUploading(false)
    }
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
      dragMovedRef.current = false // distinguish a tap (open editor) from a drag (move)
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
      setView(v => clampView({
        ...v,
        x: drag.vx! + e.clientX - drag.sx,
        y: drag.vy! + e.clientY - drag.sy,
      }))
    } else if (drag.id) {
      if (Math.abs(e.clientX - drag.sx) > 4 || Math.abs(e.clientY - drag.sy) > 4) dragMovedRef.current = true
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
      if (!dragMovedRef.current) {
        // A tap (not a drag): open the rename/recolor/delete menu, if this
        // viewer owns the chip or is the GM. Character tokens aren't editable
        // here — their name/picture come from the character sheet.
        if (t && !t.characterId && (isGM || t.owner === sessionId)) {
          setEditing(t.id)
          setEditLabel(t.label)
        }
      } else {
        if (t) broadcast('token-move', { id: t.id, x: t.x, y: t.y })
        commitMapToken(drag.id) // persist final position to Postgres
      }
    }
    setDrag(null)
  }

  function onLeave() {
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
      return clampView({ scale: ns, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio })
    })
  }

  function handleAdd() {
    const t: MapToken = {
      id: crypto.randomUUID(),
      label: newLabel || 'Token',
      color: newColor,
      x: 50,
      y: 50,
      owner: sessionId,
      ...(newIcon ? { icon: newIcon } : {}),
    }
    addMapToken(t)
    broadcast('token-add', t)
    setNewLabel('')
    setNewIcon('')
    setAdding(false)
  }

  function handleRemove(id: string) {
    removeMapToken(id)
    broadcast('token-remove', { id })
    if (editing === id) setEditing(null)
  }

  // Apply a label/color change to a chip: persist it (editMapToken) and push it
  // to peers live over the map channel.
  function applyTokenEdit(id: string, updates: Partial<MapToken>) {
    editMapToken(id, updates)
    broadcast('token-update', { id, updates })
  }

  function closeEditor() {
    if (editing) applyTokenEdit(editing, { label: editLabel.trim() || 'Token' })
    setEditing(null)
  }

  function strokeOpacity(s: Stroke): number {
    const age = (clock || Date.now()) - s.addedAt
    if (age < STROKE_HOLD) return 0.85
    return Math.max(0, 0.85 * (1 - (age - STROKE_HOLD) / STROKE_FADE))
  }

  const toolCursor = tool === 'draw' ? 'cursor-crosshair' : tool === 'ping' ? 'cursor-pointer'
    : drag?.mode === 'pan' ? 'cursor-grabbing' : drag ? 'cursor-default' : 'cursor-grab'

  // The manual chip panel manages freeform chips only; character avatar tokens
  // are auto-managed and never added/removed here.
  const chipTokens = mapTokens.filter(t => !t.characterId)

  const TOOLS: { id: Tool; icon: typeof Hand; label: string }[] = [
    { id: 'move', icon: Hand, label: 'Move & pan' },
    { id: 'draw', icon: Pencil, label: 'Draw (fades out)' },
    { id: 'ping', icon: Radio, label: 'Ping a spot' },
  ]

  // Chip currently being edited (if it still exists) and its on-screen anchor.
  const editTok = editing ? mapTokens.find(t => t.id === editing) : null
  const editAnchor = editTok
    ? {
        x: view.x + (editTok.x / 100 * surface.width) * view.scale,
        y: view.y + (editTok.y / 100 * surface.height) * view.scale,
      }
    : null

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
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/50 disabled:opacity-60"
                disabled={uploading}
                onClick={() => { fileInputRef.current?.click() }}
              >
                <Upload className="h-3 w-3" />
                {uploading ? 'Uploading…' : 'Upload custom image...'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn('relative h-full w-full overflow-hidden rounded-lg border bg-slate-900', toolCursor)}
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
          {mapTokens.map(token => {
            // Character tokens derive their picture/name from the live
            // character; a deleted character's orphan token is hidden.
            const char = token.characterId ? characters.find(c => c.id === token.characterId) : null
            if (token.characterId && !char) return null
            const dragging = drag?.id === token.id
            const sz = TOKEN_SIZES[token.size ?? 'md']
            return (
              <div
                key={token.id}
                data-token-id={token.id}
                className={cn(
                  'absolute flex flex-col items-center',
                  dragging ? 'z-50 cursor-grabbing' : 'cursor-grab',
                  // In draw/ping mode chips are click-through so strokes/pings can
                  // start anywhere, even on top of a chip.
                  tool !== 'move' && 'pointer-events-none',
                )}
                style={{
                  left: `${token.x}%`,
                  top: `${token.y}%`,
                  transform: `translate(-50%, -50%) scale(${1 / view.scale})`,
                  transition: dragging ? 'none' : 'left 120ms ease-out, top 120ms ease-out',
                }}
              >
                {char ? (
                  <div
                    className={cn('rounded-full transition-transform', dragging && 'scale-110')}
                    style={{ boxShadow: `0 0 0 2px ${token.color}, 0 2px 6px rgba(0,0,0,0.5)` }}
                  >
                    {/* pointer-events-none so the browser's native image drag
                        doesn't hijack the token drag; the parent handles it. */}
                    <CharacterAvatar character={char} size="sm" className={cn('pointer-events-none select-none border-2 border-background', sz.box)} />
                  </div>
                ) : (() => {
                  const Icon = token.icon ? TOKEN_ICONS[token.icon] : undefined
                  // An icon chip is just the icon (no circle), filled in the
                  // token color with a dark halo so it reads on a busy map.
                  return Icon ? (
                    <Icon
                      className={cn(sz.icon, 'transition-transform', dragging && 'scale-110')}
                      strokeWidth={2.25}
                      style={{
                        color: token.color,
                        fill: token.icon && FILLED_ICONS.has(token.icon) ? token.color : 'none',
                        filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.9)) drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-full border-2 border-white/80 font-bold text-white shadow-lg shadow-black/40',
                        sz.box, sz.text,
                        dragging && 'ring-2 ring-white/60 scale-110',
                      )}
                      style={{ backgroundColor: token.color }}
                    >
                      {token.label.slice(0, 2).toUpperCase()}
                    </div>
                  )
                })()}
                <span
                  className="mt-0.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold leading-none shadow-sm"
                  style={{ backgroundColor: token.color, color: textOn(token.color) }}
                >
                  {char ? (char.alias || char.name) : token.label}
                </span>
              </div>
            )
          })}

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
                <span
                  className="absolute left-4 top-4 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-md"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name}
                </span>
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

      {/* Chip editor — opens on tapping (not dragging) a chip you own (or any, as GM) */}
      {editTok && editAnchor && (
        <div
          className="absolute z-30 w-52 rounded-lg border bg-background/95 p-2 shadow-xl backdrop-blur"
          style={{
            left: Math.max(8, editAnchor.x),
            top: Math.max(8, editAnchor.y - 12),
            transform: 'translate(-50%, -100%)',
          }}
          onPointerDown={e => e.stopPropagation()}
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold">Edit chip</span>
            <button className="text-muted-foreground hover:text-foreground" onClick={closeEditor} title="Done">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input
            value={editLabel}
            onChange={e => setEditLabel(e.target.value)}
            placeholder="Name..."
            autoFocus
            className="h-7 text-xs"
            onKeyDown={e => { if (e.key === 'Enter') closeEditor() }}
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {TOKEN_PALETTE.map(c => (
              <button
                key={c}
                className={cn('h-5 w-5 rounded-full border-2', editTok.color === c ? 'border-white' : 'border-transparent')}
                style={{ backgroundColor: c }}
                onClick={() => applyTokenEdit(editTok.id, { color: c })}
              />
            ))}
          </div>
          <div className="mt-2">
            <IconPicker value={editTok.icon} onChange={(icon) => applyTokenEdit(editTok.id, { icon })} />
          </div>
          <div className="mt-2 flex gap-1">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <button
                key={s}
                onClick={() => applyTokenEdit(editTok.id, { size: s })}
                className={cn(
                  'flex-1 rounded border-2 py-0.5 text-[10px] font-medium uppercase',
                  (editTok.size ?? 'md') === s ? 'border-white bg-accent' : 'border-transparent bg-muted text-muted-foreground',
                )}
              >
                {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <Button size="sm" variant="destructive" className="h-6 flex-1 gap-1 text-xs" onClick={() => handleRemove(editTok.id)}>
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
            <Button size="sm" className="h-6 text-xs" onClick={closeEditor}>Done</Button>
          </div>
        </div>
      )}

      {/* Token panel — upper right (below the GM's Change Map button when present) */}
      <div
        className={cn(
          'absolute right-2 z-10 w-48 rounded-lg border bg-background/90 backdrop-blur',
          isGM ? 'top-14' : 'top-2',
        )}
        onPointerDown={e => e.stopPropagation()}
      >
        <button
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
          onClick={() => setPanel(p => !p)}
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Tokens ({chipTokens.length})
          </span>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', panel && 'rotate-180')} />
        </button>

        {panel && (
          <div className="border-t px-2 py-1.5">
            <div className="max-h-48 space-y-0.5 overflow-y-auto">
              {chipTokens.map(token => (
                <div key={token.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-xs hover:bg-accent/50">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full border border-white/20"
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="flex-1 truncate">{token.label}</span>
                  {(isGM || token.owner === sessionId) && (
                    <button
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      title={isGM && token.owner !== sessionId ? 'Remove chip' : 'Remove your chip'}
                      onClick={() => handleRemove(token.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {adding ? (
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
                <IconPicker value={newIcon} onChange={setNewIcon} />
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
