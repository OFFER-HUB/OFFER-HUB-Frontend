#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extract all rect elements and convert to diamonds (rotated 45°)
const rectRegex = /<rect x="([^"]*)" y="([^"]*)" width="([^"]*)" height="([^"]*)" fill="([^"]*)"\s*\/>/g;

const diamonds = [];
let match;
while ((match = rectRegex.exec(svgContent)) !== null) {
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  const width = parseFloat(match[3]);
  const height = parseFloat(match[4]);
  const fill = match[5];

  // Calculate center point for rotation
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Create diamond using a smaller size for cleaner look
  const size = 3;

  // Use polygon for diamond shape (more precise than rotated rect)
  const halfSize = size / 2;
  const points = [
    `${cx},${cy - halfSize * 1.2}`,      // top
    `${cx + halfSize * 1.2},${cy}`,      // right
    `${cx},${cy + halfSize * 1.2}`,      // bottom
    `${cx - halfSize * 1.2},${cy}`,      // left
  ].join(' ');

  diamonds.push(`<polygon points="${points}" fill="${fill}"/>`);
}

// Build new SVG
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
${diamonds.join('\n')}
</svg>`;

// Write output
fs.writeFileSync(svgPath, newSvg);
console.log(`Converted ${diamonds.length} squares to diamonds`);
