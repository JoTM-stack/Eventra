import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const {
      email,
      amount,
      event_id,
      event_name,
    } = body

    if (!body) {

      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
                            )
                                                        }

    // GET LOGGED-IN USER
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('PAYSTACK INIT USER:', user)
    console.log('PAYSTACK INIT AUTH ERROR:', authError)

    if (!user) {

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )

    }

    // INITIALIZE PAYSTACK
    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({

          email,

          amount:
            Math.round(amount * 100),

          callback_url:
            `${process.env.NEXT_PUBLIC_APP_URL}/verify`,

          metadata: {

            event_id,

            user_id: user.id,

            email,

            event_name,


          },

        }),

      }
    )

    const data = await response.json()

    console.log('PAYSTACK RESPONSE:', data)

    if (!data.status) {

      return NextResponse.json(
        { error: data.message },
        { status: 400 }
      )

    }

    return NextResponse.json({

      authorization_url:
        data.data.authorization_url,

      reference:
        data.data.reference,

    })

  } catch (error) {

    console.error(
      'Paystack Init Error:',
      error
    )

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )

  }

}