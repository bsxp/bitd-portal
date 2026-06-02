import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Users, User } from 'lucide-react'

export interface ToastItem {
  id: string
  text: string
  tone: 'good' | 'bad' | 'neutral'
  scope: 'party' | 'self'
}

const TONE: Record<ToastItem['tone'], string> = {
  good: 'bg-emerald-600 text-white',
  bad: 'bg-red-600 text-white',
  neutral: 'bg-slate-800 text-white',
}

function ToastRow({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 3500)
    const t2 = setTimeout(() => onDismiss(toast.id), 3880)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast.id, onDismiss])

  const Icon = toast.scope === 'party' ? Users : User
  return (
    <div
      onClick={() => onDismiss(toast.id)}
      className={cn(
        'pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg shadow-black/30',
        TONE[toast.tone],
        leaving ? 'toast-out' : 'toast-in',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-90" />
      {toast.text}
    </div>
  )
}

export function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastRow key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
