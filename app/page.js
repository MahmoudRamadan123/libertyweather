'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useWeather } from './hooks/useWeather';
import { useHolidays } from './hooks/useHolidays';
import useSkyTime from './hooks/useSkyTime';
import { useUSSunTimes } from './hooks/useUSSunTimes';

import Header from './components/Header';
import Cards from './components/Cards';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import Mascot from './components/Mascot';
import HourlyForecast from './components/HourlyForecast';
import CelestialBody from './components/CelestialBody';
import dynamic from 'next/dynamic';

// Dynamically import WeatherAlert with loading fallback
const WeatherAlert = dynamic(() => import('./components/WeatherAlert'), {
  ssr: false,
  loading: () => (
    <div className="p-3 rounded-full bg-gray-700 animate-pulse">
      <div className="h-6 w-6"></div>
    </div>
  )
});

export default function Page() {
  const [cityName, setCityName] = useState('New York');
  const [MascotCity, setMascotCity] = useState('New York');
  const [searchOpen, setSearchOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [colorBg, setColorBg] = useState('rgb(30 33 26)');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loadedSections, setLoadedSections] = useState({
    weather: false,
    sunTimes: false,
    holidays: false,
    alerts: false
  });

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
    location: cityName,
    setLocation: setCityName
  });

  // Load sun times with loading state
  const { 
    sunrise, 
    sunset, 
    isLoading: sunTimesLoading,
    error: sunTimesError,

  } = useUSSunTimes(cityName);

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
    console.log('Latitude and Longitude changed:', latAndLon);
    if (!latAndLon?.lat || !latAndLon?.lon) return;
    
    let mounted = true;
    
    const fetchAlerts = async () => {
      try {
        const lat = latAndLon.lat;
        const lon = latAndLon.lon;
        console.log('Fetching alerts for:', lat, lon);
        const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
          signal: AbortSignal.timeout(5000) // 5 second timeout
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
        }
        else{
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

  // Handle city change from search - this is now the only place we update cityName
  const handleCityChange = (city) => {
    setCityName(city);
    setMascotCity(city);
    // Reset loading states
    setLoadedSections({
      weather: false,
      sunTimes: false,
      holidays: false,
      alerts: false
    });
  };


  // Determine if all critical sections are loaded
  const allSectionsLoaded = useMemo(() => {
    return loadedSections.weather && loadedSections.sunTimes;
  }, [loadedSections]);

  // Get display values with fallbacks
  const displayTemperature = weatherData?.temperature || '—';
  const displayCondition = weatherData?.condition || animationType?.toUpperCase() || '—';
  const displaySummary = summary || (
    timeOfDay === 'night' 
      ? 'A peaceful night with clear skies' 
      : "It's sunny with a gentle breeze — perfect weather!"
  );
  if (!allSectionsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4">
        <div className="text-white text-lg animate-pulse">Loading weather data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: colorBg }}>
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex flex-col" style={{ background: skyGradient }}>
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
              {displayTemperature}°C | {displayCondition}
            </h1>


          </div>

          <div className="z-10 w-full">
            <Mascot
              isHolidayToday={isHolidayToday}
              mascotVideoUrl={mascotVideoUrl}
              animationType={animationType}
              cityName={MascotCity}
              timeOfDay={timeOfDay}
              isLoading={!allSectionsLoaded}
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
              className="mx-auto max-w-[520px] px-4 py-3 shadow-md transition-opacity duration-300"
              style={{
                background: timeOfDay === 'night' ? 'rgb(150,150,180)' : 'rgb(198,184,154)',
                opacity: loadedSections.weather ? 1 : 0.7
              }}
            >
              <p className="text-center italic text-sm text-black">
                "{displaySummary}"
              </p>
            </div>
          </div>
        </div>

        {/* Hourly Forecast - loads independently */}
        <div className="px-2 py-0 lg:pt-7 relative z-[10]" style={{ background: colorBg }}>
          <Suspense fallback={
            <div className="h-24 flex items-center justify-center">
              <div className="text-white/60">Loading forecast...</div>
            </div>
          }>
            <HourlyForecast cityName={cityName} />
          </Suspense>
        </div>

        {/* Scroll indicator - only show when main content is loaded */}
        {allSectionsLoaded && (
          <div className="flex flex-col items-center py-3 text-xs text-white/60 transition-opacity duration-300" style={{ background: colorBg }}>
            <span>SCROLL FOR MORE</span>
            <span className="text-lg">⌄</span>
          </div>
        )}
      </section>



      {/* Cards section - loads independently */}
      <Suspense fallback={
        <div className="h-64 flex items-center justify-center" style={{ background: colorBg }}>
          <div className="text-white/60">Loading weather details...</div>
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

      {/* Search Modal */}
      <SearchModal
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        setCityName={handleCityChange} // Use the new handler
        handleLocationSearch={handleLocationSearch}
        isHolidayToday={isHolidayToday}
        setMascotCity={setMascotCity}
        holidayColors={holidayColors}
      />
    </div>
  );
}