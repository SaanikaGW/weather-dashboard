const WEATHER_CODES = {
  0:  { label: 'Clear Sky',        emoji: '☀️' },
  1:  { label: 'Mainly Clear',     emoji: '🌤️' },
  2:  { label: 'Partly Cloudy',    emoji: '⛅' },
  3:  { label: 'Overcast',         emoji: '☁️' },
  45: { label: 'Fog',              emoji: '🌫️' },
  48: { label: 'Icy Fog',          emoji: '🌫️' },
  51: { label: 'Light Drizzle',    emoji: '🌦️' },
  53: { label: 'Drizzle',          emoji: '🌦️' },
  55: { label: 'Heavy Drizzle',    emoji: '🌧️' },
  61: { label: 'Light Rain',       emoji: '🌧️' },
  63: { label: 'Moderate Rain',    emoji: '🌧️' },
  65: { label: 'Heavy Rain',       emoji: '🌧️' },
  71: { label: 'Light Snow',       emoji: '🌨️' },
  73: { label: 'Moderate Snow',    emoji: '❄️' },
  75: { label: 'Heavy Snow',       emoji: '❄️' },
  77: { label: 'Snow Grains',      emoji: '🌨️' },
  80: { label: 'Rain Showers',     emoji: '🌦️' },
  81: { label: 'Heavy Showers',    emoji: '🌧️' },
  82: { label: 'Violent Showers',  emoji: '⛈️' },
  85: { label: 'Snow Showers',     emoji: '🌨️' },
  86: { label: 'Heavy Snow',       emoji: '❄️' },
  95: { label: 'Thunderstorm',     emoji: '⛈️' },
  96: { label: 'Thunderstorm',     emoji: '⛈️' },
  99: { label: 'Thunderstorm',     emoji: '⛈️' },
}

export function getWeatherInfo(code) {
  return WEATHER_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' }
}

export function formatTemp(temp) {
  if (temp == null) return '--'
  return `${Math.round(temp)}°C`
}

export function formatTime(isoString) {
  if (!isoString) return 'never'
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
