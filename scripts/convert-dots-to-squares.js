#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extract all path elements
const pathRegex = /<path[^>]*d="([^"]*)"[^>]*fill="([^"]*)"[^>]*\/>/g;

// Parse a path and extract the approximate center and size
function parsePath(d) {
  // Extract all numbers from the path
  const numbers = d.match(/-?\d+\.?\d*/g)?.map(Number) || [];
  if (numbers.length < 4) return null;

  // Find min/max to get bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  // Parse pairs of coordinates
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = numbers[i];
    const y = numbers[i + 1];
    if (!isNaN(x) && !isNaN(y)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX === Infinity) return null;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX;
  const height = maxY - minY;

  return { centerX, centerY, width, height };
}

// Collect all rect elements
const rects = [];
let match;
while ((match = pathRegex.exec(svgContent)) !== null) {
  const d = match[1];
  const fill = match[2];
  const parsed = parsePath(d);

  if (parsed) {
    // Create square (use smaller dimension to make it more uniform)
    const size = 4; // Fixed size for uniform squares
    const x = parsed.centerX - size / 2;
    const y = parsed.centerY - size / 2;

    rects.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${size}" height="${size}" fill="${fill}"/>`);
  }
}

// Build new SVG
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
${rects.join('\n')}
</svg>`;

// Write output
fs.writeFileSync(svgPath, newSvg);
console.log(`Converted ${rects.length} dots to squares`);
