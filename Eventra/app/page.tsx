import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort, formatPrice } from '@/lib/utils'
import type { Event } from '@/lib/supabase/types'
import tickets from '@/tickets'

async function getPublishedEvents(): Promise<Event[]> {
  const supabase = await createClient()
  const today = new Date().toISOString()

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(6)
  return data ?? []
}

function EventCard({ event }: { event: Event }) {
  const { month, day } = formatDateShort(event.date)
  return (
    <Link href={`/events/${event.slug}`} className="card flex gap-3 hover:border-brand transition-colors cursor-pointer">
      <div className="min-w-[44px] text-center bg-brand-soft rounded-lg py-2 px-1">
        <div className="text-[10px] font-semibold text-brand uppercase tracking-wide">{month}</div>
        <div className="text-xl font-bold text-brand-dark leading-tight">{day}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate mb-0.5">{event.name}</div>
        <div className="text-xs text-gray-400 truncate">{event.venue ?? 'Venue TBC'}{event.category ? ` · ${event.category}` : ''}</div>
      </div>
      <div className="text-sm font-semibold text-brand whitespace-nowrap self-center">
        {formatPrice(event.price)}
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  const events = await getPublishedEvents()

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-display font-bold text-xl text-brand">EVENTRA</span>
        <div className="flex gap-2">
          <Link href="/auth/login" className="text-sm text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors">
            Sign in
          </Link>
          <Link href="/auth/signup" className="text-sm text-white bg-brand rounded-full px-4 py-1.5 hover:opacity-90 transition-opacity">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="px-5 pt-10 pb-8">
        <div className="text-xs font-semibold text-brand uppercase tracking-[2px] mb-3">eventra!!!</div>
        <h1 className="font-display text-4xl font-bold leading-[1.1] mb-4">
          Create events.<br />
          <span className="text-brand">Sell tickets.</span><br />
          Share the link.
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">
          Stop chasing EFT screenshots and printing tickets that don’t sell.
          Sell online, stress less.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/auth/signup?role=organizer" className="btn-primary">
            Start selling tickets {/* — it&apos;s free */}
          </Link>
          <Link href="/auth/signup?role=attendee" className="btn-outline">
            Browse Events
          </Link>
        </div>
      </div>

      {/* Feature pills */}
      <div className="px-5 flex gap-2 flex-wrap mb-8">
        {['3-step setup', 'Shareable links', 'Quick & Secure payments', 'Get Paid'].map(f => (
          <span key={f} className="text-xs bg-brand-soft text-brand-mid rounded-full px-3 py-1 font-medium">{f}</span>
        ))}
      </div>

      {/* Upcoming events */}
      {events.length > 0 && (
        <div className="px-5 pb-10">
          <div className="section-label">Upcoming events</div>
          <div className="flex flex-col gap-2">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto px-5 py-6 border-t border-gray-100 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Eventra · Built For Connecting
      </div>
    </div>
  )
}
