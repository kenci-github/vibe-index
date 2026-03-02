'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-accent">!</p>
      <p className="mt-3 text-base font-semibold text-gray-700">Something went wrong</p>
      <p className="mt-1 text-sm text-gray-400">
        We hit a snag loading this page.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  )
}
