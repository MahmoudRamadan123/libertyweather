'use client';

import { useEffect, useState } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  MoonStar,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
} from 'lucide-react';

/* ---------------- ICON MAPPING ---------------- */
const getWeatherIcon = (shortForecast = '') => {
  const f = shortForecast.toLowerCase();
  
  if (f.includes('sun') || f.includes('clear')) return Sun;
  if (f.includes('overcast') || f.includes('cloud')) return Cloud;
  if (f.includes('drizzle')) return CloudDrizzle;
  if (f.includes('rain') || f.includes('shower')) return CloudRain;
  if (f.includes('snow') || f.includes('sleet') || f.includes('hail')) return CloudSnow;
  if (f.includes('thunder') || f.includes('storm')) return CloudLightning;
  if (f.includes('fog') || f.includes('mist') || f.includes('haze')) return CloudFog;

  return MoonStar;
};

/* ---------------- HELPERS ---------------- */
const formatHour = (isoTime) =>
  new Date(isoTime).toLocaleTimeString([], {
    hour: 'numeric',
    hour12: true,
  });

const fahrenheitToC = (f) => Math.round(((f - 32) * 5) / 9);

/* ---------------- MOCK DATA GENERATOR ---------------- */
const generateMockHours = () => {
  const now = new Date();
  const mockHours = [];
  
  const mockTemps = [22, 21, 20, 19, 18, 17, 16, 15, 14, 15, 16, 17];
  const mockIcons = [Sun, Cloud, CloudRain, Cloud, MoonStar, Cloud, CloudFog, MoonStar, Cloud, Sun, Cloud, MoonStar];
  const mockTimes = ['Now', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM', '10PM', '11PM'];
  
  for (let i = 0; i < 12; i++) {
    mockHours.push({
      time: mockTimes[i],
      temp: mockTemps[i] || 18,
      Icon: mockIcons[i] || Cloud,
      shortForecast: 'Loading...',
      isMock: true
    });
  }
  
  return mockHours;
};

/* ---------------- COMPONENT ---------------- */
export default function HourlyForecast({ cityName }) {
  const [hours, setHours] = useState(generateMockHours());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cityName) {
      // Show mock hours when no city is provided
      setHours(generateMockHours());
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      
      // Show mock hours immediately while loading
      setHours(generateMockHours());

      try {
        /* 1️⃣ Geocode city */
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
        );
        const geo = await geoRes.json();
        console.log('Geocode result:', geo);
        if (!geo?.length) throw new Error('City not found');

        const { lat, lon } = geo[0];

        /* 2️⃣ NWS Point metadata */
        const pointRes = await fetch(
          `https://api.weather.gov/points/${lat},${lon}`,
          { headers: { 'User-Agent': 'LibertyWeather/1.0 (contact@libertyhail.com)' } }
        );
        const point = await pointRes.json();

        const hourlyUrl = point?.properties?.forecastHourly;
        const stationsUrl = point?.properties?.observationStations;

        if (!hourlyUrl) throw new Error('Hourly forecast unavailable');

        /* 3️⃣ Hourly forecast */
        const forecastRes = await fetch(hourlyUrl, {
          headers: { 'User-Agent': 'LibertyWeather/1.0 (contact@libertyhail.com)' },
        });
        const forecast = await forecastRes.json();

        const periods = forecast?.properties?.periods ?? [];
        if (!periods.length) throw new Error('No forecast data');

        /* 4️⃣ Latest observation (real now temp) */
        let realNowTemp = null;

        if (stationsUrl) {
          try {
            const stationsRes = await fetch(stationsUrl, {
              headers: { 'User-Agent': 'LibertyWeather/1.0' },
            });
            const stations = await stationsRes.json();
            const station = stations?.features?.[0]?.id;

            if (station) {
              const obsRes = await fetch(
                `${station}/observations/latest`,
                { headers: { 'User-Agent': 'LibertyWeather/1.0' } }
              );
              if (obsRes.ok) {
                const obs = await obsRes.json();
                realNowTemp = obs?.properties?.temperature?.value;
                if (realNowTemp !== null) {
                  realNowTemp = Math.round(realNowTemp); // already °C
                }
              }
            }
          } catch {
            /* silent fallback */
          }
        }

        /* 5️⃣ Align forecast with REAL current hour */
        const now = new Date();

        const startIndex = periods.findIndex(
          (p) => new Date(p.startTime) >= now
        );

        const sliceStart = startIndex >= 0 ? startIndex : 0;

        const next12 = periods.slice(sliceStart, sliceStart + 24);

        const finalHours = next12.map((p, idx) => ({
          time: idx === 0 ? 'Now' : formatHour(p.startTime),
          temp:
            idx === 0 && realNowTemp !== null
              ? realNowTemp
              : fahrenheitToC(p.temperature),
          Icon: getWeatherIcon(p.shortForecast),
          shortForecast: p.shortForecast,
          isMock: false
        }));

        setHours(finalHours);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load weather');
        // Keep showing mock hours on error (they're already showing)
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [cityName]);

  /* ---------------- UI ---------------- */
  // Always show the hours (mock during loading, real after loading)
  return (
    <div className="w-full text-white py-6 px-4 lg:py-0">

      
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {hours.map((h, i) => {
          const Icon = h.Icon;
          return (
            <div
              key={i}
              className={`flex flex-col items-center min-w-[64px] ${
                h.isMock ? 'opacity-70' : ''
              }`}
            >
              <p className="text-sm opacity-80">{h.time}</p>
              <Icon className="h-6 w-6 mt-2" />
              <p className="text-lg font-semibold mt-2">{h.temp}°C</p>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}