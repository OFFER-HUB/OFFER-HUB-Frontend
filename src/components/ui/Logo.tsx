import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "auto";
  className?: string;
  showText?: boolean;
}

const sizeConfig = {
  sm: { width: 33, height: 20, iconClass: "h-5 w-auto", textClass: "text-base" },
  md: { width: 46, height: 28, iconClass: "h-7 w-auto", textClass: "text-xl" },
  lg: { width: 60, height: 36, iconClass: "h-9 w-auto", textClass: "text-2xl" },
};

export function Logo({ size = "md", variant = "auto", className, showText = true }: LogoProps) {
  const config = sizeConfig[size];

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group transition-opacity hover:opacity-90", className)}
    >
      {variant === "auto" ? (
        <>
          {/* Light mode logo */}
          <Image
            src="/OH_light.svg"
            alt="OFFER-HUB"
            width={config.width}
            height={config.height}
            priority
            className={cn(config.iconClass, "dark:hidden object-contain")}
          />
          {/* Dark mode logo */}
          <Image
            src="/OH_dark.svg"
            alt="OFFER-HUB"
            width={config.width}
            height={config.height}
            priority
            className={cn(config.iconClass, "hidden dark:block object-contain")}
          />
        </>
      ) : (
        <Image
          src={variant === "dark" ? "/OH_dark.svg" : "/OH_light.svg"}
          alt="OFFER-HUB"
          width={config.width}
          height={config.height}
          priority
          className={cn(config.iconClass, "object-contain")}
        />
      )}

      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight select-none",
            config.textClass
          )}
        >
          <span
            className={
              variant === "dark"
                ? "text-white"
                : variant === "light"
                ? "text-[#19213D]"
                : "text-[#19213D] dark:text-white"
            }
          >
            OFFER-
          </span>
          <span className="text-[#149A9B]">HUB</span>
        </span>
      )}
    </Link>
  );
}
