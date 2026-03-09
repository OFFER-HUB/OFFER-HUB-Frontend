"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Step, CallBackProps } from "react-joyride";

// Dynamic import to avoid SSR issues
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

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
    disableBeacon: true,
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
  const { hasCompletedTour, completeTour, setTourStep, currentTourStep } = useOnboardingStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Start tour after a short delay to ensure DOM is ready
    if (isAuthenticated && !hasCompletedTour) {
      const timer = setTimeout(() => {
        setShouldRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasCompletedTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];

    if (finishedStatuses.includes(status as string)) {
      completeTour();
      setShouldRun(false);
    }

    if (type === "step:after") {
      setTourStep(index + 1);
    }
  };

  if (!mounted || !isAuthenticated) return null;

  // Allow manual run override
  const isRunning = run !== undefined ? run : (shouldRun && !hasCompletedTour);

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous
      showProgress
      showSkipButton
      stepIndex={currentTourStep}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#10B981",
          backgroundColor: "#F3F4F6",
          textColor: "#1F2937",
          arrowColor: "#F3F4F6",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 16,
          padding: 24,
          backgroundColor: "#F3F4F6",
          boxShadow: "8px 8px 16px #d1d5db, -8px -8px 16px #ffffff",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
          color: "#1F2937",
        },
        tooltipContent: {
          padding: "12px 0 8px 0",
        },
        tooltipFooter: {
          marginTop: 16,
        },
        buttonNext: {
          backgroundColor: "#F3F4F6",
          color: "#10B981",
          borderRadius: 12,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 500,
          boxShadow: "4px 4px 8px #d1d5db, -4px -4px 8px #ffffff",
          border: "none",
          outline: "none",
        },
        buttonBack: {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          borderRadius: 12,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 500,
          boxShadow: "4px 4px 8px #d1d5db, -4px -4px 8px #ffffff",
          marginRight: 12,
        },
        buttonSkip: {
          backgroundColor: "transparent",
          color: "#9CA3AF",
          fontSize: 13,
          padding: "8px 12px",
        },
        buttonClose: {
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: "#F3F4F6",
          boxShadow: "3px 3px 6px #d1d5db, -3px -3px 6px #ffffff",
        },
        spotlight: {
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        },
        beacon: {
          display: "none",
        },
        beaconInner: {
          backgroundColor: "#10B981",
        },
        beaconOuter: {
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          border: "2px solid #10B981",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: {
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
          },
          arrow: {
            color: "#F3F4F6",
          },
        },
      }}
    />
  );
}

export { dashboardSteps };
