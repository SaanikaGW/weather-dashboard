-- Cities master table
CREATE TABLE IF NOT EXISTS cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  openmeteo_id INTEGER UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One weather reading per city, upserted by the worker
CREATE TABLE IF NOT EXISTS weather_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  temperature_c DECIMAL(5, 2),
  feels_like_c DECIMAL(5, 2),
  humidity INTEGER,
  wind_speed DECIMAL(6, 2),
  weather_code INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id)
);

-- Maps Clerk user_id (text) to city UUIDs
CREATE TABLE IF NOT EXISTS user_cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, city_id)
);

-- Row Level Security
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cities ENABLE ROW LEVEL SECURITY;

-- Public read so the anon key can read data and Realtime can broadcast
CREATE POLICY "Public read cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read weather" ON weather_readings FOR SELECT USING (true);

-- user_cities: all mutations go through API routes that use the service role key,
-- which bypasses RLS entirely — no client-side policies needed.

-- Enable Realtime on weather_readings
ALTER PUBLICATION supabase_realtime ADD TABLE weather_readings;
