import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {

  try {

    const supabase = await createClient()

    const body = await req.json()

    const { email, role, ip } = body

    // EMAIL CHECK
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)

    if (profiles && profiles.length > 0) {

      const sameRole = profiles.find(
        (p) => p.role === role
      )

      if (sameRole) {
        return NextResponse.json({
          success: false,
          message:
            `This email already has a ${role} account.`,
        })
      }

      if (profiles.length >= 2) {
        return NextResponse.json({
          success: false,
          message:
            'Maximum account types reached for this email.',
        })
      }
    }

    // IP CHECK
    const { data: ipAccounts } = await supabase
      .from('profiles')
      .select('*')
      .eq('signup_ip', ip)

    if (ipAccounts && ipAccounts.length >= 3) {
      return NextResponse.json({
        success: false,
        message:
          'Maximum accounts reached for this IP address.',
      })
    }

    return NextResponse.json({
      success: true,
    })

  } catch (err) {

    console.log(err)

    return NextResponse.json({
      success: false,
      message: 'Server error',
    })
  }
}