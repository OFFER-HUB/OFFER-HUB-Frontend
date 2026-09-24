// Main section component
export { CommunityMapSection } from "./CommunityMapSection";

// Subcomponents (if needed individually)
export { WorldMap } from "./WorldMap";
export { MapStats } from "./MapStats";
export { MapLegend } from "./MapLegend";
export { MapTooltip } from "./MapTooltip";
export { JoinCommunityCTA } from "./JoinCommunityCTA";

// Types
export type {
  MapUser,
  MapUserType,
  MapLocationsResponse,
  MapStats as MapStatsType,
} from "./types";

// Mock data (for development/testing)
export { MOCK_MAP_USERS } from "./mock-data";

// Region-based positioning (replaces specific coordinates)
export {
  getRegionForCountry,
  getRandomCoordinatesInRegion,
  COUNTRY_TO_REGION,
  REGION_BOUNDARIES,
} from "./country-to-region";
export type { Region } from "./country-to-region";
