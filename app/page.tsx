import { Suspense } from 'react'
import HomeClient from '@/components/HomeClient'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 px-4 pb-2 pt-5 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Vibe<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-gray-400">Discover by mood, not category</p>
      </div>

      <Suspense fallback={<div className="h-screen bg-background" />}>
        <HomeClient />
      </Suspense>
    </div>
  )
}
