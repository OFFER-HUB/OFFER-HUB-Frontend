"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
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
import { MOCK_CLIENT_OFFER_DETAILS } from "@/data/client-offer.data";
import { isOfferEligibleForDispute } from "@/data/dispute.data";
import type { Applicant, ClientOfferDetail } from "@/types/client-offer.types";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ApplicantCardProps {
  applicant: Applicant;
}

function ApplicantCard({ applicant }: ApplicantCardProps): React.JSX.Element {
  return (
    <div className={cn("p-4 rounded-xl", NEUMORPHIC_INSET)}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
            "bg-primary text-white font-semibold"
          )}
        >
          {applicant.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-text-primary">{applicant.name}</h3>
            <div className="flex items-center gap-1 text-warning">
              <Icon path={ICON_PATHS.star} size="sm" />
              <span className="text-sm font-medium">{applicant.rating}</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary">{applicant.title}</p>
          <p className="text-sm text-primary font-medium mt-1">${applicant.hourlyRate}/hr</p>
          <p className="text-sm text-text-secondary mt-2 line-clamp-2">{applicant.coverLetter}</p>
          <div className="flex items-center gap-2 mt-3">
            <Link
              href={`/app/messages?user=${applicant.id}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                "bg-primary text-white hover:bg-primary-hover transition-colors"
              )}
            >
              <Icon path={ICON_PATHS.chat} size="sm" />
              Chat
            </Link>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                "text-text-secondary hover:text-text-primary hover:bg-background",
                "transition-colors cursor-pointer"
              )}
            >
              <Icon path={ICON_PATHS.user} size="sm" />
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

export default function OfferPanelPage(): React.JSX.Element {
  const params = useParams();
  const { setMode } = useModeStore();
  const [offer, setOffer] = useState<ClientOfferDetail | null>(null);

  useEffect(() => {
    setMode("client");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = params.id as string;
    const foundOffer = MOCK_CLIENT_OFFER_DETAILS[id];
    if (foundOffer) {
      setOffer(foundOffer);
    }
  }, [params.id]);

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

          <div className={NEUMORPHIC_CARD}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Applicants ({offer.applicants.length})
              </h2>
            </div>
            {offer.applicants.length === 0 ? (
              <div className="text-center py-8">
                <Icon path={ICON_PATHS.users} size="xl" className="text-text-secondary mx-auto mb-2" />
                <p className="text-text-secondary">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offer.applicants.map((applicant) => (
                  <ApplicantCard key={applicant.id} applicant={applicant} />
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
                value={String(offer.applicants.length)}
              />
            </div>
          </div>

          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
            <div className="space-y-3">
              <Link href={`/app/client/offers/${offer.id}/edit`} className={ACTION_BUTTON_DEFAULT}>
                <Icon path={ICON_PATHS.edit} size="md" />
                Edit Offer
              </Link>
              {offer.status === "active" && (
                <button className={ACTION_BUTTON_WARNING}>
                  <Icon path={ICON_PATHS.clock} size="md" />
                  Close Offer
                </button>
              )}
              <button className={ACTION_BUTTON_DANGER}>
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
    </div>
  );
}
