"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing";
import {
  FilterSidebar,
  FreelancerCard,
  PopularCarousel,
  ProfileSidebar,
  SearchBar,
} from "@/components/marketplace";
import { getPublicOffers, getPublicServices } from "@/lib/api/marketplace";
import type { Offer, Freelancer } from "@/types/marketplace.types";
import { LoadingSpinner } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) {
        return "Just now";
      }
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } catch {
    return "Recently";
  }
}

export default function MarketplacePage() {
  const [popularOffers, setPopularOffers] = useState<Offer[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarketplaceData() {
      setIsLoading(true);
      setError(null);
      try {
        const [offersRes, servicesRes] = await Promise.all([
          getPublicOffers({ limit: 6 }),
          getPublicServices({ limit: 20 }),
        ]);

        // Map MarketplaceOffer to Offer
        const mappedOffers: Offer[] = offersRes.data.map((offer) => {
          const companyName = offer.user?.email ? offer.user.email.split("@")[0] : "Client";
          return {
            id: offer.id,
            company: {
              name: companyName,
              logo: "", // Public offers don't have static logos
            },
            title: offer.title,
            rating: 4.8,
            location: "Remote",
            postedAt: formatTimeAgo(offer.createdAt),
            applicants: offer.applicantsCount || 0,
            isBookmarked: false,
          };
        });

        // Extract unique freelancers from active services
        const uniqueFreelancersMap = new Map<string, Freelancer>();
        servicesRes.data.forEach((service) => {
          if (service.user && !uniqueFreelancersMap.has(service.userId)) {
            const user = service.user;
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || 
                             user.username || 
                             user.email.split("@")[0];

            uniqueFreelancersMap.set(service.userId, {
              id: user.id,
              name: fullName,
              avatar: user.avatarUrl || "",
              title: service.title,
              rating: parseFloat(service.averageRating || "5.0"),
              location: user.country || "Worldwide",
              skills: [service.category],
              hourlyRate: parseFloat(service.price) || 50,
              isAvailable: service.status === "ACTIVE",
            });
          }
        });

        setPopularOffers(mappedOffers);
        setFreelancers(Array.from(uniqueFreelancersMap.values()));
      } catch (err) {
        console.error("Failed to load marketplace data:", err);
        setError("Failed to load marketplace data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMarketplaceData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-6 lg:py-8">
        <div className="w-full px-4 lg:px-6 xl:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
            {/* Left Sidebar - Filters */}
            <aside className="lg:col-span-3 xl:col-span-2 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <FilterSidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-6 xl:col-span-8 order-1 lg:order-2 space-y-8">
              {/* Search Bar */}
              <SearchBar />

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingSpinner className="text-primary" />
                </div>
              ) : error ? (
                <div className="p-6 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] text-center text-red-500">
                  {error}
                </div>
              ) : (
                <>
                  {/* Popular Section - Carousel */}
                  <section>
                    {popularOffers.length > 0 ? (
                      <PopularCarousel offers={popularOffers} />
                    ) : (
                      <div className="p-8 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] text-center">
                        <p className="text-text-secondary mb-2 font-medium">No popular offers available</p>
                        <p className="text-xs text-text-secondary/60">Be the first to post a new offer to start hiring!</p>
                      </div>
                    )}
                  </section>

                  {/* Freelancers Grid Section */}
                  <section>
                    <h2 className="text-lg font-bold text-text-primary mb-4">Top Freelancers</h2>
                    {freelancers.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {freelancers.map((freelancer, index) => (
                          <div
                            key={freelancer.id}
                            className="opacity-0 animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                          >
                            <FreelancerCard freelancer={freelancer} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff] text-center">
                        <p className="text-text-secondary mb-2 font-medium">No freelancers found</p>
                        <p className="text-xs text-text-secondary/60">Create a freelancer profile and add services to be listed here!</p>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>

            {/* Right Sidebar - Profile/Sign In */}
            <aside className="lg:col-span-3 xl:col-span-2 order-3">
              <div className="lg:sticky lg:top-24">
                <ProfileSidebar />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
