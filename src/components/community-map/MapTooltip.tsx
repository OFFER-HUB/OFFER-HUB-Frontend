"use client";

import { MapUser } from "./types";

interface MapTooltipProps {
  user: MapUser | null;
  position: { x: number; y: number };
}

export function MapTooltip({ user, position }: MapTooltipProps) {
  if (!user) return null;

  const isFreelancer = user.userType === "FREELANCER";
  const badgeClasses = isFreelancer
    ? "bg-teal-500/20 text-teal-400 border-teal-500/30"
    : "bg-purple-500/20 text-purple-400 border-purple-500/30";

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 12,
        top: position.y - 10,
        transform: "translateY(-100%)",
      }}
    >
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 shadow-2xl min-w-[200px]">
        {/* Arrow */}
        <div
          className="absolute w-3 h-3 bg-gray-900/95 border-r border-b border-gray-700/50 rotate-45"
          style={{
            bottom: -6,
            left: 20,
          }}
        />

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ${
                  isFreelancer
                    ? "bg-teal-500/20 text-teal-400 ring-teal-500/30"
                    : "bg-purple-500/20 text-purple-400 ring-purple-500/30"
                }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
                isFreelancer ? "bg-teal-500" : "bg-purple-500"
              }`}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user.name}
            </p>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <svg
                className="w-3 h-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">
                {user.region ? `${user.region}, ` : ""}
                {user.country}
              </span>
            </p>
          </div>
        </div>

        {/* Badge */}
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeClasses}`}
          >
            {isFreelancer ? "Freelancer" : "Client"}
          </span>
        </div>
      </div>
    </div>
  );
}
