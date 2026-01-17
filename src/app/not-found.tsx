import Link from "next/link";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* 3D Isometric 404 */}
      <div className="relative mb-12 select-none" aria-hidden="true">
        <div className="flex items-end gap-0">
          {/* First 4 - 3D Isometric */}
          <svg
            width="140"
            height="200"
            viewBox="0 0 140 200"
            className="w-[80px] sm:w-[100px] lg:w-[140px] h-auto"
          >
            {/* Back face (darker) */}
            <polygon
              points="30,180 30,60 70,20 70,100 50,120 50,140 70,140 70,180"
              fill="#d1d5db"
            />
            {/* Right face (medium) */}
            <polygon
              points="70,20 110,60 110,180 70,180 70,140 90,140 90,120 70,100"
              fill="#e5e7eb"
            />
            {/* Top face (lightest) */}
            <polygon
              points="30,60 70,20 110,60 70,100 50,120 90,120 90,140 50,140"
              fill="#f3f4f6"
            />
            {/* Inner cutout - left */}
            <polygon points="50,120 50,140 70,140 70,120" fill="#9ca3af" />
            {/* Inner cutout - right */}
            <polygon points="70,120 90,120 90,140 70,140" fill="#d1d5db" />
          </svg>

          {/* Zero - 3D Isometric with sink animation */}
          <div className="relative mx-[-10px] sm:mx-[-5px]">
            {/* Shadow under zero */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] sm:w-[80px] lg:w-[100px] h-[30px] bg-black/20 rounded-[50%] animate-shadow-pulse blur-sm" />

            <svg
              width="140"
              height="200"
              viewBox="0 0 140 200"
              className="w-[80px] sm:w-[100px] lg:w-[140px] h-auto animate-zero-sink"
            >
              {/* Outer ring - back face */}
              <path
                d="M70,20 C30,20 10,70 10,100 C10,130 30,180 70,180 C110,180 130,130 130,100 C130,70 110,20 70,20"
                fill="#d1d5db"
              />
              {/* Outer ring - right face */}
              <path
                d="M70,20 C110,20 130,70 130,100 C130,130 110,180 70,180 C90,170 100,140 100,100 C100,60 90,30 70,20"
                fill="#e5e7eb"
              />
              {/* Outer ring - top surface */}
              <ellipse cx="70" cy="50" rx="50" ry="25" fill="#f3f4f6" />
            </svg>

            {/* Inner ellipse (the hole) - animated separately */}
            <div className="absolute inset-0 flex items-center justify-center animate-zero-inner-rise">
              <svg
                width="140"
                height="200"
                viewBox="0 0 140 200"
                className="w-[80px] sm:w-[100px] lg:w-[140px] h-auto"
              >
                {/* Inner hole - dark */}
                <ellipse cx="70" cy="100" rx="25" ry="40" fill="#1f2937" />
                {/* Inner hole - top rim */}
                <ellipse cx="70" cy="70" rx="25" ry="12" fill="#374151" />
              </svg>
            </div>
          </div>

          {/* Second 4 - 3D Isometric */}
          <svg
            width="140"
            height="200"
            viewBox="0 0 140 200"
            className="w-[80px] sm:w-[100px] lg:w-[140px] h-auto"
          >
            {/* Back face (darker) */}
            <polygon
              points="30,180 30,60 70,20 70,100 50,120 50,140 70,140 70,180"
              fill="#d1d5db"
            />
            {/* Right face (medium) */}
            <polygon
              points="70,20 110,60 110,180 70,180 70,140 90,140 90,120 70,100"
              fill="#e5e7eb"
            />
            {/* Top face (lightest) */}
            <polygon
              points="30,60 70,20 110,60 70,100 50,120 90,120 90,140 50,140"
              fill="#f3f4f6"
            />
            {/* Inner cutout - left */}
            <polygon points="50,120 50,140 70,140 70,120" fill="#9ca3af" />
            {/* Inner cutout - right */}
            <polygon points="70,120 90,120 90,140 70,140" fill="#d1d5db" />
          </svg>
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
