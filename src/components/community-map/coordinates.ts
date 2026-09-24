/**
 * Country/Region coordinates for the community map SVG (1240 x 431 viewBox)
 *
 * These coordinates are calibrated to match the dotted world map SVG.
 * Organized by geographic regions for easy maintenance.
 *
 * To add a new country:
 * 1. Find the region it belongs to
 * 2. Add the country code (ISO 3166-1 alpha-2) with x,y coordinates
 * 3. Test by adding a mock user with that country code
 */

export interface Coordinates {
  x: number;
  y: number;
}

// ============================================
// NORTH AMERICA
// ============================================
const NORTH_AMERICA: Record<string, Coordinates> = {
  CA: { x: 185, y: 85 },   // Canada
  US: { x: 195, y: 130 },  // United States
  MX: { x: 175, y: 175 },  // Mexico
};

// ============================================
// CENTRAL AMERICA & CARIBBEAN
// ============================================
const CENTRAL_AMERICA: Record<string, Coordinates> = {
  GT: { x: 175, y: 195 },  // Guatemala
  BZ: { x: 182, y: 190 },  // Belize
  SV: { x: 177, y: 200 },  // El Salvador
  HN: { x: 182, y: 198 },  // Honduras
  NI: { x: 185, y: 205 },  // Nicaragua
  CR: { x: 190, y: 215 },  // Costa Rica
  PA: { x: 200, y: 220 },  // Panama
  CU: { x: 210, y: 180 },  // Cuba
  JM: { x: 218, y: 188 },  // Jamaica
  HT: { x: 225, y: 185 },  // Haiti
  DO: { x: 232, y: 185 },  // Dominican Republic
  PR: { x: 240, y: 185 },  // Puerto Rico
};

// ============================================
// SOUTH AMERICA
// ============================================
const SOUTH_AMERICA: Record<string, Coordinates> = {
  CO: { x: 215, y: 235 },  // Colombia
  VE: { x: 240, y: 225 },  // Venezuela
  EC: { x: 200, y: 255 },  // Ecuador
  PE: { x: 210, y: 280 },  // Peru
  BR: { x: 280, y: 290 },  // Brazil
  BO: { x: 245, y: 305 },  // Bolivia
  PY: { x: 265, y: 320 },  // Paraguay
  UY: { x: 275, y: 340 },  // Uruguay
  AR: { x: 255, y: 360 },  // Argentina
  CL: { x: 240, y: 350 },  // Chile
  GY: { x: 255, y: 235 },  // Guyana
  SR: { x: 265, y: 235 },  // Suriname
};

// ============================================
// WESTERN EUROPE
// ============================================
const WESTERN_EUROPE: Record<string, Coordinates> = {
  PT: { x: 478, y: 145 },  // Portugal
  ES: { x: 492, y: 145 },  // Spain
  FR: { x: 505, y: 130 },  // France
  GB: { x: 492, y: 110 },  // United Kingdom
  IE: { x: 478, y: 108 },  // Ireland
  BE: { x: 512, y: 115 },  // Belgium
  NL: { x: 515, y: 108 },  // Netherlands
  LU: { x: 515, y: 120 },  // Luxembourg
  CH: { x: 525, y: 130 },  // Switzerland
  IT: { x: 535, y: 140 },  // Italy
  MC: { x: 520, y: 138 },  // Monaco
};

// ============================================
// CENTRAL & EASTERN EUROPE
// ============================================
const CENTRAL_EASTERN_EUROPE: Record<string, Coordinates> = {
  DE: { x: 530, y: 118 },  // Germany
  AT: { x: 540, y: 128 },  // Austria
  PL: { x: 555, y: 115 },  // Poland
  CZ: { x: 545, y: 120 },  // Czech Republic
  SK: { x: 555, y: 125 },  // Slovakia
  HU: { x: 555, y: 130 },  // Hungary
  RO: { x: 575, y: 135 },  // Romania
  BG: { x: 575, y: 145 },  // Bulgaria
  UA: { x: 595, y: 115 },  // Ukraine
  BY: { x: 580, y: 105 },  // Belarus
  MD: { x: 585, y: 125 },  // Moldova
  HR: { x: 545, y: 138 },  // Croatia
  SI: { x: 540, y: 135 },  // Slovenia
  RS: { x: 560, y: 140 },  // Serbia
  BA: { x: 550, y: 140 },  // Bosnia
  AL: { x: 555, y: 150 },  // Albania
  MK: { x: 565, y: 148 },  // North Macedonia
  GR: { x: 565, y: 155 },  // Greece
};

// ============================================
// NORTHERN EUROPE / SCANDINAVIA
// ============================================
const NORTHERN_EUROPE: Record<string, Coordinates> = {
  IS: { x: 450, y: 65 },   // Iceland
  NO: { x: 530, y: 75 },   // Norway
  SE: { x: 545, y: 80 },   // Sweden
  FI: { x: 575, y: 75 },   // Finland
  DK: { x: 530, y: 100 },  // Denmark
  EE: { x: 575, y: 95 },   // Estonia
  LV: { x: 575, y: 100 },  // Latvia
  LT: { x: 575, y: 105 },  // Lithuania
};

