'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  phone: string | null
  location: string | null
  role: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [password, setPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  function set(field: keyof Profile, value: string) {
    setProfile(prev => prev ? ({ ...prev, [field]: value }) : null)
  }

  async function saveProfile() {
    if (!profile) return

    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio,
        phone: profile.phone,
        location: profile.location,
      })
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    if (password.trim()) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      })

      if (passwordError) {
        setError(passwordError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link
          href="/attendee"
          className="text-sm text-gray-400"
        >
          ← Back
        </Link>

        <span className="font-bold text-xl text-brand">
          eventra
        </span>

        <div className="w-10" />
      </nav>

      <div className="px-5 py-6 flex-1">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-brand-soft flex items-center justify-center text-3xl font-bold text-brand mb-4">
            {profile.full_name?.charAt(0) || 'E'}
          </div>

          <h1 className="text-2xl font-bold">
            {profile.full_name || 'Your Profile'}
          </h1>

          <p className="text-sm text-gray-400 mt-1 capitalize">
            {profile.role}
          </p>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4">

          <div>
            <label className="text-xs uppercase text-gray-400 font-medium mb-1 block">
              Full Name
            </label>
            <input
              className="input"
              value={profile.full_name || ''}
              onChange={(e) => set('full_name', e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-medium mb-1 block">
              Username
            </label>
            <input
              className="input"
              value={profile.username || ''}
              onChange={(e) => set('username', e.target.value)}
              placeholder="@username"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-medium mb-1 block">
              Bio
            </label>
            <textarea
              className="input min-h-[100px] resize-none"
              value={profile.bio || ''}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Tell people about yourself"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-medium mb-1 block">
              Contact Number
            </label>
            <input
              className="input"
              value={profile.phone || ''}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+27 71 234 5678"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-medium mb-1 block">
              Location
            </label>
            <input
              className="input"
              value={profile.location || ''}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Cape Town, South Africa"
            />
          </div>

          <div>
            <label className="text-xs uppercase text-gray-400 font-medium mb-1 block">
              New Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3">
              Profile updated successfully.
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary mt-2"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}