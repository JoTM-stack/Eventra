import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { generateTicketPdf } from '@/lib/pdf/generateTicketPdf'
import { sendTicketEmail } from '@/lib/email/sendTicketEmail'

import crypto from 'crypto'

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

  // Verify payment with Paystack
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

  // Payment failed
  if (
    !verifyData.status ||
    verifyData.data.status !== 'success'
  )

    {
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

  const supabase = await createClient()

  // Prevent duplicate ticket updates
const { data: existingTransaction } = await supabase
  .from('transactions')
  .select('id')
  .eq('reference', reference)
  .maybeSingle()

  if (!existingTransaction) {
    // Save transaction
   const { data: insertedTransaction, error: transactionError } =
      await supabase
        .from('transactions')
        .insert({
          reference,
          amount: verifyData.data.amount / 100,
          status: verifyData.data.status,
          event_id,
        })
        .select()

    console.log('INSERTED TRANSACTION:', insertedTransaction)
    console.log('TRANSACTION ERROR:', transactionError)

    // Increment tickets sold
    const { data: event } = await supabase
      .from('events')
      .select('tickets_sold')
      .eq('id', event_id)
      .single()

    if (event) {
      await supabase
        .from('events')
        .update({
              tickets_sold: (event?.tickets_sold ?? 0) + 1,
                    })
        .eq('id', event_id)
    }

    // Create ticket
    // get event details
    const { data: eventData } = await supabase
      .from('events')
      .select('organizer_id, price')
      .eq('id', event_id)
      .single()


   //
// GET USER ID FROM PAYMENT METADATA
//

const user_id = metadata?.user_id

if (!user_id) {

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
      <div className="w-full border border-gray-100 rounded-3xl p-6 text-center">

        <div className="text-5xl mb-4">⚠️</div>

        <h1 className="text-2xl font-bold mb-2">
          Missing user data
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Payment was successful but ticket ownership data was missing.
        </p>

      </div>
    </div>
  )
}

  if (!eventData) {

  return (
    <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">

      <div className="text-center">

        <div className="text-2xl font-bold text-red-500 mb-3">
          Event not found
        </div>

      </div>

    </div>
  )
}

//
// CREATE TICKET
//

const { data: insertedTicket, error: ticketError } =
  await supabase
    .from('tickets')
    .insert({
      user_id,
      event_id,
      organizer_id: eventData?.organizer_id,
      payment_reference: reference,
      amount: eventData?.price ?? 0,
      status: 'paid',
      ticket_code:
          'EVT-' +
          crypto
            .randomBytes(10)
            .toString('base64')
             .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 11),
            })
    .select()



console.log('INSERTED TICKET:', insertedTicket)
console.log('TICKET ERROR:', ticketError)

if (insertedTicket?.[0]) {

  if (!metadata?.email) {
        console.error('Missing email metadata')
            } else {

  const ticket =
        insertedTicket[0]

  const pdfBuffer =
    await generateTicketPdf({

      ticketCode:
        ticket.ticket_code,

      eventName:
        metadata?.event_name,

      email:
        metadata?.email,

      amount:
        eventData?.price ?? 0,

      status:
        'PAID',
    })


  await sendTicketEmail({

    to:
      metadata?.email,

    eventName:
      metadata?.event_name,

    ticketCode:
      ticket.ticket_code,

    pdfBuffer,
  })

 }

}

}

return (
  <div className="max-w-md mx-auto min-h-screen flex items-center justify-center px-5">
    <div className="w-full border border-gray-100 rounded-3xl p-6 text-center">
      <div className="text-5xl mb-4">🎉</div>

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
          bg-black text-white
          rounded-2xl py-3
          font-semibold
        "
      >
        View My Ticket
      </Link>
    </div>
  </div>
)
}
