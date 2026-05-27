'use client'

import Link from 'next/link'

export default function BasketButton() {
  return (
    <Link
      href="/saved"
      className="
        fixed bottom-5 left-1/2 -translate-x-1/2
        z-50 bg-brand text-white
        px-5 py-3 rounded-full
        shadow-xl flex items-center gap-2
        text-sm font-medium
      "
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z" />
      </svg>

      Basket
    </Link>
  )
}

