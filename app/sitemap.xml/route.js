// app/sitemap.xml/route.js
export async function GET() {
  const baseUrl = 'https://libertyweather.com';
  
  const cities = [
    'new-york',
    'chicago',
    'los-angeles',
    'miami',
    'seattle',
    'houston',
    'phoenix',
    'philadelphia',
    'san-antonio',
    'san-diego',
    'dallas',
    'san-jose',
    'austin',
    'jacksonville',
    'fort-worth',
    'columbus',
    'charlotte',
    'san-francisco',
    'indianapolis',
    'denver',
  ];

  const urls = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // City pages
    ...cities.map(city => ({
      url: `${baseUrl}/weather/${city}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    })),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map(
          (url) => `
        <url>
          <loc>${url.url}</loc>
          <lastmod>${url.lastModified.toISOString()}</lastmod>
          <changefreq>${url.changeFrequency}</changefreq>
          <priority>${url.priority}</priority>
        </url>
      `
        )
        .join('')}
    </urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  );
}