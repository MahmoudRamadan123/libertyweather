// hooks/useWeather.js
import { useState, useEffect } from 'react';

const WEATHER_HEADERS = {
  'User-Agent': 'LibertyHail (hani@libertyhail.com)',
  Accept: 'application/geo+json',
};

// Convert city/state → lat/lon using Mapbox
const geocodeLocation = async (query) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?types=place,region&country=US&limit=1&access_token=${token}`
  );
  const data = await res.json();
  if (!data.features?.length) {
    return;
  };

  const feature = data.features[0];
  return {
    lat: feature.center[1],
    lon: feature.center[0],
    label: feature.place_name,
  };
};

// Get forecast + latest observations from weather.gov
const getWeatherGovForecast = async (lat, lon) => {
  // 1️⃣ Get NWS point info
  const pointsRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
    headers: WEATHER_HEADERS,
  });
  if (!pointsRes.ok) throw new Error('Failed to get points info');
  const pointsData = await pointsRes.json();

  const hourlyUrl = pointsData.properties.forecastHourly;
  const stationsUrl = pointsData.properties.observationStations;

  if (!hourlyUrl) throw new Error('Hourly forecast unavailable');

  // 2️⃣ Get hourly forecast
  const forecastRes = await fetch(hourlyUrl, { headers: WEATHER_HEADERS });
  if (!forecastRes.ok) throw new Error('Failed to fetch hourly forecast');
  const forecastData = await forecastRes.json();
  const periods = forecastData.properties.periods;

  // 3️⃣ Get latest observation for real "now" temperature
  let realNowTemp = null; // in Celsius
  try {
    const stationsRes = await fetch(stationsUrl, { headers: WEATHER_HEADERS });
    const stations = await stationsRes.json();
    const firstStation = stations?.features?.[0]?.id;

    if (firstStation) {
      const obsRes = await fetch(`${firstStation}/observations/latest`, { headers: WEATHER_HEADERS });
      if (obsRes.ok) {
        const obs = await obsRes.json();
        const tempVal = obs?.properties?.temperature?.value; // °C
        if (tempVal !== null && !isNaN(tempVal)) realNowTemp = Math.round(tempVal);
      }
    }
  } catch {
    /* fallback silently if observation fails */
  }

  // 4️⃣ Find the forecast period that matches current device time
  const now = new Date();
  const currentPeriod = periods.find((p) => {
    const start = new Date(p.startTime);
    const end = new Date(p.endTime);
    return now >= start && now <= end;
  }) || periods[0];

  const tempC = realNowTemp !== null ? realNowTemp : Math.round(((currentPeriod.temperature - 32) * 5) / 9);

  return {
    temperature: tempC,
    temperatureUnit: 'C',
    shortForecast: currentPeriod.shortForecast,
    detailedForecast: currentPeriod.detailedForecast,
    windSpeed: currentPeriod.windSpeed,
    windDirection: currentPeriod.windDirection,
    icon: currentPeriod.icon,
  };
};

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
    if (f.includes('sun') || f.includes('clear')) setAnimationType('sunny');
    else if (f.includes('cloud') || f.includes('overcast')) setAnimationType('cloudy');
    else if (f.includes('rain') || f.includes('shower')) setAnimationType('rainy');
    else if (f.includes('snow') || f.includes('sleet') || f.includes('hail')) setAnimationType('snowy');
    else if (f.includes('thunder') || f.includes('storm')) setAnimationType('stormy');
    else setAnimationType('default');
  };

  const handleLocationSearch = async (query) => {
    setLoading(true);
    try {
      const loc = await geocodeLocation(query);
      if (!loc) return;
      setLocation(loc.label);

      const forecast = await getWeatherGovForecast(loc.lat, loc.lon);
      setLatAndLon({ lat: loc.lat, lon: loc.lon });
      setWeatherData({ ...forecast, city: loc.label });

      updateMascotAndAnimation(forecast.temperature, forecast.shortForecast);

      setSummary(
        `It's ${forecast.shortForecast.toLowerCase()} in ${loc.label} at ${forecast.temperature}°${forecast.temperatureUnit}. ${forecast.detailedForecast}`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) handleLocationSearch(location);
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
