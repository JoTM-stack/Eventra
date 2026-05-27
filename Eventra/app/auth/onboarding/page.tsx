// app/auth/onboarding/page.tsx

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OrganizerOnboardingPage() {
  const router = useRouter()

  const [organizerName, setOrganizerName] = useState('')
  const [email, setEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        setEmail(user.email)
      }
    }

    loadUser()
  }, [])

  async function becomeOrganizer() {
  setLoading(true)
  setError('')

  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      router.push('/auth/login')
      return
    }

    // REQUIRED FIELDS
    if (!organizerName.trim()) {
      setError('Organizer name is required')
      setLoading(false)
      return
    }

    if (!email.trim()) {
      setError('Email address is required')
      setLoading(false)
      return
    }

    // PASSWORD VALIDATION
    if (newPassword || confirmPassword) {

      if (!currentPassword.trim()) {
        setError('Please enter your current attendee password')
        setLoading(false)
        return
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match')
        setLoading(false)
        return
      }

      // VERIFY CURRENT PASSWORD
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })

      if (authError) {
        setError('Current attendee password is incorrect')
        setLoading(false)
        return
      }
    }

    // UPDATE EMAIL
    if (email !== user.email) {

      const { error: emailError } =
        await supabase.auth.updateUser({
          email,
        })

      if (emailError) {
        setError(emailError.message)
        setLoading(false)
        return
      }
    }

    // UPDATE PROFILE
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'organizer',
        organizer_name: organizerName,
      })
      .eq('id', user.id)

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    // UPDATE PASSWORD
    if (newPassword) {

      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: newPassword,
        })

      if (passwordError) {
        setError(passwordError.message)
        setLoading(false)
        return
      }
    }

    router.push('/organizer/dashboard')

  } catch (err) {
    console.error(err)
    setError('Something went wrong')
  }

  setLoading(false)
}

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">

      {/* NAV */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link
          href="/attendee"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </Link>

        <div className="font-black text-2xl text-violet-500 tracking-tight">
          EVENTRA
        </div>

        <div className="w-12" />
      </nav>

      {/* CONTENT */}
      <div className="flex-1 px-5 py-8">

        <div className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-xs font-semibold mb-5">
          ORGANIZER ACTIVATION
        </div>

        <h1 className="text-4xl font-black leading-tight tracking-tight">
          Launch your
          <br />

          <span className="text-violet-500">
            organizer account.
          </span>
        </h1>

        <p className="mt-4 text-gray-500 text-sm leading-6">
          Set up your organizer identity and securely activate
          Eventra organizer tools.
        </p>

        {/* FORM */}
        <div className="mt-8 flex flex-col gap-4">

          {/* ORGANIZER NAME */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Organizer Name
            </label>

            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="Soulful Nights"
              className="input"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              autoComplete="off"
              spellCheck={false}
            />

            <p className="text-xs text-gray-400 mt-2 leading-5">
              This email will receive ticket updates,
              organizer notifications and payment alerts.
            </p>
          </div>

          {/* SECURITY */}
          <div className="pt-3 border-t border-gray-100">

            <div className="text-sm font-semibold mb-4">
              Security Verification
            </div>

            <form autoComplete="off" className="flex flex-col gap-4">

              {/* CURRENT PASSWORD */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Current Attendee Password
                </label>

                <input
                  type="password"
                  name="current-password-hidden"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input"
                  autoComplete="new-password"
                  spellCheck={false}
                />
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  New Password (Optional)
                </label>

                <input
                  type="password"
                  name="new-organizer-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set a new organizer password"
                  className="input"
                  autoComplete="new-password"
                  spellCheck={false}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirm-organizer-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="input"
                  autoComplete="new-password"
                  spellCheck={false}
                />
              </div>

            </form>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-8 bg-violet-50 border border-violet-100 rounded-2xl p-5">

          <div className="font-semibold text-violet-700 mb-2">
            Your attendee account stays linked
          </div>

          <p className="text-sm text-violet-600 leading-6">
            You’ll still be able to browse and buy tickets while also
            accessing organizer dashboards and event management tools.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="px-5 py-6 border-t border-gray-100 bg-white flex flex-col gap-3">

        <button
          onClick={becomeOrganizer}
          disabled={loading}
          className="
            bg-violet-500 text-white
            rounded-2xl py-4
            font-semibold
            hover:opacity-90
            transition
          "
        >
          {loading
            ? 'Activating organizer account...'
            : 'Activate Organizer Account'}
        </button>

        <Link
          href="/attendee"
          className="
            border border-gray-200
            rounded-2xl py-4
            text-center
            font-medium
            hover:bg-gray-50
            transition
          "
        >
          Maybe later
        </Link>
      </div>
    </div>
  )
}