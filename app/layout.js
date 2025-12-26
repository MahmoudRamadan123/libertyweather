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

export const metadata = {
  title: 'LibertyWeather - Simple, Personalized Weather Updates',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="geo.position" content="39.8;-98.6" />
        <meta name="ICBM" content="39.8, -98.6" />
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
        
        {/* Structured Data for Weather Service */}
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
      </body>
    </html>
  );
}