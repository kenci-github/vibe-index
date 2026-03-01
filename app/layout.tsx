import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import BottomNav from '@/components/BottomNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vibe Index',
  description: 'Discover amazing places by vibe, not category.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAFAFA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto max-w-md">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
