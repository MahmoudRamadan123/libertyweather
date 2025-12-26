const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export async function mapboxAutocomplete(query) {
  if (!query || query.length < 2) return [];

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?types=place,region&country=US&limit=5&access_token=${MAPBOX_TOKEN}`
  );

  const data = await res.json();

  return data.features.map((f) => {
    const state = f.context?.find(c => c.id.includes('region'))?.text;
    return {
      id: f.id,
      city: f.text,
      state,
      lat: f.center[1],
      lon: f.center[0],
      label: state || f.text, // what we store
      fullLabel: f.place_name,
    };
  });
}
