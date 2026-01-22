// lib/city-data.js
export const citySlugToName = {
  'new-york': 'New York',
  'chicago': 'Chicago',
  'los-angeles': 'Los Angeles',
  'miami': 'Miami',
  'seattle': 'Seattle',
  'houston': 'Houston',
  'phoenix': 'Phoenix',
  'philadelphia': 'Philadelphia',
  'san-antonio': 'San Antonio',
  'san-diego': 'San Diego',
  'dallas': 'Dallas',
  'san-jose': 'San Jose',
  'austin': 'Austin',
  'jacksonville': 'Jacksonville',
  'fort-worth': 'Fort Worth',
  'columbus': 'Columbus',
  'charlotte': 'Charlotte',
  'san-francisco': 'San Francisco',
  'indianapolis': 'Indianapolis',
  'denver': 'Denver',
};

export const cityFullNames = {
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

export const getCityData = (citySlug) => {
  const cityCoords = {
    'new-york': { lat: 40.7128, lon: -74.0060, population: 8336817 },
    'chicago': { lat: 41.8781, lon: -87.6298, population: 2746388 },
    'los-angeles': { lat: 34.0522, lon: -118.2437, population: 3979576 },
    'miami': { lat: 25.7617, lon: -80.1918, population: 442241 },
    'seattle': { lat: 47.6062, lon: -122.3321, population: 744955 },
    'houston': { lat: 29.7604, lon: -95.3698, population: 2320268 },
    'phoenix': { lat: 33.4484, lon: -112.0740, population: 1680992 },
    'philadelphia': { lat: 39.9526, lon: -75.1652, population: 1584064 },
    'san-antonio': { lat: 29.4241, lon: -98.4936, population: 1547253 },
    'san-diego': { lat: 32.7157, lon: -117.1611, population: 1386932 },
    'dallas': { lat: 32.7767, lon: -96.7970, population: 1343573 },
    'san-jose': { lat: 37.3382, lon: -121.8863, population: 1021795 },
    'austin': { lat: 30.2672, lon: -97.7431, population: 978908 },
    'jacksonville': { lat: 30.3322, lon: -81.6557, population: 903889 },
    'fort-worth': { lat: 32.7555, lon: -97.3308, population: 927720 },
    'columbus': { lat: 39.9612, lon: -82.9988, population: 898553 },
    'charlotte': { lat: 35.2271, lon: -80.8431, population: 885708 },
    'san-francisco': { lat: 37.7749, lon: -122.4194, population: 881549 },
    'indianapolis': { lat: 39.7684, lon: -86.1581, population: 876384 },
    'denver': { lat: 39.7392, lon: -104.9903, population: 727211 },
  };
  
  return cityCoords[citySlug] || { lat: 39.8, lon: -98.6, population: 0 };
};

// Get all city slugs for sitemap
export const getAllCitySlugs = () => Object.keys(cityFullNames);