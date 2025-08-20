// TypewriterHTML.tsx
"use client"
import { useEffect, useRef } from "react"
import Typed from "typed.js"

type Props = {
  html: string
  speedMs?: number
  startDelayMs?: number
  className?: string
  cursor?: boolean
  onComplete?: () => void
}

export function TypewriterHTML({
  html,
  speedMs = 8,       // 🔥 super fast & still visible
  startDelayMs = 0,
  className,
  cursor = true,
  onComplete,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const typedRef = useRef<Typed | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // If you ever want instant render, set speedMs <= 0
    if (speedMs <= 0) {
      el.innerHTML = html
      Promise.resolve().then(() => onComplete?.())
      return
    }

    typedRef.current = new Typed(el, {
      strings: [html],
      typeSpeed: speedMs,         // ms/char — lower == faster
      startDelay: startDelayMs,
      showCursor: cursor,
      contentType: "html",
      smartBackspace: false,
      backSpeed: 0,
      backDelay: 999999,
      onComplete: () => onComplete?.(),
    })

    return () => typedRef.current?.destroy()
  }, [html, speedMs, startDelayMs, cursor, onComplete])

  return <div className={className} ref={elRef} />
}
