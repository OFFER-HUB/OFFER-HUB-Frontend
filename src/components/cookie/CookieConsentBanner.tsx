"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_CONSENT_VERSION = "1.0";

export type CookieConsent = {
  version: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const consent = JSON.parse(stored) as CookieConsent;
    if (consent.version !== COOKIE_CONSENT_VERSION) return null;

    return consent;
  } catch {
    return null;
  }
}

function setCookieConsent(consent: Omit<CookieConsent, "version" | "timestamp">): void {
  const fullConsent: CookieConsent = {
    ...consent,
    version: COOKIE_CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setConsent(getCookieConsent());
    setIsLoading(false);
  }, []);

  return { consent, isLoading };
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const existingConsent = getCookieConsent();
    if (!existingConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAcceptAll(): void {
    setCookieConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    setIsVisible(false);
  }

  function handleRejectAll(): void {
    setCookieConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    setIsVisible(false);
  }

  function handleSavePreferences(): void {
    setCookieConsent({
      necessary: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className={cn(
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[100]",
        "sm:max-w-md",
        "animate-slide-up"
      )}
    >
      <div
        className={cn(
          "p-5 rounded-xl bg-white",
          "shadow-[4px_4px_12px_#d1d5db,-4px_-4px_12px_#ffffff]",
          "border border-border-light"
        )}
      >
        {!showPreferences ? (
          <>
            <p
              id="cookie-consent-description"
              className="text-sm text-text-secondary leading-relaxed"
            >
              <span id="cookie-consent-title" className="font-medium text-text-primary">
                We use cookies
              </span>{" "}
              to improve your experience.{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Learn more
              </Link>
            </p>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
              >
                Accept
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary border border-border-light rounded-lg hover:bg-background transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Cookie settings"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-text-primary">Cookie Settings</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-text-secondary">Necessary</span>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-5 h-5 rounded accent-primary cursor-not-allowed opacity-50"
                />
              </label>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-text-secondary">Analytics</span>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-text-secondary">Marketing</span>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
              </label>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
