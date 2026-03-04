import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { DM_Sans } from 'next/font/google'
import BottomNav from '@/components/BottomNav'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://vibeindex.app'

export const metadata: Metadata = {
  title: 'Vibe Index',
  description: 'Discover amazing places by vibe, not category. Find your next date spot, solo hang, or group outing by mood — not by star rating.',
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vibe',
  },
  openGraph: {
    type: 'website',
    siteName: 'Vibe Index',
    title: 'Vibe Index',
    description: 'Discover amazing places by vibe, not category.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Index',
    description: 'Discover amazing places by vibe, not category.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAFAFA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto max-w-md">{children}</main>
        <BottomNav />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
