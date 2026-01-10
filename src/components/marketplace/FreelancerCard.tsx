"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Freelancer } from "@/types/marketplace.types";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { useModeStore } from "@/stores/mode-store";
import { Toast } from "@/components/ui/Toast";

interface FreelancerCardProps {
  freelancer: Freelancer;
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { mode } = useModeStore();
  const [showToast, setShowToast] = useState(false);

  const isClient = isAuthenticated && mode === "client";

  function handleContact(): void {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isClient) {
      return;
    }

    setShowToast(true);
    router.push(`/app/chat/${freelancer.id}`);
  }

  return (
    <>
      <div
        className={cn(
          "p-6 rounded-3xl bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
          "hover:shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]",
          "hover:scale-[1.02] transition-all duration-300",
          "flex flex-col min-h-[280px]"
        )}
      >
        {/* Header with Avatar */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <div className="p-1 rounded-[24px] shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]">
              <Image
                src={freelancer.avatar}
                alt={freelancer.name}
                width={56}
                height={72}
                className="rounded-[20px] object-cover w-14 h-[72px]"
              />
            </div>
            {freelancer.isAvailable && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-bold text-text-primary text-base mb-1">{freelancer.name}</h3>
            <p className="text-sm text-text-secondary">{freelancer.title}</p>
          </div>
        </div>

        {/* Rating and Location */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-bold text-text-primary">{freelancer.rating}</span>
          </div>
          <span className="text-text-secondary/40">•</span>
          <span className="text-sm text-text-secondary">{freelancer.location}</span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {freelancer.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className={cn(
                "px-3 py-1.5 text-xs font-medium text-text-secondary rounded-xl",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                "bg-background"
              )}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-light">
          <div>
            <span className="text-xl font-bold text-text-primary">${freelancer.hourlyRate}</span>
            <span className="text-sm text-text-secondary">/hr</span>
          </div>
          {isAuthenticated ? (
            <button
              onClick={handleContact}
              disabled={!isClient}
              title={!isClient ? "Switch to Client mode to contact freelancers" : undefined}
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                "bg-primary text-white cursor-pointer",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]",
                !isClient && "opacity-50 cursor-not-allowed"
              )}
            >
              Contact
            </button>
          ) : (
            <Link
              href="/login"
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                "bg-primary text-white",
                "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]"
              )}
            >
              Contact
            </Link>
          )}
        </div>
      </div>

      {showToast && (
        <Toast
          message={`Starting conversation with ${freelancer.name}`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
