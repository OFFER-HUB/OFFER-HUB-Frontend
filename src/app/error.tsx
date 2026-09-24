"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps): React.JSX.Element {
  useEffect(() => {
    // Log error to console
    console.error("[ErrorPage] Application error:", error);

    // Report to error tracking service if enabled
    if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === "true") {
      const errorPayload = {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url: typeof window !== "undefined" ? window.location.href : "unknown",
        timestamp: new Date().toISOString(),
      };
      console.log("[ErrorTracking] Error payload:", errorPayload);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-error/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-text-secondary mb-8 text-lg">
          We apologize for the inconvenience. An unexpected error has occurred.
          Our team has been notified and is working to fix the issue.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-8 p-4 bg-gray-100 rounded-xl text-left overflow-auto max-h-40">
            <p className="text-sm font-mono text-error break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-text-secondary mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl font-semibold bg-primary text-white shadow-[var(--shadow-neumorphic-light)] hover:bg-primary-hover active:shadow-[var(--shadow-neumorphic-inset-light)] transition-all"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-8 py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
          >
            Go Home
          </a>
        </div>

        <p className="mt-8 text-sm text-text-secondary">
          If this problem persists, please{" "}
          <a href="/help" className="text-primary hover:underline">
            contact our support team
          </a>
          .
        </p>
      </div>
    </div>
  );
}
