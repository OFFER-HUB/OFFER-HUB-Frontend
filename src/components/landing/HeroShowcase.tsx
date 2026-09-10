"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface FreelancerHighlight {
  title: string;
  subtitle: string;
  icon: "code" | "design" | "ai" | "mobile" | "security" | "database" | "cloud" | "check";
}

interface FreelancerProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: string;
  reviews: number;
  badge: string;
  price: string;
  pricePeriod: string;
  serviceTitle: string;
  skills: string[];
  highlights: [FreelancerHighlight, FreelancerHighlight];
}

const PROFILES: FreelancerProfile[] = [
  {
    id: "sarah",
    name: "Sarah Johnson",
    role: "Full Stack Engineer",
    location: "San Francisco, USA",
    avatar: "/mock-images/woman1.png",
    rating: "4.9",
    reviews: 148,
    badge: "Full Stack Lead",
    price: "$2,500",
    pricePeriod: "per project",
    serviceTitle: "Full-Stack Web App & Scalable API Architecture",
    skills: ["React", "Next.js", "Node.js", "PostgreSQL"],
    highlights: [
      {
        title: "Production Next.js 15 & REST/GraphQL",
        subtitle: "Enterprise architecture, tested code",
        icon: "code",
      },
      {
        title: "PostgreSQL & Database Optimization",
        subtitle: "High-performance queries & caching",
        icon: "database",
      },
    ],
  },
  {
    id: "marcus",
    name: "Marcus Chen",
    role: "Lead Product Designer",
    location: "Toronto, Canada",
    avatar: "/mock-images/man1.png",
    rating: "5.0",
    reviews: 94,
    badge: "Design Systems",
    price: "$1,800",
    pricePeriod: "per sprint",
    serviceTitle: "Modern SaaS Design System & Interactive Prototypes",
    skills: ["Figma", "UI/UX", "Design Tokens", "Wireframing"],
    highlights: [
      {
        title: "Pixel-Perfect Figma Component Library",
        subtitle: "Auto-layout, variables & variants",
        icon: "design",
      },
      {
        title: "User Testing & Clickable Prototypes",
        subtitle: "Ready for stakeholder demos",
        icon: "check",
      },
    ],
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "AI & Machine Learning Specialist",
    location: "Berlin, Germany",
    avatar: "/mock-images/woman2.png",
    rating: "4.9",
    reviews: 82,
    badge: "AI & RAG Specialist",
    price: "$3,200",
    pricePeriod: "per model",
    serviceTitle: "Custom LLM Fine-Tuning & Vector Search Pipelines",
    skills: ["Python", "PyTorch", "LangChain", "Qdrant"],
    highlights: [
      {
        title: "Retrieval-Augmented Generation (RAG)",
        subtitle: "Low latency, grounded answers",
        icon: "ai",
      },
      {
        title: "Custom Embedding & Data Pipelines",
        subtitle: "High accuracy search & semantic ranking",
        icon: "database",
      },
    ],
  },
  {
    id: "david",
    name: "David Kim",
    role: "Mobile App Developer",
    location: "Seoul, South Korea",
    avatar: "/mock-images/man2.png",
    rating: "4.8",
    reviews: 116,
    badge: "iOS & Android",
    price: "$2,900",
    pricePeriod: "per release",
    serviceTitle: "Cross-Platform React Native & Native Swift/Kotlin",
    skills: ["React Native", "Swift", "Kotlin", "Firebase"],
    highlights: [
      {
        title: "Store Submission & Automated CI/CD",
        subtitle: "Apple App Store & Google Play",
        icon: "mobile",
      },
      {
        title: "Offline Sync & Push Notifications",
        subtitle: "Reliable background tasks & cache",
        icon: "cloud",
      },
    ],
  },
  {
    id: "sofia",
    name: "Sofia Martinez",
    role: "Stellar Smart Contract Auditor",
    location: "Madrid, Spain",
    avatar: "/mock-images/woman3.png",
    rating: "5.0",
    reviews: 73,
    badge: "Security Auditor",
    price: "$3,500",
    pricePeriod: "per audit",
    serviceTitle: "Soroban Smart Contracts & Secure Escrow Protocols",
    skills: ["Rust", "Soroban", "Cryptography", "Stellar SDK"],
    highlights: [
      {
        title: "Soroban Smart Escrow Validation",
        subtitle: "Multi-party lock & release security",
        icon: "security",
      },
      {
        title: "Zero-Vulnerability Formal Audit",
        subtitle: "Comprehensive vulnerability report",
        icon: "check",
      },
    ],
  },
];

