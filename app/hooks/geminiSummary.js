const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;

export async function generateWeatherSummary({
  city,
  temp,
  shortForecast,
  windSpeed,
}) {
  const prompt = `
You are a weather assistant.
Write EXACTLY 2 short sentences.

Sentence 1:
- Describe the weather briefly in ${city}
- Mention what to wear (hat, jacket, coat, sunglasses, etc.)

Sentence 2:
- Give a car/travel safety hint
- Mention umbrella or road caution ONLY if relevant

Weather:
Temperature: ${temp}°C
Condition: ${shortForecast}
Wind: ${windSpeed}

Do not add emojis.
Do not exceed 2 sentences.
`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 80, // hard limit
        },
      }),
    }
  );

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
