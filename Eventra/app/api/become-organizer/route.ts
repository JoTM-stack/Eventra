import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      })
    }

    // GET PROFILE
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({
        success: false,
        message: 'Profile not found',
      })
    }

    // BLOCK DOUBLE ORGANIZER
    if (profile.is_organizer) {
      return NextResponse.json({
        success: false,
        message:
          'Already registered as organizer',
      })
    }

    // UPDATE ROLE
    const { error } = await supabase
      .from('profiles')
      .update({
        is_organizer: true,
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({
        success: false,
        message: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message:
        'Organizer account activated',
    })

  } catch (error) {

    return NextResponse.json({
      success: false,
      message: 'Server error',
    })
  }
}