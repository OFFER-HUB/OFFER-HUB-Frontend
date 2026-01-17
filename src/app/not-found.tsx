import Link from "next/link";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Floating disconnected cable animation */}
      <div className="relative mb-8">
        {/* The "404" made of network elements */}
        <div className="flex items-center gap-2 sm:gap-4 select-none">
          {/* First 4 - styled as a port/connector */}
          <div className="relative">
            <div className="text-[80px] sm:text-[120px] lg:text-[150px] font-bold text-secondary opacity-20">
              4
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-background shadow-[var(--shadow-neumorphic-light)] flex items-center justify-center animate-pulse-soft">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-primary/20 grid grid-cols-2 gap-0.5 p-1">
                  <div className="bg-primary rounded-sm" />
                  <div className="bg-primary/50 rounded-sm" />
                  <div className="bg-primary/50 rounded-sm" />
                  <div className="bg-primary rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Zero - the disconnected plug, floating */}
          <div className="relative animate-wave-1">
            <div className="text-[80px] sm:text-[120px] lg:text-[150px] font-bold text-secondary opacity-20">
              0
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Ethernet plug illustration */}
              <div className="relative">
                <div className="w-10 h-14 sm:w-14 sm:h-20 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-sm rounded-b-lg shadow-[var(--shadow-neumorphic-light)] flex flex-col items-center pt-1 sm:pt-2">
                  {/* Clip */}
                  <div className="w-3 h-2 sm:w-4 sm:h-3 bg-primary rounded-sm mb-1" />
                  {/* Pins */}
                  <div className="flex gap-[2px] sm:gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-3 sm:w-1.5 sm:h-4 bg-yellow-500 rounded-b-sm"
                      />
                    ))}
                  </div>
                </div>
                {/* Cable coming out */}
                <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 w-2 sm:w-3 h-6 sm:h-8 bg-gradient-to-t from-gray-300 to-primary rounded-full" />
                {/* Wavy cable line */}
                <svg
                  className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-8 sm:h-12 text-primary"
                  viewBox="0 0 48 48"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24 48 C24 40, 12 36, 12 28 C12 20, 24 16, 24 8 C24 4, 24 0, 24 0"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-pulse-soft"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Second 4 - styled as another port */}
          <div className="relative">
            <div className="text-[80px] sm:text-[120px] lg:text-[150px] font-bold text-secondary opacity-20">
              4
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-background shadow-[var(--shadow-neumorphic-light)] flex items-center justify-center">
                {/* Empty port waiting for connection */}
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-200 shadow-[var(--shadow-neumorphic-inset-light)] flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-dashed border-gray-400 rounded-sm animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background px-3 py-1 rounded-full shadow-[var(--shadow-neumorphic-light)]">
          <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="text-xs text-text-secondary font-medium">Disconnected</span>
        </div>
      </div>

      {/* Message */}
      <div className="text-center mb-8 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
          Oops! Connection Lost
        </h1>
        <p className="text-text-secondary text-sm sm:text-base">
          Looks like this page got unplugged. The page you&apos;re looking for
          doesn&apos;t exist or has been moved to a different location.
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

      {/* Fun fact */}
      <p className="mt-12 text-xs text-text-secondary/60 text-center max-w-xs">
        Fun fact: Error 404 was named after a room at CERN where the original web servers were located.
      </p>

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-primary/20 animate-wave-2" aria-hidden="true" />
      <div className="absolute top-40 right-20 w-2 h-2 rounded-full bg-accent/30 animate-wave-3" aria-hidden="true" />
      <div className="absolute bottom-32 left-20 w-4 h-4 rounded-full bg-secondary/10 animate-wave-4" aria-hidden="true" />
      <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-primary/15 animate-wave-5" aria-hidden="true" />
    </div>
  );
}
