import Image from "next/image";
import { Card } from "@/components/ui";

interface FreelancerProfile {
  name: string;
  email: string;
  avatar: string;
}

interface ServicePreview {
  title: string;
  price: string;
  rating: number;
}

const mockFreelancer: FreelancerProfile = {
  name: "Sarah Johnson",
  email: "sarah.dev@gmail.com",
  avatar: "SJ",
};

const mockService: ServicePreview = {
  title: "Full Stack Development",
  price: "$2,500",
  rating: 4.9,
};

export function HeroShowcase() {
  return (
    <div className="relative">
      {/* Main Card - Neumorphic */}
      <Card variant="neumorphic" padding="none" className="overflow-hidden w-72 md:w-80">
        {/* Profile Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border-light">
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src="/mock-images/woman1.png"
              alt={mockFreelancer.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-text-primary">{mockFreelancer.name}</p>
            <p className="text-sm text-text-secondary">{mockFreelancer.email}</p>
          </div>
        </div>

        {/* Service Details */}
        <div className="p-4 border-b border-border-light">
          <p className="text-sm text-text-secondary mb-1">Featured Service</p>
          <p className="text-2xl font-bold text-text-primary">{mockService.price}</p>
          <p className="text-sm text-text-secondary">{mockService.title}</p>
        </div>

        {/* Payment Options - Neumorphic Inset */}
        <div className="p-4 space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl shadow-[var(--shadow-neumorphic-inset-light)] bg-background cursor-pointer">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="flex-1 text-sm font-medium text-text-primary">Secure Payment</span>
            <div className="h-4 w-4 rounded-full border-4 border-primary" />
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl shadow-[var(--shadow-neumorphic-inset-light)] bg-background cursor-pointer">
            <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="flex-1 text-sm font-medium text-text-primary">Escrow Protection</span>
            <div className="h-4 w-4 rounded-full border-2 border-text-secondary" />
          </label>
        </div>

        {/* Hire Button - Neumorphic */}
        <div className="p-4">
          <button className="w-full rounded-xl bg-primary py-3 font-medium text-white shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all">
            Hire Now
          </button>
        </div>
      </Card>

      {/* Floating Badge Card - Neumorphic */}
      <div className="absolute -top-4 -right-4 z-10">
        <Card variant="neumorphic" padding="sm" className="bg-primary border-none">
          <p className="text-xs font-medium text-white/80 mb-1">Top Rated</p>
          <p className="text-lg font-bold text-white">{mockService.rating} <span className="text-sm font-normal">/ 5.0</span></p>
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-3 w-3 fill-white" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
