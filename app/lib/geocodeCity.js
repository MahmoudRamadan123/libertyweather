export async function geocodeCity(city) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`,
    {
      headers: {
        'User-Agent': 'LibertyHail (hani@libertyhail.com)'
      }
    }
  );

  const data = await res.json();

  if (!data.length) throw new Error('City not found');

  return {
    lat: data[0].lat,
    lon: data[0].lon,
    displayName: data[0].display_name
  };
}
