'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function SignupContent() {
  const router = useRouter()
  const params = useSearchParams()

  const defaultRole =
    params.get('role') === 'organizer'
      ? 'organizer'
      : 'attendee'

  const [role, setRole] =
    useState<'organizer' | 'attendee'>(
      defaultRole
    )

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const ipRes = await fetch(
        'https://api.ipify.org?format=json'
      )

      const ipData = await ipRes.json()
      const ip = ipData.ip

      const validateRes = await fetch(
        '/api/validate-signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            role,
            ip,
          }),
        }
      )

      const validateData =
        await validateRes.json()

      if (!validateData.success) {
        setError(validateData.message)
        setLoading(false)
        return
      }

      const supabase = createClient()

      const { error } =
        await supabase.auth.signUp({
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
        <Link
          href="/"
          className="font-display font-bold text-xl text-brand"
        >
          eventra
        </Link>
      </nav>

      <div className="flex-1 px-5 pt-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Create account
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Choose your role — you can switch anytime.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['organizer', 'attendee'] as const).map(
            r => (
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
                <div className="text-sm font-semibold capitalize">
                  {r}
                </div>

                <div className="text-xs text-gray-400 mt-0.5">
                  {r === 'organizer'
                    ? 'Create & manage events'
                    : 'Buy & track tickets'}
                </div>
              </button>
            )
          )}
        </div>

        <form
          onSubmit={handleSignup}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            required
            value={fullName}
            onChange={e =>
              setFullName(e.target.value)
            }
            placeholder="Full Name"
            className="input"
          />

          <input
            type="email"
            required
            value={email}
            onChange={e =>
              setEmail(e.target.value)
            }
            placeholder="live@example.com"
            className="input"
          />

          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e =>
              setPassword(e.target.value)
            }
            placeholder="Password"
            className="input"
          />

          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={e =>
              setConfirmPassword(
                e.target.value
              )
            }
            placeholder="Confirm Password"
            className="input"
          />

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? 'Creating account…'
              : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-brand font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  )
}
