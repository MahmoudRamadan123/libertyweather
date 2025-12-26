import { useEffect, useState } from 'react';

async function fetchSunTimes(lat, lon) {
  try {
    const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
    const data = await res.json();
    return {
      sunrise: new Date(data.results.sunrise),
      sunset: new Date(data.results.sunset),
    };
  } catch (error) {
    console.error('Error fetching sun times:', error);
    // Fallback: calculate approximate sun times based on date
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 30, 0, 0);
    const sunset = new Date(now);
    sunset.setHours(18, 30, 0, 0);
    return { sunrise, sunset };
  }
}

export function useUSSunTimes(cityName) {
  const [sunTimes, setSunTimes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cityName) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1️⃣ Geocode
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`,
          { signal: controller.signal }
        );
        const geo = await geoRes.json();
        if (!isMounted) return;
        
        if (!geo?.length) {
          setError('City not found');
          setIsLoading(false);
          return;
        }
        
        const { lat, lon } = geo[0];
        
        // Try to get accurate sun times from sunrise-sunset API first
        try {
          const fetchedSunTimes = await fetchSunTimes(lat, lon);
          if (isMounted) {
            setSunTimes(fetchedSunTimes);
            setIsLoading(false);
          }
          return;
        } catch (sunError) {
          console.log('Fallback to NWS API for sun times');
        }

        // Fallback: 2️⃣ NWS Point (if sunrise-sunset API fails)
        try {
          const pointRes = await fetch(
            `https://api.weather.gov/points/${lat},${lon}`,
            { 
              headers: { 'User-Agent': 'LibertyHail (hani@libertyhail.com)' },
              signal: controller.signal 
            }
          );
          const point = await pointRes.json();
          
          if (point?.properties?.forecast) {
            // 3️⃣ Forecast (contains sunrise/sunset)
            const forecastRes = await fetch(point.properties.forecast, {
              headers: { 'User-Agent': 'LibertyHail (hani@libertyhail.com)' },
              signal: controller.signal
            });
            const forecast = await forecastRes.json();
            
            const today = forecast.properties.periods.find((p) => p.isDaytime);
            
            // If NWS doesn't provide exact times, calculate approximate times
            if (isMounted) {
              const now = new Date();
              const sunrise = today?.startTime ? new Date(today.startTime) : new Date(now);
              const sunset = today?.endTime ? new Date(today.endTime) : new Date(now);
              
              // Adjust to approximate times if NWS doesn't provide exact
              sunrise.setHours(6, 30, 0, 0);
              sunset.setHours(18, 30, 0, 0);
              
              setSunTimes({ sunrise, sunset });
            }
          }
        } catch (nwsError) {
          // Final fallback: generic times
          if (isMounted) {
            const now = new Date();
            const sunrise = new Date(now);
            sunrise.setHours(6, 30, 0, 0);
            const sunset = new Date(now);
            sunset.setHours(18, 30, 0, 0);
            setSunTimes({ sunrise, sunset });
            setError('Using approximate sun times');
          }
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          console.error('Error in useUSSunTimes:', err);
          setError('Failed to load sun times');
          
          // Always provide some fallback times
          const now = new Date();
          const sunrise = new Date(now);
          sunrise.setHours(6, 30, 0, 0);
          const sunset = new Date(now);
          sunset.setHours(18, 30, 0, 0);
          setSunTimes({ sunrise, sunset });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [cityName]);

  // Always return an object with the expected structure
  const safeSunTimes = sunTimes || (() => {
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 30, 0, 0);
    const sunset = new Date(now);
    sunset.setHours(18, 30, 0, 0);
    return { sunrise, sunset };
  })();

  return {
    sunrise: safeSunTimes.sunrise,
    sunset: safeSunTimes.sunset,
    isLoading,
    error
  };
}