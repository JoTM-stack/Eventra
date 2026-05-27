'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BottomNav() {
  const pathname = usePathname()

  const [dashboardHref, setDashboardHref] = useState('/attendee')
  const [dashboardLabel, setDashboardLabel] = useState('attendee')

  useEffect(() => {
    async function getRole() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'organizer') {
        setDashboardHref('/organizer/dashboard')
        setDashboardLabel('Dashboard')
      } else {
        setDashboardHref('/home')
        setDashboardLabel('Home')
      }
    }

    getRole()
  }, [])

  const items = [
    {
      href: '/attendee',
      label: 'Home',
      icon: (
        <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            viewBox="0 0 24 24"
        >
          <path
          strokeLinecap="round" strokeLinejoin="round"
          d="M3 10.5L12 3l9 7.5"
        />
        <path
          strokeLinecap="round" strokeLinejoin="round"
          d="M5 9.5V20h14V9.5"
        />
        <path
          strokeLinecap="round" strokeLinejoin="round"
          d="M9 20v-6h6v6"
        />
      </svg>
      ),
    },

    {
      href: '/saved',
      label: 'Basket',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M3 4h2l2.4 10.2a1 1 0 001 .8h9.7a1 1 0 001-.8L21 8H7" />
        </svg>
      ),
    },

    {
      href: '/browse',
      label: 'Browse',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.5" y2="16.5" />
        </svg>
      ),
    },

    {
      href: '/profile',
      label: 'Profile',
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
]
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="max-w-md mx-auto flex items-center h-16">

        {items.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center
                text-[11px] gap-1
                transition-all duration-200
                transform hover:scale-110 hover:-translate-y-1
                hover:text-violet-500
                hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.45)]

                ${active
                  ? 'text-gray-400 scale-105'
                  : 'text-gray-400 scale-105'}
              `}
            >
              <div className="flex items-center justify-center">
                {item.icon}
              </div>

              <span className="font-medium">
                {item.label}
              </span>
            </Link>

          )
        })}
      </div>
    </div>
  )
}