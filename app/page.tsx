import { Suspense } from 'react'
import HomeClient from '@/components/HomeClient'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-screen bg-background" />}>
        <HomeClient />
      </Suspense>
    </div>
  )
}