function RenderIcon({ icon, className }: { icon: FreelancerHighlight["icon"]; className: string }) {
  switch (icon) {
    case "code":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case "design":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "ai":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "mobile":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case "security":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "database":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    case "cloud":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case "check":
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}

export function HeroShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCenterHovered, setIsCenterHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % PROFILES.length);
  }, []);

  // Continuous auto-rotation every 4.8 seconds (pauses when central card is hovered)
  useEffect(() => {
    if (isCenterHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4800);
    return () => clearInterval(interval);
  }, [isCenterHovered, nextSlide]);

  return (
    <div className="relative w-full max-w-[540px] sm:max-w-[620px] mx-auto select-none px-4 overflow-hidden py-4">
      {/* 3D Coverflow Stage */}
      <div className="relative h-[480px] flex items-center justify-center">
        {PROFILES.map((profile, index) => {
          let offset = (index - currentIndex) % PROFILES.length;
          if (offset < -2) offset += PROFILES.length;
          if (offset > 2) offset -= PROFILES.length;

          const isCenter = offset === 0;
          const isRight = offset === 1;
          const isLeft = offset === -1;
          const isExitingLeft = offset === -2;

          // Inline style based configuration to avoid Tailwind cascade specificity bugs
          const smoothTransition =
            "transform 800ms cubic-bezier(0.25, 1, 0.5, 1), opacity 800ms cubic-bezier(0.25, 1, 0.5, 1)";

          let cardStyle: React.CSSProperties = {};

          if (isCenter) {
            cardStyle = {
              transform: "translateX(0%) scale(1)",
              opacity: 1,
              zIndex: 30,
              visibility: "visible",
              transition: smoothTransition,
            };
          } else if (isRight) {
            cardStyle = {
              transform: "translateX(38%) scale(0.90)",
              opacity: 0.85,
              zIndex: 20,
              visibility: "visible",
              transition: smoothTransition,
              pointerEvents: "none",
            };
          } else if (isLeft) {
            cardStyle = {
              transform: "translateX(-38%) scale(0.90)",
              opacity: 0.85,
              zIndex: 10,
              visibility: "visible",
              transition: smoothTransition,
              pointerEvents: "none",
            };
          } else if (isExitingLeft) {
            // Smoothly glide off-screen to the left and fade out
            cardStyle = {
              transform: "translateX(-90%) scale(0.75)",
              opacity: 0,
              zIndex: 0,
              visibility: "visible",
              transition: smoothTransition,
              pointerEvents: "none",
            };
          } else {
            // offset === 2: Queued on right off-screen.
            // Inline transition 'none' + visibility 'hidden' prevents any animation across screen on loop restart
            cardStyle = {
              transform: "translateX(90%) scale(0.75)",
              opacity: 0,
              zIndex: 0,
              visibility: "hidden",
              transition: "none",
              pointerEvents: "none",
            };
          }

          return (
            <div
              key={profile.id}
              onMouseEnter={() => {
                if (isCenter) setIsCenterHovered(true);
              }}
              onMouseLeave={() => {
                if (isCenter) setIsCenterHovered(false);
              }}
              style={cardStyle}
              className="absolute top-2 w-[290px] sm:w-[325px] transform-gpu will-change-[transform,opacity] rounded-3xl shadow-[var(--shadow-neumorphic-light)] dark:shadow-[var(--shadow-neumorphic-dark)]"
            >
              {/* Profile Card with ultra-smooth hover micro-zoom on center */}
              <div
                className={`rounded-3xl bg-white dark:bg-slate-900 overflow-hidden border-none transform-gpu transition-transform duration-300 ease-out ${
                  isCenter ? "hover:scale-[1.03] cursor-default" : ""
                }`}
              >
                {/* Header with Avatar, Name, Location, and Integrated Rating */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-sm shrink-0">
                        <Image
                          src={profile.avatar}
                          alt={profile.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-text-primary text-base leading-tight truncate">
                            {profile.name}
                          </p>
                          <svg
                            className="h-4 w-4 text-primary shrink-0"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="text-xs text-text-secondary font-medium truncate mt-0.5">
                          {profile.role}
                        </p>
                        <p className="text-[10px] text-text-secondary/70 truncate">
                          {profile.location}
                        </p>
                      </div>
                    </div>

                    {/* Integrated Modern Rating Pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs shrink-0">
                      <svg className="h-3.5 w-3.5 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{profile.rating}</span>
                      <span className="text-text-secondary/70 font-normal">
                        ({profile.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Details & Pricing */}
                <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-text-primary tracking-tight">
                        {profile.price}
                      </span>
                      <span className="text-[11px] text-text-secondary font-medium">
                        {profile.pricePeriod}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {profile.badge}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-secondary line-clamp-1">
                    {profile.serviceTitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-850 text-[10px] font-medium text-text-secondary shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Distinct Profile Highlights */}
                <div className="p-5 space-y-2.5">
                  {profile.highlights.map((highlight, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-background shadow-[var(--shadow-neumorphic-inset-light)] dark:shadow-[var(--shadow-neumorphic-inset-dark)]"
                    >
                      <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <RenderIcon icon={highlight.icon} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {highlight.title}
                        </p>
                        <p className="text-[11px] text-text-secondary truncate">
                          {highlight.subtitle}
                        </p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    </div>
                  ))}

                  {/* Consistent Unified Brand Button with Neumorphism */}
                  <div className="pt-1.5">
                    <Link href="/marketplace/offers" className="block w-full">
                      <button className="w-full rounded-2xl bg-primary hover:bg-primary-hover py-3 text-sm font-bold text-white shadow-[var(--shadow-neumorphic-light)] active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all duration-200 cursor-pointer">
                        Hire Talent
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Passive Indicator Pills - Unified brand color */}
      <div className="flex items-center justify-center gap-2 mt-3 pointer-events-none select-none">
        {PROFILES.map((profile, idx) => (
          <div
            key={profile.id}
            className={`transition-all duration-500 rounded-full ${
              idx === currentIndex
                ? "h-2 w-8 bg-primary shadow-xs shadow-primary/30"
                : "h-2 w-2 bg-slate-300 dark:bg-slate-700 opacity-40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
