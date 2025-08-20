"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

export function NetworkStatusToaster() {
  const { toast } = useToast()
  const shownRef = useRef(false)

  useEffect(() => {
    const onOffline = () => {
      if (shownRef.current) return
      shownRef.current = true
      toast({
        variant: "destructive",
        title: "No network",
        description: "You appear to be offline. Some features won’t work until the connection is restored.",
      })
    }

    const onOnline = () => {
      // reset so we can show the offline toast again if connection drops later
      shownRef.current = false
      toast({
        title: "Back online",
        description: "Connection restored.",
      })
    }

    window.addEventListener("offline", onOffline)
    window.addEventListener("online", onOnline)

    // If already offline on first render, show it once
    if (typeof navigator !== "undefined" && navigator.onLine === false) onOffline()

    return () => {
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("online", onOnline)
    }
  }, [toast])

  return null
}
