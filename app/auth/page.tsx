'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const AuthPage = () => {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [info, setInfo] = useState<string>('')
  const [cooldown, setCooldown] = useState<number>(0)

  useEffect(() => {
    let timer: any
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleLogin = async () => {
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        const msg = error.message || ''
        if (msg.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. Please verify your email or resend confirmation below.')
          return
        }
        throw error
      }
      router.push('/')
    } catch (e: any) {
      setError(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!supabase) {
      setError('Supabase not configured')
      return
    }
    if (cooldown > 0) return
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      // If email confirmations are enabled, no session will be returned
      if (!data.session) {
        setInfo('Verification email sent. Please confirm your email, then log in.')
        return
      }
      router.push('/')
    } catch (e: any) {
      const msg = e?.message || ''
      if (e?.status === 429 || msg.includes('50 seconds')) {
        setCooldown(50)
        setError('Please wait 50 seconds before trying again (anti-spam protection).')
      } else {
        setError(msg || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      setError('')
      await supabase.auth.resend({ type: 'signup', email })
      setInfo('Confirmation email resent. Please check your inbox.')
    } catch (e: any) {
      setError(e?.message || 'Failed to resend confirmation email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Welcome to KrishiAI</h1>
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 rounded-l-lg border ${mode === 'login' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg border-t border-r border-b ${mode === 'register' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Your password"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {info && (
            <div className="text-sm text-blue-700">{info}</div>
          )}
          {error.toLowerCase().includes('email not confirmed') && (
            <button
              type="button"
              onClick={handleResend}
              className="w-full text-sm text-blue-700 underline"
            >
              Resend confirmation email
            </button>
          )}
          {cooldown > 0 && (
            <div className="text-xs text-yellow-700">You can try again in {cooldown}s</div>
          )}
          <button
            disabled={loading || (mode === 'register' && cooldown > 0)}
            onClick={mode === 'login' ? handleLogin : handleRegister}
            className={`w-full ${loading ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg py-2 mt-2`}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage


