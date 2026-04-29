import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '../../../lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('user_cities')
    .select(`
      id,
      city:cities (
        id, name, country, latitude, longitude, openmeteo_id,
        weather_readings (
          temperature_c, feels_like_c, humidity, wind_speed, weather_code, updated_at
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, country, country_code, latitude, longitude, openmeteo_id } = await request.json()
  if (!name || !latitude || !longitude || !openmeteo_id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  // Get existing city or create it
  let city
  const { data: existing } = await supabase
    .from('cities')
    .select()
    .eq('openmeteo_id', openmeteo_id)
    .single()

  if (existing) {
    city = existing
  } else {
    const { data: newCity, error: insertError } = await supabase
      .from('cities')
      .insert({ name, country, country_code, latitude, longitude, openmeteo_id })
      .select()
      .single()
    if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
    city = newCity
  }

  // Add to user's cities (ignore if already there)
  const { error: linkError } = await supabase
    .from('user_cities')
    .upsert({ user_id: userId, city_id: city.id }, { onConflict: 'user_id,city_id' })

  if (linkError) return Response.json({ error: linkError.message }, { status: 500 })
  return Response.json({ success: true, city })
}
