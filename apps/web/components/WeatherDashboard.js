'use client'
import { useEffect, useState } from 'react'
import { createBrowserSupabase } from '../lib/supabase'
import WeatherCard from './WeatherCard'
import CitySearch from './CitySearch'

export default function WeatherDashboard() {
  const [userCities, setUserCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchUserCities()

    // Subscribe to live weather updates
    const supabase = createBrowserSupabase()
    const channel = supabase
      .channel('weather-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weather_readings' },
        (payload) => {
          setUserCities((prev) =>
            prev.map((item) =>
              item.city?.id === payload.new.city_id
                ? { ...item, city: { ...item.city, weather_readings: [payload.new] } }
                : item
            )
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchUserCities() {
    setLoading(true)
    try {
      const res = await fetch('/api/user-cities')
      const data = await res.json()
      setUserCities(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(cityData) {
    setAdding(true)
    try {
      const res = await fetch('/api/user-cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityData),
      })
      if (res.ok) await fetchUserCities()
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(cityId) {
    // Optimistic remove
    setUserCities((prev) => prev.filter((item) => item.city?.id !== cityId))
    await fetch(`/api/user-cities/${cityId}`, { method: 'DELETE' })
  }

  const existingOpenmeteoIds = userCities
    .map((item) => item.city?.openmeteo_id)
    .filter(Boolean)

  const [unit, setUnit] = useState('C')

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-52 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-20 bg-gray-100 rounded mb-6" />
              <div className="h-12 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Cities</h2>
          <p className="text-gray-400 text-sm mt-0.5">Refreshes automatically every 5 minutes</p>
        </div>
        <div className="flex items-center gap-3">
          {adding && <span className="text-sm text-gray-400">Adding...</span>}
          <button
            onClick={() => setUnit((u) => u === 'C' ? 'F' : 'C')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition text-gray-600"
          >
            °{unit === 'C' ? 'F' : 'C'}
          </button>
          <CitySearch onAdd={handleAdd} existingOpenmeteoIds={existingOpenmeteoIds} />
        </div>
      </div>

      {userCities.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">🌍</div>
          <p className="text-lg font-medium text-gray-500">No cities yet</p>
          <p className="text-sm mt-1">Search above to add your first city.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {userCities.map((item) => (
            <WeatherCard
              key={item.id}
              city={item.city}
              weather={item.city?.weather_readings?.[0] ?? null}
              onRemove={handleRemove}
              unit={unit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
