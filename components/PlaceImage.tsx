'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PlaceImageProps {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
  className?: string
}

export default function PlaceImage({ src, alt, priority, sizes, className }: PlaceImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
