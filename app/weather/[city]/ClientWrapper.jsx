'use client';

import dynamic from 'next/dynamic';

const ClientWeatherPage = dynamic(
  () => import('./ClientWeatherPage'),
  { ssr: false }
);

export default function ClientWrapper({ cityName }) {
  return <ClientWeatherPage initialCityName={cityName} />;
}
