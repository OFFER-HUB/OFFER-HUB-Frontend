#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Extract all polygon elements
const polygonRegex = /<polygon points="([^"]*)" fill="([^"]*)"\s*\/>/g;

const tiltedDiamonds = [];
let match;

// Tilt angle in radians (15 degrees = slight tilt to the right)
const tiltAngle = 15 * (Math.PI / 180);
const cos = Math.cos(tiltAngle);
const sin = Math.sin(tiltAngle);

while ((match = polygonRegex.exec(svgContent)) !== null) {
  const pointsStr = match[1];
  const fill = match[2];

  // Parse the 4 points
  const coords = pointsStr.split(' ').map(p => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });

  if (coords.length !== 4) continue;

  // Calculate center
  const cx = (coords[0].x + coords[1].x + coords[2].x + coords[3].x) / 4;
  const cy = (coords[0].y + coords[1].y + coords[2].y + coords[3].y) / 4;

  // Rotate each point around center
  const rotatedPoints = coords.map(({ x, y }) => {
    const dx = x - cx;
    const dy = y - cy;
    const newX = cx + dx * cos - dy * sin;
    const newY = cy + dx * sin + dy * cos;
    return `${newX.toFixed(1)},${newY.toFixed(1)}`;
  });

  tiltedDiamonds.push(`<polygon points="${rotatedPoints.join(' ')}" fill="${fill}"/>`);
}

// Build new SVG
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
${tiltedDiamonds.join('\n')}
</svg>`;

// Write output
fs.writeFileSync(svgPath, newSvg);
console.log(`Tilted ${tiltedDiamonds.length} diamonds by 15°`);
