import type { Metadata, Viewport } from 'next'
import { Syne, Instrument_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: { default: 'Eventra', template: '%s · Eventra' },
  description: 'Create events. Sell tickets. Share the link.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    siteName: 'Eventra',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7F77DD',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${instrumentSans.variable}`}>
      <body className="font-body bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
