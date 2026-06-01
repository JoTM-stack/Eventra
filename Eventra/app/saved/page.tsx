import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { formatDateShort, formatPrice } from '@/lib/utils'

export default async function SavedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: savedEvents, error } = await supabase
    .from('saved_events')
    .select(`
      id,
      events (
        id,
        slug,
        name,
        venue,
        date,
        price,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-md mx-auto p-5">
        <p className="text-red-500 text-sm">
          Failed to load saved events.
        </p>
      </div>
    )
  }

  const list =
    savedEvents
      ?.map(item => item.events)
      .filter(Boolean) ?? []

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <Link
          href="/browse"
          className="text-sm text-gray-400"
        >
          ← Browse
        </Link>

        <span className="font-display font-bold text-xl text-brand">
          Saved
        </span>

        <div className="w-12" />
      </nav>

      <div className="flex-1 px-5 py-6">
        <div className="mb-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Your basket
          </div>

          <h1 className="font-display text-2xl font-bold mt-1">
            Saved events
          </h1>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎟️</div>

            <div className="font-medium text-gray-600 mb-2">
              No saved events yet
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Save events to quickly access them later.
            </p>

            <Link
              href="/browse"
              className="btn-primary inline-block"
            >
              Browse events
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((event: any) => {
              const { month, day } =
                formatDateShort(event.date)

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="border border-gray-100 rounded-2xl p-4 hover:border-brand transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Date */}
                    <div className="min-w-[52px] h-[58px] rounded-xl bg-brand-soft flex flex-col items-center justify-center">
                      <div className="text-[10px] uppercase font-bold text-brand tracking-wide">
                        {month}
                      </div>

                      <div className="text-lg font-bold text-brand-dark leading-none">
                        {day}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm text-gray-800">
                            {event.name}
                          </div>

                          <div className="text-xs text-gray-400 mt-1">
                            {event.venue ?? 'Venue TBC'}
                          </div>

                          {event.category && (
                            <div className="text-[11px] text-brand mt-2 font-medium">
                              {event.category}
                            </div>
                          )}
                        </div>

                        <div className="font-display text-xl font-bold text-brand shrink-0">
                          {formatPrice(event.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
    
      const navItems = [
        { href: '/browse', label: 'Browse' },
        { href: '/saved', label: 'Saved' },
      ]
      
      <div className="border-t border-gray-100 flex bg-white sticky bottom-0">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 text-center py-3 text-xs font-medium ${
              item.href === '/saved'
                ? 'text-brand'
                : 'text-gray-400'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
