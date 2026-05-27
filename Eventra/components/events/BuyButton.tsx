'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  eventId: string
  eventName: string
  price: number
}

export default function BuyButton({
  eventId,
  eventName,
  price,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    try {
      setLoading(true)

      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      let email = user?.email

      // fallback if not logged in
      if (!email) {
        email = prompt('Enter your email') || ''
      }

      if (!email) {
        setLoading(false)
        return
      }

      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: price,
          event_id: eventId,
          event_name: eventName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Payment failed')
        return
      }

      window.location.href = data.authorization_url
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="btn-primary w-full"
    >
      {loading ? 'Redirecting...' : `Buy Ticket • R${price}`}
    </button>
  )
}