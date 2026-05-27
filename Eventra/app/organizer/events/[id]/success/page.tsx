
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CopyButton from '@/components/ui/CopyButton'

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          redirect('/auth/login')
        }

        const user = session.user
  if (!user) redirect('/auth/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()

  if (!event) redirect('/organizer/dashboard')

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}`

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <nav className="flex items-center justify-center px-5 py-4 border-b border-gray-100">
        <span className="font-display font-bold text-xl text-brand">eventra</span>
      </nav>

      <div className="flex-1 px-5 py-10 flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 stroke-green-600" fill="none" strokeWidth={2.5} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold mb-3">
          {event.published ? 'Event is live!' : 'Draft saved!'}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
          {event.published
            ? 'Share this link with your audience. When they tap "Buy ticket" they go straight to paystack checkout.'
            : 'Your event is saved as a draft. Add your paystack link and publish when ready.'}
        </p>

        {/* Share URL */}
        {event.published && (
          <div className="w-full mb-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="flex-1 text-xs font-mono text-brand text-left break-all">{eventUrl}</span>
              <CopyButton text={eventUrl} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Share on WhatsApp, Instagram, email — anywhere your audience is</p>
          </div>
        )}

        {/* Share buttons */}
        {event.published && (
          <div className="flex gap-2 w-full mb-8">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join me at ${event.name}! Get your tickets here: ${eventUrl}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 btn-outline text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.85L0 24l6.335-1.56A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.728.917.955-3.638-.236-.374A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`You're invited: ${event.name}`)}&body=${encodeURIComponent(`Join me at ${event.name}!\n\nGet your tickets: ${eventUrl}`)}`}
              className="flex-1 btn-outline text-xs py-2.5"
            >
              Email
            </a>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <Link href={`/events/${event.slug}`} className="btn-outline">
            Preview event page
          </Link>
          {!event.paystack_payment_link && (
            <Link href={`/organizer/events/${event.id}/edit`} className="btn-outline text-brand border-brand">
              Add paystack link
            </Link>
          )}
          <Link href="/organizer/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
