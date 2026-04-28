"use client";

import { useState, useEffect } from "react";
import { CommunityMapSection, JoinCommunityCTA } from "@/components/community-map";
import { Navbar, Footer } from "@/components/landing";
import { getMapLocations } from "@/lib/api/community";
import type { MapUser } from "@/components/community-map";

/**
 * Set to true to use mock data for development/testing
 * Set to false to fetch from the real API
 */
const _USE_MOCK_DATA = false; // Use real data

export default function OurCommunityPage() {
  const [users, setUsers] = useState<MapUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        // Fetch from real API
        const data = await getMapLocations();
        // Limit to max 100 users
        setUsers(data.users.slice(0, 100));
      } catch (err) {
        console.error("Failed to load map locations:", err);
        setError("Failed to load community map. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <CommunityMapSection
          users={users}
          isLoading={isLoading}
          error={error}
        />
        <JoinCommunityCTA />
      </main>
      <Footer />
    </>
  );
}
