'use client'
import { useState, useRef, useEffect } from 'react'

export default function CitySearch({ onAdd, existingOpenmeteoIds }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)

    if (val.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/cities/search?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setResults(data)
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  async function handleSelect(result) {
    setOpen(false)
    setQuery('')
    setResults([])
    await onAdd({
      name: result.name,
      country: result.country,
      country_code: result.country_code,
      latitude: result.latitude,
      longitude: result.longitude,
      openmeteo_id: result.id,
    })
  }

  return (
    <div ref={wrapperRef} className="relative w-72">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search for a city..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm animate-spin">↻</span>
        )}
      </div>

      {open && (
        <ul className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-lg mt-1 overflow-hidden">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">No cities found for "{query}"</li>
          ) : (
            results.map((r) => {
              const alreadyAdded = existingOpenmeteoIds.includes(r.id)
              return (
                <li key={r.id}>
                  <button
                    onClick={() => !alreadyAdded && handleSelect(r)}
                    disabled={alreadyAdded}
                    className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center transition ${
                      alreadyAdded
                        ? 'opacity-40 cursor-default'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                  >
                    <span>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-gray-400 ml-1">{r.country}</span>
                    </span>
                    {alreadyAdded && <span className="text-xs text-gray-400">Added</span>}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
