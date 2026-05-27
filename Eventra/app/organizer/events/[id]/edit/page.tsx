'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { EVENT_CATEGORIES } from '@/lib/utils'
import type { Event } from '@/lib/supabase/types'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams() // ✅ NEW WAY
  const id = params?.id as string // ✅ SAFE ACCESS

  const [event, setEvent] = useState<Event | null>(null)
  const [form, setForm] = useState<Partial<Event>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return

    const supabase = createClient()

    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setEvent(data)
          setForm(data)
        }
        setLoading(false)
      })
  }, [id])

  function set(field: keyof Event, value: string | number | boolean | null) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save(publish?: boolean) {
    if (!id) return

    setSaving(true)
    setError('')

    const supabase = createClient()

    const update: Partial<Event> = {
      name: form.name ?? event.name,
      description: form.description ?? event.description,
      date: form.date ?? event.date,
      time: form.time ?? event.time,
      venue: form.venue ?? event.venue,
      category: form.category ?? event.category,
      ticket_name: form.ticket_name ?? event.ticket_name,
      ticket_desc: form.ticket_desc ?? event.ticket_desc,
      price:
        form.price !== undefined
          ? Number(form.price)
          : event.price,
      capacity:
        form.capacity !== undefined
          ? Number(form.capacity)
          : event.capacity,
      paystack_payment_link:
        form.paystack_payment_link ?? event.paystack_payment_link,
    }

    if (publish !== undefined) update.published = publish

    const { error: err } = await supabase
      .from('events')
      .update(update)
      .eq('id', id)

    setSaving(false)

    if (err) {
      setError(err.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)

    if (publish) {
      router.push(`/organizer/events/${id}/success`)
    }
  }

  async function deleteEvent() {
    if (!confirm('Delete this event? This cannot be undone.')) return

    const supabase = createClient()

    await supabase.from('events').delete().eq('id', id)

    router.push('/organizer/dashboard')
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-5 text-center text-gray-400 mt-20">
        Loading…
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto p-5 text-center text-gray-400 mt-20">
        Event not found.
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link href="/organizer/dashboard" className="text-sm text-gray-400">
          ← Back
        </Link>
        <span className="font-bold text-xl">eventra</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          event.published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {event.published ? 'Live' : 'Draft'}
        </span>
      </nav>

      <div className="flex-1 px-5 py-6">
        <h1 className="text-2xl font-bold mb-4">Edit event</h1>

        <input
          className="input"
          value={form.name ?? ''}
          onChange={e => set('name', e.target.value)}
          placeholder="Event name"
        />

        <input
          className="input mt-3"
          value={form.venue ?? ''}
          onChange={e => set('venue', e.target.value)}
          placeholder="Venue"
        />

        <input
          className="input mt-3"
          value={form.paystack_payment_link ?? ''}
          onChange={e => set('paystack_payment_link', e.target.value)}
          placeholder="paystack / paystack link"
        />

        <input
          type="date"
          className="input mt-3"
          value={form.date ?? ''}
          onChange={e => set('date', e.target.value)}
        />

        <input
          type="time"
          className="input mt-3"
          value={form.time ?? ''}
          onChange={e => set('time', e.target.value)}
        />

        {error && <p className="text-red-500 mt-3">{error}</p>}
        {saved && <p className="text-green-600 mt-3">Saved!</p>}

        <button onClick={() => save()} className="btn-primary mt-4">
          Save
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}
{saved && <p className="text-green-600 mt-3">Saved!</p>}

<button
  onClick={() => save()}
  className="btn-primary mt-4"
>
  Save
</button>

<button
  onClick={() => save(true)}
  className="btn-outline mt-2"
>
  Publish
</button>

{/* SCANNER ACCESS */}
    {event.published && (
      <Link
        href={`/organizer/events/${id}/check-in`}
        className="
          mt-4
          flex items-center justify-center
          w-full
          rounded-2xl
          bg-black
          text-white
          py-4
          font-semibold
          hover:opacity-90
          transition
        "
      >
        🎫 Open Check-In Scanner
      </Link>
    )}
      </div>
    </div>
  )
}