'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = (params.get('role') === 'organizer' ? 'organizer' : 'attendee') as 'organizer' | 'attendee'

  const [role, setRole] = useState<'organizer' | 'attendee'>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSignup(e: React.FormEvent) {
  e.preventDefault()

  setLoading(true)
  setError('')

  // PASSWORD MATCH CHECK
if (password !== confirmPassword) {
  setError('Passwords do not match')
  setLoading(false)
  return
}

  try {
    // 1. GET USER IP
    const ipRes = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipRes.json()

    const ip = ipData.ip

    // 2. CHECK LIMITS
    const validateRes = await fetch('/api/validate-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
        ip,
      }),
    })

    const validateData = await validateRes.json()

    if (!validateData.success) {
      setError(validateData.message)
      setLoading(false)
      return
    }

    // 3. CREATE ACCOUNT
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          signup_ip: ip,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // 4. REDIRECT
    router.push(
      role === 'organizer'
        ? '/organizer/dashboard'
        : '/browse'
    )

    router.refresh()

  } catch (err) {

    console.log(err)

    setError(
        err instanceof Error
        ? err.message
        : 'Something went wrong.'

        )

  } finally {

    setLoading(false)

  }
}

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link href="/" className="font-display font-bold text-xl text-brand">eventra</Link>
      </nav>

      <div className="flex-1 px-5 pt-8">
        <h1 className="font-display text-3xl font-bold mb-2">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Choose your role — you can switch anytime.</p>

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['organizer', 'attendee'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`border rounded-xl p-4 text-left transition-all ${
                role === r
                  ? 'border-brand bg-brand-soft'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg mb-2.5 flex items-center justify-center ${role === r ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}>
                {r === 'organizer' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                )}
              </div>
              <div className="text-sm font-semibold capitalize">{r}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {r === 'organizer' ? 'Create & manage events' : 'Buy & track tickets'}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Full name</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="live@example.com" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="input" />
          </div>
          <div>
  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
    Confirm Password
  </label>

  <input
    type="password"
    required
    minLength={8}
    value={confirmPassword}
    onChange={e => setConfirmPassword(e.target.value)}
    placeholder="Re-enter password"
    className="input"
  />
</div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
