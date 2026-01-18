import Link from "next/link";
import { cn } from "@/lib/cn";
import { PRIMARY_BUTTON } from "@/lib/styles";

const STARS = [
  { size: "w-1 h-1", top: "10%", left: "15%", delay: "0s" },
  { size: "w-1.5 h-1.5", top: "20%", left: "70%", delay: "0.5s" },
  { size: "w-1 h-1", top: "35%", left: "25%", delay: "1s" },
  { size: "w-0.5 h-0.5", top: "15%", left: "45%", delay: "0.3s" },
  { size: "w-1 h-1", top: "45%", left: "80%", delay: "0.7s" },
  { size: "w-0.5 h-0.5", top: "60%", left: "10%", delay: "1.2s" },
  { size: "w-1.5 h-1.5", top: "70%", left: "55%", delay: "0.2s" },
  { size: "w-1 h-1", top: "80%", left: "35%", delay: "0.9s" },
  { size: "w-0.5 h-0.5", top: "25%", left: "90%", delay: "1.5s" },
  { size: "w-1 h-1", top: "55%", left: "65%", delay: "0.4s" },
  { size: "w-0.5 h-0.5", top: "85%", left: "20%", delay: "1.1s" },
  { size: "w-1 h-1", top: "40%", left: "50%", delay: "0.6s" },
  { size: "w-0.5 h-0.5", top: "5%", left: "85%", delay: "0.8s" },
  { size: "w-1 h-1", top: "75%", left: "8%", delay: "1.3s" },
  { size: "w-1.5 h-1.5", top: "90%", left: "75%", delay: "0.1s" },
] as const;

const LIGHT_CONE_STYLE = {
  width: "230px",
  height: "200px",
  background: "linear-gradient(to bottom, rgba(20, 154, 155, 0.15), rgba(20, 154, 155, 0.02))",
  clipPath: "polygon(26% 0%, 74% 0%, 94% 100%, 6% 100%)",
} as const;

const TEXT_GLOW_STYLE = {
  textShadow: "0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.7), 0 0 60px rgba(255, 255, 255, 0.5), 0 0 80px rgba(255, 255, 255, 0.3)",
} as const;

export default function NotFound(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Lamp fixture with light cone */}
        <div className="relative z-10 animate-lamp-swing" style={{ transformOrigin: "top center" }}>
          <div className="w-3 h-6 bg-gray-400 mx-auto rounded-b-sm" />
          <div className="w-0.5 h-12 bg-gray-400 mx-auto" />
          <div className="w-28 h-14 bg-gradient-to-b from-primary-hover to-primary mx-auto rounded-t-full" />
          <div className="mx-auto animate-flicker" style={LIGHT_CONE_STYLE} />
        </div>

        {/* Window with starry sky behind 404 */}
        <div className="relative -mt-20">
          <div className="p-4 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            <div className="p-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded">
              <div className="relative w-72 h-52 sm:w-[420px] sm:h-72 rounded overflow-hidden">
                {/* Starry sky background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-secondary">
                  {STARS.map((star, index) => (
                    <div
                      key={index}
                      className={cn("absolute bg-white rounded-full animate-pulse-soft", star.size)}
                      style={{ top: star.top, left: star.left, animationDelay: star.delay }}
                    />
                  ))}
                </div>
                {/* Window dividers (2x2 grid) */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical divider */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300" />
                  {/* Horizontal divider */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-b from-gray-300 via-gray-200 to-gray-300" />
                </div>
                {/* 404 text centered in window */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1
                    className="text-8xl sm:text-9xl font-black select-none tracking-tight animate-flicker text-white"
                    style={TEXT_GLOW_STYLE}
                  >
                    404
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center max-w-md mt-8">
          <p className="text-lg sm:text-xl text-text-secondary mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className={cn(PRIMARY_BUTTON, "inline-flex justify-center")}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
