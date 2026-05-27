'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    try {

      const supabase = createClient()

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              'http://localhost:3000/auth/callback',
          }
        )

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setMessage(
        'Password reset email sent successfully.'
      )

    } catch (err) {

      console.log(err)

      setError('Something went wrong.')

    } finally {

      setLoading(false)

    }

  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">

      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link
          href="/auth/login"
          className="font-display font-bold text-xl text-brand"
        >
          EVENTRA
        </Link>
      </nav>

      <div className="flex-1 px-5 pt-10">

        <h1 className="text-3xl font-bold mb-2">
          Reset Password
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Enter your email to receive a password reset link.
        </p>

        <form
          onSubmit={handleReset}
          className="flex flex-col gap-4"
        >

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? 'Sending...'
              : 'Send Reset Link'}
          </button>

        </form>

      </div>

    </div>
  )
}