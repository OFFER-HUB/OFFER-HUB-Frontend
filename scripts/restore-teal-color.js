#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Original teal color
const TEAL_COLOR = '#149A9B';

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

  // Paint everything teal
  newPolygons.push(`<polygon points="${pointsStr}" fill="${TEAL_COLOR}"/>`);
}

// Build new SVG
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
${newPolygons.join('\n')}
</svg>`;

fs.writeFileSync(svgPath, newSvg);
console.log(`Restored ${newPolygons.length} polygons to teal color (#149A9B)`);
