/**
 * Maps country codes to geographic regions in the SVG
 */

export type Region =
  | 'NORTH_AMERICA'
  | 'MEXICO'
  | 'CENTRAL_AMERICA'
  | 'SOUTH_AMERICA'
  | 'EUROPE'
  | 'AFRICA'
  | 'MIDDLE_EAST'
  | 'ASIA'
  | 'OCEANIA';

/**
 * Region boundaries in the SVG (viewBox: 1240 x 431)
 */
export const REGION_BOUNDARIES: Record<Region, { minX: number; maxX: number; minY: number; maxY: number }> = {
  NORTH_AMERICA: { minX: 0, maxX: 500, minY: 0, maxY: 150 },
  MEXICO: { minX: 0, maxX: 320, minY: 150, maxY: 200 },
  CENTRAL_AMERICA: { minX: 0, maxX: 320, minY: 200, maxY: 240 },
  SOUTH_AMERICA: { minX: 0, maxX: 360, minY: 240, maxY: 431 },
  EUROPE: { minX: 450, maxX: 700, minY: 0, maxY: 175 },
  AFRICA: { minX: 420, maxX: 700, minY: 165, maxY: 420 },
  MIDDLE_EAST: { minX: 580, maxX: 720, minY: 140, maxY: 250 },
  ASIA: { minX: 600, maxX: 1240, minY: 0, maxY: 290 },
  OCEANIA: { minX: 800, maxX: 1240, minY: 250, maxY: 431 },
};

/**
 * Maps country codes to their geographic regions
 */
