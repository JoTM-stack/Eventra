'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="shrink-0 bg-brand text-white text-xs font-medium rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity whitespace-nowrap"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
