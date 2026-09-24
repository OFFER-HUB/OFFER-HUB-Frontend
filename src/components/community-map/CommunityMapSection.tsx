"use client";

import { useMemo } from "react";
import { WorldMap } from "./WorldMap";
import { MapStats } from "./MapStats";
import { MapLegend } from "./MapLegend";
import { MapUser, MapStats as MapStatsType } from "./types";

interface CommunityMapSectionProps {
  users: MapUser[];
  isLoading?: boolean;
  error?: string | null;
}

export function CommunityMapSection({
  users,
  isLoading = false,
  error = null,
}: CommunityMapSectionProps) {
  // Calculate stats from users
  const stats: MapStatsType = useMemo(() => {
    const countries = new Set(users.map((u) => u.countryCode));
    return {
      totalMembers: users.length,
      totalCountries: countries.size,
      freelancersCount: users.filter((u) => u.userType === "FREELANCER").length,
      clientsCount: users.filter((u) => u.userType === "CLIENT").length,
    };
  }, [users]);

  // Loading state
  if (isLoading) {
    return (
      <section className="relative py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="mt-12 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary">Loading community map...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="relative py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="mt-12 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-error mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary hover:text-primary-hover underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <section className="relative py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeader />
          <div className="mt-12 flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background shadow-[var(--shadow-neumorphic-inset-light)] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-text-primary">
                No community members have opted to appear on the map yet.
              </p>
              <p className="text-sm text-text-secondary mt-2">
                Update your profile settings to be the first!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 bg-background overflow-hidden">
      {/* Gradient background - similar to other sections */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <SectionHeader />

        {/* Stats */}
        <div className="mt-8">
          <MapStats stats={stats} />
        </div>
      </div>

      {/* Full-width map - NO container */}
      <div className="mt-10 relative z-10">
        <WorldMap users={users} />
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
        Global Network
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
        Our Global Community
      </h2>
      <p className="text-text-secondary text-lg">
        Connect with talented freelancers and clients from around the world.
        Our community spans across continents, bringing diverse skills and
        opportunities together.
      </p>
    </div>
  );
}
