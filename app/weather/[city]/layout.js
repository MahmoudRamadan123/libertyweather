// app/weather/[city]/layout.js
import { cityFullNames, getCityData } from '../../lib/city-data';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0052FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0033CC' },
  ],
};

export async function generateMetadata({ params }) {
  const { city = "new-york" } = await params;
  const citySlug=city
  const cityName = cityFullNames[citySlug] || getCityDisplayName(citySlug);
  const cityData = getCityData(citySlug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://libertyweather.com';
  
  const metadata = {
    title: `Today's Weather Forecast – ${cityName} | LibertyWeather`,
    description: `Get simple, personalized weather updates for ${cityName}. Know exactly what to wear and how to prepare for today's conditions.`,
    keywords: `weather forecast ${cityName}, ${cityName} weather, weather in ${cityName.split(',')[0]}, daily weather updates, what to wear in ${cityName.split(',')[0]}`,
    
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}/weather/${citySlug}`,
      title: `Weather Forecast – ${cityName}`,
      description: `Clear weather advice for ${cityName}. Know what to wear today.`,
      siteName: 'LibertyWeather',
      images: [
        {
          url: `${baseUrl}/api/og?city=${encodeURIComponent(cityName)}`,
          width: 1200,
          height: 630,
          alt: `Weather forecast for ${cityName}`,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: `Weather Forecast – ${cityName} | LibertyWeather`,
      description: `Clear weather advice for ${cityName}. Know what to wear today.`,
      images: [`${baseUrl}/api/og?city=${encodeURIComponent(cityName)}`],
      creator: '@libertyweather',
    },
    
    alternates: {
      canonical: `${baseUrl}/weather/${citySlug}`,
    },
    
    // Local SEO
    other: {
      'geo.position': cityData ? `${cityData.lat};${cityData.lon}` : '39.8;-98.6',
      'geo.placename': cityName,
      'geo.region': 'US',
      'ICBM': cityData ? `${cityData.lat}, ${cityData.lon}` : '39.8, -98.6',
      'robots': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  };

  return metadata;
}

function getCityDisplayName(citySlug) {
  // Fallback function
  if (cityFullNames[citySlug]) return cityFullNames[citySlug];
  
  // Convert kebab-case to display name
  return citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Breadcrumb structured data
function getBreadcrumbSchema(citySlug, cityName) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://libertyweather.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Weather",
        "item": `${baseUrl}/weather`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cityName,
        "item": `${baseUrl}/weather/${citySlug}`
      }
    ]
  };
}

// Weather forecast structured data
function getWeatherSchema(citySlug, cityName, cityData) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://libertyweather.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "WeatherForecast",
    "name": `Today's Weather Forecast - ${cityName}`,
    "dateIssued": new Date().toISOString(),
    "validFrom": new Date().toISOString(),
    "validUntil": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    "description": `Simple weather summary for ${cityName} with personalized advice on what to wear and how to prepare.`,
    "address": {
      "@type": "Place",
      "name": cityName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityName.split(',')[0],
        "addressRegion": cityName.split(',')[1]?.trim() || '',
        "addressCountry": "US"
      }
    },
    "provider": {
      "@type": "Organization",
      "name": "LibertyWeather",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`
    },
    "url": `${baseUrl}/weather/${citySlug}`,
    "potentialAction": {
      "@type": "SubscribeAction",
      "target": `${baseUrl}/api/subscribe?city=${encodeURIComponent(citySlug)}`,
      "expectsAcceptanceOf": {
        "@type": "Offer",
        "name": "Daily Weather Updates"
      }
    }
  };
}

export default async function CityLayout({ children, params }) {
    const { city = "new-york" } = await params;
    const citySlug=city
  const cityName = cityFullNames[citySlug] || getCityDisplayName(citySlug);
  const cityData = getCityData(citySlug);
  
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema(citySlug, cityName))
        }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWeatherSchema(citySlug, cityName, cityData))
        }}
      />
      
      {/* FAQ Schema for Common Questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is the current weather in ${cityName}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Get real-time weather conditions, temperature, and personalized advice for ${cityName}. Our simple summaries tell you exactly what to wear and how to prepare.`
                }
              },
              {
                "@type": "Question",
                "name": `What should I wear in ${cityName.split(',')[0]} today?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Based on current conditions in ${cityName}, we provide specific clothing recommendations to keep you comfortable throughout the day.`
                }
              },
              {
                "@type": "Question",
                "name": `How can I get daily weather updates for ${cityName}?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `Subscribe to LibertyWeather for daily email updates with simple weather summaries and personalized advice for ${cityName}.`
                }
              }
            ]
          })
        }}
      />
      
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LibertyWeather",
            "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://libertyweather.com',
            "logo": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://libertyweather.com'}/logo.png`,
            "description": "Simple weather updates with personality-driven advice",
            "sameAs": [
              "https://twitter.com/libertyweather",
              "https://facebook.com/libertyweather",
              "https://instagram.com/libertyweather"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "support@libertyweather.com"
            }
          })
        }}
      />
      
      {/* Viewport meta tags for responsive design */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      
      {/* Apple specific tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* PWA tags */}
      <meta name="application-name" content="LibertyWeather" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Security headers would be configured in next.config.js or middleware */}
      
      {/* Additional SEO meta tags */}
      <meta name="language" content="en" />
      <meta name="coverage" content="United States" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="1 days" />
      <meta name="generator" content="Next.js" />
      
      {/* OpenSearch */}
      <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="LibertyWeather" />
      
      {/* Preload critical resources */}
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Preconnect to important origins */}
      <link rel="preconnect" href="https://api.openweathermap.org" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.weather.gov" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://api.openweathermap.org" />
      <link rel="dns-prefetch" href="https://api.weather.gov" />
      
      {children}
    </>
  );
}