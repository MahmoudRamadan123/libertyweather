// app/robots.txt/route.js
export async function GET() {
  const robotsTxt = `# robots.txt for LibertyWeather
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Crawl delay (requests per second)
Crawl-delay: 2

# Sitemaps
Sitemap: https://libertyweather.com/sitemap.xml

# Googlebot specific
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Bingbot specific
User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Block AI crawlers (optional)
User-agent: ChatGPT-User
Disallow: /
User-agent: GPTBot
Disallow: /

# Block scrapers
User-agent: MJ12bot
Disallow: /
User-agent: AhrefsBot
Disallow: /
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}