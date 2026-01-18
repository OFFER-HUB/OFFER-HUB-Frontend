import Link from "next/link";
import { cn } from "@/lib/cn";
import { PRIMARY_BUTTON } from "@/lib/styles";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Lamp and light scene */}
      <div className="relative flex flex-col items-center">
        {/* Lamp fixture with light cone */}
        <div className="relative z-10 animate-lamp-swing" style={{ transformOrigin: "top center" }}>
          {/* Ceiling mount */}
          <div className="w-3 h-6 bg-gray-400 mx-auto rounded-b-sm" />
          {/* Lamp cord */}
          <div className="w-0.5 h-12 bg-gray-400 mx-auto" />
          {/* Lamp head - bowl shape facing down */}
          <div
            className="w-28 h-14 bg-gradient-to-b from-primary-hover to-primary mx-auto rounded-t-full"
          />
          {/* Light cone - trapezoid shape matching lamp width at top */}
          <div
            className="mx-auto animate-flicker"
            style={{
              width: "230px",
              height: "200px",
              background: "linear-gradient(to bottom, rgba(20, 154, 155, 0.15), rgba(20, 154, 155, 0.02))",
              clipPath: "polygon(26% 0%, 74% 0%, 94% 100%, 6% 100%)",
            }}
          />
        </div>

        {/* Window with starry sky behind 404 */}
        <div className="relative -mt-20">
          {/* Outer window frame */}
          <div className="p-4 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]">
            {/* Inner window frame */}
            <div className="p-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded">
              {/* Window glass area */}
              <div className="relative w-72 h-52 sm:w-[420px] sm:h-72 rounded overflow-hidden">
                {/* Starry sky background */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-secondary">
                  {/* Stars */}
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[15%] animate-pulse-soft" />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[20%] left-[70%] animate-pulse-soft" style={{ animationDelay: "0.5s" }} />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[35%] left-[25%] animate-pulse-soft" style={{ animationDelay: "1s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[15%] left-[45%] animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[45%] left-[80%] animate-pulse-soft" style={{ animationDelay: "0.7s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[60%] left-[10%] animate-pulse-soft" style={{ animationDelay: "1.2s" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[70%] left-[55%] animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[80%] left-[35%] animate-pulse-soft" style={{ animationDelay: "0.9s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[25%] left-[90%] animate-pulse-soft" style={{ animationDelay: "1.5s" }} />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[55%] left-[65%] animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[85%] left-[20%] animate-pulse-soft" style={{ animationDelay: "1.1s" }} />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[40%] left-[50%] animate-pulse-soft" style={{ animationDelay: "0.6s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[5%] left-[85%] animate-pulse-soft" style={{ animationDelay: "0.8s" }} />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[75%] left-[8%] animate-pulse-soft" style={{ animationDelay: "1.3s" }} />
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-[90%] left-[75%] animate-pulse-soft" style={{ animationDelay: "0.1s" }} />
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
                    style={{
                      textShadow: "0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.7), 0 0 60px rgba(255, 255, 255, 0.5), 0 0 80px rgba(255, 255, 255, 0.3)",
                    }}
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
