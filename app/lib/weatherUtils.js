export function getWeatherIcon(condition) {
  if (!condition) return '🌈';
  
  const cond = condition.toLowerCase();
  
  if (cond.includes('sun') || cond.includes('clear')) return '☀️';
  if (cond.includes('cloud')) return '☁️';
  if (cond.includes('rain')) return '🌧️';
  if (cond.includes('drizzle')) return '🌦️';
  if (cond.includes('snow')) return '❄️';
  if (cond.includes('storm') || cond.includes('thunder')) return '⛈️';
  if (cond.includes('wind')) return '💨';
  if (cond.includes('fog') || cond.includes('mist')) return '🌫️';
  if (cond.includes('tornado')) return '🌪️';
  if (cond.includes('hail')) return '🌨️';
  
  return '🌈';
}

export function getConditionColor(condition) {
  if (!condition) return '#0052FF';
  
  const cond = condition.toLowerCase();
  
  if (cond.includes('sun') || cond.includes('clear')) return '#FFD700';
  if (cond.includes('rain') || cond.includes('drizzle')) return '#4A90E2';
  if (cond.includes('storm') || cond.includes('thunder')) return '#9932CC';
  if (cond.includes('snow') || cond.includes('blizzard')) return '#87CEEB';
  if (cond.includes('wind')) return '#00CED1';
  if (cond.includes('fog') || cond.includes('mist')) return '#A9A9A9';
  if (cond.includes('tornado')) return '#8B0000';
  if (cond.includes('hail')) return '#4682B4';
  if (cond.includes('cloud')) return '#778899';
  
  return '#0052FF';
}

export function getClothingAdvice(temperature, condition) {
  const temp = temperature || 72;
  const cond = (condition || '').toLowerCase();
  
  let items = [];
  let tip = '';
  
  if (temp >= 85) {
    items = ['Light shirt', 'Shorts', 'Sunglasses', 'Hat'];
    tip = "Stay hydrated and seek shade during peak sun hours.";
  } else if (temp >= 70 && temp < 85) {
    items = ['T-shirt', 'Light pants', 'Comfortable shoes'];
    tip = "Perfect weather for outdoor activities. Layer for evening cool down.";
  } else if (temp >= 55 && temp < 70) {
    items = ['Long sleeves', 'Light jacket', 'Jeans'];
    tip = "Bring a light layer for when the sun goes down.";
  } else if (temp >= 40 && temp < 55) {
    items = ['Sweater', 'Jacket', 'Pants', 'Closed-toe shoes'];
    tip = "Layers are your friend. You can always remove a layer if it warms up.";
  } else if (temp < 40) {
    items = ['Winter coat', 'Gloves', 'Scarf', 'Warm hat', 'Boots'];
    tip = "Dress warmly and cover exposed skin to prevent frostbite.";
  }
  
  // Adjust for precipitation
  if (cond.includes('rain') || cond.includes('drizzle')) {
    items.push('Raincoat', 'Umbrella', 'Waterproof shoes');
    tip = "Keep dry and watch for slippery surfaces.";
  }
  
  if (cond.includes('snow') || cond.includes('blizzard')) {
    items.push('Waterproof boots', 'Thermal layers', 'Snow gloves');
    tip = "Dress in layers and keep extremities covered.";
  }
  
  if (cond.includes('wind')) {
    items.push('Windbreaker', 'Secure hat', 'Eye protection');
    tip = "Secure loose items and protect your eyes from blowing debris.";
  }
  
  if (cond.includes('sun') && temp > 70) {
    items.push('Sunscreen');
    tip = "Apply sunscreen 30 minutes before going outside.";
  }
  
  return { items, tip };
}

export function generateAISummary(temperature, condition, unit) {
  const temp = temperature || 72;
  const cond = condition || 'Clear';
  const isMetric = unit === 'C';
  
  const summaries = {
    hot: [
      `It's a scorcher at ${Math.round(temp)}°${unit}! With this heat, you'll want light, breathable fabrics and plenty of water. Perfect day for shade and hydration!`,
      `Feeling like ${Math.round(temp)}°${unit} and sunny? That's shorts weather! Grab your sunglasses and find some AC for the hottest parts of the day.`
    ],
    warm: [
      `A beautiful ${Math.round(temp)}°${unit} day with ${cond.toLowerCase()} skies! It's perfect for outdoor adventures - maybe bring a light layer for when the sun dips.`,
      `At ${Math.round(temp)}°${unit} with ${cond.toLowerCase()} conditions, it's ideal weather. Enjoy the sunshine but keep sunscreen handy!`
    ],
    mild: [
      `A comfortable ${Math.round(temp)}°${unit} with ${cond.toLowerCase()} conditions means you can dress light but might want a sweater for later.`,
      `${Math.round(temp)}°${unit} and ${cond.toLowerCase()} - it's jacket-on, jacket-off weather. Layers will keep you comfortable all day long!`
    ],
    cool: [
      `With ${Math.round(temp)}°${unit} and ${cond.toLowerCase()} conditions, you'll want a cozy jacket. Perfect weather for warm drinks and brisk walks!`,
      `It's ${Math.round(temp)}°${unit} and ${cond.toLowerCase()} - time for your favorite sweater. Crisp air makes for refreshing outdoor time!`
    ],
    cold: [
      `Brrr! ${Math.round(temp)}°${unit} means winter gear is essential. Bundle up with layers and don't forget your hat and gloves!`,
      `At ${Math.round(temp)}°${unit} with ${cond.toLowerCase()} conditions, it's proper coat weather. Stay warm and watch for ice on sidewalks!`
    ]
  };
  
  let category;
  if (temp >= 85) category = 'hot';
  else if (temp >= 70) category = 'warm';
  else if (temp >= 55) category = 'mild';
  else if (temp >= 40) category = 'cool';
  else category = 'cold';
  
  const options = summaries[category];
  return options[Math.floor(Math.random() * options.length)];
}

