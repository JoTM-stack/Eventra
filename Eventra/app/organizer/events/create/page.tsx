'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { uniqueSlug, EVENT_CATEGORIES } from '@/lib/utils'

type Step = 1 | 2 | 3

interface FormData {
  name: string
  description: string
  date: string
  time: string
  venue: string
  category: string
  ticket_name: string
  ticket_desc: string
  price: string
  capacity: string
  banner_url: string
  published: boolean
}

const EMPTY: FormData = {
  name: '', description: '', date: '', time: '', venue: '', category: '',
  ticket_name: 'General Admission', ticket_desc: '', price: '0', capacity: '',  banner_url: '',
}

export default function CreateEventPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

   const numericPrice = parseFloat(form.price || '0')

const invalidPaidTicket =
  numericPrice > 0 && numericPrice < 50

  function set(field: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function next() {
    if (step === 1 && !form.name.trim()) { setError('Event name is required.'); return }
    if (step === 1 && !form.venue.trim()) { setError('Venue is required.'); return }
    setError('')
    setStep(s => (s + 1) as Step)
    window.scrollTo(0, 0)
  }

  function back() {
    setError('')
    setStep(s => (s - 1) as Step)
    window.scrollTo(0, 0)
  }

  async function submit(publish: boolean) {
    setLoading(true)
    setError('')
    const numericPrice =
          parseFloat(form.price || '0')

        if (
          numericPrice > 0 &&
          numericPrice < 50
        ) {

          setError(
            'Paid tickets must be at least R50 or free.'
          )

          setLoading(false)
          return
        }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const slug = uniqueSlug(form.name)
   const startDate = form.date
      ? new Date(
          `${form.date}T${form.time || '00:00'}`
        ).toISOString()
      : null

    const { data, error: err } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,





        // NEW schema
        name: form.name.trim(),
        banner_url: form.banner_url || null,
        date: form.date || null,
        time: form.time || null,
        venue: form.venue.trim() || null,

        slug,

        description:
          form.description.trim() || null,

        category:
          form.category || null,

        ticket_name:
          form.ticket_name.trim() ||
          'General Admission',

        ticket_desc:
          form.ticket_desc.trim() || null,

        price:
          parseFloat(form.price) || 0,

        capacity: form.capacity
          ? parseInt(form.capacity)
          : null,

        published: publish,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/organizer/events/${data.id}/success`)
  }

  const stepLabels = ['Details', 'Tickets', 'Payments']

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link href="/organizer/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Dashboard
        </Link>
        <span className="font-display font-bold text-xl text-brand">eventra</span>
        <div className="w-20" />
      </nav>

      {/* Step indicators */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(n => (
            <div key={n} className={`flex-1 h-1 rounded-full transition-colors ${n <= step ? 'bg-brand' : 'bg-gray-100'}`} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          {stepLabels.map((l, i) => (
            <span key={l} className={i + 1 === step ? 'text-brand font-medium' : ''}>{l}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-6">

        {/* ── STEP 1: Event details ── */}
        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Event details</h1>
            <p className="text-sm text-gray-400 mb-6">Tell people about your event.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Event name *</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Afro Jazz Night" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What makes this event special?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Time</label>
                  <input type="time" className="input" value={form.time} onChange={e => set('time', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Venue *</label>
                <input className="input" value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="12 Bree St, Cape Town" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Select a category</option>
                  {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
           <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
            Event Banner
          </label>

          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={async (e) => {
              const file = e.target.files?.[0]

              if (!file) return

              const supabase = createClient()

              const fileExt = file.name.split('.').pop()

              const fileName =
                `${Date.now()}.${fileExt}`

              const filePath =
                `event-banners/${fileName}`

              const { error: uploadError } =
                await supabase.storage
                  .from('event-banners')
                  .upload(filePath, file)

              if (uploadError) {
                setError(uploadError.message)
                return
              }

              const {
                data: { publicUrl },
              } = supabase.storage
                .from('event-banners')
                .getPublicUrl(filePath)

              set('banner_url', publicUrl)
            }}
          />

          {form.banner_url && (
            <img
              src={form.banner_url}
              alt="Banner Preview"
              className="mt-3 rounded-xl w-full h-40 object-cover border"
            />
          )}
        </div>

            </div>
          </div>
        )}

        {/* ── STEP 2: Ticket setup ── */}
        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Ticket setup</h1>
            <p className="text-sm text-gray-400 mb-6">Configure pricing and capacity.</p>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Price (R)</label>
                  <input
                          type="number"
                          min="0"
                          className={`input ${
                            invalidPaidTicket
                              ? 'border-red-400'
                              : ''
                          }`}
                          value={form.price}
                          onChange={e =>
                            set('price', e.target.value)
                          }
                          placeholder="0 = free"
                        />

                        <p className={`text-xs mt-1 ${
                          invalidPaidTicket
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}>
                          Ticket price must be FREE (R0)
                          or at least R50.
                        </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Capacity</label>
                  <input type="number" min="1" className="input" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="e.g. 200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Ticket type name</label>
                <input className="input" value={form.ticket_name} onChange={e => set('ticket_name', e.target.value)} placeholder="General Admission" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Ticket description</label>
                <textarea className="input min-h-[70px] resize-none" value={form.ticket_desc} onChange={e => set('ticket_desc', e.target.value)} placeholder="What's included with this ticket?" />
              </div>

              {/* Price preview */}
              <div className="bg-brand-soft rounded-xl p-4 flex items-center justify-between">
                <div className="text-sm text-brand-dark">
                  <div className="font-semibold">{form.ticket_name || 'General Admission'}</div>
                  {form.capacity && <div className="text-xs text-brand-mid mt-0.5">{form.capacity} spots available</div>}
                </div>
                <div className="font-display text-2xl font-bold text-brand">
                  {parseFloat(form.price) === 0 || !form.price ? 'Free' : `R${Math.round(parseFloat(form.price))}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Payments ── */}
        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">
              Payments
            </h1>

            <p className="text-sm text-gray-400 mb-6">
              Eventra will automatically generate secure Paystack checkout sessions for attendees.
            </p>

            <div className="bg-brand-soft border border-brand/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shrink-0">
                  ✓
                </div>

                <div>
                  <div className="font-semibold text-brand-dark mb-1">
                    Automatic Paystack Payments Enabled
                  </div>

                  <p className="text-sm text-brand-mid leading-relaxed">
                    Buyers will click “Buy Ticket”, Eventra will initialize the payment,
                    redirect them to Paystack securely, then automatically verify payment
                    and issue tickets.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 border border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-500">
              Your Paystack merchant account will be used automatically for ticket payments.
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          {step < 3 && (
            <button onClick={next} className="btn-primary">Continue →</button>
          )}
          {step === 3 && (
            <>
              <button
                  onClick={() => submit(true)}
                  disabled={
                    loading || invalidPaidTicket
                  }
                  className={`btn-primary ${
                    invalidPaidTicket
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                {loading ? 'Publishing…' : 'Publish event'}
              </button>
              <button onClick={() => submit(false)} disabled={loading} className="btn-outline">
                Save as draft
              </button>
            </>
          )}
          {step > 1 && (
            <button onClick={back} className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">← Back</button>
          )}
        </div>
      </div>
    </div>
  )
}
