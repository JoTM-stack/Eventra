import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      ticket_id,
      ticket_code,
      event_id,
    } = body

    // VALIDATION
    if (
      !ticket_id ||
      !ticket_code ||
      !event_id
    ) {

      return NextResponse.json({
        success: false,
        message: 'Missing ticket data',
      })

    }

    const supabase = await createClient()

    // FETCH TICKET
    const { data: ticket, error } =
      await supabase
        .from('tickets')
        .select(`
          *,
          events (
            name
          )
        `)
        .eq('id', ticket_id)
        .single()

    if (error || !ticket) {

      return NextResponse.json({
        success: false,
        message: 'Invalid ticket',
      })

    }

    // WRONG CODE
    if (
      ticket.ticket_code !==
      ticket_code
    ) {

      return NextResponse.json({
        success: false,
        message: 'Invalid ticket code',
      })

    }

    // WRONG EVENT
    if (
      ticket.event_id !==
      event_id
    ) {

      return NextResponse.json({
        success: false,
        message: 'Wrong event ticket',
      })

    }

    // ALREADY USED
    if (ticket.checked_in) {

      return NextResponse.json({
        success: false,
        message: 'Ticket already used',
      })

    }

    // MARK CHECKED IN
    const {
      error: updateError,
    } = await supabase
      .from('tickets')
      .update({

        checked_in: true,

        checked_in_at:
          new Date().toISOString(),

      })
      .eq('id', ticket.id)

    if (updateError) {

      console.log(updateError)

      return NextResponse.json({
        success: false,
        message: 'Failed to check in ticket',
      })

    }

    // SUCCESS
    return NextResponse.json({

      success: true,

      message: 'Access Granted',

      ticket: {

        event_name:
          ticket.events?.name,

        ticket_code:
          ticket.ticket_code,

      },

    })

  } catch (error) {

    console.log(error)

    return NextResponse.json({

      success: false,

      message: 'Server error',

    })

  }

}