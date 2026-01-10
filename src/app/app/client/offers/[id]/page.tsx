"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useModeStore } from "@/stores/mode-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import {
  NEUMORPHIC_CARD,
  NEUMORPHIC_INSET,
  ICON_BUTTON,
  PRIMARY_BUTTON,
  ICON_CONTAINER,
} from "@/lib/styles";

type OfferStatus = "active" | "pending" | "closed";

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  hourlyRate: number;
  proposalDate: string;
  coverLetter: string;
}

interface OfferDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: OfferStatus;
  createdAt: string;
  applicants: Applicant[];
}

const MOCK_OFFERS: Record<string, OfferDetail> = {
  "1": {
    id: "1",
    title: "Build a responsive e-commerce website",
    description:
      "We need a professional e-commerce website built using React and Next.js. The website should include product listings, shopping cart, checkout flow, user authentication, and an admin panel for managing products and orders. Must be mobile-responsive and optimized for SEO.",
    category: "Web Development",
    budget: 2500,
    deadline: "2026-02-15",
    status: "active",
    createdAt: "2026-01-05",
    applicants: [
      {
        id: "a1",
        name: "John Developer",
        avatar: "JD",
        title: "Senior Full-Stack Developer",
        rating: 4.9,
        hourlyRate: 75,
        proposalDate: "2026-01-06",
        coverLetter:
          "I have 8+ years of experience building e-commerce platforms. I've worked with React, Next.js, and various payment integrations.",
      },
      {
        id: "a2",
        name: "Sarah Designer",
        avatar: "SD",
        title: "UI/UX Developer",
        rating: 4.8,
        hourlyRate: 65,
        proposalDate: "2026-01-07",
        coverLetter:
          "I specialize in creating beautiful, user-friendly e-commerce experiences. I can deliver a modern design with excellent UX.",
      },
      {
        id: "a3",
        name: "Mike Tech",
        avatar: "MT",
        title: "React Specialist",
        rating: 4.7,
        hourlyRate: 55,
        proposalDate: "2026-01-08",
        coverLetter:
          "I've built 20+ e-commerce sites using React and Next.js. Fast delivery and clean code guaranteed.",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Mobile app UI/UX design",
    description:
      "Looking for a talented designer to create UI/UX for our mobile fitness app. Need wireframes, high-fidelity mockups, and a design system. The app will have features like workout tracking, meal planning, and progress charts.",
    category: "Design & Creative",
    budget: 1200,
    deadline: "2026-01-25",
    status: "active",
    createdAt: "2026-01-03",
    applicants: [
      {
        id: "a4",
        name: "Emma Creative",
        avatar: "EC",
        title: "Product Designer",
        rating: 5.0,
        hourlyRate: 80,
        proposalDate: "2026-01-04",
        coverLetter:
          "I've designed 15+ fitness apps and understand the space deeply. I'll create an engaging experience for your users.",
      },
    ],
  },
};

const STATUS_CONFIG: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-success", bg: "bg-success/10" },
  pending: { label: "Pending", color: "text-warning", bg: "bg-warning/10" },
  closed: { label: "Closed", color: "text-text-secondary", bg: "bg-gray-100" },
};

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
                "bg-primary text-white",
                "hover:bg-primary-hover transition-colors"
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

export default function OfferPanelPage(): React.JSX.Element {
  const params = useParams();
  const { setMode } = useModeStore();
  const [offer, setOffer] = useState<OfferDetail | null>(null);

  useEffect(() => {
    setMode("client");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = params.id as string;
    const foundOffer = MOCK_OFFERS[id];
    if (foundOffer) {
      setOffer(foundOffer);
    }
  }, [params.id]);

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon path={ICON_PATHS.briefcase} size="xl" className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">Offer not found</p>
          <Link href="/app/client/offers" className="text-primary hover:underline mt-2 inline-block">
            Back to offers
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[offer.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/client/offers" className={ICON_BUTTON}>
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{offer.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusConfig.color, statusConfig.bg)}>
              {statusConfig.label}
            </span>
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
              <div className="flex items-center gap-3">
                <div className={cn(ICON_CONTAINER, "bg-primary")}>
                  <Icon path={ICON_PATHS.currency} size="sm" className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Budget</p>
                  <p className="font-semibold text-text-primary">${offer.budget.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(ICON_CONTAINER, "bg-secondary")}>
                  <Icon path={ICON_PATHS.clock} size="sm" className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Deadline</p>
                  <p className="font-semibold text-text-primary">
                    {new Date(offer.deadline).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn(ICON_CONTAINER, "bg-accent")}>
                  <Icon path={ICON_PATHS.users} size="sm" className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Applicants</p>
                  <p className="font-semibold text-text-primary">{offer.applicants.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={NEUMORPHIC_CARD}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/app/client/offers/${offer.id}/edit`}
                className={cn(
                  "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
                  "text-text-primary font-medium",
                  "bg-background hover:bg-gray-100 transition-colors"
                )}
              >
                <Icon path={ICON_PATHS.edit} size="md" />
                Edit Offer
              </Link>
              {offer.status === "active" && (
                <button
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
                    "text-warning font-medium cursor-pointer",
                    "bg-warning/10 hover:bg-warning/20 transition-colors"
                  )}
                >
                  <Icon path={ICON_PATHS.clock} size="md" />
                  Close Offer
                </button>
              )}
              <button
                className={cn(
                  "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
                  "text-error font-medium cursor-pointer",
                  "bg-error/10 hover:bg-error/20 transition-colors"
                )}
              >
                <Icon path={ICON_PATHS.trash} size="md" />
                Delete Offer
              </button>
              <div className="border-t border-border-light pt-3 mt-3">
                <Link
                  href="/app/disputes/new"
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
                    "text-text-secondary font-medium",
                    "hover:bg-background transition-colors"
                  )}
                >
                  <Icon path={ICON_PATHS.flag} size="md" />
                  Open Dispute
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
