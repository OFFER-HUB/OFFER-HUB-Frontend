import Link from "next/link";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

// 3D Isometric Number 4 Component
function IsometricFour({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      fill="none"
    >
      {/* Back/Left faces (darkest) */}
      {/* Vertical stem - left face */}
      <polygon points="30,0 30,95 15,105 15,10" fill="#9ca3af" />
      {/* Horizontal bar - left face */}
      <polygon points="15,85 15,105 85,105 85,85" fill="#b0b5bd" />
      {/* Descender - left face */}
      <polygon points="70,85 70,160 55,160 55,95" fill="#9ca3af" />

      {/* Front faces (medium) */}
      {/* Vertical stem - front */}
      <polygon points="30,0 45,10 45,95 30,95" fill="#d1d5db" />
      {/* Horizontal bar - front */}
      <polygon points="15,105 100,105 100,120 15,120" fill="#d1d5db" />
      {/* Descender - front */}
      <polygon points="70,105 85,105 85,160 70,160" fill="#d1d5db" />

      {/* Top faces (lightest) */}
      {/* Vertical stem - top */}
      <polygon points="30,0 45,10 45,10 30,0" fill="#f3f4f6" />
      {/* Horizontal bar - top */}
      <polygon points="15,85 100,85 100,105 15,105" fill="#e8eaed" />

      {/* Right faces */}
      {/* Vertical stem - right */}
      <polygon points="45,10 45,95 45,95 45,10" fill="#e5e7eb" />
      {/* Horizontal bar - right */}
      <polygon points="100,85 100,120 85,120 85,85" fill="#c4c9d1" />
      {/* Descender - right */}
      <polygon points="85,105 85,160 85,160 85,105" fill="#c4c9d1" />
    </svg>
  );
}

// Simplified cleaner 4 that looks like the Dribbble reference
function CleanFour({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className}>
      {/* Main shape using a cleaner approach */}
      {/* Left side of the "4" angle - darkest */}
      <path d="M25,5 L25,75 L5,90 L5,20 Z" fill="#9ca3af" />

      {/* Top face of angle */}
      <path d="M25,5 L45,15 L45,85 L25,75 Z" fill="#e5e7eb" />

      {/* Horizontal crossbar - top */}
      <path d="M5,75 L85,75 L95,85 L15,85 Z" fill="#f3f4f6" />

      {/* Horizontal crossbar - front */}
      <path d="M15,85 L95,85 L95,100 L15,100 Z" fill="#d1d5db" />

      {/* Horizontal crossbar - left edge */}
      <path d="M5,75 L15,85 L15,100 L5,90 Z" fill="#9ca3af" />

      {/* Vertical descender - left face */}
      <path d="M60,85 L60,140 L50,140 L50,95 Z" fill="#9ca3af" />

      {/* Vertical descender - front */}
      <path d="M60,85 L80,85 L80,140 L60,140 Z" fill="#d1d5db" />

      {/* Vertical descender - top */}
      <path d="M60,75 L80,75 L80,85 L60,85 Z" fill="#e5e7eb" />

      {/* Vertical descender - right face */}
      <path d="M80,75 L90,85 L90,140 L80,140 Z" fill="#c4c9d1" />
    </svg>
  );
}

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* 3D Isometric 404 */}
      <div className="relative mb-12 select-none" aria-hidden="true">
        <div className="flex items-end justify-center gap-2 sm:gap-4">
          {/* First 4 */}
          <CleanFour className="w-[70px] sm:w-[90px] lg:w-[110px] h-auto" />

          {/* Zero with animation */}
          <div className="relative">
            {/* Shadow */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[60px] sm:w-[75px] lg:w-[90px] h-[15px] bg-black/25 rounded-[50%] animate-shadow-pulse blur-sm" />

            {/* Outer zero */}
            <svg
              viewBox="0 0 100 140"
              className="w-[70px] sm:w-[90px] lg:w-[110px] h-auto animate-zero-sink relative z-10"
            >
              {/* Outer ellipse - creates the 0 shape */}
              {/* Left side (darkest) */}
              <path
                d="M50,10 C25,10 10,40 10,70 C10,100 25,130 50,130 C35,120 25,95 25,70 C25,45 35,20 50,10 Z"
                fill="#9ca3af"
              />
              {/* Right side (medium) */}
              <path
                d="M50,10 C75,10 90,40 90,70 C90,100 75,130 50,130 C65,120 75,95 75,70 C75,45 65,20 50,10 Z"
                fill="#d1d5db"
              />
              {/* Top highlight */}
              <ellipse cx="50" cy="25" rx="32" ry="15" fill="#f3f4f6" />
              {/* Bottom */}
              <ellipse cx="50" cy="115" rx="32" ry="15" fill="#e5e7eb" />
              {/* Fill the body */}
              <ellipse cx="50" cy="70" rx="40" ry="60" fill="#e0e3e8" />
              {/* Re-add side shadows on top */}
              <path
                d="M50,10 C25,10 10,40 10,70 C10,100 25,130 50,130 C35,120 25,95 25,70 C25,45 35,20 50,10 Z"
                fill="#9ca3af"
              />
              <path
                d="M50,10 C75,10 90,40 90,70 C90,100 75,130 50,130 C65,120 75,95 75,70 C75,45 65,20 50,10 Z"
                fill="#d1d5db"
              />
            </svg>

            {/* Inner hole */}
            <div className="absolute inset-0 flex items-center justify-center animate-zero-inner-rise z-20">
              <svg
                viewBox="0 0 100 140"
                className="w-[70px] sm:w-[90px] lg:w-[110px] h-auto"
              >
                {/* Dark hole */}
                <ellipse cx="50" cy="72" rx="18" ry="35" fill="#1f2937" />
                {/* Hole rim */}
                <ellipse cx="50" cy="45" rx="18" ry="10" fill="#374151" />
              </svg>
            </div>
          </div>

          {/* Second 4 */}
          <CleanFour className="w-[70px] sm:w-[90px] lg:w-[110px] h-auto" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center mb-8 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
          Page Not Found
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          The page you&apos;re looking for seems to have slipped away.
          It might have been moved or no longer exists.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover transition-colors"
        >
          <Icon path={ICON_PATHS.home} size="sm" ariaHidden />
          Back to Home
        </Link>
        <Link
          href="/app/freelancer/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background text-text-primary font-medium rounded-xl shadow-[var(--shadow-neumorphic-light)] hover:shadow-[var(--shadow-neumorphic-inset-light)] transition-all"
        >
          <Icon path={ICON_PATHS.grid} size="sm" ariaHidden />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
