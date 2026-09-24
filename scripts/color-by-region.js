#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Region colors (Mexico = WHITE, Central America = GREEN, South America = YELLOW)
const COLORS = {
  NORTH_AMERICA: '#3B82F6',      // Blue
  NORTH_AMERICA_BORDER: '#FFFFFF', // White (unused)
  MEXICO: '#FFFFFF',             // WHITE (Mexico separate region)
  CENTRAL_AMERICA: '#22C55E',    // GREEN (Central America)
  SOUTH_AMERICA: '#EAB308',      // YELLOW (South America)
  EUROPE: '#EF4444',             // Red
  AFRICA: '#F97316',             // Orange
  MIDDLE_EAST: '#EC4899',        // Pink
  ASIA: '#8B5CF6',               // Purple
  OCEANIA: '#06B6D4',            // Cyan
  UNKNOWN: '#6B7280',            // Gray
};

// Determine region based on x,y coordinates (viewBox 1240x431)
function getRegion(x, y) {
  // Oceania (bottom-right) - check first to avoid overlap with Asia
  if (x >= 800 && y >= 250) return 'OCEANIA';

  // Europe northern region (Scandinavia, Iceland at top)
  if (x >= 500 && x < 600 && y < 100) return 'EUROPE';

  // Top rows western hemisphere are North America (Arctic, Alaska, Northern Canada, Greenland)
  // Extended 4 columns to the right in rows 1-6
  if (x < 500 && y < 100) return 'NORTH_AMERICA';

  // North America (USA & Canada only, excluding Mexico)
  if (x < 450 && y < 150) return 'NORTH_AMERICA';

  // Mexico (separate region between North America and Central America)
  if (x < 320 && y >= 150 && y < 200) return 'MEXICO';

  // Central America & Caribbean (below Mexico)
  if (x < 320 && y >= 200 && y < 240) return 'CENTRAL_AMERICA';

  // South America (everything below Central America)
  if (x < 360 && y >= 240) return 'SOUTH_AMERICA';

  // Atlantic islands near Africa (Cape Verde, etc.) - should be Africa
  if (x >= 420 && x < 480 && y >= 200 && y < 260) return 'AFRICA';

  // Europe top band (bordering Asia, Scandinavia region)
  if (x >= 450 && x < 700 && y >= 100 && y < 140) return 'EUROPE';

  // Europe (center-top, expanded)
  if (x >= 450 && x < 620 && y >= 100 && y < 175) return 'EUROPE';

  // Middle East (check before Africa due to overlap)
  if (x >= 580 && x < 720 && y >= 140 && y < 250) return 'MIDDLE_EAST';

  // Africa (expanded to cover all)
  if (x >= 450 && x < 700 && y >= 165 && y < 420) return 'AFRICA';

  // Asia top rows (Siberia, Northern Asia)
  if (x >= 600 && y < 100) return 'ASIA';

  // Asia (large area, including Russia and Southeast Asia)
  if (x >= 600 && y < 290) return 'ASIA';

  // Southeast Asia islands and eastern regions
  if (x >= 750 && y >= 200 && y < 320) return 'ASIA';

  return 'UNKNOWN';
}

// Process polygons
const polygonRegex = /<polygon points="([^"]*)" fill="([^"]*)"\s*\/>/g;
const newPolygons = [];
let match;

while ((match = polygonRegex.exec(svgContent)) !== null) {
  const pointsStr = match[1];

  // Get first point to determine region
  const firstPoint = pointsStr.split(' ')[0];
  const [x, y] = firstPoint.split(',').map(Number);

  // Skip stray polygons at the beginning (isolated points that don't represent any location)
  if (x < 50 && y > 150 && y < 350) {
    continue; // Skip this polygon
  }

  const region = getRegion(x, y);
  const color = COLORS[region];

  newPolygons.push(`<polygon points="${pointsStr}" fill="${color}"/>`);
}

// Build new SVG
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
<!-- Region Colors:
  Blue (#3B82F6) = North America
  Green (#22C55E) = Central America
  Yellow (#EAB308) = South America
  Red (#EF4444) = Europe
  Orange (#F97316) = Africa
  Pink (#EC4899) = Middle East
  Purple (#8B5CF6) = Asia
  Cyan (#06B6D4) = Oceania
  Gray (#6B7280) = Unknown
-->
${newPolygons.join('\n')}
</svg>`;

fs.writeFileSync(svgPath, newSvg);
console.log(`Colored ${newPolygons.length} polygons by region`);
console.log('Colors: Blue=NorthAmerica, Green=CentralAmerica, Yellow=SouthAmerica, Red=Europe, Orange=Africa, Pink=MiddleEast, Purple=Asia, Cyan=Oceania');
