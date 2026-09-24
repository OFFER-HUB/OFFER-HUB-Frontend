"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import type { Application } from "@/types/application.types";
import { APPLICATION_STATUS_CONFIG } from "@/types/application.types";

export interface ApplicationCardProps {
  application: Application;
  onAccept?: (applicationId: string) => Promise<void>;
  onReject?: (applicationId: string) => Promise<void>;
  showActions?: boolean;
}

export function ApplicationCard({
  application,
  onAccept,
  onReject,
  showActions = false,
}: ApplicationCardProps): React.JSX.Element {
  const router = useRouter();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const statusConfig = APPLICATION_STATUS_CONFIG[application.status];
  const freelancerName = application.freelancer?.email?.split('@')[0] || 'Anonymous';
  const proposalDate = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  async function handleAccept() {
    if (!onAccept) return;
    setIsProcessing(true);
    try {
      await onAccept(application.id);
      setShowAcceptModal(false);
      // Redirect to orders page after successful accept
      router.push('/app/orders');
    } catch (error) {
      console.error('Failed to accept application:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleReject() {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject(application.id);
      setShowRejectModal(false);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "p-4 rounded-xl bg-background",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              "bg-primary text-white font-semibold text-lg"
            )}
          >
            {freelancerName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium text-text-primary">{freelancerName}</h3>
              <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", statusConfig.bg, statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>

            {/* Email */}
            <p className="text-sm text-text-secondary">{application.freelancer?.email}</p>

            {/* Proposed Rate */}
            {application.proposedRate && (
              <p className="text-sm text-primary font-medium mt-1">
                Proposed Rate: ${application.proposedRate}
              </p>
            )}

            {/* Date */}
            <p className="text-xs text-text-secondary mt-1">Applied on {proposalDate}</p>

            {/* Cover Letter */}
            <div className="mt-3">
              <p className="text-sm font-medium text-text-primary mb-1">Cover Letter:</p>
              <p className="text-sm text-text-secondary line-clamp-3">{application.coverLetter}</p>
            </div>

            {/* Actions */}
            {showActions && application.status === 'PENDING' && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setShowAcceptModal(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium",
                    "bg-white text-success",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                    "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
                    "transition-all duration-200"
                  )}
                >
                  <Icon path={ICON_PATHS.check} size="sm" />
                  Accept
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium",
                    "bg-white text-error",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                    "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1)]",
                    "transition-all duration-200"
                  )}
                >
                  <Icon path={ICON_PATHS.close} size="sm" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        title="Accept Application"
        message={`Are you sure you want to accept ${freelancerName}'s application? This will notify the freelancer.`}
        confirmText="Accept"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Application"
        message={`Are you sure you want to reject ${freelancerName}'s application? This action cannot be undone.`}
        confirmText="Reject"
        variant="danger"
        isLoading={isProcessing}
      />
    </>
  );
}
