'use client'
import { getWeatherInfo, formatTemp, formatTime } from '../utils/weather'

export default function WeatherCard({ city, weather, onRemove, unit = 'C' }) {
  const info = weather ? getWeatherInfo(weather.weather_code) : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative group">
      <button
        onClick={() => onRemove(city.id)}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition text-xl leading-none opacity-0 group-hover:opacity-100"
        title="Remove city"
      >
        ×
      </button>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{city.name}</h2>
          <p className="text-sm text-gray-400">{city.country}</p>
        </div>
        <span className="text-4xl">{info?.emoji ?? '🌡️'}</span>
      </div>

      {weather ? (
        <>
          <p className="text-5xl font-bold text-gray-900 mb-1">{formatTemp(weather.temperature_c, unit)}</p>
          <p className="text-gray-500 mb-5">{info?.label}</p>

          <div className="grid grid-cols-3 gap-2 text-sm border-t border-gray-50 pt-4">
            <div>
              <p className="font-semibold text-gray-800">{formatTemp(weather.feels_like_c, unit)}</p>
              <p className="text-gray-400">Feels like</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{weather.humidity ?? '--'}%</p>
              <p className="text-gray-400">Humidity</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {weather.wind_speed != null ? `${Math.round(weather.wind_speed)} km/h` : '--'}
              </p>
              <p className="text-gray-400">Wind</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 mt-4">
            Last polled {formatTime(weather.updated_at)}
            {new Date() - new Date(weather.updated_at) > 10 * 60 * 1000 && (
              <span className="ml-1 text-amber-400" title="Worker may be delayed">⚠</span>
            )}
          </p>
        </>
      ) : (
        <p className="text-gray-400 text-sm mt-2">Waiting for first weather reading...</p>
      )}
    </div>
  )
}
