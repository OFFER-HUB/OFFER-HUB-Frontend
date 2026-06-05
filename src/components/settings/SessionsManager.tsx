"use client";

import { useEffect, useState } from "react";
import {
  fetchSessions,
  revokeSession,
  revokeOtherSessions,
  type Session,
} from "@/lib/api/sessions";
import { useAuthStore } from "@/stores/auth-store";
import { SessionCard } from "./SessionCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Toast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { cn } from "@/lib/cn";
import { NEUMORPHIC_CARD, DANGER_BUTTON } from "@/lib/styles";

export function SessionsManager(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<"all" | "desktop" | "mobile" | "tablet">("all");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    async function loadSessions() {
      if (!token) return;
      try {
        const data = await fetchSessions(token);
        setSessions(data.sort((a, b) => (a.isCurrent === b.isCurrent ? 0 : a.isCurrent ? -1 : 1)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [token]);

  const handleRevoke = async (id: string) => {
    if (!token) return;
    setRevokingId(id);
    try {
      await revokeSession(token, id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setToast({ type: "success", message: "Session signed out successfully." });
    } catch (err) {
      setToast({ type: "error", message: "Failed to sign out session." });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!token) return;
    setRevokingAll(true);
    try {
      await revokeOtherSessions(token);
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setToast({ type: "success", message: "All other sessions signed out." });
      setShowRevokeAllModal(false);
    } catch (err) {
      setToast({ type: "error", message: "Failed to sign out other sessions." });
    } finally {
      setRevokingAll(false);
    }
  };

  if (loading) return <LoadingState message="Loading active sessions..." variant="card" />;
  if (error)
    return <ErrorState message={error} onRetry={() => window.location.reload()} variant="card" />;

  const filteredSessions = sessions.filter((s) => filter === "all" || s.deviceType === filter);
  const otherSessionsExist = sessions.some((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      <div className={NEUMORPHIC_CARD}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {(["all", "desktop", "mobile", "tablet"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-xl transition-all duration-200 capitalize",
                  filter === type
                    ? "bg-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]"
                    : "bg-background text-text-secondary shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:shadow-none"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {otherSessionsExist && (
            <button
              type="button"
              onClick={() => setShowRevokeAllModal(true)}
              className={cn(DANGER_BUTTON, "py-2 px-4 whitespace-nowrap")}
            >
              Sign out all other sessions
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
                isRevoking={revokingId === session.id}
              />
            ))
          ) : (
            <p className="text-center text-text-secondary py-8">
              No active sessions found for this filter.
            </p>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        onConfirm={handleRevokeAll}
        title="Sign out all other sessions?"
        message="This will immediately end all other active sessions across all devices. You will remain logged in on this device."
        confirmText="Sign out all"
        variant="danger"
        isLoading={revokingAll}
      />

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
