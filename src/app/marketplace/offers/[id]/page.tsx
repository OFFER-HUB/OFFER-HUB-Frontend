"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPublicOfferById, type MarketplaceOffer } from "@/lib/api/marketplace";
import { applyToOffer } from "@/lib/api/applications";
import { useAuthStore } from "@/stores/auth-store";
import { ApplyModal } from "@/components/marketplace/ApplyModal";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Navbar } from "@/components/landing/Navbar";
import { cn } from "@/lib/cn";

const CATEGORY_MAP: Record<string, string> = {
  WEB_DEVELOPMENT: "Web Development",
  MOBILE_DEVELOPMENT: "Mobile Development",
  DESIGN: "Design & Creative",
  WRITING: "Writing & Translation",
  MARKETING: "Marketing & Sales",
  VIDEO: "Video & Animation",
  MUSIC: "Music & Audio",
  DATA: "Data & Analytics",
  OTHER: "Other",
};

export default function OfferDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<MarketplaceOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    async function fetchOffer() {
      if (!offerId) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getPublicOfferById(offerId);
        setOffer(data);
      } catch (err) {
        console.error("Failed to fetch offer:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch offer");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffer();
  }, [offerId]);

  async function handleApply(coverLetter: string, proposedRate?: string) {
    if (!token) return;

    try {
      await applyToOffer(token, offerId, { coverLetter, proposedRate });
      setHasApplied(true);
      // Refresh offer data to update applicantsCount
      const refreshedData = await getPublicOfferById(offerId);
      setOffer(refreshedData);
    } catch (error) {
      console.error('Failed to apply to offer:', error);
      throw error;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner className="text-primary" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          icon={ICON_PATHS.alertCircle}
          message={error || "Offer not found. The offer you're looking for doesn't exist or has been removed"}
        />
      </div>
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const budget = parseFloat(offer.budget);
  const deadline = new Date(offer.deadline).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const category = CATEGORY_MAP[offer.category] || offer.category;
  const createdDate = new Date(offer.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  // Extract display name from email
  const userName = offer.user?.email?.split("@")[0] || "Anonymous";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className={cn(
            "flex items-center gap-2 mb-6 text-text-secondary hover:text-text-primary transition-colors"
          )}
        >
          <Icon path={ICON_PATHS.chevronLeft} size="sm" />
          <span className="text-sm font-medium">Back to offers</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Header */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                  {category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-text-primary mb-4">{offer.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Icon path={ICON_PATHS.calendar} size="sm" />
                  <span>Posted {createdDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon path={ICON_PATHS.clock} size="sm" />
                  <span>Deadline: {deadline}</span>
                </div>
                {offer.applicantsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Icon path={ICON_PATHS.users} size="sm" />
                    <span>
                      {offer.applicantsCount} applicant{offer.applicantsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">Description</h2>
              <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{offer.description}</p>
            </div>

            {/* Attachments */}
            {offer.attachments && offer.attachments.length > 0 && (
              <div
                className={cn(
                  "p-6 rounded-3xl bg-white",
                  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
                )}
              >
                <h2 className="text-xl font-bold text-text-primary mb-4">Attachments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {offer.attachments.map((attachment) => {
                    const fileUrl = `${backendUrl}${attachment.url}`;
                    const isImage = attachment.mimeType.startsWith("image/");

                    return (
                      <a
                        key={attachment.id}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl",
                          "bg-background transition-all duration-200",
                          "shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]",
                          "hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {isImage ? (
                            <Icon path={ICON_PATHS.image} size="sm" className="text-primary" />
                          ) : (
                            <Icon path={ICON_PATHS.document} size="sm" className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Icon path={ICON_PATHS.externalLink} size="sm" className="text-text-secondary" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Budget Card */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-2 mb-2 text-text-secondary">
                <Icon path={ICON_PATHS.currency} size="sm" />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-6">${budget.toLocaleString()}</div>

              {/* Apply Button */}
              {!isAuthenticated ? (
                <>
                  <Link
                    href={`/login?redirect=/marketplace/offers/${offerId}`}
                    className={cn(
                      "w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2",
                      "bg-primary text-white font-medium",
                      "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                      "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]",
                      "transition-all duration-200"
                    )}
                  >
                    <span>Apply to This Offer</span>
                    <Icon path={ICON_PATHS.chevronRight} size="sm" />
                  </Link>
                  <p className="mt-3 text-xs text-center text-text-secondary">
                    You'll need to log in to apply
                  </p>
                </>
              ) : hasApplied ? (
                <div className="p-3 rounded-xl bg-success/10 text-success text-center text-sm font-medium">
                  Application submitted successfully!
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className={cn(
                    "w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2",
                    "bg-primary text-white font-medium",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                    "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]",
                    "transition-all duration-200"
                  )}
                >
                  <span>Apply to This Offer</span>
                  <Icon path={ICON_PATHS.chevronRight} size="sm" />
                </button>
              )}
            </div>

            {/* Client Card */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <h3 className="text-sm font-medium text-text-secondary mb-4">About the Client</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{userName}</p>
                  <p className="text-xs text-text-secondary truncate">{offer.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <h3 className="text-sm font-medium text-text-secondary mb-4">Offer Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      offer.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-text-secondary/10 text-text-secondary"
                    )}
                  >
                    {offer.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Deadline</span>
                  <span className="text-sm font-medium text-text-primary">{deadline}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Apply Modal */}
      {offer && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
          offerTitle={offer.title}
          offerBudget={offer.budget}
        />
      )}
    </>
  );
}
