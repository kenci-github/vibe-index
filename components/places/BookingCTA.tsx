'use client'

import { ExternalLink, Phone, MessageCircle, Calendar, Scissors, Instagram } from 'lucide-react'

interface BookingCTAProps {
  bookingUrl: string | null
  ctaType: string | null
  placeName: string
}

export default function BookingCTA({ bookingUrl, ctaType, placeName }: BookingCTAProps) {
  if (!bookingUrl || !ctaType) return null

  const configs: Record<string, { href: string; label: string; icon: React.ReactNode; external: boolean }> = {
    whatsapp: {
      href: `https://wa.me/${bookingUrl}?text=Hi%2C+I+found+${encodeURIComponent(placeName)}+on+Vibe+Index`,
      label: 'Message on WhatsApp',
      icon: <MessageCircle className="h-4 w-4" />,
      external: true,
    },
    opentable: {
      href: bookingUrl,
      label: 'Reserve on OpenTable',
      icon: <Calendar className="h-4 w-4" />,
      external: true,
    },
    fresha: {
      href: bookingUrl,
      label: 'Book on Fresha',
      icon: <Scissors className="h-4 w-4" />,
      external: true,
    },
    website: {
      href: bookingUrl,
      label: 'Visit Website',
      icon: <ExternalLink className="h-4 w-4" />,
      external: true,
    },
    phone: {
      href: `tel:${bookingUrl}`,
      label: 'Call to Book',
      icon: <Phone className="h-4 w-4" />,
      external: false,
    },
    instagram: {
      href: `https://instagram.com/${bookingUrl}`,
      label: 'DM on Instagram',
      icon: <Instagram className="h-4 w-4" />,
      external: true,
    },
  }

  const config = configs[ctaType]
  if (!config) return null

  return (
    <a
      href={config.href}
      {...(config.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white transition active:scale-[0.98]"
    >
      {config.icon}
      {config.label}
    </a>
  )
}
