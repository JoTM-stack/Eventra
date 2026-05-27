import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDateShort, formatPrice } from '@/lib/utils'
import type { Event, Profile } from '@/lib/supabase/types'
import BasketButton from '@/components/BasketButton'
import BottomNav from '@/components/navigation/BottomNav'
import tickets from '@/tickets'

async function getData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, eventsRes] = await Promise.all([
  supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single(),

  supabase
    .from('events')
    .select(`
      *,
      tickets (
        id
      )
    `)
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false }),
])

  return {
    profile: profileRes.data as Profile,
    events: (eventsRes.data ?? []) as Event[],
  }
}

function EventRow({
  event,
}: {
  event: Event & {
    tickets?: { id: string }[]
  }
})
 {
  const { month, day } = formatDateShort(event.date)
  const sold = event.tickets?.length ?? 0
  const isExpired = (() => {
  const expiryTime = new Date(event.date)

  // event expires 8h after start time
  expiryTime.setHours(expiryTime.getHours() + 0.00138889)

  return expiryTime < new Date()
})()

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-brand transition-colors">
      <div className="min-w-[40px] text-center bg-brand-soft rounded-lg py-1.5 px-1">
        <div className="text-[9px] font-bold text-brand uppercase tracking-wide">{month}</div>
        <div className="text-lg font-bold text-brand-dark leading-tight">{day}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{event.name}</div>
        <div className="text-xs text-gray-400 truncate">
          {event.venue ?? 'Venue TBC'}
        </div>

        <div className="text-xs text-brand mt-1 font-medium">
          {sold} ticket{sold !== 1 ? 's' : ''} sold
        </div>

      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isExpired
              ? 'bg-gray-100 text-gray-500'
              : event.published
              ? 'bg-green-50 text-green-700'
              : 'bg-amber-50 text-amber-700'
          }`}
        >
          {isExpired
            ? 'Expired'
            : event.published
            ? 'Live'
            : 'Draft'}
        </span>
        <span className="text-sm font-semibold text-brand">{formatPrice(event.price)}</span>
        <Link href={`/organizer/events/${event.id}/edit`} className="text-xs text-gray-400 hover:text-brand transition-colors px-1">Edit</Link>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const { profile, events } = await getData()
  const published = events.filter(e => e.published)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const totalTicketsSold = events.reduce(
  (sum, event) => sum + (event.tickets?.length ?? 0),
  0
)

const totalRevenue = events.reduce(
  (sum, event) =>
    sum + ((event.tickets?.length ?? 0) * (event.price ?? 0)),
  0
)

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

const now = new Date()

const liveEvents = events.filter(event => {
  const expiryTime = new Date(event.date)
  expiryTime.setHours(expiryTime.getHours() + 0.00138889)

  return expiryTime >= now
})

const expiredEvents = events.filter(event => {
  const expiryTime = new Date(event.date)

  // expire 8 hours after event starts
  expiryTime.setHours(expiryTime.getHours() + 0.00138889)

  return expiryTime < now
})

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <span className="font-display font-bold text-xl text-brand">eventra</span>
        <form action={signOut}>
          <button type="submit" className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50">Sign out</button>
        </form>
      </nav>

      <div className="flex-1 px-5 py-6 pb-28">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Good day,</div>
            <div className="font-display text-2xl font-bold">{firstName}</div>
          </div>
          <span className="text-xs bg-brand-soft text-brand-mid rounded-full px-3 py-1 font-medium">Organizer</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">

  <div className="bg-gray-50 rounded-xl p-3">
    <div className="text-xs text-gray-400 mb-1">
      Total events
    </div>

    <div className="text-2xl font-display font-bold">
      {events.length}
    </div>
  </div>

  <div className="bg-gray-50 rounded-xl p-3">
    <div className="text-xs text-gray-400 mb-1">
      Tickets sold
    </div>

    <div className="text-2xl font-display font-bold">
      {totalTicketsSold}
    </div>
  </div>

  <div className="bg-gray-50 rounded-xl p-3">
    <div className="text-xs text-gray-400 mb-1">
      Revenue
    </div>

    <div className="text-xl font-display font-bold text-brand">
      {totalRevenue > 0 ? formatPrice(totalRevenue) : 'R0'}
    </div>
  </div>


<div className= "h-5"/>
         {/*import tickets from '@/tickets'*/}
      <Link
          href="/tickets"
          className="flex flex-col items-center justify-center relative w-28 h-28"
        >

          {/* CURVED TEXT */}
          <div
            className="
              absolute inset-0
              rounded-full
              animate-spin-slow
            "
          >

            <svg viewBox="0 0 100 100" className="w-full h-full">

              <path
                id="circlePath"
                d="
                  M 50,50
                  m -38,0
                  a 38,38 0 1,1 76,0
                  a 38,38 0 1,1 -76,0
                "
                fill="none"
              />

              <text
                fill="black"
                fontSize="9"
                fontWeight="600"
                letterSpacing="2"
              >
                <textPath
                  href="#circlePath"
                  startOffset="30%"
                  textAnchor="middle"
                >
                  ••••••••••••••••••••••• MY TICKETS ••••••••••••••••••••••••••••
                </textPath>
              </text>

            </svg>

          </div>

          {/* CENTER ICON */}
          <div
            className="
              w-16 h-16
              rounded-full
              bg-black
              flex items-center justify-center
              text-white text-3xl
              z-10
            "
          >
            🎫
          </div>

        </Link>

       </div>

        {/* EVENTS */}
<div className="mt-2">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-4">
    <div className="section-label mb-0">
      My events
    </div>

    <Link
      href="/organizer/events/create"
      className="
        text-xs text-white bg-brand
        rounded-full px-3 py-1.5
        hover:opacity-90 transition-opacity
      "
    >
      + New event
    </Link>
  </div>

  {/* LIVE EVENTS */}
  <div className="mb-8">

    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">

        <div className="
          px-3 py-1 rounded-full
          bg-green-50 text-green-700
          text-xs font-semibold
        ">
          Live Events
        </div>

        <span className="text-xs text-gray-400">
          {liveEvents.length}
        </span>

      </div>
    </div>

    {liveEvents.length === 0 ? (

      <div className="
        border border-dashed border-gray-200
        rounded-2xl p-6 text-center
      ">
        <div className="text-sm text-gray-400">
          No live events
        </div>
      </div>

    ) : (

      <div className="flex flex-col gap-2">
        {liveEvents.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </div>

    )}

  </div>

  {/* EXPIRED EVENTS */}
  <div>

    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">

        <div className="
          px-3 py-1 rounded-full
          bg-gray-100 text-gray-600
          text-xs font-semibold
        ">
          Expired Events
        </div>

        <span className="text-xs text-gray-400">
          {expiredEvents.length}
        </span>

      </div>
    </div>

    {expiredEvents.length === 0 ? (

      <div className="
        border border-dashed border-gray-200
        rounded-2xl p-6 text-center
      ">
        <div className="text-sm text-gray-400">
          No expired events
        </div>
      </div>

    ) : (

      <div className="flex flex-col gap-2">

        {expiredEvents.map((event) => {
          const { month, day } = formatDateShort(event.date)
          const sold = event.tickets?.length ?? 0

          return (
            <div
              key={event.id}
              className="
                flex items-center gap-3
                p-3 rounded-xl
                border border-gray-100
                opacity-80
              "
            >

              <div className="
                min-w-[40px]
                text-center
                bg-gray-100
                rounded-lg py-1.5 px-1
              ">
                <div className="
                  text-[9px]
                  font-bold
                  text-gray-500
                  uppercase tracking-wide
                ">
                  {month}
                </div>

                <div className="
                  text-lg font-bold
                  text-gray-700 leading-tight
                ">
                  {day}
                </div>
              </div>

              <div className="flex-1 min-w-0">

                <div className="text-sm font-medium truncate">
                  {event.name}
                </div>

                <div className="text-xs text-gray-400 truncate">
                  {event.venue ?? 'Venue TBC'}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {sold} ticket{sold !== 1 ? 's' : ''} sold
                </div>

              </div>

              <div className="flex flex-col items-end gap-1">

                <span className="
                  text-xs px-2 py-0.5
                  rounded-full
                  bg-gray-100 text-gray-500
                  font-medium
                ">
                  Expired
                </span>

                <span className="
                  text-sm font-semibold text-gray-500
                ">
                  {formatPrice(event.price)}
                </span>

                <span className="
                  text-[11px]
                  text-gray-300
                  cursor-not-allowed
                ">
                  Edit disabled
                </span>

              </div>

            </div>
          )
        })}

      </div>

    )}

  </div>

</div>


      </div>

      <BottomNav />

    </div>
  )
}
