// TypewriterHTML.tsx
"use client"
import { useEffect, useRef } from "react"

type Props = {
  html: string
  /** Total animation time in ms (keep small so it feels instant). */
  durationMs?: number
  /** About how many reveal steps (we'll aim near this). */
  targetSegments?: number
  startDelayMs?: number
  className?: string
  cursor?: boolean
  onComplete?: () => void
}

export function TypewriterHTML({
  html,
  durationMs = 350,       // ⚡ super fast, still visible
  targetSegments = 24,     // ~24 tiny reveals over the duration
  startDelayMs = 0,
  className,
  cursor = true,
  onComplete,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // Tokenize HTML into tags vs text so we never split a tag
    const tokens = html.match(/<[^>]+>|[^<]+/g) ?? [html]
    const totalLen = tokens.reduce((a, t) => a + t.length, 0)

    // Build ~targetSegments segments by splitting text tokens into small chunks
    const approxSegLen = Math.max(8, Math.floor(totalLen / Math.max(1, targetSegments)))
    const segs: string[] = []
    for (const tok of tokens) {
      if (tok.startsWith("<")) {
        // tags are atomic
        segs.push(tok)
      } else {
        // split text token into small slices
        for (let i = 0; i < tok.length; i += approxSegLen) {
          segs.push(tok.slice(i, i + approxSegLen))
        }
      }
    }

    // Ensure we always have enough steps for visibility (even for tiny HTML)
    while (segs.length < 10 && segs.length < html.length) {
      // split last text segment again if possible
      const last = segs.pop() as string
      if (!last || last.startsWith("<") || last.length < 4) {
        segs.push(last)
        break
      }
      const mid = Math.floor(last.length / 2)
      segs.push(last.slice(0, mid), last.slice(mid))
    }

    const stepInterval = Math.max(12, Math.floor(durationMs / Math.max(1, segs.length))) // ~12ms min/frame
    let i = 0
    let out = ""

    const CURSOR_HTML = cursor
      ? `<span class="tw-cursor" style="display:inline-block;width:1ch;margin-left:2px;animation:tw-blink 1s steps(1,end) infinite;">|</span>`
      : ""

    const tick = () => {
      // Append next segment
      out += segs[i++] ?? ""
      el.innerHTML = cursor ? out + CURSOR_HTML : out

      if (i >= segs.length) {
        if (cursor) el.innerHTML = out // remove cursor at end
        onComplete?.()
        return
      }
      timerRef.current = window.setTimeout(tick, stepInterval)
    }

    const start = () => {
      if (cursor && !document.getElementById("tw-cursor-style")) {
        const style = document.createElement("style")
        style.id = "tw-cursor-style"
        style.textContent = `@keyframes tw-blink { 50% { opacity: 0; } }`
        document.head.appendChild(style)
      }
      // start with an empty container (and cursor) so user perceives the start instantly
      el.innerHTML = cursor ? CURSOR_HTML : ""
      timerRef.current = window.setTimeout(tick, stepInterval)
    }

    const delayTimer = startDelayMs > 0 ? window.setTimeout(start, startDelayMs) : (start(), null)

    return () => {
      if (delayTimer) clearTimeout(delayTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [html, durationMs, targetSegments, startDelayMs, cursor, onComplete])

  return <div className={className} ref={elRef} />
}
