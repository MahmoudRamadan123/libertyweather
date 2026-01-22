// app/layout.js
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

// Base metadata for fallback
const baseMetadata = {
  title: {
    default: 'LibertyWeather - Simple, Personalized Weather Updates',
    template: '%s | LibertyWeather',
  },
  description: 'Get straightforward weather summaries with personality. No confusing graphs, just clear advice on what to wear and how to prepare.',
  keywords: 'weather, simple weather, weather alerts, weather updates, clothing advice, LibertyWeather',
  authors: [{ name: 'LibertyWeather' }],
  creator: 'LibertyWeather',
  publisher: 'LibertyWeather',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://libertyweather.com',
    title: 'LibertyWeather - Weather Made Simple',
    description: 'Clear weather advice with personality. Know exactly what to wear and how to prepare.',
    siteName: 'LibertyWeather',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LibertyWeather - Simple weather updates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LibertyWeather - Weather Made Simple',
    description: 'Clear weather advice with personality',
    images: ['/twitter-image.png'],
    creator: '@libertyweather',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0052FF' },
    { media: '(prefers-color-scheme: dark)', color: '#0033CC' },
  ],
  category: 'weather',
};

export async function generateMetadata({ params }) {
  const metadata = { ...baseMetadata };
  const baseUrl = 'https://libertyweather.com';
  
  // If on a city page, enhance metadata
  if (params.city) {
    const cityName = getCityDisplayName(params.city);
    metadata.title = `Today's Weather Forecast – ${cityName} | LibertyWeather`;
    metadata.description = `Simple weather updates for ${cityName}. Get personalized advice on what to wear and how to prepare.`;
    
    metadata.openGraph = {
      ...metadata.openGraph,
      title: `Weather Forecast – ${cityName}`,
      description: `Clear weather advice for ${cityName}. Know what to wear today.`,
      url: `${baseUrl}/weather/${params.city}`,
    };
    
    metadata.twitter = {
      ...metadata.twitter,
      title: `Weather Forecast – ${cityName} | LibertyWeather`,
      description: `Clear weather advice for ${cityName}. Know what to wear today.`,
    };
  }
  
  metadata.metadataBase = new URL(baseUrl);
  return metadata;
}

// Helper function to get city display name
function getCityDisplayName(citySlug) {
  const cityMap = {
    'new-york': 'New York, NY',
    'chicago': 'Chicago, IL',
    'los-angeles': 'Los Angeles, CA',
    'miami': 'Miami, FL',
    'seattle': 'Seattle, WA',
    'houston': 'Houston, TX',
    'phoenix': 'Phoenix, AZ',
    'philadelphia': 'Philadelphia, PA',
    'san-antonio': 'San Antonio, TX',
    'san-diego': 'San Diego, CA',
    'dallas': 'Dallas, TX',
    'san-jose': 'San Jose, CA',
    'austin': 'Austin, TX',
    'jacksonville': 'Jacksonville, FL',
    'fort-worth': 'Fort Worth, TX',
    'columbus': 'Columbus, OH',
    'charlotte': 'Charlotte, NC',
    'san-francisco': 'San Francisco, CA',
    'indianapolis': 'Indianapolis, IN',
    'denver': 'Denver, CO',
  };
  
  return cityMap[citySlug] || `${citySlug.replace('-', ' ').toUpperCase()}`;
}

export default function RootLayout({ children, params }) {
  const citySlug = params?.city;
  const cityName = citySlug ? getCityDisplayName(citySlug) : null;
  
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="geo.position" content="39.8;-98.6" />
        <meta name="ICBM" content="39.8, -98.6" />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "LibertyWeather",
              "url": "https://libertyweather.com",
              "description": "Simple weather updates with personality-driven advice",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://libertyweather.com?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "LibertyWeather",
              "description": "Simple weather updates with personalized clothing advice",
              "url": "https://libertyweather.com",
              "telephone": "+1-800-555-1212",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "areaServed": {
                "@type": "Country",
                "name": "United States"
              },
              "serviceType": "Weather Forecasting Service"
            })
          }}
        />
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-white select-none">
        <div className="relative overflow-hidden">
          {children}
          <Analytics />
        </div>
        
        {/* Weather Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WeatherService",
              "name": "LibertyWeather",
              "description": "Simple weather updates with personalized clothing advice",
              "url": "https://libertyweather.com",
              "areaServed": {
                "@type": "Country",
                "name": "United States"
              },
              "featureList": [
                "Simple weather summaries",
                "Personalized clothing advice",
                "Email weather alerts",
                "Animated weather mascot"
              ]
            })
          }}
        />
        
        {/* Add city-specific structured data if on city page */}
        {cityName && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://libertyweather.com"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Weather",
                    "item": "https://libertyweather.com/weather"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": cityName,
                    "item": `https://libertyweather.com/weather/${citySlug}`
                  }
                ]
              })
            }}
          />
        )}
      </body>
    </html>
  );
}