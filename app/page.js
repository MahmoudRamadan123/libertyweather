'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { useWeather } from './hooks/useWeather';
import { useHolidays } from './hooks/useHolidays';
import useSkyTime from './hooks/useSkyTime';
import { useUSSunTimes } from './hooks/useUSSunTimes';


import dynamic from 'next/dynamic';

const Header = dynamic(() => import("./components/Header"), {
  ssr: false,
});

const Cards = dynamic(() => import("./components/Cards"), {
  ssr: false,
});

const Footer = dynamic(() => import("./components/Footer"), {
  ssr: false,
});

const SearchModal = dynamic(() => import("./components/SearchModal"), {
  ssr: false,
});

const Mascot = dynamic(() => import("./components/Mascot"), {
  ssr: false,
});

const HourlyForecast = dynamic(() => import("./components/HourlyForecast"), {
  ssr: false,
});

const CelestialBody = dynamic(() => import("./components/CelestialBody"), {
  ssr: false,
});

const WeatherAlert = dynamic(() => import("./components/WeatherAlert"), {
  ssr: false,
  loading: () => null,
});


// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export default function Page() {
  const [cityName, setCityName] = useState('New York');
  const [MascotCity, setMascotCity] = useState('New York');
  const [searchOpen, setSearchOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [colorBg, setColorBg] = useState('rgb(30 33 26)');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadedSections, setLoadedSections] = useState({
    weather: false,
    sunTimes: false,
    holidays: false,
    alerts: false
  });

  // Debounce city changes to prevent rapid API calls
  const debouncedCityName = useDebounce(cityName, 500);
  
  // Get current time and sky gradient (always available)
  const { currentTime, timeOfDay, skyGradient } = useSkyTime();
  
  // Load weather data with loading state
  const { 
    weatherData, 
    latAndLon, 
    summary, 
    animationType, 
    handleLocationSearch,
    isLoading: weatherLoading 
  } = useWeather({ 
    location: debouncedCityName,
    setLocation: setCityName
  });

  // Load sun times with loading state
  const { 
    sunrise, 
    sunset, 
    isLoading: sunTimesLoading,
    error: sunTimesError
  } = useUSSunTimes(debouncedCityName);

  // Load holidays with loading state
  const { 
    isHolidayToday, 
    mascotVideoUrl, 
    holidayColors,
    isLoading: holidaysLoading 
  } = useHolidays();

  // Memoize sunTimes to prevent unnecessary recalculations
  const sunTimes = useMemo(() => ({
    sunrise: sunrise || '07:00',
    sunset: sunset || '19:00',
    isLoading: sunTimesLoading,
    error: sunTimesError
  }), [sunrise, sunset, sunTimesLoading, sunTimesError]);

  // Memoize display values
  const memoizedDisplayValues = useMemo(() => ({
    temperature: weatherData?.temperature || '—',
    condition: weatherData?.condition || animationType?.toUpperCase() || '—',
    summary: summary || (
      timeOfDay === 'night' 
        ? 'A peaceful night with clear skies' 
        : "It's sunny with a gentle breeze — perfect weather!"
    )
  }), [weatherData, animationType, summary, timeOfDay]);

  // Load all data in parallel
  useEffect(() => {
    if (!debouncedCityName) return;
    
    setLoadingAll(true);
    
    // Track loading states
    const loadPromises = [
      "/mascots/all/",
      "/api/Boston/",
      "/api/Chicago/",
      "/api/Los Angeles/",
      "/api/New York/",
      "/api/San Francisco/",
      "/api/Las Vegas/",
      "/api/Philadelphia/",
      "/api/sehel/",
      "/api/suburub/"
    ];
    
    // Weather data will load via its own effect
     loadPromises.push(new Promise((resolve) => {
      const checkWeatherLoaded = () => {
        if (!weatherLoading) {
          resolve();
        }
        else {
          setTimeout(checkWeatherLoaded, 100);
        }
      };
      checkWeatherLoaded();
    }));
    // We'll track it separately
    setLoadedSections(prev => ({ ...prev, weather: false }));
    
    // Set up loading timeout to show something even if some APIs fail
    const loadingTimeout = setTimeout(() => {
      setLoadingAll(false);
    }, 5000); // Max 5 seconds loading time
    
    return () => clearTimeout(loadingTimeout);
  }, [debouncedCityName]);

  // Update loaded sections as data comes in
  useEffect(() => {
    if (!weatherLoading && weatherData) {
      setLoadedSections(prev => ({ ...prev, weather: true }));
    }
  }, [weatherLoading, weatherData]);

  useEffect(() => {
    if (!sunTimesLoading && sunTimes.sunrise) {
      setLoadedSections(prev => ({ ...prev, sunTimes: true }));
    }
  }, [sunTimesLoading, sunTimes.sunrise]);

  useEffect(() => {
    if (!holidaysLoading) {
      setLoadedSections(prev => ({ ...prev, holidays: true }));
      // Holidays are not critical, so we don't wait for them
      setLoadingAll(prev => prev && false);
    }
  }, [holidaysLoading]);

  // Set background color based on animation type
  useEffect(() => {
    if (!animationType) return;
    
    const colorMap = {
      'sunny': 'rgb(30 33 26)',
      'clear': 'rgb(30 33 26)',
      'snowy': 'rgb(35 42 52)',
      'rainy': 'rgb(32 40 55)',
      'stormy': 'rgb(22 28 38)',
      'thunderstorm': 'rgb(22 28 38)',
      'cloudy': 'rgb(45 50 60)',
      'overcast': 'rgb(45 50 60)'
    };
    
    setColorBg(colorMap[animationType] || 'rgb(30 33 26)');
  }, [animationType]);

  // Fetch NWS Alerts (loads independently)
  useEffect(() => {
    if (!latAndLon?.lat || !latAndLon?.lon) return;
    
    let mounted = true;
    
    const fetchAlerts = async () => {
      try {
        const lat = latAndLon.lat;
        const lon = latAndLon.lon;
        const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
          signal: AbortSignal.timeout(3000) // Reduced to 3 seconds
        }).catch(() => null);
        
        if (!res?.ok) return;
        
        const data = await res.json();
        if (mounted && data?.features?.length) {
          const activeAlerts = data.features.map((f) => ({
            id: f.id,
            event: f.properties.event,
            headline: f.properties.headline,
            description: f.properties.description,
            instruction: f.properties.instruction,
            start: f.properties.effective,
            end: f.properties.expires,
          }));
          setAlerts(activeAlerts);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        // Silently fail - alerts are non-critical
        console.error('Failed to fetch alerts', err);
      } finally {
        if (mounted) {
          setLoadedSections(prev => ({ ...prev, alerts: true }));
        }
      }
    };

    fetchAlerts();
    
    return () => {
      mounted = false;
    };
  }, [latAndLon?.lat, latAndLon?.lon]);

  // Handle city change from search
  const handleCityChange = useCallback((city) => {
    setCityName(city);
    setMascotCity(city);
    // Reset loading states
    setLoadedSections({
      weather: false,
      sunTimes: false,
      holidays: false,
      alerts: false
    });
  }, []);

  // Determine if all critical sections are loaded
  const criticalSectionsLoaded = useMemo(() => {
    return loadedSections.weather && loadedSections.sunTimes;
  }, [loadedSections]);

  // Performance monitoring
  useEffect(() => {
    performance.mark('page-load-start');
    
    return () => {
      performance.mark('page-load-end');
      performance.measure('page-load', 'page-load-start', 'page-load-end');
    };
  }, []);



  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: colorBg }}>
      {/* Critical CSS */}
      <style jsx global>{`
        .skeleton {
          background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 0.375rem;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex flex-col fade-in" style={{ background: skyGradient }}>
        <Header
          setSearchOpen={setSearchOpen}
          isHolidayToday={isHolidayToday}
          holidayColors={holidayColors}
          isLoading={holidaysLoading}
        />

        <CelestialBody
          sunTimes={sunTimes}
          currentTime={currentTime}
          isHolidayToday={isHolidayToday}
          holidayColors={holidayColors}
          isLoading={!loadedSections.sunTimes}
        />

        <div className="relative flex-1 flex items-center justify-center">
          <div className="absolute top-18 w-full z-20 flex items-center justify-between px-4">
            <h1
              className="text-white text-[43px] lg:text-[52px] font-bold transition-opacity duration-300"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.45)',
                opacity: loadedSections.weather ? 1 : 0.6
              }}
            >
              {memoizedDisplayValues.temperature}°C | {memoizedDisplayValues.condition}
            </h1>

           
          </div>

          <div className="z-10 w-full">
            <Mascot
              isHolidayToday={isHolidayToday}
              mascotVideoUrl={mascotVideoUrl}
              animationType={animationType}
              cityName={MascotCity}
              timeOfDay={timeOfDay}
              isLoading={!criticalSectionsLoaded}
            />
          </div>

          {/* Bottom fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-full z-10"
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0) 40%, ${colorBg} 90%)` }}
          />

          {/* Quote */}
          <div className="absolute bottom-0 z-20 px-4 w-full">
            <div
              className="mx-auto max-w-[520px] px-4 py-3 shadow-md transition-opacity duration-300 fade-in"
              style={{
                background: timeOfDay === 'night' ? 'rgb(150,150,180)' : 'rgb(198,184,154)',
                opacity: loadedSections.weather ? 1 : 0.7
              }}
            >
              <p className="text-center italic text-sm text-black">
                "{memoizedDisplayValues.summary}"
              </p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast - loads independently */}
        <div className="px-2 py-0 lg:pt-7 relative z-[10]" style={{ background: colorBg }}>
          <Suspense fallback={
            <div className="h-24 flex items-center justify-center">
              <div className="skeleton h-20 w-full max-w-4xl"></div>
            </div>
          }>
            <HourlyForecast cityName={cityName} />
          </Suspense>
        </div>

        {/* Scroll indicator - show when critical content is loaded */}
        {criticalSectionsLoaded && (
          <div className="flex flex-col items-center py-3 text-xs text-white/60 transition-opacity duration-300 fade-in" style={{ background: colorBg }}>
            <span>SCROLL FOR MORE</span>
            <span className="text-lg">⌄</span>
          </div>
        )}
      </section>

      {/* Cards section - loads independently */}
      <Suspense fallback={
        <div className="h-64 flex items-center justify-center" style={{ background: colorBg }}>
          <div className="skeleton h-48 w-full max-w-6xl"></div>
        </div>
      }>
        <Cards colorBg={colorBg} />
      </Suspense>

      {/* Footer */}
      <Footer
        isHolidayToday={isHolidayToday}
        holidayColors={holidayColors}
        email={email}
        setEmail={setEmail}
        subscribed={subscribed}
      />

      {/* Weather Alert - loads independently */}
      {latAndLon?.lat && latAndLon?.lon && alerts.length > 0 && (
        <Suspense fallback={null}>
          <WeatherAlert
            lat={latAndLon.lat}
            lon={latAndLon.lon}
          />
        </Suspense>
      )}

      <SearchModal
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        handleLocationSearch={handleLocationSearch}
        setCityName={handleCityChange}
        setMascotCity={setMascotCity}
      />
    </div>
  );
}