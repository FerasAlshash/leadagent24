// Smart location parser to extract clean City and Country from diverse B2B addresses
export function parseLocationFromAddress(rawAddress) {
  if (!rawAddress || typeof rawAddress !== 'string' || !rawAddress.trim()) {
    return { city: 'Unknown City', country: 'Unknown Country' };
  }

  const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return { city: 'Unknown City', country: 'Unknown Country' };
  }

  // 1. Country: typically the last segment
  let country = 'Unknown Country';
  if (parts.length >= 2) {
    country = parts[parts.length - 1];
  } else {
    country = parts[0];
  }
  country = country.replace(/[\d-]/g, '').trim() || 'Unknown Country';

  // 2. City candidate: usually the second to last segment (or before state/zip in US)
  let candidate = parts.length >= 3 ? parts[parts.length - 2] : (parts.length === 2 ? parts[0] : parts[0]);

  // Handle US formats where second-to-last is "NY 10001" and city is third-to-last
  if (parts.length >= 4 && /^[A-Z]{2}(\s+\d{5})?$/i.test(candidate)) {
    candidate = parts[parts.length - 3];
  }

  // Clean European postal codes (e.g., "52080 Aachen", "70176 Stuttgart-West"), UK postcodes, US zips
  let cleanCity = candidate
    .replace(/^\b\d{4,6}\b\s*/, '') // leading 4-6 digit zip code (Germany, France, etc.)
    .replace(/\s+\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i, '') // trailing UK postal code
    .replace(/\b\d{5}(-\d{4})?\b/, '') // US zip codes
    .replace(/^[A-Z]{2}\s+\d{5}/, '') // 'NY 10001'
    .trim();

  if (!cleanCity || cleanCity.length < 2) {
    cleanCity = candidate;
  }

  return {
    city: cleanCity || 'Unknown City',
    country: country || 'Unknown Country'
  };
}
