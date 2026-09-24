"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Step, EventData } from "react-joyride";

// Dynamic import to avoid SSR issues
const Joyride = dynamic(() => import("react-joyride").then((m) => m.Joyride), { ssr: false });

// Tour steps for the main dashboard
const dashboardSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="text-center py-2">
        <h3 className="text-lg font-bold text-text-primary mb-2">Welcome to OFFER-HUB!</h3>
        <p className="text-sm text-text-secondary">
          Let us give you a quick tour to help you get started.
        </p>
      </div>
    ),
    placement: "center",
    skipBeacon: true,
  },
  {
    target: '[data-tour="mode-switcher"]',
    content: (
      <div className="py-1">
        <h4 className="font-semibold text-text-primary mb-1">Switch Modes</h4>
        <p className="text-sm text-text-secondary">
          Toggle between <strong className="text-primary">Freelancer</strong> and <strong className="text-secondary">Client</strong> mode.
          As a Freelancer, you offer services. As a Client, you hire freelancers.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="balance-card"]',
    content: (
      <div className="py-1">
        <h4 className="font-semibold text-text-primary mb-1">Your Balance</h4>
        <p className="text-sm text-text-secondary">
          View your available funds and reserved amounts.
          You can add funds or withdraw anytime.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-services"]',
    content: (
      <div className="py-1">
        <h4 className="font-semibold text-text-primary mb-1">Your Services</h4>
        <p className="text-sm text-text-secondary">
          Create and manage your services here.
          Clients will find and hire you through your service listings.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="nav-orders"]',
    content: (
      <div className="py-1">
        <h4 className="font-semibold text-text-primary mb-1">Orders</h4>
        <p className="text-sm text-text-secondary">
          Track all your orders - both as a freelancer (work you&apos;re doing)
          and as a client (services you&apos;ve hired).
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="nav-profile"]',
    content: (
      <div className="py-1">
        <h4 className="font-semibold text-text-primary mb-1">Your Profile</h4>
        <p className="text-sm text-text-secondary">
          Complete your profile to build trust with clients.
          Add your skills, bio, and portfolio.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="nav-marketplace"]',
    content: (
      <div className="py-1">
        <h4 className="font-semibold text-text-primary mb-1">Marketplace</h4>
        <p className="text-sm text-text-secondary">
          Browse services and offers from other freelancers.
          Find the perfect match for your project needs.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "body",
    content: (
      <div className="text-center py-2">
        <h3 className="text-lg font-bold text-text-primary mb-2">You&apos;re all set!</h3>
        <p className="text-sm text-text-secondary mb-2">
          Start by creating your first service or browsing the marketplace.
        </p>
        <p className="text-xs text-text-secondary/60">
          You can restart this tour anytime from Settings.
        </p>
      </div>
    ),
    placement: "center",
  },
];

interface OnboardingTourProps {
  steps?: Step[];
  run?: boolean;
}

export function OnboardingTour({ steps = dashboardSteps, run }: OnboardingTourProps) {
  const { hasCompletedTour, completeTour } = useOnboardingStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);
  const [key, setKey] = useState(0);

  // Monitor store hydration to avoid race conditions
  useEffect(() => {
    setMounted(true);

    const checkHydration = () => {
      const onboardingHydrated = useOnboardingStore.persist.hasHydrated();
      const authHydrated = useAuthStore.persist.hasHydrated();
      if (onboardingHydrated && authHydrated) {
        setIsStoreHydrated(true);
      }
    };

    checkHydration();

    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(checkHydration);
    const unsubAuth = useAuthStore.persist.onFinishHydration(checkHydration);

    return () => {
      unsubOnboarding();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!isStoreHydrated) return;

    if (typeof window !== "undefined") {
      const showTourFlag = localStorage.getItem("show-onboarding-tour") === "true";
      if (showTourFlag) {
        localStorage.removeItem("show-onboarding-tour");
        const timer = setTimeout(() => {
          setShouldRun(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (isAuthenticated && !hasCompletedTour) {
        const timer = setTimeout(() => {
          setShouldRun(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isStoreHydrated, isAuthenticated, hasCompletedTour]);

  const stopTour = () => {
    completeTour();
    if (typeof window !== "undefined") {
      localStorage.removeItem("show-onboarding-tour");
    }
    setShouldRun(false);

    // Explicitly reset body styles to ensure scrolling is re-enabled
    if (typeof window !== "undefined") {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.position = "";
    }

    setKey((k) => k + 1); // force full unmount/remount to clean up overlay
  };

  const handleJoyrideCallback = (data: EventData) => {
    const { status, action } = data;

    // Only stop when truly done — do NOT call stopTour on intermediate events
    // like "paused" or "step:after" because that causes an infinite loop with
    // Zustand re-renders when stepIndex is used as a controlled prop.
    if (
      status === "finished" ||
      status === "skipped" ||
      action === "close" ||
      action === "skip" ||
      action === "reset"
    ) {
      stopTour();
    }
  };

  // Ensure scroll behaves properly when unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
        document.body.style.height = "";
        document.body.style.position = "";
      }
    };
  }, []);

  if (!mounted || !isStoreHydrated || !isAuthenticated) return null;

  // Allow manual run override
  const isRunning = run !== undefined ? run : (shouldRun && !hasCompletedTour);

  return (
    <Joyride
      key={key}
      steps={steps}
      run={isRunning}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: "#10B981",
        backgroundColor: "#F3F4F6",
        textColor: "#1F2937",
        arrowColor: "#F3F4F6",
        overlayColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 10000,
        showProgress: true,
        skipScroll: true,
        buttons: ["back", "close", "primary", "skip"],
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
      styles={{
        floater: {
          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
        },
        arrow: {
          color: "#F3F4F6",
        },
      }}
    />
  );
}

export { dashboardSteps };
