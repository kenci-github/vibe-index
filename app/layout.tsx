import type { Metadata, Viewport } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

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
  themeColor: '#FAF9F7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TopNav />
        <main>{children}</main>
        <BottomNav />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