// ============================================
// RUSSIA & CIS
// ============================================
const RUSSIA_CIS: Record<string, Coordinates> = {
  RU: { x: 750, y: 90 },   // Russia (central point)
  KZ: { x: 700, y: 130 },  // Kazakhstan
  UZ: { x: 680, y: 150 },  // Uzbekistan
  TM: { x: 665, y: 155 },  // Turkmenistan
  KG: { x: 710, y: 150 },  // Kyrgyzstan
  TJ: { x: 700, y: 155 },  // Tajikistan
  GE: { x: 625, y: 145 },  // Georgia
  AM: { x: 635, y: 150 },  // Armenia
  AZ: { x: 645, y: 150 },  // Azerbaijan
};

// ============================================
// MIDDLE EAST
// ============================================
const MIDDLE_EAST: Record<string, Coordinates> = {
  TR: { x: 595, y: 145 },  // Turkey
  CY: { x: 590, y: 158 },  // Cyprus
  SY: { x: 610, y: 160 },  // Syria
  LB: { x: 605, y: 165 },  // Lebanon
  IL: { x: 600, y: 172 },  // Israel
  PS: { x: 602, y: 174 },  // Palestine
  JO: { x: 608, y: 175 },  // Jordan
  IQ: { x: 635, y: 165 },  // Iraq
  IR: { x: 665, y: 165 },  // Iran
  KW: { x: 645, y: 180 },  // Kuwait
  SA: { x: 640, y: 200 },  // Saudi Arabia
  AE: { x: 670, y: 200 },  // UAE
  QA: { x: 660, y: 195 },  // Qatar
  BH: { x: 655, y: 190 },  // Bahrain
  OM: { x: 680, y: 210 },  // Oman
  YE: { x: 655, y: 225 },  // Yemen
};

// ============================================
// SOUTH ASIA
// ============================================
const SOUTH_ASIA: Record<string, Coordinates> = {
  PK: { x: 695, y: 175 },  // Pakistan
  IN: { x: 730, y: 200 },  // India
  NP: { x: 745, y: 185 },  // Nepal
  BT: { x: 760, y: 185 },  // Bhutan
  BD: { x: 765, y: 195 },  // Bangladesh
  LK: { x: 740, y: 235 },  // Sri Lanka
  MV: { x: 720, y: 245 },  // Maldives
  AF: { x: 690, y: 165 },  // Afghanistan
};

// ============================================
// EAST ASIA
// ============================================
const EAST_ASIA: Record<string, Coordinates> = {
  CN: { x: 810, y: 160 },  // China
  MN: { x: 795, y: 130 },  // Mongolia
  KP: { x: 885, y: 145 },  // North Korea
  KR: { x: 890, y: 155 },  // South Korea
  JP: { x: 920, y: 150 },  // Japan
  TW: { x: 880, y: 190 },  // Taiwan
  HK: { x: 860, y: 195 },  // Hong Kong
  MO: { x: 855, y: 198 },  // Macau
};

// ============================================
// SOUTHEAST ASIA
// ============================================
const SOUTHEAST_ASIA: Record<string, Coordinates> = {
  MM: { x: 780, y: 205 },  // Myanmar
  TH: { x: 795, y: 215 },  // Thailand
  LA: { x: 805, y: 210 },  // Laos
  VN: { x: 820, y: 210 },  // Vietnam
  KH: { x: 810, y: 220 },  // Cambodia
  MY: { x: 810, y: 245 },  // Malaysia
  SG: { x: 815, y: 255 },  // Singapore
  ID: { x: 850, y: 270 },  // Indonesia
  PH: { x: 875, y: 215 },  // Philippines
  BN: { x: 845, y: 245 },  // Brunei
  TL: { x: 880, y: 280 },  // Timor-Leste
};

// ============================================
// OCEANIA
// ============================================
const OCEANIA: Record<string, Coordinates> = {
  AU: { x: 910, y: 340 },  // Australia
  NZ: { x: 1000, y: 385 }, // New Zealand
  PG: { x: 920, y: 280 },  // Papua New Guinea
  FJ: { x: 1020, y: 320 }, // Fiji
};

// ============================================
// NORTH AFRICA
// ============================================
const NORTH_AFRICA: Record<string, Coordinates> = {
  MA: { x: 485, y: 170 },  // Morocco
  DZ: { x: 510, y: 175 },  // Algeria
  TN: { x: 530, y: 168 },  // Tunisia
  LY: { x: 550, y: 180 },  // Libya
  EG: { x: 590, y: 185 },  // Egypt
  SD: { x: 595, y: 215 },  // Sudan
};

