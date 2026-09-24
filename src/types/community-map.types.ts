export type MapUserType = "FREELANCER" | "CLIENT";

export interface MapUser {
  id: string;
  name: string;
  avatar: string | null;
  userType: MapUserType;
  country: string;
  countryCode: string;
  region: string | null;
  latitude: number;
  longitude: number;
}

export interface MapLocationsResponse {
  users: MapUser[];
  total: number;
}

export interface MapStats {
  totalMembers: number;
  totalCountries: number;
  freelancersCount: number;
  clientsCount: number;
}
