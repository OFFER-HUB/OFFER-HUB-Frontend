/**
 * API Configuration
 *
 * Centralized configuration for API endpoints.
 * Toggle between local and production API using NEXT_PUBLIC_USE_LOCAL_API.
 */

const USE_LOCAL_API = process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true';
const LOCAL_API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:4000/api/v1';
const PRODUCTION_API_URL = process.env.NEXT_PUBLIC_PRODUCTION_API_URL || 'https://offer-hub-api-production.up.railway.app/api/v1';

/**
 * Get the current API base URL based on environment configuration
 */
export function getApiUrl(): string {
  return USE_LOCAL_API ? LOCAL_API_URL : PRODUCTION_API_URL;
}

/**
 * API base URL (use this in your API calls)
 */
export const API_URL = getApiUrl();

/**
 * Backend base URL (without /api/v1) - for asset URLs, images, etc.
 */
export const BACKEND_URL = API_URL.replace("/api/v1", "");

/**
 * Log current API configuration (only in development)
 */
if (process.env.NODE_ENV === 'development') {
  console.log(`[API Config] Using ${USE_LOCAL_API ? 'LOCAL' : 'PRODUCTION'} API: ${API_URL}`);
}
