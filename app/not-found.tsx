import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-accent">404</p>
      <p className="mt-3 text-base font-semibold text-gray-700">Place not found</p>
      <p className="mt-1 text-sm text-gray-400">
        This place may have moved or no longer exists.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to Discover
      </Link>
    </div>
  )
}
