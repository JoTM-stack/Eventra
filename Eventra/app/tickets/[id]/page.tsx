import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import DownloadTicketButton from '@/components/tickets/DownloadTicketButton'
import ShareButton from '@/components/events/ShareButton'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function TicketDetailsPage({
  params,
}: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: ticket } = await supabase
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
    .eq('id', id)
    .single()

  if (!ticket) {
    redirect('/tickets')
  }

  // SECURITY
  if (ticket.user_id !== user.id) {
    redirect('/tickets')
  }

  return (
    <div className="min-h-screen bg-violet-500 px-4 py-6">

      {/* BACK */}
      <Link
        href="/tickets"
        className="text-white/70 text-sm"
      >
        ← Back
      </Link>

      {/* TICKET */}
     <div
          className="
            mt-5
            max-w-md mx-auto
            rounded-[38px]
            overflow-hidden
            border border-purple-500/20
            ring-1 ring-purple-400/10

            bg-gradient-to-b
            from-[#1a0038]
            via-[#090014]
            to-black

            transform-gpu
            perspective-[1800px]
            rotate-x-[8deg]
            rotate-y-[-2deg]
            scale-[0.98]

            before:absolute
            before:inset-0
            before:bg-gradient-to-br
            before:from-white/10
            before:to-transparent
            before:pointer-events-none

            relative
          "
        >

        <div
          className="
            absolute
            -top-32
            left-1/2
            -translate-x-1/2
            w-72
            h-72
            bg-purple-500/20
            blur-3xl
            rounded-full
            pointer-events-none
          "
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-white/10
            via-transparent
            to-transparent
            pointer-events-none
          "
        />


        {/* TOP */}
        <div className="p-6">

          {/* HEADER */}
          <div className="flex items-center justify-between">

            <div>
              <div className="text-purple-400 text-sm font-semibold">
                EVENTRA
              </div>

              <div className="text-white/50 text-xs mt-1">
                LIVE EXPERIENCE
              </div>
            </div>

            {ticket.events?.banner_url && (
              <img
                src={ticket.events.banner_url}
                alt={ticket.events.name}
                className="w-full h-44 object-cover"
              />
            )}

            <div
              className={`
                text-xs
                px-3 py-1
                rounded-full
                border
                ${
                  ticket.checked_in
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
                    : 'bg-green-500/20 text-green-400 border-green-500/20'
                }
              `}
            >
              {ticket.checked_in ? 'USED' : 'PAID'}
            </div>

          </div>

          {/* TITLE */}
          <div className="mt-8">

            <h1
              className="
                text-white
                text-5xl
                font-black
                leading-none
                uppercase
              "
            >
              {ticket.events?.name}
            </h1>

          </div>

          {/* INFO */}
          <div className="mt-8 flex flex-col gap-5">

            <div>
              <div className="text-purple-400 text-xs">
                DATE
              </div>

              <div className="text-white text-lg font-semibold">
                {new Date(
                  ticket.events?.date
                ).toLocaleDateString('en-ZA', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div>
              <div className="text-purple-400 text-xs">
                VENUE
              </div>

              <div className="text-white text-lg font-semibold">
                {ticket.events?.venue}
              </div>
            </div>

          </div>

        </div>

        {/* CUT LINE */}
        <div className="relative py-6">

          <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black" />

          <div className="absolute right-[-18px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black" />

          <div className="border-t border-dashed border-white/20" />

        </div>

        {/* QR */}
        <div className="px-6 pb-6">

          <div className="flex justify-center">

            <div
              className="
                bg-white
                p-5
                rounded-3xl
              "
            >
              <QRCode
                value={JSON.stringify({
                  ticket_id: ticket.id,
                  ticket_code: ticket.ticket_code,
                  event_id: ticket.event_id,
                })}
                size={220}
              />
            </div>

          </div>

          <div className="text-center mt-5">

            <div className="text-purple-400 text-sm">
              Scan to validate ticket
            </div>

            <div
              className="
                mt-3
                text-white
                font-mono
                text-lg
                font-semibold
              "
            >
              {ticket.ticket_code}
            </div>

          </div>

          {/* HOLDER */}
          <div
            className="
              mt-8
              rounded-3xl
              border border-white/10
              bg-white/5
              p-5
            "
          >

            <div className="grid grid-cols-2 gap-5">

              <div>
                <div className="text-white/40 text-xs">
                  TICKET HOLDER
                </div>

                <div className="text-white font-semibold mt-1 break-all">
                  {user.email}
                </div>
              </div>

              <div>
                <div className="text-white/40 text-xs">
                  STATUS
                </div>

                <div
                  className={`
                    font-semibold mt-1
                    ${
                      ticket.checked_in
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }
                  `}
                >
                  {ticket.checked_in
                    ? 'CHECKED IN'
                    : 'CONFIRMED'}
                </div>
              </div>

            </div>

          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 mt-6">

             <DownloadTicketButton
              ticketCode={ticket.ticket_code}
              eventName={ticket.events?.name || ''}
              email={user.email || ''}
              amount={ticket.amount}
              status={ticket.status}
            />

            <ShareButton
              className="w-full justify-center"
              url={`${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticket.ticket_code}`}
              title={`My ticket for ${ticket.events?.name ?? 'Eventra Event'}`}
            />

          </div>

          {/* FOOTER */}
          <div className="text-center mt-8">

            <div className="text-white/30 text-sm">
              Your Event. Your Experience.
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
