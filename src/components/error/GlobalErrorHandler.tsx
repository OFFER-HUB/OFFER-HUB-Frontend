"use client";

import { useEffect } from "react";

interface ErrorReport {
  type: "unhandled-error" | "unhandled-rejection";
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

function reportError(report: ErrorReport): void {
  // Log to console in all environments
  console.error(`[GlobalErrorHandler] ${report.type}:`, report.message);

  // Only send to tracking service if enabled
  if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED !== "true") {
    return;
  }

  // Log the full report (replace with actual service integration)
  console.log("[ErrorTracking] Report:", report);

  // Example: Send to error tracking endpoint
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(report),
  // }).catch(console.error);
}

export function GlobalErrorHandler(): null {
  useEffect(() => {
    function handleError(event: ErrorEvent): void {
      reportError({
        type: "unhandled-error",
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }

    function handleRejection(event: PromiseRejectionEvent): void {
      const message = event.reason instanceof Error
        ? event.reason.message
        : String(event.reason);

      const stack = event.reason instanceof Error
        ? event.reason.stack
        : undefined;

      reportError({
        type: "unhandled-rejection",
        message,
        stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
