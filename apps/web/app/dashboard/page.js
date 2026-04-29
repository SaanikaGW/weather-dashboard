import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import WeatherDashboard from '../../components/WeatherDashboard'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌤️</span>
          <h1 className="text-xl font-bold text-gray-900">Weather Dashboard</h1>
        </div>
        <UserButton />
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <WeatherDashboard />
      </main>
    </div>
  )
}
