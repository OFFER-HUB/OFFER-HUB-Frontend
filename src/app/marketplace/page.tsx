"use client";

import { Navbar } from "@/components/landing";
import {
  FilterSidebar,
  FreelancerCard,
  PopularCarousel,
  ProfileSidebar,
  SearchBar,
} from "@/components/marketplace";
import { popularOffers, freelancers } from "@/data/marketplace.data";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-6 lg:py-8">
        {/* Full width container with edge-to-edge padding */}
        <div className="w-full px-4 lg:px-6 xl:px-8">
          {/* Main Grid Layout */}
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

              {/* Popular Section - Carousel */}
              <section>
                <PopularCarousel offers={popularOffers} />
              </section>

              {/* Freelancers Grid Section */}
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4">Top Freelancers</h2>
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
              </section>
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
