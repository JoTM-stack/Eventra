'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // GET USER IP
  const headersList = await headers()

  const forwardedFor = headersList.get('x-forwarded-for')

  const ip =
    forwardedFor?.split(',')[0] ||
    'unknown'

  // CHECK EXISTING LOGIN ATTEMPTS
  const { data: existing } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('email', email)
    .eq('ip_address', ip)
    .single()

  // BLOCK AFTER 5 FAILS
  if (existing && existing.attempts >= 5) {
    return {
      error:
        'Too many failed login attempts. Try again later.',
    }
  }

  // TRY LOGIN
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // FAILED LOGIN
  if (error) {

    // UPDATE ATTEMPTS
    if (existing) {

      await supabase
        .from('login_attempts')
        .update({
          attempts: existing.attempts + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

    } else {

      await supabase
        .from('login_attempts')
        .insert({
          email,
          ip_address: ip,
          attempts: 1,
        })

    }

    return {
      error: 'Invalid login credentials',
    }
  }

  // SUCCESS LOGIN → RESET ATTEMPTS
  if (existing) {
    await supabase
      .from('login_attempts')
      .delete()
      .eq('id', existing.id)
  }

  redirect('/attendee')
}