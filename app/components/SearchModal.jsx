'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mapboxAutocomplete } from '../lib/mapboxGeocode';

// Allowed mascot cities
const ALLOWED_MASCOT_CITIES = [
  'boston',
  'chicago',
  'las vegas',
  'los angeles',
  'new york',
  'philadelphia',
  'san francisco',
  'sehel',
  'suburub',
];

// Helper to resolve mascot city from search result
const resolveMascotCity = (item) => {
  const text = `${item.city || ''} ${item.state || ''} ${item.label || ''}`.toLowerCase();
  
  // Special cases
  if (text.includes('sehel')) return 'Sehel';
  if (text.includes('suburub')) return 'Suburub';
  
  // Major US cities
  const majorCities = [
    'boston', 'chicago', 'las vegas', 'los angeles', 
    'new york', 'philadelphia', 'san francisco'
  ];
  
  const match = majorCities.find(city => text.includes(city));
  
  if (match) {
    return match.replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Default for all other cities
  return 'new york';
};
export default function SearchModal({
  searchOpen,
  setSearchOpen,
  handleLocationSearch,
  setCityName,
  setMascotCity
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      const data = await mapboxAutocomplete(query);
      setResults(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  if (!searchOpen) return null;

  const handleSelect = (item) => {
    handleLocationSearch({
      lat: item.lat,
      lon: item.lon,
    });

    // Call setCityName with the city name (this will trigger handleCityChange in parent)
    setCityName(item.city);
    
    // Mascot city restricted
    const mascotCity = resolveMascotCity(item);
    setMascotCity(mascotCity);

    setSearchOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="rounded-3xl max-w-md w-full p-8 bg-[#0e1f39]">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Change Location</h3>
          <button onClick={() => setSearchOpen(false)} className="text-gray-400">✕</button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or state..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 text-white"
          />
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading && <p className="text-white/50 px-2">Searching…</p>}

          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-3 rounded-xl text-white hover:bg-white/10 transition"
            >
              <div className="font-medium">{item.city}</div>
              <div className="text-sm text-white/60">{item.state}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}