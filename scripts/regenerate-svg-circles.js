#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '../src/components/community-map/svg-polygon-mapping.ts');
const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const DARK_COLOR = '#002333';

// Read the TypeScript file
const content = fs.readFileSync(mappingPath, 'utf-8');

// Extract polygon data using regex
const polygonRegex = /x:\s*([\d.]+),\s*y:\s*([\d.]+)/g;
const polygons = [];
let match;

while ((match = polygonRegex.exec(content)) !== null) {
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);

  // Skip stray points
  if (x < 50 && y > 150 && y < 350) {
    continue;
  }

  polygons.push({ x, y });
}

// Create circles from polygon data (almost invisible circles that cast shadows)
const circles = polygons.map(p => {
  return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${DARK_COLOR}" fill-opacity="0.05" stroke="none" filter="url(#circleShadow)"/>`;
});

// Build SVG with shadow filter
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.15"/>
  </filter>
</defs>
${circles.join('\n')}
</svg>`;

fs.writeFileSync(svgPath, newSvg);
console.log(`Generated ${circles.length} circles in SVG with dark color (${DARK_COLOR})`);
