"use client";

import { cn } from "@/lib/cn";

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase", test: (p) => /[a-z]/.test(p) },
  { label: "Number", test: (p) => /[0-9]/.test(p) },
];

export function PasswordRequirements({ password, show }: PasswordRequirementsProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 mt-2",
        "animate-fade-in"
      )}
    >
      {requirements.map((req, index) => {
        const met = req.test(password);
        return (
          <span
            key={req.label}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium",
              "transition-all duration-300",
              met
                ? "bg-success/10 text-success"
                : "bg-background text-text-secondary shadow-[inset_1px_1px_2px_#d1d5db,inset_-1px_-1px_2px_#ffffff]"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {met ? (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
              </svg>
            )}
            {req.label}
          </span>
        );
      })}
    </div>
  );
}
