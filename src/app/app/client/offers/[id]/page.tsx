"use client";

import { useEffect, useState } from "react";
import { useOfferDetail } from "@/hooks/useOfferDetail";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { BACKEND_URL } from "@/config/api";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { RateFreelancerModal } from "@/components/rating/RateFreelancerModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { OfferDetailLayout } from "@/components/offers/OfferDetailLayout";
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
import { isOfferEligibleForDispute } from "@/lib/disputes/helpers";
import { getRatingByOfferId, addRating } from "@/data/rating.data";
import type { Applicant, ClientOfferDetail, OfferStatus } from "@/types/client-offer.types";
import type { FreelancerRating } from "@/types/rating.types";

export default function OfferPanelPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [existingRating, setExistingRating] = useState<FreelancerRating | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const { offer, isLoading, setOffer } = useOfferDetail(params.id as string, token, mounted);

  useEffect(() => {
    setMode("client");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!offer) return;
    setExistingRating(getRatingByOfferId(offer.id) ?? null);
  }, [offer]);

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
      <OfferDetailLayout
        offer={offer}
        applications={applications}
        isLoadingApplications={isLoadingApplications}
        existingRating={existingRating}
        isClosing={isClosing}
        onAcceptApplication={handleAcceptApplication}
        onRejectApplication={handleRejectApplication}
        onCloseOffer={handleCloseOffer}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
        onRateClick={() => setIsRatingModalOpen(true)}
      />

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
