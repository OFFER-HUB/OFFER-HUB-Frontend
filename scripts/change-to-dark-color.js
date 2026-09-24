#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/our-community/community-map.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Dark color from project (secondary color)
const DARK_COLOR = '#002333';

// Process circles (if SVG already has circles) or polygons (if converting from polygons)
const polygonRegex = /<polygon points="([^"]*)" fill="([^"]*)"\s*\/>/g;
const circleRegex = /<circle cx="([^"]*)" cy="([^"]*)" r="[^"]*" fill="([^"]*)"\s*\/>/g;
const newCircles = [];
let match;

// Check if SVG has circles
const hasCircles = svgContent.includes('<circle');

if (hasCircles) {
  // Process existing circles
  while ((match = circleRegex.exec(svgContent)) !== null) {
    const cx = parseFloat(match[1]);
    const cy = parseFloat(match[2]);

    // Skip stray points
    if (cx < 50 && cy > 150 && cy < 350) {
      continue;
    }

    // Create circle with new radius
    newCircles.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" fill="${DARK_COLOR}"/>`);
  }
} else {
  // Process polygons and convert to circles
  while ((match = polygonRegex.exec(svgContent)) !== null) {
    const pointsStr = match[1];
    const points = pointsStr.split(' ').map(p => {
      const [x, y] = p.split(',').map(Number);
      return { x, y };
    });

    // Calculate center of polygon
    let sumX = 0, sumY = 0;
    points.forEach(p => {
      sumX += p.x;
      sumY += p.y;
    });
    const centerX = sumX / points.length;
    const centerY = sumY / points.length;

    // Skip stray points
    if (centerX < 50 && centerY > 150 && centerY < 350) {
      continue;
    }

    // Create circle at polygon center
    newCircles.push(`<circle cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" r="4" fill="${DARK_COLOR}"/>`);
  }
}

// Build new SVG
const newSvg = `<svg width="1240" height="431" viewBox="0 0 1240 431" fill="none" xmlns="http://www.w3.org/2000/svg">
${newCircles.join('\n')}
</svg>`;

fs.writeFileSync(svgPath, newSvg);
console.log(`Converted ${newCircles.length} polygons to circles with dark color (${DARK_COLOR})`);
