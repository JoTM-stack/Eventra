'use client'

import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { useParams } from 'next/navigation'

export default function CheckInPage() {

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)

  const params = useParams()
  const eventId = params.id

  function resetScanner() {
    setScanned(false)
    setResult(null)
    setLoading(false)
  }

  async function handleScan(text: string) {

    if (scanned || loading) return

    setScanned(true)
    setResult(null)

    try {

      setLoading(true)

      const parsed = JSON.parse(text)

      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parsed,
          event_id: eventId,
        }),
      })

      const data = await res.json()

      setResult(data)

      // vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(
          data.success
            ? [200]
            : [100, 100, 100]
        )
      }

    } catch (error) {

      console.log(error)

      setResult({
        success: false,
        message: 'Invalid QR Code',
      })

    } finally {

      setLoading(false)

      // AUTO RESET AFTER 3s
      setTimeout(() => {
        setScanned(false)
        setResult(null)
      }, 3000)

    }
  }

  return (
    <div
      className={`
        min-h-screen text-white px-5 py-6 transition-all duration-300
        ${
          result?.success
            ? 'bg-green-950'
            : result && !result.success
            ? 'bg-red-950'
            : 'bg-black'
        }
      `}
    >

      <h1 className="text-3xl font-bold mb-6">
        Event Check-In
      </h1>

      {/* SCANNER */}
      <div className="overflow-hidden rounded-3xl border border-white/10">

        <Scanner
          onScan={(result) => {
            if (result?.[0]?.rawValue) {
              handleScan(result[0].rawValue)
            }
          }}
        />

      </div>

      {/* STATUS */}
      <div className="mt-6">

        {loading && (
          <div className="text-yellow-400">
            Verifying ticket...
          </div>
        )}

        {result && (

          <div
            className={`
              mt-4 rounded-3xl p-5 border
              ${
                result.success
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }
            `}
          >

            <div className="text-xl font-bold">
              {result.message}
            </div>

            {result.ticket && (

              <div className="mt-3 text-sm space-y-1">

                <div>
                  Event: {result.ticket.event_name}
                </div>

                <div>
                  Code: {result.ticket.ticket_code}
                </div>

              </div>

            )}

            {/* RESET BUTTON */}
            <button
              onClick={resetScanner}
              className="
                mt-5
                w-full
                rounded-2xl
                bg-white/10
                border border-white/10
                py-4
                font-semibold
                text-white
                hover:bg-white/20
                transition
              "
            >
              Scan Next Ticket
            </button>

          </div>

        )}

      </div>

    </div>
  )
}