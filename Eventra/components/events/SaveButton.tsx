'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  eventId: string
}

export default function SaveButton({ eventId }: Props) {
  const supabase = createClient()

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSaved()
  }, [])

  async function checkSaved() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('saved_events')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single()

    setSaved(!!data)
    setLoading(false)
  }

  async function toggleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    if (saved) {
      await supabase
        .from('saved_events')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId)

      setSaved(false)
    } else {
      await supabase.from('saved_events').insert({
        user_id: user.id,
        event_id: eventId,
      })

      setSaved(true)
    }
  }

  if (loading) return null

  return (
    <button
      onClick={toggleSave}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        saved
          ? 'bg-brand text-white'
          : 'border border-gray-200 text-gray-500'
      }`}
    >
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}