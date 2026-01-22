'use client';

import { useState, useEffect } from 'react';

/* ======================================================
   CONSTANTS
====================================================== */

const WEATHER_HEADERS = {
  'User-Agent': 'LibertyHail (hani@libertyhail.com)',
  Accept: 'application/geo+json',
};

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;

/* ======================================================
   IMPROVED IN-MEMORY AI CACHE
====================================================== */

// Create a singleton cache instance
const createCache = () => {
  const cache = new Map();
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  return {
    get: (key) => {
      const cached = cache.get(key);
      if (!cached) return null;

      // Check if cache is expired
      if (Date.now() - cached.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
      }
      
      return cached.data;
    },
    
    set: (key, data) => {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    },
    
    // Optional: Clear expired entries periodically
    cleanup: () => {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }
  };
};

const aiCache = createCache();

/* ======================================================
   MAPBOX GEOCODING
====================================================== */

const geocodeLocation = async (query) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  // Normalize query for consistent caching
  const normalizedQuery = query.trim().toLowerCase();

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      normalizedQuery
    )}.json?types=place,region&country=US&limit=1&access_token=${token}`
  );

  const data = await res.json();
  if (!data.features?.length) return null;

  const feature = data.features[0];

  return {
    lat: feature.center[1],
    lon: feature.center[0],
    label: feature.place_name,
    // Add normalized label for consistent caching
    normalizedLabel: normalizedQuery
  };
};

/* ======================================================
   WEATHER.GOV FORECAST + REAL OBSERVATION
====================================================== */

const getWeatherGovForecast = async (lat, lon) => {
  const pointsRes = await fetch(
    `https://api.weather.gov/points/${lat},${lon}`,
    { headers: WEATHER_HEADERS }
  );

  if (!pointsRes.ok) throw new Error('Failed to load NWS points');

  const pointsData = await pointsRes.json();
  const hourlyUrl = pointsData.properties.forecastHourly;
  const stationsUrl = pointsData.properties.observationStations;

  const forecastRes = await fetch(hourlyUrl, {
    headers: WEATHER_HEADERS,
  });

  if (!forecastRes.ok) throw new Error('Failed hourly forecast');

  const forecastData = await forecastRes.json();
  const periods = forecastData.properties.periods;

  let realNowTemp = null;

  try {
    const stationsRes = await fetch(stationsUrl, {
      headers: WEATHER_HEADERS,
    });

    const stations = await stationsRes.json();
    const stationId = stations?.features?.[0]?.id;

    if (stationId) {
      const obsRes = await fetch(
        `${stationId}/observations/latest`,
        { headers: WEATHER_HEADERS }
      );

      if (obsRes.ok) {
        const obs = await obsRes.json();
        const val = obs?.properties?.temperature?.value;
        if (val !== null && !isNaN(val)) {
          realNowTemp = Math.round(val);
        }
      }
    }
  } catch {
    /* silent fallback */
  }

  const now = new Date();

  const currentPeriod =
    periods.find((p) => {
      const start = new Date(p.startTime);
      const end = new Date(p.endTime);
      return now >= start && now <= end;
    }) || periods[0];

  const tempC =
    realNowTemp !== null
      ? realNowTemp
      : Math.round(((currentPeriod.temperature - 32) * 5) / 9);

  return {
    temperature: tempC,
    temperatureUnit: 'C',
    shortForecast: currentPeriod.shortForecast,
    detailedForecast: currentPeriod.detailedForecast,
    windSpeed: currentPeriod.windSpeed,
    windDirection: currentPeriod.windDirection,
    icon: currentPeriod.icon,
    // Add timestamp for caching
    timestamp: now.toISOString(),
    // Add rounded temperature for consistent cache key
    roundedTemp: Math.round(tempC)
  };
};

/* ======================================================
   GEMINI 2-SENTENCE WEATHER SUMMARY
====================================================== */

