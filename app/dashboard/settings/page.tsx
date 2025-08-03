// app/dashboard/settings/page.tsx
"use client"

import { useEffect, useState, FormEvent } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type DbUser = {
  id: string
  full_name: string | null
  email: string
  plan_type: string | null
  plan_limit: number | null
}

export default function SettingsPage() {
  const supabase = createClientComponentClient()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [msg, setMsg] = useState<string>("")
  const [err, setErr] = useState<string>("")

  // ---- Load auth user + DB row ----
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setMsg("")
      setErr("")
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAuthUser(null)
        setDbUser(null)
        setLoading(false)
        return
      }
      setAuthUser(user)

      // If your auth user id == users.id (UUID), use by id; else swap to email.
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        setErr(error.message)
      } else {
        setDbUser(data as DbUser)
      }
      setLoading(false)
    })()
  }, [supabase])

  // ---- Profile save ----
  async function handleProfileSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!authUser || !dbUser) return
    setSavingProfile(true)
    setMsg("")
    setErr("")
    const { error } = await supabase
      .from("users")
      .update({
        full_name: dbUser.full_name,
        plan_type: dbUser.plan_type,
        plan_limit: dbUser.plan_limit,
      })
      .eq("id", authUser.id)

    setSavingProfile(false)
    if (error) setErr(error.message)
    else setMsg("Profile updated!")
  }

  // ---- Password change ----
  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const newPwd = (form.elements.namedItem("newPassword") as HTMLInputElement).value
    if (!newPwd) return
    setSavingPwd(true)
    setMsg("")
    setErr("")
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) setErr(error.message)
    else {
      setMsg("Password changed!")
      form.reset()
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!authUser) return <div className="p-6">Not signed in</div>

  return (
    <div className="mx-auto max-w-xl p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Account Settings</h1>

      {/* Feedback messages */}
      {!!err && (
        <div className="rounded bg-red-100 px-4 py-2 text-sm text-red-700">
          {err}
        </div>
      )}
      {!!msg && (
        <div className="rounded bg-green-100 px-4 py-2 text-sm text-green-700">
          {msg}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-lg font-medium">My Details</h2>

        <label className="block">
          <span className="text-sm text-gray-600">Email (read-only)</span>
          <input
            disabled
            value={dbUser?.email ?? authUser.email ?? ""}
            className="mt-1 w-full rounded border px-3 py-2 bg-gray-100"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Full name</span>
          <input
            value={dbUser?.full_name ?? ""}
            onChange={(e) =>
              setDbUser(p => ({ ...(p as DbUser), full_name: e.target.value }))
            }
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        {/* Optional: make these read-only if they shouldn't be user-editable */}
        <label className="block">
          <span className="text-sm text-gray-600">Plan type</span>
          <input
            value={dbUser?.plan_type ?? ""}
            onChange={(e) =>
              setDbUser(p => ({ ...(p as DbUser), plan_type: e.target.value }))
            }
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Plan limit</span>
          <input
            type="number"
            value={dbUser?.plan_limit ?? 0}
            onChange={(e) =>
              setDbUser(p => ({ ...(p as DbUser), plan_limit: Number(e.target.value) }))
            }
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <button
          disabled={savingProfile}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {savingProfile ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordChange} className="space-y-4 border p-4 rounded-lg">
        <h2 className="text-lg font-medium">Change Password</h2>

        <label className="block">
          <span className="text-sm text-gray-600">New password</span>
          <input
            name="newPassword"
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <button
          disabled={savingPwd}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {savingPwd ? "Updating…" : "Update password"}
        </button>

        <p className="text-xs text-gray-500 mt-1">
          Forgot current password? Use the email link flow on{" "}
          <a href="/auth/forgot-password" className="underline">Forgot Password</a>.
        </p>
      </form>
    </div>
  )
}
