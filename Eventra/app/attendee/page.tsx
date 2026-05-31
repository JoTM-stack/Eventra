import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomHNav from '@/components/navigation/BottomHNav'
import { formatDateShort, formatPrice } from '@/lib/utils'
import type { Event } from '@/lib/supabase/types'
import SignOutButton from '@/app/components/SignOutButton'
import tickets from '@/app/tickets/[id]'



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

  const now = new Date()

  const visibleEvents = (data ?? []).filter((event) => {
    const expiryTime = new Date(event.date)

    // temporary 5-second expiry test
    expiryTime.setHours(
      expiryTime.getHours() + 0.00138889
    )

    return expiryTime >= now
  })

  return visibleEvents
}

function EventCard({ event }: { event: Event }) {
  const { month, day } = formatDateShort(event.date)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="
        bg-white border border-gray-100 rounded-2xl
        p-4 flex gap-3
        hover:border-violet-300
        transition-all
      "
    >
      <div className="min-w-[48px] h-[56px] rounded-xl bg-violet-100 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase font-semibold text-violet-500">
          {month}
        </div>

        <div className="text-lg font-bold text-violet-700 leading-none">
          {day}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {event.name}
        </div>

        <div className="text-xs text-gray-400 mt-1 truncate">
          {event.venue ?? 'Venue TBC'}
        </div>
      </div>

      <div className="text-sm font-bold text-violet-500 whitespace-nowrap">
        {formatPrice(event.price)}
      </div>
    </Link>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

    const role = profile?.role || 'attendee'

if (profile?.role === 'organizer') {
    redirect('/organizer/dashboard')
  }

 const events = await getPublishedEvents()


  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col pb-20">

      {/* Top Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-bold text-2xl text-violet-500 tracking-tight">
          EVENTRA
        </span>

           <SignOutButton />


      </nav>

      {/* Hero */}
      <div className="px-5 pt-10">

        <div className="text-xs font-bold tracking-[2px] text-violet-400 uppercase mb-5">
          EVENTRA!!!
        </div>

        <h1 className="text-5xl font-black leading-[1.05] tracking-tight mb-5">
          Create events.<br />

          <span className="text-violet-500">
            Sell tickets.
          </span><br />

          Share the link.
        </h1>

        <p className="text-gray-500 text-sm leading-7 mb-8">
          Stop chasing EFT screenshots and printing tickets that don’t sell.
          Sell online, stress less.
        </p>

        <div className="flex flex-col gap-3">
          <button
              href={
                role === 'organizer'
                  ? '/organizer/events/create'
                  : '/auth/onboarding'
              }
            className="
              bg-violet-500 text-white
              rounded-2xl py-4
              text-center font-semibold
              hover:opacity-90 transition
            "
          >
            Start selling tickets
          </button>

          <Link
            href="/browse"
            className="
              border border-gray-200
              rounded-2xl py-4
              text-center font-medium
              hover:bg-gray-50 transition
            "
          >
            Browse Events
          </Link>
        </div>
      </div>

      {/* Pills */}
      <div className="px-5 flex flex-wrap gap-2 mt-8">
        {[
          '3-step setup',
          'Shareable links',
          'Quick & Secure payments',
          'Get Paid',
        ].map((pill) => (
          <div
            key={pill}
            className="
              px-3 py-1.5
              rounded-full
              bg-violet-100
              text-violet-500
              text-xs font-medium
            "
          >
            {pill}
          </div>
        ))}
    </div>

 <div className= "h-10"/>
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


      {/* Events */}
      <div className="px-5 mt-10">
        <div className="text-xs font-semibold tracking-[2px] text-gray-400 uppercase mb-4">
          Upcoming Events
        </div>

        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomHNav />
    </div>
  )
}
