'use client';

import { useEffect, useState, useCallback } from 'react';

// Cache for sun times
const sunTimesCache = new Map();
const SUN_TIMES_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Fast calculation of sunrise/sunset (approximation)
const calculateSunTime = (lat, date, isSunrise = true) => {
  const now = new Date(date);
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Simplified calculation based on latitude and day of year
  const latRad = lat * Math.PI / 180;
  const declination = 23.44 * Math.PI / 180 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365);
  
  // Hour angle approximation
  const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(declination));
  
  // Convert to hours
  const hour = isSunrise 
    ? 12 - hourAngle * 180 / (Math.PI * 15)
    : 12 + hourAngle * 180 / (Math.PI * 15);
  
  now.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
  return now;
};

// Fast API endpoint for sun times
const fetchSunTimesFromAPI = async (lat, lon) => {
  try {
    // Use a faster API with CORS support
    const res = await fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&formatted=0`, {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    
    if (!res.ok) throw new Error('API failed');
    
    const data = await res.json();
    if (data.status === 'OK') {
      return {
        sunrise: new Date(data.results.sunrise),
        sunset: new Date(data.results.sunset)
      };
    }
  } catch (error) {
    console.log('Sun times API failed, using calculation');
  }
  return null;
};

export function useUSSunTimes(cityName) {
  const [sunTimes, setSunTimes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithFallback = useCallback(async (lat, lon, cacheKey) => {
    // Try API first
    const apiResult = await fetchSunTimesFromAPI(lat, lon);
    if (apiResult) {
      return apiResult;
    }
    
    // Fallback to calculation
    const now = new Date();
    const calculated = {
      sunrise: calculateSunTime(lat, now, true),
      sunset: calculateSunTime(lat, now, false)
    };
    
    setError('Using approximate sun times');
    return calculated;
  }, []);

  useEffect(() => {
    if (!cityName) {
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = cityName.toLowerCase();
    const cached = sunTimesCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < SUN_TIMES_CACHE_DURATION) {
      setSunTimes(cached.data);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fast geocoding with OpenStreetMap
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&addressdetails=1`,
          { 
            signal: controller.signal,
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'WeatherApp/1.0'
            }
          }
        );
        
        if (!isMounted) return;
        
        const geo = await geoRes.json();
        if (!geo?.length) {
          setError('City not found');
          setIsLoading(false);
          return;
        }
        
        const { lat, lon } = geo[0];
        
        // Get sun times with fallback
        const fetchedSunTimes = await fetchWithFallback(lat, lon, cacheKey);
        
        if (isMounted && fetchedSunTimes) {
          // Cache the result
          sunTimesCache.set(cacheKey, {
            data: fetchedSunTimes,
            timestamp: Date.now()
          });
          
          setSunTimes(fetchedSunTimes);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          console.error('Error in useUSSunTimes:', err);
          
          // Ultimate fallback
          const now = new Date();
          const fallback = {
            sunrise: new Date(now.setHours(6, 30, 0, 0)),
            sunset: new Date(now.setHours(18, 30, 0, 0))
          };
          
          sunTimesCache.set(cacheKey, {
            data: fallback,
            timestamp: Date.now()
          });
          
          setSunTimes(fallback);
          setError('Using fallback times');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Small delay to avoid request waterfall
    const timer = setTimeout(() => {
      load();
    }, 100);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [cityName, fetchWithFallback]);

  // Always return valid times
  const safeSunTimes = sunTimes || (() => {
    const now = new Date();
    return {
      sunrise: new Date(now.setHours(6, 30, 0, 0)),
      sunset: new Date(now.setHours(18, 30, 0, 0))
    };
  })();

  return {
    sunrise: safeSunTimes.sunrise,
    sunset: safeSunTimes.sunset,
    isLoading,
    error
  };
}