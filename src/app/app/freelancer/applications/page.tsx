"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getMyApplications, withdrawApplication } from "@/lib/api/applications";
import { LoadingSpinner, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApplicationCard } from "@/components/offers/ApplicationCard";
import { cn } from "@/lib/cn";
import type { Application, ApplicationStatus } from "@/types/application.types";
import { APPLICATION_STATUS_CONFIG } from "@/types/application.types";

export default function MyApplicationsPage(): React.JSX.Element {
  const { token } = useAuthStore();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      if (!token) return;

      setIsLoading(true);
      try {
        const filters = filterStatus !== 'ALL' ? { status: filterStatus } : undefined;
        const apps = await getMyApplications(token, filters);
        setApplications(apps);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [token, filterStatus]);

  const handleWithdraw = useCallback(
    async (applicationId: string) => {
      if (!token) return;
      setWithdrawingId(applicationId);
      try {
        await withdrawApplication(token, applicationId);
        setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      } finally {
        setWithdrawingId(null);
      }
    },
    [token]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Applications</h1>
          <p className="text-text-secondary">Track your job applications</p>
        </div>

        {/* Filters */}
        <div
          className={cn(
            "p-4 mb-6 rounded-3xl bg-white",
            "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
          )}
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filterStatus === 'ALL'
                  ? "bg-primary text-white"
                  : "bg-background text-text-secondary hover:text-text-primary"
              )}
            >
              All
            </button>
            {Object.entries(APPLICATION_STATUS_CONFIG).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as ApplicationStatus)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterStatus === status
                    ? cn(config.bg, config.color)
                    : "bg-background text-text-secondary hover:text-text-primary"
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <EmptyState
            icon={ICON_PATHS.briefcase}
            message="No applications found. Start applying to offers!"
            actionLabel="Browse Offers"
            onAction={() => router.push('/marketplace/offers')}
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onWithdraw={handleWithdraw}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
