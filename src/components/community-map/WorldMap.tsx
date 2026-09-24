"use client";

import { useState, useMemo, memo } from "react";
import { MapTooltip } from "./MapTooltip";
import { MapUser } from "./types";
import { getRegionForCountry } from "./country-to-region";
import { getRandomPolygonFromRegion, getPolygonData } from "./svg-polygon-mapping";

interface WorldMapProps {
  users: MapUser[];
}

const DEFAULT_MARKER_COLOR = "#002333"; // Secondary (dark blue)
const HOVER_MARKER_COLOR = "#149A9B"; // Primary (teal) for hover

export const WorldMap = memo(function WorldMap({ users }: WorldMapProps) {
  const [hoveredUser, setHoveredUser] = useState<MapUser | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Group users by country to calculate offsets
  const usersByCountry = useMemo(() => {
    const grouped: Record<string, MapUser[]> = {};
    users.forEach((user) => {
      if (user.countryCode) {
        if (!grouped[user.countryCode]) {
          grouped[user.countryCode] = [];
        }
        grouped[user.countryCode].push(user);
      }
    });
    return grouped;
  }, [users]);

  // Assign each user to a random polygon from their region
  const usersWithPolygons = useMemo(() => {
    return users
      .map((user) => {
        if (!user.countryCode) return null;

        // Get region for country
        const region = getRegionForCountry(user.countryCode);
        if (!region) return null;

        // Get random polygon from region
        const polygonIndex = getRandomPolygonFromRegion(region);
        if (polygonIndex === -1) return null;

        const polygonData = getPolygonData(polygonIndex);
        if (!polygonData) return null;

        return { user, polygon: polygonData, region };
      })
      .filter(Boolean) as Array<{
        user: MapUser;
        polygon: { index: number; points: string; x: number; y: number; region: string };
        region: string;
      }>;
  }, [users]);

  const handleMouseEnter = (user: MapUser, e: React.MouseEvent) => {
    setHoveredUser(user);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredUser(null);
    setHoveredUserId(null);
  };

  return (
    <div className="relative w-full overflow-hidden py-8">
      <svg
        viewBox="0 0 1240 431"
        className="w-full h-auto"
        style={{
          minHeight: "clamp(200px, 40vh, 500px)",
        }}
      >
        {/* SVG Filters for glow and shadow effects */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-hover" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* Dotted world map background */}
        <image
          href="/our-community/community-map.svg?v=40"
          x="0"
          y="0"
          width="1240"
          height="431"
          opacity="1"
        />

        {/* User markers (visible filled circles with glow and shadow) */}
        {usersWithPolygons.map(({ user, polygon }) => {
          const isHovered = hoveredUserId === user.id;
          const color = isHovered ? HOVER_MARKER_COLOR : DEFAULT_MARKER_COLOR;
          const filterEffects = isHovered ? "url(#glow-hover) url(#shadow)" : "url(#glow) url(#shadow)";

          return (
            <circle
              key={user.id}
              cx={polygon.x}
              cy={polygon.y}
              r="5"
              fill={color}
              stroke="none"
              filter={filterEffects}
              onMouseEnter={(e) => {
                setHoveredUser(user);
                setHoveredUserId(user.id);
                setTooltipPosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={handleMouseLeave}
              className="transition-all duration-200 cursor-pointer"
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </svg>

      <MapTooltip user={hoveredUser} position={tooltipPosition} />
    </div>
  );
});
