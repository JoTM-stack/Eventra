'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-white bg-gray-400 rounded-full px-3 py-1.5"
    >
      Sign out
    </button>
  )
}