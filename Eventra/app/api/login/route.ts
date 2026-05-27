import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {

  const supabase = await createClient()

  const body = await request.json()

  const email = body.email
  const password = body.password

  const ip =
    request.headers.get('x-forwarded-for') ??
    'unknown'

  /*
    CHECK FAILED ATTEMPTS
  */

  const { count } = await supabase
    .from('login_attempts')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('email', email)
    .eq('success', false)

  if ((count ?? 0) >= 5) {

    return Response.json({
      success: false,
      message:
        'Too many failed login attempts',
    })

  }

  /*
    LOGIN
  */

  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  /*
    FAILED LOGIN
  */

  if (error) {

    await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email)

    await supabase
      .from('login_attempts')
      .insert({
        email,
        ip_address: ip,
        success: false,
      })

    return Response.json({
      success: false,
      message: 'Invalid credentials',
    })

  }

  /*
    SUCCESS LOGIN
  */

  await supabase
    .from('login_attempts')
    .insert({
      email,
      ip_address: ip,
      success: true,
    })

  return Response.json({
    success: true,
    user: data.user,
  })
}