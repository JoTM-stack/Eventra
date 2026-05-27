import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatEventDate, formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'
import BuyButton from '@/components/events/BuyButton'
import ShareButton from '@/components/events/ShareButton'
import SaveButton from '@/components/events/SaveButton'
import BottomNav from '@/components/navigation/BottomNav'
import BottomHNav from '@/components/navigation/BottomHNav'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('name, description, venue, date')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!event) return { title: 'Event not found' }
  return {
    title: event.name,
    description: event.description ?? `${event.name} at ${event.venue}`,
    openGraph: {
      title: event.name,
      description: event.description ?? undefined,
      type: 'website',
    },
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

    const {
          data: { user },
        } = await supabase.auth.getUser()

        let role = 'attendee'

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          role = profile?.role || 'attendee'
        }

  const { data: event } = await supabase
    .from('events')
    .select(`
            *,
            tickets(id)
          `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!event) notFound()

    const soldTickets =
      event.tickets?.length || 0

    const ticketsLeft = event.capacity
      ? Math.max(
          event.capacity - soldTickets,
          0
        )
      : null

  const soldOut = ticketsLeft !== null && ticketsLeft <= 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const eventUrl = `${appUrl}/events/${event.slug}`

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <a href="/" className="font-display font-bold text-xl text-brand">eventra</a>
        <ShareButton url={eventUrl} title={event.name} />
      </nav>


      {/* Hero banner */}
        <div className="bg-brand-dark overflow-hidden">

         <div
            className="
              bg-black/10
              overflow-hidden
              border border-white/0
              rounded-3xl
              py-0
              mx-20
              mt-10
              backdrop-blur-sm
            "
          >

          {/* BANNER IMAGE */}
          {event.banner_url && (
            <img
              src={event.banner_url}
              alt={event.name}
              className="
                w-full
                h-full
                object-cover
              "
            />
          )}

         </div>

          {/* EVENT DETAILS */}
          <div className="px-5 py-8">

            {event.category && (
              <div className="
                text-xs
                font-semibold
                tracking-[2px]
                uppercase
                text-brand
                mb-3
              ">
                {event.category}
              </div>
            )}

            <h1 className="
              font-display
              text-3xl
              font-bold
              text-white
              leading-tight
              mb-5
            ">
              {event.name}
            </h1>

            <div className="
              flex flex-col
              gap-2.5
              text-sm
              text-white/60
            ">

              {/* DATE */}
              <div className="flex items-center gap-2.5">

                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>

                <span className="text-white/80">
                  {formatEventDate(event.date, event.time)}
                </span>

              </div>

              {/* VENUE */}
              {event.venue && (
                <div className="flex items-center gap-2.5">

                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>

                  <span className="text-white/80">
                    {event.venue}
                  </span>

                </div>
              )}

              {/* TICKETS */}
              {event.capacity && (
                <div className="flex items-center gap-2.5">

                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>

                  <span
                    className={
                      ticketsLeft !== null &&
                      ticketsLeft < 20
                        ? 'text-amber-300'
                        : 'text-white/80'
                    }
                  >
                    {soldOut
                      ? 'Sold out'
                      : ticketsLeft !== null
                      ? `${ticketsLeft} tickets left`
                      : `${event.capacity} capacity`}
                  </span>

                </div>
              )}

            </div>

          </div>

        </div>

      <div className="flex-1 px-5 py-6">
        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">About this event</div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* Ticket box */}
        <div className="border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-sm">{event.ticket_name ?? 'General Admission'}</div>
              {event.ticket_desc && <div className="text-xs text-gray-400 mt-0.5">{event.ticket_desc}</div>}
            </div>
            <div className="font-display text-2xl font-bold text-brand">{formatPrice(event.price)}</div>
          </div>

          {soldOut ? (
            <button disabled className="btn-primary opacity-50 cursor-not-allowed">Sold out</button>
          ) : (
           <BuyButton
              eventId={event.id}
              eventName={event.name}
              price={event.price}
            />
          )}
        </div>

        {/* Map placeholder */}
        {event.venue && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Venue</div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-soft rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium">{event.venue}</div>
                <a
                  href={`https://maps.google.com?q=${encodeURIComponent(event.venue)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand hover:underline"
                >
                  Open in Maps →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky buy bar on mobile */}
        {!soldOut && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex items-center gap-4">

            <div>
              <div className="text-xs text-gray-400">
                {event.ticket_name ?? 'General Admission'}
              </div>

              <div className="font-display font-bold text-lg text-brand">
                {formatPrice(event.price)}
              </div>
            </div>

            <div className="flex-1">
              <BuyButton
                eventId={event.id}
                eventName={event.name}
                price={event.price}
              />
            </div>

            <SaveButton eventId={event.id} />

          </div>
        )}
        <div className= "h-20"/>

          {
              role === 'organizer'
                ? <BottomNav />
                : <BottomHNav />
            }

    </div>
  )
}
