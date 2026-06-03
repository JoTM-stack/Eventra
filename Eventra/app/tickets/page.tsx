import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BottomHNav from '@/components/navigation/BottomHNav'


export default async function TicketsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      events (
        id,
        name,
        date,
        venue
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
  <div className="max-w-md mx-auto min-h-screen bg-white px-5 py-6 pb-28">

    {/* HEADER */}
    <div className="mb-7">
      <div className="text-xs text-gray-400 mb-1">
        Wallet
      </div>

      <h1 className="text-3xl font-display font-bold">
        My Tickets
      </h1>
    </div>

    {/* TICKET FILTER NAV */}
<div
  className="
    flex gap-3 overflow-x-auto
    no-scrollbar
    pb-2 mb-6
  "
>

  <button
    className="
      whitespace-nowrap
      px-5 py-2.5
      rounded-full
      bg-brand text-white
      text-sm font-semibold
    "
  >
    All Tickets
  </button>

  <button
    className="
      whitespace-nowrap
      px-5 py-2.5
      rounded-full
      border border-gray-200
      bg-white
      text-gray-600
      text-sm font-medium
    "
  >
    Checked In
  </button>

  <button
    className="
      whitespace-nowrap
      px-5 py-2.5
      rounded-full
      border border-gray-200
      bg-white
      text-gray-600
      text-sm font-medium
    "
  >
    Unchecked + Expired
  </button>

</div>

    {/* EMPTY STATE */}
    {tickets?.length === 0 && (
      <div
        className="
          border border-dashed border-gray-200
          rounded-3xl
          p-10
          text-center
        "
      >
        <div className="text-5xl mb-4">
          🎟️
        </div>

        <div className="text-lg font-semibold mb-2">
          No tickets yet
        </div>

        <p className="text-sm text-gray-400 mb-5">
          Tickets you purchase will appear here.
        </p>

        <Link
          href="/browse"
          className="
            inline-flex items-center justify-center
            bg-brand text-white
            rounded-2xl px-5 py-3
            text-sm font-semibold
          "
        >
          Browse Events
        </Link>
      </div>
    )}

    {/* TICKETS */}
    <div className="flex flex-col gap-4">

      {tickets?.map((ticket) => (

        <Link
          href={`/tickets/${ticket.id}`}
          key={ticket.id}
          className="
            block
            relative overflow-hidden
            rounded-3xl
            border border-gray-100
            bg-white
            shadow-sm
          "
        >

          {/* TOP SECTION */}
          <div className="p-5">

            <div className="flex items-start justify-between gap-3">

              <div>
                <div className="text-xl font-bold leading-tight">
                  {ticket.events?.name}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  {ticket.events?.venue}
                </div>
              </div>

              <div
                className="
                  shrink-0
                  bg-black text-white
                  text-[11px]
                  px-3 py-1
                  rounded-full
                  font-semibold
                "
              >
                {ticket.status}
              </div>
            </div>

            {/* DATE */}
            <div className="mt-5 flex items-center gap-2">

              <div className="text-2xl">
                📅
              </div>

              <div>
                <div className="text-xs text-gray-400">
                  Event Date
                </div>

                <div className="text-sm font-medium">
                  {new Date(
                    ticket.events?.date
                  ).toLocaleDateString('en-ZA', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* DASH LINE */}
          <div className="relative">

            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />

            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />

            <div className="border-t border-dashed border-gray-200" />

          </div>

          {/* BOTTOM */}
          <div className="p-5 flex items-end justify-between gap-4">

            <div>
              <div className="text-xs text-gray-400 mb-1">
                Ticket Code
              </div>

              <div className="font-mono text-sm font-semibold">
                {ticket.ticket_code}
              </div>
            </div>

            {/* QR PLACEHOLDER */}
            <div
              className="
                w-16 h-16
                rounded-xl
                border border-gray-200
                flex items-center justify-center
                text-2xl
                bg-gray-50
              "
            >
              🎫
            </div>

          </div>

        </Link>

      ))}

    </div>
     {/* Bottom Nav */}
      <BottomHNav />

  </div>
)
}
