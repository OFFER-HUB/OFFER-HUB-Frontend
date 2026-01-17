import Link from "next/link";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

// 3D Isometric Number 4 - matching Dribbble reference exactly
function IsometricFour({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={className}>
      {/* The "4" shape: diagonal stroke going down-right, horizontal bar, vertical descender */}

      {/* Diagonal part (going from top-left down to meet horizontal bar) */}
      {/* Left face - darkest */}
      <path d="M20,10 L20,70 L10,80 L10,20 Z" fill="#6b7280" />
      {/* Front face */}
      <path d="M20,10 L35,10 L35,70 L20,70 Z" fill="#9ca3af" />
      {/* Top face */}
      <path d="M20,10 L35,10 L45,0 L30,0 Z" fill="#d1d5db" />
      {/* Right face */}
      <path d="M35,10 L45,0 L45,60 L35,70 Z" fill="#b0b5c0" />

      {/* Horizontal crossbar */}
      {/* Top face - lightest */}
      <path d="M10,68 L90,68 L100,58 L20,58 Z" fill="#e5e7eb" />
      {/* Front face */}
      <path d="M10,68 L10,82 L90,82 L90,68 Z" fill="#d1d5db" />
      {/* Left face - darkest */}
      <path d="M10,68 L10,82 L0,92 L0,78 Z" fill="#6b7280" />
      {/* Right face */}
      <path d="M90,68 L100,58 L100,72 L90,82 Z" fill="#9ca3af" />

      {/* Vertical descender (the stem going down on the right side) */}
      {/* Left face - darkest */}
      <path d="M58,82 L58,130 L48,130 L48,92 Z" fill="#6b7280" />
      {/* Front face */}
      <path d="M58,82 L78,82 L78,130 L58,130 Z" fill="#9ca3af" />
      {/* Top face - lightest (connects to crossbar) */}
      <path d="M58,68 L78,68 L88,58 L68,58 Z" fill="#e5e7eb" />
      {/* Right face */}
      <path d="M78,82 L88,72 L88,130 L78,130 Z" fill="#b0b5c0" />
    </svg>
  );
}

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* 3D Isometric 404 */}
      <div className="relative mb-12 select-none" aria-hidden="true">
        <div className="flex items-end justify-center gap-1 sm:gap-3 lg:gap-4">
          {/* First 4 */}
          <IsometricFour className="w-[65px] sm:w-[85px] lg:w-[110px] h-auto" />

          {/* Zero with animation */}
          <div className="relative">
            {/* Shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[55px] sm:w-[70px] lg:w-[90px] h-[12px] bg-black/30 rounded-[50%] animate-shadow-pulse blur-sm" />

            {/* Outer zero - 3D torus/ring shape */}
            <svg
              viewBox="0 0 100 130"
              className="w-[65px] sm:w-[85px] lg:w-[110px] h-auto animate-zero-sink relative z-10"
            >
              {/* Main ellipse body */}
              <ellipse cx="50" cy="65" rx="45" ry="60" fill="#d1d5db" />

              {/* Left shadow */}
              <path
                d="M50,5 C20,5 5,30 5,65 C5,100 20,125 50,125 C30,115 18,92 18,65 C18,38 30,15 50,5 Z"
                fill="#9ca3af"
              />

              {/* Right highlight */}
              <path
                d="M50,5 C80,5 95,30 95,65 C95,100 80,125 50,125 C70,115 82,92 82,65 C82,38 70,15 50,5 Z"
                fill="#e5e7eb"
              />

              {/* Top rim - lightest */}
              <ellipse cx="50" cy="18" rx="38" ry="16" fill="#f3f4f6" />

              {/* Bottom */}
              <ellipse cx="50" cy="112" rx="38" ry="16" fill="#b0b5c0" />
            </svg>

            {/* Inner hole */}
            <div className="absolute inset-0 flex items-center justify-center animate-zero-inner-rise z-20">
              <svg
                viewBox="0 0 100 130"
                className="w-[65px] sm:w-[85px] lg:w-[110px] h-auto"
              >
                {/* Dark inner hole */}
                <ellipse cx="50" cy="68" rx="20" ry="38" fill="#1f2937" />
                {/* Inner hole top rim */}
                <ellipse cx="50" cy="38" rx="20" ry="10" fill="#374151" />
              </svg>
            </div>
          </div>

          {/* Second 4 */}
          <IsometricFour className="w-[65px] sm:w-[85px] lg:w-[110px] h-auto" />
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
