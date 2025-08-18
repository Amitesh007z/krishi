'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthGate = () => {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!supabase) return null

  if (user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-700">{user.email}</span>
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          onClick={async () => {
            if (!supabase) return
            await supabase.auth.signOut()
          }}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <a href="/auth" className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm">Login / Register</a>
  )
}

export default AuthGate


