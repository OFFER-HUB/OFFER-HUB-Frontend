"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { RateFreelancerModal } from "@/components/rating/RateFreelancerModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
  ICON_CONTAINER,
  ACTION_BUTTON_DEFAULT,
  ACTION_BUTTON_WARNING,
  ACTION_BUTTON_DANGER,
  ACTION_BUTTON_SUBTLE,
} from "@/lib/styles";
import { getOfferById, deleteOffer, updateOfferStatus, type Offer, type OfferCategory, type OfferAttachment } from "@/lib/api/offers";
import { getOfferApplications, updateApplicationStatus } from "@/lib/api/applications";
import { ApplicationCard } from "@/components/offers/ApplicationCard";
import type { Application } from "@/types/application.types";
import { isOfferEligibleForDispute } from "@/data/dispute.data";
import { getRatingByOfferId, addRating } from "@/data/rating.data";
import type { Applicant, ClientOfferDetail, OfferStatus } from "@/types/client-offer.types";
import type { FreelancerRating } from "@/types/rating.types";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface DetailItemProps {
  icon: string;
  iconBgColor: string;
  label: string;
  value: string;
}

function DetailItem({ icon, iconBgColor, label, value }: DetailItemProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(ICON_CONTAINER, iconBgColor)}>
        <Icon path={icon} size="sm" className="text-white" />
      </div>
      <div>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

