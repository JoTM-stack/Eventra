import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const body = await request.json()

    const email = body.email
    const password = body.password

    // GET IP
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

    /*
      BLOCK AFTER 5 FAILS
    */
    if ((count ?? 0) >= 5) {
      return Response.json({
        success: false,
        message:
          'Too many failed login attempts. Try again later.',
      })
    }

    /*
      LOGIN
    */
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    /*
      FAILED LOGIN
    */
    if (error) {

      // SAVE FAILED ATTEMPT
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

    // OPTIONAL:
    // clear old failed attempts
    await supabase
      .from('login_attempts')
      .delete()
      .eq('email', email)

    // SAVE SUCCESS LOG
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

  } catch (error) {

    console.log(error)

    return Response.json({
      success: false,
      message: 'Server error',
    })
  }
}