// ============================================
// WEST AFRICA
// ============================================
const WEST_AFRICA: Record<string, Coordinates> = {
  MR: { x: 475, y: 210 },  // Mauritania
  SN: { x: 460, y: 225 },  // Senegal
  GM: { x: 458, y: 228 },  // Gambia
  GW: { x: 458, y: 235 },  // Guinea-Bissau
  GN: { x: 465, y: 240 },  // Guinea
  SL: { x: 463, y: 248 },  // Sierra Leone
  LR: { x: 468, y: 255 },  // Liberia
  CI: { x: 480, y: 250 },  // Ivory Coast
  ML: { x: 490, y: 220 },  // Mali
  BF: { x: 498, y: 235 },  // Burkina Faso
  GH: { x: 498, y: 250 },  // Ghana
  TG: { x: 505, y: 252 },  // Togo
  BJ: { x: 510, y: 250 },  // Benin
  NE: { x: 520, y: 220 },  // Niger
  NG: { x: 525, y: 245 },  // Nigeria
};

// ============================================
// CENTRAL AFRICA
// ============================================
const CENTRAL_AFRICA: Record<string, Coordinates> = {
  CM: { x: 540, y: 255 },  // Cameroon
  CF: { x: 560, y: 255 },  // Central African Republic
  TD: { x: 555, y: 225 },  // Chad
  GA: { x: 540, y: 270 },  // Gabon
  CG: { x: 550, y: 275 },  // Congo
  CD: { x: 575, y: 275 },  // DR Congo
  GQ: { x: 535, y: 268 },  // Equatorial Guinea
  AO: { x: 550, y: 300 },  // Angola
};

// ============================================
// EAST AFRICA
// ============================================
const EAST_AFRICA: Record<string, Coordinates> = {
  ET: { x: 620, y: 245 },  // Ethiopia
  ER: { x: 615, y: 225 },  // Eritrea
  DJ: { x: 630, y: 240 },  // Djibouti
  SO: { x: 645, y: 255 },  // Somalia
  KE: { x: 620, y: 270 },  // Kenya
  UG: { x: 600, y: 270 },  // Uganda
  RW: { x: 595, y: 278 },  // Rwanda
  BI: { x: 595, y: 285 },  // Burundi
  TZ: { x: 610, y: 295 },  // Tanzania
  MW: { x: 610, y: 320 },  // Malawi
  MZ: { x: 615, y: 335 },  // Mozambique
  ZM: { x: 585, y: 315 },  // Zambia
  ZW: { x: 595, y: 330 },  // Zimbabwe
  MG: { x: 655, y: 330 },  // Madagascar
};

// ============================================
// SOUTHERN AFRICA
// ============================================
const SOUTHERN_AFRICA: Record<string, Coordinates> = {
  NA: { x: 555, y: 335 },  // Namibia
  BW: { x: 575, y: 335 },  // Botswana
  ZA: { x: 580, y: 365 },  // South Africa
  SZ: { x: 600, y: 350 },  // Eswatini
  LS: { x: 590, y: 360 },  // Lesotho
};

// ============================================
// COMBINED COORDINATES
// ============================================
export const COUNTRY_COORDINATES: Record<string, Coordinates> = {
  // North America
  ...NORTH_AMERICA,
  // Central America & Caribbean
  ...CENTRAL_AMERICA,
  // South America
  ...SOUTH_AMERICA,
  // Western Europe
  ...WESTERN_EUROPE,
  // Central & Eastern Europe
  ...CENTRAL_EASTERN_EUROPE,
  // Northern Europe
  ...NORTHERN_EUROPE,
  // Russia & CIS
  ...RUSSIA_CIS,
  // Middle East
  ...MIDDLE_EAST,
  // South Asia
  ...SOUTH_ASIA,
  // East Asia
  ...EAST_ASIA,
  // Southeast Asia
  ...SOUTHEAST_ASIA,
  // Oceania
  ...OCEANIA,
  // North Africa
  ...NORTH_AFRICA,
  // West Africa
  ...WEST_AFRICA,
  // Central Africa
  ...CENTRAL_AFRICA,
  // East Africa
  ...EAST_AFRICA,
  // Southern Africa
  ...SOUTHERN_AFRICA,
};

/**
 * Get coordinates for a country, with offset for multiple users in same country
 */
export function getCountryCoordinates(
  countryCode: string,
  index: number = 0
): Coordinates | null {
  const base = COUNTRY_COORDINATES[countryCode];
  if (!base) return null;

  // Add small offset for multiple users in same country
  const offsetX = (index % 4) * 10 - 15;
  const offsetY = Math.floor(index / 4) * 10 - 5;

  return {
    x: base.x + offsetX,
    y: base.y + offsetY,
  };
}

/**
 * Check if a country code has coordinates defined
 */
export function hasCountryCoordinates(countryCode: string): boolean {
  return countryCode in COUNTRY_COORDINATES;
}
