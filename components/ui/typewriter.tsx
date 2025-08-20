"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  text: string
  speed?: number // chars per second
  className?: string
  showCursor?: boolean
  onDone?: () => void
}

export function TypewriterParagraph({
  text,
  speed = 90,
  className,
  showCursor = true,
  onDone,
}: Props) {
  const [n, setN] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)

  useEffect(() => {
    setN(0)
    start.current = null

    const step = (t: number) => {
      if (start.current == null) start.current = t
      const elapsed = (t - start.current) / 1000
      // smooth but deterministic: characters revealed
      const next = Math.min(text.length, Math.floor(elapsed * speed))
      setN(next)
      if (next < text.length) {
        raf.current = requestAnimationFrame(step)
      } else {
        onDone?.()
      }
    }

    raf.current = requestAnimationFrame(step)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [text, speed, onDone])

  const visible = text.slice(0, n)
  return (
    <div className={className}>
      <pre className="whitespace-pre-wrap font-sans leading-relaxed">
        {visible}
        {showCursor && n < text.length ? "▍" : ""}
      </pre>
    </div>
  )
}
