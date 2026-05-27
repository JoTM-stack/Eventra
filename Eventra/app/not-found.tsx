import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <div className="font-display text-8xl font-bold text-brand-soft mb-4">404</div>
      <h1 className="font-display text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-400 text-sm mb-8">
        This event may have been removed or the link is incorrect.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/browse" className="btn-primary">Browse events</Link>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  )
}