const CATEGORY_MAP: Record<OfferCategory, string> = {
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

function mapApiOfferToDetail(apiOffer: Offer): ClientOfferDetail & { apiAttachments?: OfferAttachment[] } {
  return {
    id: apiOffer.id,
    title: apiOffer.title,
    description: apiOffer.description,
    category: CATEGORY_MAP[apiOffer.category] || apiOffer.category,
    budget: parseFloat(apiOffer.budget),
    deadline: apiOffer.deadline.split("T")[0],
    status: apiOffer.status.toLowerCase() as OfferStatus,
    createdAt: apiOffer.createdAt.split("T")[0],
    applicants: [], // TODO: Will be populated when applicants feature is added
    hiredFreelancer: undefined,
    attachments: undefined,
    apiAttachments: apiOffer.attachments,
  };
}

export default function OfferPanelPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offer, setOffer] = useState<(ClientOfferDetail & { apiAttachments?: OfferAttachment[] }) | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [existingRating, setExistingRating] = useState<FreelancerRating | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  useEffect(() => {
    setMode("client");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchOffer() {
      const id = params.id as string;
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const apiOffer = await getOfferById(token, id);
        setOffer(mapApiOfferToDetail(apiOffer));
        setExistingRating(getRatingByOfferId(id) ?? null);
      } catch (error) {
        console.error("Failed to fetch offer:", error);
        setOffer(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffer();
  }, [mounted, params.id, token]);

  // Fetch applications for this offer
  useEffect(() => {
    if (!token || !offer) return;

    const offerId = offer.id;
    async function fetchApplications() {
      if (!token) return;
      setIsLoadingApplications(true);
      try {
        const apps = await getOfferApplications(token, offerId);
        setApplications(apps);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoadingApplications(false);
      }
    }

    fetchApplications();
  }, [token, offer]);

  async function handleAcceptApplication(applicationId: string): Promise<void> {
    if (!token || !offer) return;

    try {
      await updateApplicationStatus(token, applicationId, { status: 'ACCEPTED' });
      // Refresh applications
      const apps = await getOfferApplications(token, offer.id);
      setApplications(apps);
    } catch (error) {
      console.error('Failed to accept application:', error);
      throw error;
    }
  }

  async function handleRejectApplication(applicationId: string): Promise<void> {
    if (!token || !offer) return;

    try {
      await updateApplicationStatus(token, applicationId, { status: 'REJECTED' });
      // Refresh applications
      const apps = await getOfferApplications(token, offer.id);
      setApplications(apps);
    } catch (error) {
      console.error('Failed to reject application:', error);
      throw error;
    }
  }

  async function handleDelete(): Promise<void> {
    if (!token || !offer) return;
    setIsDeleting(true);

    try {
      await deleteOffer(token, offer.id);
      router.push("/app/client/offers");
    } catch (error) {
      console.error("Failed to delete offer:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  }

  async function handleCloseOffer(): Promise<void> {
    if (!token || !offer) return;
    setIsClosing(true);

    try {
      await updateOfferStatus(token, offer.id, { status: "CLOSED" });
      setOffer((prev) => prev ? { ...prev, status: "closed" } : null);
    } catch (error) {
      console.error("Failed to close offer:", error);
    } finally {
      setIsClosing(false);
    }
  }

  async function handleSubmitRating(rating: number, comment: string): Promise<void> {
    if (!offer || !offer.hiredFreelancer) return;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRating: FreelancerRating = {
      id: `rating-${Date.now()}`,
      offerId: offer.id,
      freelancerId: offer.hiredFreelancer.id,
      freelancerName: offer.hiredFreelancer.name,
      clientId: "client-1",
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    addRating(newRating);
    setExistingRating(newRating);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-text-secondary">Loading offer...</span>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={ICON_PATHS.briefcase}
          message="Offer not found"
          linkHref="/app/client/offers"
          linkText="Back to offers"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/client/offers" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{offer.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={offer.status} />
            <span className="text-text-secondary">•</span>
            <span className="text-sm text-text-secondary">{offer.category}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Description</h2>
            <p className="text-text-secondary whitespace-pre-line">{offer.description}</p>
          </div>

          {offer.apiAttachments && offer.apiAttachments.length > 0 && (
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Attachments ({offer.apiAttachments.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {offer.apiAttachments.map((attachment) => {
                  const isImage = attachment.mimeType.startsWith("image/");
                  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
                  const fileUrl = `${backendUrl}${attachment.url}`;

                  return (
                    <a
                      key={attachment.id}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group relative rounded-xl overflow-hidden",
                        NEUMORPHIC_INSET,
                        "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                        "transition-all duration-200"
                      )}
                    >
                      {isImage ? (
                        <div className="aspect-square">
                          <img
                            src={fileUrl}
                            alt={attachment.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex flex-col items-center justify-center p-4 bg-background">
                          <Icon path={ICON_PATHS.document} size="xl" className="text-text-secondary mb-2" />
                          <p className="text-xs text-text-secondary text-center truncate w-full">
                            {attachment.filename}
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className={NEUMORPHIC_CARD}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Applicants ({applications.length})
              </h2>
            </div>
            {isLoadingApplications ? (
              <div className="text-center py-8">
                <LoadingSpinner className="text-primary mx-auto" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <Icon path={ICON_PATHS.users} size="xl" className="text-text-secondary mx-auto mb-2" />
                <p className="text-text-secondary">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onAccept={handleAcceptApplication}
                    onReject={handleRejectApplication}
                    showActions
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Details</h2>
            <div className="space-y-4">
              <DetailItem
                icon={ICON_PATHS.currency}
                iconBgColor="bg-primary"
                label="Budget"
                value={`$${offer.budget.toLocaleString()}`}
              />
              <DetailItem
                icon={ICON_PATHS.clock}
                iconBgColor="bg-secondary"
                label="Deadline"
                value={formatDate(offer.deadline)}
              />
              <DetailItem
                icon={ICON_PATHS.users}
                iconBgColor="bg-accent"
                label="Applicants"
                value={String(applications.length)}
              />
            </div>
          </div>

          {offer.status === "completed" && offer.hiredFreelancer && (
            <div className={NEUMORPHIC_CARD}>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Hired Freelancer
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white font-semibold">
                  {offer.hiredFreelancer.avatar}
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    {offer.hiredFreelancer.name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {offer.hiredFreelancer.title}
                  </p>
                </div>
              </div>

              {existingRating ? (
                <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-text-secondary">Your Rating:</span>
                    <StarRating value={existingRating.rating} readonly size="sm" />
                  </div>
                  <p className="text-text-primary text-sm">{existingRating.comment}</p>
                </div>
              ) : (
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className={ACTION_BUTTON_WARNING}
                >
                  <Icon path={ICON_PATHS.star} size="md" />
                  Rate Freelancer
                </button>
              )}
            </div>
          )}

          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
            <div className="space-y-3">
              <Link href={`/app/client/offers/${offer.id}/edit`} className={ACTION_BUTTON_DEFAULT}>
                <Icon path={ICON_PATHS.edit} size="md" />
                Edit Offer
              </Link>
              {offer.status === "active" && (
                <button
                  onClick={handleCloseOffer}
                  disabled={isClosing}
                  className={ACTION_BUTTON_WARNING}
                >
                  {isClosing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <Icon path={ICON_PATHS.clock} size="md" />
                      Close Offer
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className={ACTION_BUTTON_DANGER}
              >
                <Icon path={ICON_PATHS.trash} size="md" />
                Delete Offer
              </button>
              {isOfferEligibleForDispute(offer.id, offer.status) && (
                <div className="border-t border-border-light pt-3 mt-3">
                  <Link href={`/app/disputes/new?offerId=${offer.id}`} className={ACTION_BUTTON_SUBTLE}>
                    <Icon path={ICON_PATHS.flag} size="md" />
                    Open Dispute
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {offer.hiredFreelancer && (
        <RateFreelancerModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleSubmitRating}
          freelancerName={offer.hiredFreelancer.name}
          offerTitle={offer.title}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Offer?"
        message="Are you sure you want to delete this offer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        icon={ICON_PATHS.trash}
        isLoading={isDeleting}
      />
    </div>
  );
}
