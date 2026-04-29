import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '300000')

async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  const data = await res.json()
  return data.current
}

async function poll() {
  console.log(`[${new Date().toISOString()}] Polling...`)

  const { data: cities, error } = await supabase.from('cities').select('*')
  if (error) {
    console.error('Failed to fetch cities:', error.message)
    return
  }

  if (!cities?.length) {
    console.log('No cities to poll.')
    return
  }

  for (const city of cities) {
    try {
      const weather = await fetchWeather(city.latitude, city.longitude)
      const { error: upsertError } = await supabase
        .from('weather_readings')
        .upsert(
          {
            city_id: city.id,
            temperature_c: weather.temperature_2m,
            feels_like_c: weather.apparent_temperature,
            humidity: weather.relative_humidity_2m,
            wind_speed: weather.wind_speed_10m,
            weather_code: weather.weather_code,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'city_id' }
        )
      if (upsertError) {
        console.error(`Upsert failed for ${city.name}:`, upsertError.message)
      } else {
        console.log(`  ✓ ${city.name}: ${weather.temperature_2m}°C`)
      }
    } catch (err) {
      console.error(`  ✗ ${city.name}:`, err.message)
    }
  }

  console.log(`Done. Next poll in ${POLL_INTERVAL / 1000}s\n`)
}

async function main() {
  console.log(`Weather Worker started. Interval: ${POLL_INTERVAL / 1000}s`)
  await poll()
  setInterval(poll, POLL_INTERVAL)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