export const COUNTRY_TO_REGION: Record<string, Region> = {
  // North America
  CA: 'NORTH_AMERICA', // Canada
  US: 'NORTH_AMERICA', // United States
  MX: 'MEXICO', // Mexico (separate region)

  // Central America & Caribbean
  GT: 'CENTRAL_AMERICA', // Guatemala
  BZ: 'CENTRAL_AMERICA', // Belize
  SV: 'CENTRAL_AMERICA', // El Salvador
  HN: 'CENTRAL_AMERICA', // Honduras
  NI: 'CENTRAL_AMERICA', // Nicaragua
  CR: 'CENTRAL_AMERICA', // Costa Rica
  PA: 'CENTRAL_AMERICA', // Panama
  CU: 'CENTRAL_AMERICA', // Cuba
  JM: 'CENTRAL_AMERICA', // Jamaica
  HT: 'CENTRAL_AMERICA', // Haiti
  DO: 'CENTRAL_AMERICA', // Dominican Republic
  PR: 'CENTRAL_AMERICA', // Puerto Rico

  // South America
  CO: 'SOUTH_AMERICA', // Colombia
  VE: 'SOUTH_AMERICA', // Venezuela
  EC: 'SOUTH_AMERICA', // Ecuador
  PE: 'SOUTH_AMERICA', // Peru
  BR: 'SOUTH_AMERICA', // Brazil
  BO: 'SOUTH_AMERICA', // Bolivia
  PY: 'SOUTH_AMERICA', // Paraguay
  UY: 'SOUTH_AMERICA', // Uruguay
  AR: 'SOUTH_AMERICA', // Argentina
  CL: 'SOUTH_AMERICA', // Chile
  GY: 'SOUTH_AMERICA', // Guyana
  SR: 'SOUTH_AMERICA', // Suriname

  // Europe
  PT: 'EUROPE', ES: 'EUROPE', FR: 'EUROPE', GB: 'EUROPE', IE: 'EUROPE',
  BE: 'EUROPE', NL: 'EUROPE', LU: 'EUROPE', CH: 'EUROPE', IT: 'EUROPE',
  DE: 'EUROPE', AT: 'EUROPE', PL: 'EUROPE', CZ: 'EUROPE', SK: 'EUROPE',
  HU: 'EUROPE', RO: 'EUROPE', BG: 'EUROPE', UA: 'EUROPE', BY: 'EUROPE',
  MD: 'EUROPE', HR: 'EUROPE', SI: 'EUROPE', RS: 'EUROPE', BA: 'EUROPE',
  AL: 'EUROPE', MK: 'EUROPE', GR: 'EUROPE', IS: 'EUROPE', NO: 'EUROPE',
  SE: 'EUROPE', FI: 'EUROPE', DK: 'EUROPE', EE: 'EUROPE', LV: 'EUROPE',
  LT: 'EUROPE', MC: 'EUROPE',

  // Russia & CIS (mapped to Asia or Europe based on location)
  RU: 'ASIA', // Russia (mostly in Asia)
  KZ: 'ASIA', UZ: 'ASIA', TM: 'ASIA', KG: 'ASIA', TJ: 'ASIA',
  GE: 'EUROPE', AM: 'EUROPE', AZ: 'EUROPE',

  // Middle East
  TR: 'MIDDLE_EAST', CY: 'MIDDLE_EAST', SY: 'MIDDLE_EAST', LB: 'MIDDLE_EAST',
  IL: 'MIDDLE_EAST', PS: 'MIDDLE_EAST', JO: 'MIDDLE_EAST', IQ: 'MIDDLE_EAST',
  IR: 'MIDDLE_EAST', KW: 'MIDDLE_EAST', SA: 'MIDDLE_EAST', AE: 'MIDDLE_EAST',
  QA: 'MIDDLE_EAST', BH: 'MIDDLE_EAST', OM: 'MIDDLE_EAST', YE: 'MIDDLE_EAST',

  // Asia
  PK: 'ASIA', IN: 'ASIA', NP: 'ASIA', BT: 'ASIA', BD: 'ASIA', LK: 'ASIA',
  MV: 'ASIA', AF: 'ASIA', CN: 'ASIA', MN: 'ASIA', KP: 'ASIA', KR: 'ASIA',
  JP: 'ASIA', TW: 'ASIA', HK: 'ASIA', MO: 'ASIA', MM: 'ASIA', TH: 'ASIA',
  LA: 'ASIA', VN: 'ASIA', KH: 'ASIA', MY: 'ASIA', SG: 'ASIA', ID: 'ASIA',
  PH: 'ASIA', BN: 'ASIA', TL: 'ASIA',

  // Africa
  MA: 'AFRICA', DZ: 'AFRICA', TN: 'AFRICA', LY: 'AFRICA', EG: 'AFRICA',
  SD: 'AFRICA', MR: 'AFRICA', SN: 'AFRICA', GM: 'AFRICA', GW: 'AFRICA',
  GN: 'AFRICA', SL: 'AFRICA', LR: 'AFRICA', CI: 'AFRICA', ML: 'AFRICA',
  BF: 'AFRICA', GH: 'AFRICA', TG: 'AFRICA', BJ: 'AFRICA', NE: 'AFRICA',
  NG: 'AFRICA', CM: 'AFRICA', CF: 'AFRICA', TD: 'AFRICA', GA: 'AFRICA',
  CG: 'AFRICA', CD: 'AFRICA', GQ: 'AFRICA', AO: 'AFRICA', ET: 'AFRICA',
  ER: 'AFRICA', DJ: 'AFRICA', SO: 'AFRICA', KE: 'AFRICA', UG: 'AFRICA',
  RW: 'AFRICA', BI: 'AFRICA', TZ: 'AFRICA', MW: 'AFRICA', MZ: 'AFRICA',
  ZM: 'AFRICA', ZW: 'AFRICA', MG: 'AFRICA', NA: 'AFRICA', BW: 'AFRICA',
  ZA: 'AFRICA', SZ: 'AFRICA', LS: 'AFRICA',

  // Oceania
  AU: 'OCEANIA', // Australia
  NZ: 'OCEANIA', // New Zealand
  PG: 'OCEANIA', // Papua New Guinea
  FJ: 'OCEANIA', // Fiji
};

/**
 * Get the region for a country code
 */
export function getRegionForCountry(countryCode: string): Region | null {
  return COUNTRY_TO_REGION[countryCode.toUpperCase()] || null;
}

/**
 * Get random coordinates within a region's boundaries
 */
export function getRandomCoordinatesInRegion(region: Region): { x: number; y: number } {
  const bounds = REGION_BOUNDARIES[region];
  const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
  const y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
  return { x: Math.round(x), y: Math.round(y) };
}
