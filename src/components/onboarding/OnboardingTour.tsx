"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import type { Step, CallBackProps, STATUS, EVENTS } from "react-joyride";

// Dynamic import to avoid SSR issues
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

// Tour steps for the main dashboard
const dashboardSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">Welcome to OFFER-HUB!</h3>
        <p className="text-sm text-gray-600">
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
      <div>
        <h4 className="font-semibold mb-1">Switch Modes</h4>
        <p className="text-sm text-gray-600">
          Toggle between <strong>Freelancer</strong> and <strong>Client</strong> mode.
          As a Freelancer, you offer services. As a Client, you hire freelancers.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="balance-card"]',
    content: (
      <div>
        <h4 className="font-semibold mb-1">Your Balance</h4>
        <p className="text-sm text-gray-600">
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
      <div>
        <h4 className="font-semibold mb-1">Your Services</h4>
        <p className="text-sm text-gray-600">
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
      <div>
        <h4 className="font-semibold mb-1">Orders</h4>
        <p className="text-sm text-gray-600">
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
      <div>
        <h4 className="font-semibold mb-1">Your Profile</h4>
        <p className="text-sm text-gray-600">
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
      <div>
        <h4 className="font-semibold mb-1">Marketplace</h4>
        <p className="text-sm text-gray-600">
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
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">You&apos;re all set!</h3>
        <p className="text-sm text-gray-600 mb-2">
          Start by creating your first service or browsing the marketplace.
        </p>
        <p className="text-xs text-gray-400">
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
          primaryColor: "#10B981", // primary green
          backgroundColor: "#ffffff",
          textColor: "#1F2937",
          arrowColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
        },
        tooltipContent: {
          padding: "10px 0",
        },
        buttonNext: {
          backgroundColor: "#10B981",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 14,
        },
        buttonBack: {
          color: "#6B7280",
          marginRight: 10,
        },
        buttonSkip: {
          color: "#9CA3AF",
          fontSize: 13,
        },
        spotlight: {
          borderRadius: 8,
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
        disableAnimation: true,
      }}
    />
  );
}

export { dashboardSteps };
