'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {

  const router = useRouter()

  const [password, setPassword] =
    useState('')

  const [confirmPassword,
    setConfirmPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [sessionReady, setSessionReady] =
    useState(false)

useEffect(() => {

  const supabase = createClient()

  async function checkSession() {

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {

      setError(
        'Recovery session missing.'
      )

      return
    }

    setSessionReady(true)
  }

  checkSession()

}, [])

  async function handleUpdate(
    e: React.FormEvent
  ) {

    e.preventDefault()

    setError('')
    setSuccess('')

    if (!sessionReady) {
      setError(
        'Recovery session not ready.'
      )
      return
    }

    if (password.length < 8) {

      setError(
        'Password must be at least 8 characters.'
      )

      return
    }

    if (password !== confirmPassword) {

      setError(
        'Passwords do not match.'
      )

      return
    }

    try {

      setLoading(true)

      const supabase =
        createClient()

      const { error } =
        await supabase.auth.updateUser({
          password,
        })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(
        'Password updated successfully.'
      )

      //
      // SIGN OUT OLD SESSION
      //
      await supabase.auth.signOut()

      //
      // REDIRECT TO LOGIN
      //
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err) {

      console.log(err)

      setError(
        'Something went wrong.'
      )

    } finally {

      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen px-5 pt-10">

      <h1 className="text-3xl font-bold mb-2">
        Create New Password
      </h1>

      <p className="text-gray-500 text-sm mb-6">
        Enter your new password below.
      </p>

      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-4"
      >

        <input
          type="password"
          required
          minLength={8}
          placeholder="New password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="input"
        />

        <input
          type="password"
          required
          minLength={8}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          className="input"
        />

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading
            ? 'Updating...'
            : 'Update Password'}
        </button>

      </form>

    </div>
  )
}