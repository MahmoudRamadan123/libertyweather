// app/weather/[city]/page.js
import { citySlugToName } from '../../lib/city-data';
import ClientWrapper from './ClientWrapper';

export async function generateStaticParams() {
  return Object.keys(citySlugToName).map((city) => ({
    city,
  }));
}

export async function generateMetadata({ params }) {
  if (!params?.city) return {};

  const cityName = getCityDisplayName(params.city);
  const baseUrl = 'https://libertyweather.com';

  return {
    title: `Today's Weather Forecast – ${cityName} | LibertyWeather`,
    description: `Simple weather updates for ${cityName}. Get personalized advice on what to wear and how to prepare.`,
    openGraph: {
      title: `Weather Forecast – ${cityName} | LibertyWeather`,
      description: `Clear weather advice for ${cityName}. Know what to wear today.`,
      url: `${baseUrl}/weather/${params.city}`,
    },
  };
}

function getCityDisplayName(citySlug) {
    const city =citySlugToName[citySlug]

  return city || citySlug.replace(/-/g, ' ').toUpperCase();
}

export default async function WeatherPage({ params }) {
  const { city = "new-york" } = await params;
  const cityName = getCityDisplayName(city);

  return <ClientWrapper cityName={cityName} />;
}

