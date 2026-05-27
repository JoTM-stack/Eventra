import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{
    reference?: string
  }>
}

export default async function VerifyPage({
  searchParams,
}: Props) {
  const { reference } = await searchParams

  if (!reference) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            Invalid payment reference
          </div>

          <Link
            href="/browse"
            className="text-brand font-medium"
          >
            Back to events
          </Link>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  //
  // AUTH
  //
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  //
  // VERIFY PAYSTACK PAYMENT
  //
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },

      cache: 'no-store',
    }
  )

  const verifyData = await verifyRes.json()

  //
  // PAYMENT FAILED
  //
  if (
    !verifyData.status ||
    verifyData.data.status !== 'success'
  ) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
        <div className="text-center">

          <div className="text-2xl font-bold mb-2 text-red-500">
            Payment failed
          </div>

          <p className="text-gray-500 mb-5">
            Your payment could not be verified.
          </p>

          <Link
            href="/browse"
            className="text-brand font-medium"
          >
            Return to events
          </Link>

        </div>
      </div>
    )
  }

  const metadata = verifyData.data.metadata
  const event_id = metadata?.event_id

  //
  // CHECK EXISTING TRANSACTION
  //
  const { data: existingTransaction } = await supabase
    .from('transactions')
    .select('id')
    .eq('reference', reference)
    .single()

  //
  // ONLY PROCESS IF NOT ALREADY PROCESSED
  //
  if (!existingTransaction) {

    //
    // GET EVENT DETAILS
    //
    const { data: eventData } = await supabase
      .from('events')
      .select(`
        organizer_id,
        price,
        capacity,
        tickets_sold,
        max_tickets_per_user,
        published
      `)
      .eq('id', event_id)
      .single()

    //
    // EVENT NOT FOUND
    //
    if (!eventData) {
      return (
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
          <div className="text-center">

            <div className="text-2xl font-bold text-red-500 mb-3">
              Event not found
            </div>

            <Link
              href="/browse"
              className="text-brand font-medium"
            >
              Back to events
            </Link>

          </div>
        </div>
      )
    }

    //
    // EVENT NOT LIVE
    //
    if (!eventData.published) {
      return (
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
          <div className="text-center">

            <div className="text-2xl font-bold text-red-500 mb-3">
              Event unavailable
            </div>

            <p className="text-gray-500 mb-5">
              Ticket sales are closed.
            </p>

          </div>
        </div>
      )
    }

    //
    // SOLD OUT PROTECTION
    //
    if (
      eventData.capacity &&
      eventData.tickets_sold >= eventData.capacity
    ) {

      await supabase
        .from('events')
        .update({
          published: false,
        })
        .eq('id', event_id)

      return (
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
          <div className="text-center">

            <div className="text-2xl font-bold text-red-500 mb-3">
              Sold Out
            </div>

            <p className="text-gray-500 mb-5">
              This event has reached maximum capacity.
            </p>

            <Link
              href="/browse"
              className="text-brand font-medium"
            >
              Back to events
            </Link>

          </div>
        </div>
      )
    }

    //
    // MAX TICKETS PER USER
    //
    const { count } = await supabase
      .from('tickets')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('event_id', event_id)
      .eq('user_id', user.id)

    if (
      (count ?? 0) >=
      (eventData.max_tickets_per_user ?? 5)
    ) {
      return (
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
          <div className="text-center">

            <div className="text-2xl font-bold text-red-500 mb-3">
              Ticket limit reached
            </div>

            <p className="text-gray-500 mb-5">
              You already own the maximum number of tickets for this event.
            </p>

            <Link
              href="/browse"
              className="text-brand font-medium"
            >
              Back to events
            </Link>

          </div>
        </div>
      )
    }

    //
    // SAVE TRANSACTION
    //
    await supabase
      .from('transactions')
      .insert({
        reference,
        amount: verifyData.data.amount / 100,
        status: verifyData.data.status,
        event_id,
      })

    //
    // UPDATE TICKETS SOLD
    //
    await supabase
      .from('events')
      .update({
        tickets_sold:
          (eventData.tickets_sold ?? 0) + 1,
      })
      .eq('id', event_id)

    //
    // CREATE TICKET
    //
    const { data: insertedTicket, error: ticketError } =
      await supabase
        .from('tickets')
        .insert({
          event_id,
          user_id: user.id,
          organizer_id: eventData.organizer_id,
          payment_reference: reference,
          amount: eventData.price ?? 0,
          status: 'paid',
        })
        .select()

    console.log('INSERTED TICKET:', insertedTicket)
    console.log('TICKET ERROR:', ticketError)
    const pdfBuffer = await generateTicketPdf({
                      ticketCode,
                      eventName,
                      email,
                      amount,
                      status,
                    })
    //
    // AUTO CLOSE SALES IF FULL
    //
    const newTotal =
      (eventData.tickets_sold ?? 0) + 1

    if (
      eventData.capacity &&
      newTotal >= eventData.capacity
    ) {
      await supabase
        .from('events')
        .update({
          published: false,
        })
        .eq('id', event_id)
    }
  }

  //
  // SUCCESS PAGE
  //
  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">

      <div className="w-full border border-gray-100 rounded-3xl p-6 text-center">

        <div className="text-5xl mb-4">
          🎉
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Payment successful
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Your ticket has been confirmed successfully.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">

          <div className="text-xs text-gray-400 mb-1">
            Reference
          </div>

          <div className="font-mono text-sm break-all">
            {reference}
          </div>

        </div>

        <Link
          href="/tickets"
          className="
            block w-full
            bg-brand text-white
            rounded-2xl py-3
            font-semibold
          "
        >
          View My Tickets
        </Link>

      </div>

    </div>
  )
}