export function formatWindSpeed(speed, unit = 'mph') {
  if (!speed) return 'Calm';
  
  if (speed < 3) return 'Calm';
  if (speed < 8) return `Light breeze (${Math.round(speed)} ${unit})`;
  if (speed < 13) return `Gentle breeze (${Math.round(speed)} ${unit})`;
  if (speed < 19) return `Moderate breeze (${Math.round(speed)} ${unit})`;
  if (speed < 25) return `Fresh breeze (${Math.round(speed)} ${unit})`;
  if (speed < 32) return `Strong breeze (${Math.round(speed)} ${unit})`;
  return `Very windy (${Math.round(speed)} ${unit})`;
}

export function getUVIndexAdvice(uvIndex) {
  if (!uvIndex) return null;
  
  if (uvIndex <= 2) {
    return { level: 'Low', color: 'green', advice: 'No protection needed' };
  } else if (uvIndex <= 5) {
    return { level: 'Moderate', color: 'yellow', advice: 'Stay in shade midday' };
  } else if (uvIndex <= 7) {
    return { level: 'High', color: 'orange', advice: 'Use SPF 30+ sunscreen' };
  } else if (uvIndex <= 10) {
    return { level: 'Very High', color: 'red', advice: 'Avoid sun 10AM-4PM' };
  } else {
    return { level: 'Extreme', color: 'purple', advice: 'Stay indoors if possible' };
  }
}

export function calculateFeelsLike(temp, humidity, windSpeed) {
  // Simple heat index approximation
  if (temp >= 80) {
    const heatIndex = 0.5 * (temp + 61.0 + ((temp - 68.0) * 1.2) + (humidity * 0.094));
    return Math.round(heatIndex);
  }
  
  // Wind chill approximation
  if (temp <= 50 && windSpeed > 3) {
    const windChill = 35.74 + 0.6215 * temp - 35.75 * Math.pow(windSpeed, 0.16) + 0.4275 * temp * Math.pow(windSpeed, 0.16);
    return Math.round(windChill);
  }
  
  return Math.round(temp);
}

export function getWeatherConditionEmoji(code) {
  // OpenWeatherMap condition codes
  const emojiMap = {
    200: '⛈️',  // thunderstorm with rain
    201: '⛈️',
    202: '⛈️',
    210: '🌩️',
    211: '🌩️',
    212: '🌩️',
    221: '🌩️',
    230: '⛈️',
    231: '⛈️',
    232: '⛈️',
    
    300: '🌦️',  // drizzle
    301: '🌦️',
    302: '🌦️',
    310: '🌦️',
    311: '🌦️',
    312: '🌦️',
    313: '🌦️',
    314: '🌦️',
    321: '🌦️',
    
    500: '🌧️',  // rain
    501: '🌧️',
    502: '🌧️',
    503: '🌧️',
    504: '🌧️',
    511: '🌨️',  // freezing rain
    520: '🌧️',
    521: '🌧️',
    522: '🌧️',
    531: '🌧️',
    
    600: '❄️',  // snow
    601: '❄️',
    602: '❄️',
    611: '🌨️',  // sleet
    612: '🌨️',
    613: '🌨️',
    615: '🌨️',
    616: '🌨️',
    620: '🌨️',
    621: '🌨️',
    622: '🌨️',
    
    701: '🌫️',  // mist
    711: '🌫️',
    721: '🌫️',
    731: '🌪️',  // sand/dust whirls
    741: '🌫️',
    751: '🌫️',
    761: '🌫️',
    762: '🌫️',
    771: '💨',
    781: '🌪️',
    
    800: '☀️',  // clear
    801: '⛅',
    802: '☁️',
    803: '☁️',
    804: '☁️',
  };
  
  return emojiMap[code] || '🌈';
}