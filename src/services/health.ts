import { httpGet } from "./http-client";

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export async function getHealth() {
  return httpGet<HealthResponse>("/health");
}

export async function getDetailedHealth() {
  return httpGet<HealthResponse>("/health/detailed");
}
