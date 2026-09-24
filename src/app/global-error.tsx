"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error("[GlobalError] Critical application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ maxWidth: "500px", textAlign: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 32px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1E293B",
                marginBottom: "16px",
              }}
            >
              Critical Error
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#64748B",
                marginBottom: "32px",
                lineHeight: 1.6,
              }}
            >
              A critical error has occurred and the application could not recover.
              Please refresh the page or try again later.
            </p>

            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "12px 32px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#149A9B",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  padding: "12px 32px",
                  borderRadius: "12px",
                  border: "2px solid #149A9B",
                  backgroundColor: "transparent",
                  color: "#149A9B",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
