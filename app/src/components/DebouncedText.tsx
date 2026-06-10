import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

// Free-text fields write to the DB through onCommit. Committing on every
// keystroke both stutters and — because the input is controlled by the value
// that round-trips through the DB — can drop characters when typing fast. So
// keep the text in local state for instant feedback and debounce the save,
// flushing on blur and unmount so nothing is lost.
export function DebouncedText({
  value,
  onCommit,
  readonly,
  placeholder,
  multiline,
  className,
  delay = 300,
}: {
  value: string
  onCommit: (v: string | null) => void
  readonly?: boolean
  placeholder?: string
  multiline?: boolean
  className?: string
  delay?: number
}) {
  const [draft, setDraft] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftRef = useRef(value)
  // The last value we sent up (and expect to see echoed back via props), so a
  // genuinely external change can be told apart from our own debounced commit.
  const lastSynced = useRef(value)

  // Adopt external updates (e.g. another device) without clobbering live typing.
  useEffect(() => {
    if (value !== lastSynced.current) {
      lastSynced.current = value
      draftRef.current = value
      setDraft(value)
    }
  }, [value])

  function commit() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    const v = draftRef.current
    if (v !== lastSynced.current) {
      lastSynced.current = v
      onCommit(v || null)
    }
  }

  // Flush any pending edit when the field unmounts.
  useEffect(() => commit, [])

  function handleChange(v: string) {
    draftRef.current = v
    setDraft(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(commit, delay)
  }

  if (multiline) {
    return (
      <textarea
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commit}
        readOnly={readonly}
        placeholder={placeholder}
        className={className}
      />
    )
  }

  return (
    <Input
      value={draft}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={commit}
      readOnly={readonly}
      placeholder={placeholder}
      className={className}
    />
  )
}
