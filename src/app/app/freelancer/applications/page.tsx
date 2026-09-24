"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getMyApplications, withdrawApplication } from "@/lib/api/applications";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
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

  async function handleWithdraw() {
    if (!token || !withdrawingId) return;

    try {
      await withdrawApplication(token, withdrawingId);
      setApplications((prev) => prev.filter((app) => app.id !== withdrawingId));
    } catch (error) {
      console.error('Failed to withdraw application:', error);
    } finally {
      setWithdrawingId(null);
    }
  }

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
            {applications.map((app) => {
              const statusConfig = APPLICATION_STATUS_CONFIG[app.status];
              const appliedDate = new Date(app.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={app.id}
                  className={cn(
                    "p-6 rounded-3xl bg-white",
                    "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary flex-1">
                          {app.offer?.title}
                        </h3>
                        <span className={cn("px-3 py-1 rounded-lg text-xs font-medium", statusConfig.bg, statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-secondary mb-3">
                        <span>Budget: ${app.offer?.budget}</span>
                        <span>•</span>
                        <span>Applied {appliedDate}</span>
                        {app.proposedRate && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-medium">Your rate: ${app.proposedRate}</span>
                          </>
                        )}
                      </div>

                      <div
                        className={cn(
                          "p-3 rounded-lg bg-background",
                          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                        )}
                      >
                        <p className="text-sm font-medium text-text-primary mb-1">Your Cover Letter:</p>
                        <p className="text-sm text-text-secondary">{app.coverLetter}</p>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => router.push(`/marketplace/offers/${app.offerId}`)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                            "bg-primary text-white hover:bg-primary-hover transition-colors"
                          )}
                        >
                          <Icon path={ICON_PATHS.eye} size="sm" />
                          View Offer
                        </button>

                        {app.status === 'PENDING' && (
                          <button
                            onClick={() => setWithdrawingId(app.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                              "text-error hover:bg-error/10 transition-colors"
                            )}
                          >
                            <Icon path={ICON_PATHS.close} size="sm" />
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw Confirmation */}
      <ConfirmationModal
        isOpen={!!withdrawingId}
        onClose={() => setWithdrawingId(null)}
        onConfirm={handleWithdraw}
        title="Withdraw Application"
        message="Are you sure you want to withdraw this application? This action cannot be undone."
        confirmText="Withdraw"
        variant="warning"
      />
    </>
  );
}
