'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

async function handleLogin(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  const user = data.user

  // 🔽 fetch role from your profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 🔽 redirect based on role
  if (profile?.role === 'organizer') {
    router.push('/organizer/dashboard')
  } else {
    router.push('/attendee') // 👈 attendees go here
  }

  router.refresh()
}

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link href="/" className="font-display font-bold text-xl text-brand">
          eventra
        </Link>
      </nav>

      <div className="flex-1 px-5 pt-10">
        <h1 className="font-display text-3xl font-bold mb-2">
          Welcome back
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input"
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
          />

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          No account?{' '}
          <Link href="/auth/signup" className="text-brand font-medium">
            Create one free
          </Link>
        </p>

        <p className='text-center text-sm text-gray-400 mt-5'>
            Forgot password?{' '}
            <Link
              href="/auth/reset-password"
              className="text-sm text-brand"
            >
             Reset
            </Link>
           </p>

      </div>
    </div>
  )
}