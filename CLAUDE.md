# Weather Dashboard

## Architecture

```
Open-Meteo API → Worker (Railway) → Supabase (+ Realtime) → Next.js Frontend (Vercel)
```

## Services

### Background Worker — `apps/worker/`
- Node.js script deployed on Railway
- Polls [Open-Meteo](https://open-meteo.com) every 5 minutes (set via `POLL_INTERVAL_MS`)
- Fetches current weather for every city in the `cities` table
- Upserts results into `weather_readings` using the Supabase **service role key**
- Supabase Realtime fires on each upsert → frontend cards update live

### Database — Supabase
| Table | Purpose |
|---|---|
| `cities` | Master city list with lat/lon and Open-Meteo ID |
| `weather_readings` | One row per city, upserted by worker. Realtime enabled. |
| `user_cities` | Maps Clerk `user_id` (text) to `city_id` (UUID) |

RLS is enabled on all tables:
- `cities` + `weather_readings`: public SELECT (anon key can read; required for Realtime)
- `user_cities`: no client policies — all access goes through API routes that use the service role key

### Frontend — `apps/web/`
- Next.js 14 App Router + Tailwind CSS, deployed on Vercel
- Auth: Clerk (`@clerk/nextjs`)
- API routes (`/api/user-cities`) use service role key for Supabase mutations
- Client subscribes to `weather_readings` via Supabase Realtime (anon key)
- Users search cities via Open-Meteo Geocoding API, add/remove from their dashboard

## Data Flow

1. User signs in via Clerk
2. User searches for a city → `/api/cities/search` → Open-Meteo Geocoding API
3. User adds city → `POST /api/user-cities` → upserts into `cities` + `user_cities`
4. Worker (every 5 min) fetches weather for all cities → upserts `weather_readings`
5. Supabase Realtime event → `WeatherDashboard` updates the matching card instantly

## Environment Variables

### Worker (`apps/worker/.env`)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
POLL_INTERVAL_MS=300000
```

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Setup Steps

1. **Supabase**: Run `supabase/schema.sql` in the SQL editor. Confirm Realtime is enabled on `weather_readings` (Table Editor → Realtime toggle).
2. **Clerk**: Create an app at clerk.com. Copy publishable key + secret key.
3. **Env vars**: Copy `.env.example` → `.env.local` (web) and `.env` (worker). Fill in all values.
4. **Install**: `npm install` from the monorepo root.
5. **Test worker**: `npm run dev:worker` from root — watch the Supabase dashboard for rows appearing.
6. **Test frontend**: `npm run dev:web` — sign up, add cities, confirm live updates.

## Deployment

**Worker → Railway**
- New project → connect GitHub → set root directory to `apps/worker`
- Add env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `POLL_INTERVAL_MS`
- Railway will use the `Dockerfile` in `apps/worker/`

**Frontend → Vercel**
- Import repo → set root directory to `apps/web`
- Add all env vars from `.env.local`
- Deploy
