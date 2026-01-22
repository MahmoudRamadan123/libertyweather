// app/weather/[city]/ClientWeatherPage.js
'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import { useHolidays } from '../../hooks/useHolidays';
import useSkyTime from '../../hooks/useSkyTime';
import { useUSSunTimes } from '../../hooks/useUSSunTimes';
import {
  Cloud,
  Sun,
  Umbrella,
  Thermometer,
  Snowflake,
  Wind,
  Zap,
  Eye,
} from "lucide-react";

import dynamic from 'next/dynamic';

const Header = dynamic(() => import("../../components/Header"), {
  ssr: false,
});

const Cards = dynamic(() => import("../../components/Cards"), {
  ssr: false,
});

const Footer = dynamic(() => import("../../components/Footer"), {
  ssr: false,
});

const SearchModal = dynamic(() => import("../../components/SearchModal"), {
  ssr: false,
});

const Mascot = dynamic(() => import("../../components/Mascot"), {
  ssr: false,
});

const HourlyForecast = dynamic(() => import("../../components/HourlyForecast"), {
  ssr: false,
});

const CelestialBody = dynamic(() => import("../../components/CelestialBody"), {
  ssr: false,
});

const WeatherAlert = dynamic(() => import("../../components/WeatherAlert"), {
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

export default function ClientWeatherPage({ initialCityName }) {
  console.log(initialCityName)
  const [cityName, setCityName] = useState(initialCityName);
  const [MascotCity, setMascotCity] = useState(initialCityName);
  const [searchOpen, setSearchOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [colorBg, setColorBg] = useState('rgb(30 33 26)');
  const [alerts, setAlerts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadedSections, setLoadedSections] = useState({
    weather: false,
    sunTimes: false,
    holidays: false,
    alerts: false
  });

  // Debounce city changes
  const debouncedCityName = useDebounce(cityName, 500);
  
  // Get current time and sky gradient
  const { currentTime, timeOfDay, skyGradient } = useSkyTime();
  
  // Load weather data
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

  // Load sun times
  const { 
    sunrise, 
    sunset, 
    isLoading: sunTimesLoading,
    error: sunTimesError
  } = useUSSunTimes(debouncedCityName);

  // Load holidays
  const { 
    isHolidayToday, 
    mascotVideoUrl, 
    holidayColors,
    isLoading: holidaysLoading 
  } = useHolidays();

  // Memoize values
  const sunTimes = useMemo(() => ({
    sunrise: sunrise || '07:00',
    sunset: sunset || '19:00',
    isLoading: sunTimesLoading,
    error: sunTimesError
  }), [sunrise, sunset, sunTimesLoading, sunTimesError]);

  const memoizedDisplayValues = useMemo(() => ({
    temperature: weatherData?.temperature || 0,
    condition: weatherData?.condition || animationType?.toUpperCase() || '—',
    summary: summary || (
      timeOfDay === 'night' 
        ? 'A peaceful night with clear skies' 
        : "It's sunny with a gentle breeze — perfect weather!"
    )
  }), [weatherData, animationType, summary, timeOfDay]);

  // Set background color
  useEffect(() => {
    if (!animationType) return;

    const colorMap = {
      clear: 'rgb(18 45 90)',
      rainy: 'rgb(16 40 70)',
      sunny: '#e2ab2c',
      heat: 'rgb(120 45 25)',
      snowy: 'rgb(40 60 80)',
      stormy: 'rgb(35 30 60)',
      thunderstorm: 'rgb(25 20 50)',
      cloudy: 'rgb(60 65 75)',
      overcast: 'rgb(50 55 65)',
    };

    setColorBg(colorMap[animationType] || 'rgb(18 45 90)');
  }, [animationType]);

  // Fetch alerts
  useEffect(() => {
    if (!latAndLon?.lat || !latAndLon?.lon) return;
    
    let mounted = true;
    
    const fetchAlerts = async () => {
      try {
        const lat = latAndLon.lat;
        const lon = latAndLon.lon;
        const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
          signal: AbortSignal.timeout(3000)
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

  // Handle city change
  const handleCityChange = useCallback((city) => {
    setCityName(city);
    setMascotCity(city);
    setLoadedSections({
      weather: false,
      sunTimes: false,
      holidays: false,
      alerts: false
    });
  }, []);

  // Check loaded sections
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

  const criticalSectionsLoaded = useMemo(() => {
    return loadedSections.weather && loadedSections.sunTimes;
  }, [loadedSections]);

  const scrollToCards = useCallback(() => {
    const cardsSection = document.querySelector('.cards-section');
    if (cardsSection) {
      cardsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: colorBg }}>
      <style jsx global>{`
        .skeleton { background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 0.375rem; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .scroll-indicator { animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(4px); } 40% { transform: translateY(7px); } 60% { transform: translateY(4px); } }
      `}</style>

      <section className="relative min-h-screen flex flex-col fade-in" style={{ background: skyGradient }}>
        <Header
          setSearchOpen={setSearchOpen}
          isHolidayToday={isHolidayToday}
          holidayColors={holidayColors}
          isLoading={holidaysLoading}
          cityName={cityName}
        />

        <CelestialBody
          sunTimes={sunTimes}
          currentTime={currentTime}
          isHolidayToday={isHolidayToday}
          holidayColors={holidayColors}
          isLoading={!loadedSections.sunTimes}
        />

        <div className="relative flex-1 flex items-center justify-center">
          <div className="absolute top-20 w-full z-20 flex flex-col gap-[2px] px-4 sm:px-6">
            <span className="text-white lg:text-[14px] text-[10px] uppercase tracking-widest" style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.45)",
            }}>
              {cityName} · Right now
            </span>

            <h1
              className="text-white lg:text-[64px] text-[44px] font-bold leading-[1.05]"
              style={{
                textShadow: "0 2px 4px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.45)",
                opacity: loadedSections.weather ? 1 : 0.6,
              }}
            >
              {memoizedDisplayValues.temperature}°C
            </h1>

            <span className="text-white/90 font-medium text-lg">
              {memoizedDisplayValues.condition}
            </span>

            <span className="flex items-center gap-1 text-white text-[13px] lg:text-[15px] mt-3" style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.45)",
            }}>
              {(() => {
                const condition = memoizedDisplayValues.condition.toLowerCase();
                const temp = memoizedDisplayValues.temperature;

                if (condition.includes("thunder")) return (<> <Zap className="w-4 h-4" /> Stay indoors if possible </>);
                if (condition.includes("storm")) return (<> <AlertCircle className="w-4 h-4" /> Avoid travel, secure loose items </>);
                if (condition.includes("rain") || condition.includes("drizzle")) return (<> <Umbrella className="w-4 h-4" /> Take an umbrella </>);
                if (condition.includes("snow")) return (<> <Snowflake className="w-4 h-4" /> Dress warm & watch for ice </>);
                if (condition.includes("sleet") || condition.includes("ice")) return (<> <Snowflake className="w-4 h-4" /> Slippery roads – walk carefully </>);
                if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) return (<> <Eye className="w-4 h-4" /> Low visibility – drive carefully </>);
                if (condition.includes("wind") || condition.includes("breezy")) return (<> <Wind className="w-4 h-4" /> Windy – secure loose items </>);
                if (condition.includes("sun") || condition.includes("clear")) return (<> <Sun className="w-4 h-4" /> Pleasant conditions </>);
                if (condition.includes("cloud") || condition.includes("overcast")) return (<> <Cloud className="w-4 h-4" /> Calm weather – no special prep </>);
                if (temp >= 40) return (<> <Thermometer className="w-4 h-4" /> Extreme heat – avoid outdoor activity </>);
                if (temp >= 35) return (<> <Thermometer className="w-4 h-4" /> Stay hydrated & avoid sun </>);
                if (temp >= 30) return (<> <Thermometer className="w-4 h-4" /> Light clothing recommended </>);
                if (temp <= -5) return (<> <Thermometer className="w-4 h-4" /> Extreme cold – limit exposure </>);
                if (temp <= 0) return (<> <Thermometer className="w-4 h-4" /> Freezing – dress in layers </>);
                if (temp <= 10) return (<> <Thermometer className="w-4 h-4" /> Wear a jacket </>);
                return (<> <Sun className="w-4 h-4" /> Normal conditions </>);
              })()}
            </span>
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

          <div
            className="absolute inset-x-0 bottom-0 h-full z-10"
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0) 40%, ${colorBg} 90%)` }}
          />

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

        <div className="px-2 py-0 lg:pt-7 relative z-[10]" style={{ background: colorBg }}>
          <Suspense fallback={<div className="h-24 flex items-center justify-center"><div className="skeleton h-20 w-full max-w-4xl"></div></div>}>
            <HourlyForecast cityName={cityName} />
          </Suspense>
        </div>

        {criticalSectionsLoaded && (
          <div 
            className="flex flex-col items-center py-7 transition-opacity duration-300 fade-in cursor-pointer group"
            style={{ background: colorBg }}
            onClick={scrollToCards}
          >
            <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-200 mb-1">
              SCROLL FOR MORE
            </span>
            <div className="scroll-indicator">
              <ChevronDown className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors duration-200" />
            </div>
          </div>
        )}
      </section>

      <Suspense fallback={<div className="h-64 flex items-center justify-center cards-section" style={{ background: colorBg }}><div className="skeleton h-48 w-full max-w-6xl"></div></div>}>
        <div className="cards-section">
          <Cards colorBg={colorBg} />
        </div>
      </Suspense>

      <Footer
        isHolidayToday={isHolidayToday}
        holidayColors={holidayColors}
        email={email}
        setEmail={setEmail}
        subscribed={subscribed}
        cityName={cityName}
      />

      {latAndLon?.lat && latAndLon?.lon && alerts.length > 0 && (
        <Suspense fallback={null}>
          <WeatherAlert lat={latAndLon.lat} lon={latAndLon.lon} />
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