export async function getWeatherByLatLon(lat, lon) {
  const res = await fetch(
    `https://api.weather.gov/points/${lat},${lon}`,
    {
      headers: {
        'User-Agent': 'LibertyHail (hani@libertyhail.com)',
        'Accept': 'application/geo+json'
      }
    }
  );

  if (!res.ok) {
    throw new Error('Weather.gov request failed');
  }

  return res.json();
}
