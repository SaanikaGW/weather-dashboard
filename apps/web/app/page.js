import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="text-center max-w-xl px-4">
        <div className="text-6xl mb-6">🌤️</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Weather Dashboard</h1>
        <p className="text-xl text-gray-500 mb-10">
          Live weather for your favorite cities, updated in real time.
        </p>

        <SignedOut>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-in"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-white text-blue-600 border border-blue-300 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition"
            >
              Sign Up
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
