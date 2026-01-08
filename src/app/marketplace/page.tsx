"use client";

import { Container } from "@/components/ui";
import { Navbar } from "@/components/landing";
import {
  FilterSidebar,
  FreelancerCard,
  PopularOfferCard,
  ProfileSidebar,
  SearchBar,
} from "@/components/marketplace";
import { popularOffers, freelancers } from "@/data/marketplace.data";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-6 lg:py-8">
        <Container>
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar - Filters */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <FilterSidebar />
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-8">
              {/* Search Bar */}
              <SearchBar />

              {/* Popular Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary">Popular</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">1</span>
                    <span className="text-sm text-text-secondary">2</span>
                    <span className="text-sm text-text-secondary">3</span>
                    <span className="text-sm text-text-secondary">4</span>
                    <span className="text-sm text-text-secondary">5</span>
                    <span className="text-sm text-text-secondary">...</span>
                    <button className="px-3 py-1 text-sm rounded-lg bg-secondary text-white">
                      -
                    </button>
                    <button className="p-1 text-text-secondary hover:text-text-primary">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Popular Offers Grid - Bento Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {popularOffers.map((offer) => (
                    <PopularOfferCard
                      key={offer.id}
                      offer={offer}
                      onClick={() => {
                        // In real app, open detail modal
                        console.log("Clicked offer:", offer.id);
                      }}
                    />
                  ))}
                </div>
              </section>

              {/* Freelancers Grid Section */}
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4">Top Freelancers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {freelancers.map((freelancer) => (
                    <FreelancerCard key={freelancer.id} freelancer={freelancer} />
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sidebar - Profile/Sign In */}
            <aside className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-24">
                <ProfileSidebar />
              </div>
            </aside>
          </div>
        </Container>
      </main>
    </div>
  );
}
