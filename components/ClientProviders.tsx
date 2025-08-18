// components/ClientProviders.tsx
"use client"

import { ReactNode, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { Toaster } from "@/components/ui/toaster"

export function ClientProviders({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() =>
    createClientComponentClient({
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true, // parse #access_token links
          flowType: "pkce",         // ✅ needed for ?code=... recovery links
        },
      },
    })
  )

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
      <Toaster />
    </SessionContextProvider>
  )
}