const generateGeminiSummary = async ({
  city,
  temperature,
  shortForecast,
  windSpeed,
}) => {
  const prompt = `
This keeps your developer’s constraints but improves output quality and variety:
You are a friendly, professional weather assistant.
Write EXACTLY 2 short sentences in clear, natural language.
Sentence 1:
- Briefly describe the current weather
- Suggest what to wear based on temperature and conditions 
Sentence 2:
- Give one practical driving or travel safety tip
- Mention rain, wind, umbrella, or road caution ONLY if conditions require it
Weather data:
Temperature: ${temperature}°C
Condition: ${shortForecast}
Wind: ${windSpeed}
Rules:
- Do not exceed 2 sentences
- Avoid repeating the same phrasing every day
- Keep the tone helpful and calm
Example Output
“Today is sunny with mild temperatures, so light layers and sunglasses are ideal. Enjoy safe driving with clear roads and good visibility.”
or
“Cool and windy conditions today mean a jacket is recommended. Drive carefully as gusty winds may affect vehicle control.”
`;

  const maxRetries = 3;
  const baseDelay = 1000; // Start with 1 second
  
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
            },
          }),
        }
      );

      if (res.status === 429) {
        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limited. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      }

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status}`);
      }

      const data = await res.json();
      console.log('Gemini response data:', data);
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean up the response
      return text.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
            const cacheKey = JSON.stringify({
        condition: shortForecast.toLowerCase(),
        temp: temperature,
        wind: windSpeed
      });

      // Try to get cached summary
      let aiSummary = aiCache.get(cacheKey);
      console.log(aiSummary)
      return aiSummary;
    }
  
};

/* ======================================================
   MAIN HOOK
====================================================== */

export const useWeather = ({ location, setLocation }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [mascotOutfit, setMascotOutfit] = useState('default');
  const [animationType, setAnimationType] = useState('sunny');
  const [latAndLon, setLatAndLon] = useState({ lat: null, lon: null });

  const updateMascotAndAnimation = (temp, forecast) => {
    if (temp >= 27) setMascotOutfit('summer');
    else if (temp >= 16) setMascotOutfit('spring');
    else if (temp >= 4) setMascotOutfit('fall');
    else setMascotOutfit('winter');

    const f = forecast.toLowerCase();
    console.log(f)
    if (f.includes('sun')) setAnimationType('sunny');
    else if(f.includes('clear')) setAnimationType('clear');
    else if (f.includes('cloud')) setAnimationType('cloudy');
    else if (f.includes('rain')) setAnimationType('rainy');
    else if (f.includes('snow') || f.includes('hail')) setAnimationType('snowy');
    else if (f.includes('thunder')) setAnimationType('stormy');
    else setAnimationType('default');
  };

  const handleLocationSearch = async (query) => {
    setLoading(true);

    try {
      const loc = await geocodeLocation(query);
      if (!loc) {
        console.error('Location not found:', query);
        return;
      }

      setLocation(loc.label);

      const forecast = await getWeatherGovForecast(loc.lat, loc.lon);

      setLatAndLon({ lat: loc.lat, lon: loc.lon });
      setWeatherData({ ...forecast, city: loc.label });

      updateMascotAndAnimation(
        forecast.temperature,
        forecast.shortForecast
      );

      // Create a consistent cache key
      const cacheKey = JSON.stringify({
        condition: forecast.shortForecast.toLowerCase(),
        temp: forecast.roundedTemp,
        wind: forecast.windSpeed
      });

      console.log('Cache key:', cacheKey);

      // Try to get cached summary
      let aiSummary = aiCache.get(cacheKey);
      
      if (!aiSummary) {
        console.log('Cache miss, calling Gemini API...');
        aiSummary = await generateGeminiSummary({
          temperature: forecast.temperature,
          shortForecast: forecast.shortForecast,
          windSpeed: forecast.windSpeed,
        });

        // Cache the result
        if (aiSummary) {
          aiCache.set(cacheKey, aiSummary);
          console.log('Cached new summary for key:', cacheKey);
        }
      } else {
        console.log('Cache hit for key:', cacheKey);
      }

      setSummary(aiSummary || '');
    } catch (err) {
      console.error('Error in handleLocationSearch:', err);
      setSummary('Unable to generate weather summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Optional: Clean up cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      aiCache.cleanup();
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location && location.trim()) {
      handleLocationSearch(location);
    }
  }, [location]);

  const getTemperatureColor = (temp) => {
    if (temp >= 27) return 'text-red-600';
    if (temp >= 21) return 'text-orange-600';
    if (temp >= 16) return 'text-yellow-600';
    if (temp >= 10) return 'text-green-600';
    if (temp >= 4) return 'text-blue-600';
    return 'text-indigo-600';
  };

  return {
    weatherData,
    summary,
    location,
    loading,
    mascotOutfit,
    animationType,
    latAndLon,
    setLocation,
    handleLocationSearch,
    getTemperatureColor,
  };
};