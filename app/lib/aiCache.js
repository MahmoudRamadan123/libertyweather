const aiCache = new Map();

/**
 * Cache key example:
 * New York|rain|12
 */
export function getCachedSummary(key) {
  const cached = aiCache.get(key);
  if (!cached) return null;

  // expire after 60 minutes
  if (Date.now() - cached.time > 60 * 60 * 1000) {
    aiCache.delete(key);
    return null;
  }

  return cached.value;
}

export function setCachedSummary(key, value) {
  aiCache.set(key, {
    value,
    time: Date.now(),
  });
}
