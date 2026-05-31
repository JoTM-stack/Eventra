import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateShort, formatPrice, EVENT_CATEGORIES } from '@/lib/utils'
import type { Event } from '@/lib/supabase/types'
import SignOutButton from '@/app/components/SignOutButton'
import BottomNav from '@/components/navigation/BottomNav'
import BottomHNav from '@/components/navigation/BottomHNav'



interface Props {
  searchParams: Promise<{
    category?: string
    q?: string
  }>
}

export default async function BrowsePage({
  searchParams,
}: Props) {

  const sp = await searchParams

  const supabase = await createClient()
  const {
            data: { user }
        } = await supabase.auth.getUser()

  let query = supabase
    .from('events')
    .select(`
          *,
          tickets(id)
        `)
    .eq('published', true)
    .order('date', { ascending: true })


let role = 'attendee'

if (user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  role = profile?.role || 'attendee'
}

  if (sp.category)
    query = query.eq('category', sp.category)
  if (sp.q)
    query = query.ilike('name', `%${sp.q}%`)

  const { data: events, error } = await query

  const list = (events ?? []) as Event[]

  if (error) {
    return <div>Error loading events</div>
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">

        <a href="/" className="font-display font-bold text-xl text-brand">eventra</a>

        {user ? (
              <SignOutButton />
            ) : (
              <Link href="/auth/signup" className="text-xs text-white bg-brand rounded-full px-3 py-1.5">
                Get started
              </Link>
                )
        }
      </nav>

      <div className="px-5 py-5">
        {/* Search */}
        <form method="GET" className="mb-4">
          <input
            name="q"
            defaultValue={sp.q}
            className="input"
            placeholder="Search events…"
          />
        </form>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <Link
            href="/browse"
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              !sp.category ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            All
          </Link>
          {EVENT_CATEGORIES.map(cat => (

            <Link
              key={cat}
              href={`/browse?category=${encodeURIComponent(cat)}`}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                sp.category === cat ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {list.length} event{list.length !== 1 ? 's' : ''} found
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎟️</div>
            <div className="font-medium text-gray-600 mb-1">No events found</div>
            <div className="text-sm text-gray-400">Try a different category or search term</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map(event => {
              const { month, day } = formatDateShort(event.date)
              return (
               <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="overflow-hidden border border-gray-100 rounded-2xl hover:border-brand transition-colors bg-gray"
                    >

                        {/* BANNER */}
                      {event.cover_image_url && (
                        <img
                          src={event.cover_image_url}
                          alt={event.name}
                          className="w-full h-40 object-cover"
                        />
                      )}

                  <div className="min-w-[44px] text-center bg-brand-soft rounded-lg py-1.5 px-1 shrink-0">
                    <div className="text-[9px] font-bold text-brand uppercase tracking-wide">{month}</div>
                    <div className="text-xl font-bold text-brand-dark leading-tight">{day}</div>
                  </div>
                  <div className="flex-1 min-w-0 py-2 px-2">
                    <div className="text-sm font-medium truncate">{event.name}</div>
                    <div className="text-xs text-gray-400 truncate">{event.venue ?? 'Venue TBC'}{event.category ? ` · ${event.category}` : ''}</div>
                  </div>
                  <div className="shrink-0 text-right py-1 px-2 ">
                    <div className="text-sm font-bold text-brand">{formatPrice(event.price)}</div>
                    {event.capacity && (
                      <div className="text-xs text-gray-400">
                        {Math.max(
                          event.capacity -
                          ((event as any).tickets?.length || 0),
                          0
                        )} left
                      </div>
                    )}

                  </div>
                </Link>

              )
            })}

 <div className= "h-10"/>


          </div>
        )}

                    {
          role === 'organizer'
            ? <BottomNav />
            : <BottomHNav />
        }


      </div>
    </div>
  )
}
