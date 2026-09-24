"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicOfferById, type MarketplaceOffer } from "@/lib/api/marketplace";
import { applyToOffer, getMyApplications } from "@/lib/api/applications";
import { useAuthStore } from "@/stores/auth-store";
import { ApplyModal } from "@/components/marketplace/ApplyModal";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
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
  OTHER: "Other Services",
};

interface FAQItem {
  question: string;
  answer: string;
}

const OFFER_FAQS: FAQItem[] = [
  {
    question: "How does applying to an offer work?",
    answer:
      "Submit your proposal detailing your approach, experience, and proposed rate. The client reviews all submissions and contacts selected candidates directly through OfferHub chat.",
  },
  {
    question: "How does payment protection work for freelancers?",
    answer:
      "When a client accepts your proposal, they fund an escrow contract with the agreed project budget. You begin work knowing that the funds are reserved and will be released upon your approved delivery.",
  },
  {
    question: "Can I discuss the project before being hired?",
    answer:
      "Yes, you can click 'Contact Client' to clarify project requirements, deadlines, or scope before submitting your formal proposal.",
  },
];

export default function OfferDetailPage(): React.JSX.Element {
  const params = useParams();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<MarketplaceOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOfferId, setCopiedOfferId] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "client" | "process" | "faq">("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  // Check if user already applied to this offer
  useEffect(() => {
    async function checkExistingApplication() {
      if (!token || !offerId) return;

      try {
        const myApplications = await getMyApplications(token);
        const alreadyApplied = myApplications.some((app) => app.offerId === offerId);
        setHasApplied(alreadyApplied);
      } catch (err) {
        console.error("Failed to check existing application:", err);
      }
    }

    checkExistingApplication();
  }, [token, offerId]);

  async function handleApply(coverLetter: string, proposedRate?: string) {
    if (!token) return;

    try {
      await applyToOffer(token, offerId, { coverLetter, proposedRate });
      setHasApplied(true);
      const refreshedData = await getPublicOfferById(offerId);
      setOffer(refreshedData);
      setToast({
        message: "Proposal submitted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to apply to offer:", error);
      setToast({
        message: error instanceof Error ? error.message : "Failed to apply to offer",
        type: "error",
      });
      throw error;
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setToast({
        message: "Link copied to clipboard",
        type: "success",
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setToast({
        message: "Unable to copy link",
        type: "error",
      });
    }
  };

  const handleCopyOfferId = async () => {
    try {
      await navigator.clipboard.writeText(offerId);
      setCopiedOfferId(true);
      setToast({
        message: "Offer ID copied to clipboard",
        type: "success",
      });
      setTimeout(() => setCopiedOfferId(false), 2500);
    } catch {
      setToast({
        message: "Unable to copy Offer ID",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-sm font-medium text-text-secondary">Loading offer...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-background shadow-[8px_8px_20px_#d1d5db,-8px_-8px_20px_#ffffff] text-center border border-white/60">
            <EmptyState
              icon={ICON_PATHS.alertCircle}
              message={error || "Offer not found."}
            />
            <Link
              href="/marketplace/offers"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-medium shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff] hover:bg-primary-hover transition-all"
            >
              <Icon path={ICON_PATHS.arrowLeft} size="sm" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const budget = parseFloat(offer.budget);
  const deadline = new Date(offer.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const category = CATEGORY_MAP[offer.category] || offer.category;
  
  const createdDate = new Date(offer.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const memberSince = offer.user?.createdAt
    ? new Date(offer.user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const clientFullName = [offer.user?.firstName, offer.user?.lastName].filter(Boolean).join(" ");
  const clientDisplayName = clientFullName || offer.user?.username || offer.user?.email?.split("@")[0] || "Client";
  const clientHandle = offer.user?.username ? `@${offer.user.username}` : null;
  const clientLocation = offer.user?.location || offer.user?.country || null;
  const clientTitle = offer.user?.professionalTitle || null;
  const clientBio = offer.user?.bio || null;

  const userInitials = clientFullName
    ? clientFullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : clientDisplayName.slice(0, 2).toUpperCase();

  const validAttachments = offer.attachments?.filter((att) => att.url.startsWith("https://")) ?? [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-text-primary pb-24">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Top Bar: Navigation & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Link
                href="/marketplace/offers"
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-2xl",
                  "bg-background text-text-secondary hover:text-text-primary text-sm font-medium",
                  "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                  "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                  "transition-all duration-200"
                )}
              >
                <Icon path={ICON_PATHS.arrowLeft} size="sm" />
                <span>All Offers</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary pl-2">
                <span>/</span>
                <span>{category}</span>
                <span>/</span>
                <span className="text-text-primary font-medium truncate max-w-[240px]">{offer.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyOfferId}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold",
                  "bg-background text-text-secondary hover:text-text-primary",
                  "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                  "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                  "transition-all duration-200"
                )}
                title="Copy Offer ID"
              >
                <Icon path={copiedOfferId ? ICON_PATHS.check : ICON_PATHS.copy} size="sm" className={copiedOfferId ? "text-primary" : ""} />
                <span className="font-mono text-[11px]">{copiedOfferId ? "ID Copied" : offer.id}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold",
                  "bg-background text-text-secondary hover:text-text-primary",
                  "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                  "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                  "transition-all duration-200"
                )}
                title="Share offer"
              >
                <Icon path={copiedLink ? ICON_PATHS.check : ICON_PATHS.share} size="sm" className={copiedLink ? "text-primary" : ""} />
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Hero Section Banner */}
          <div
            className={cn(
              "rounded-3xl p-6 sm:p-8 lg:p-10 bg-background mb-8",
              "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
              "border border-white/80"
            )}
          >
            {/* Category & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Icon path={ICON_PATHS.briefcase} size="sm" className="w-3.5 h-3.5" />
                <span>{category}</span>
              </span>

              <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                <Icon path={ICON_PATHS.calendar} size="sm" />
                <span>Posted on {createdDate}</span>
              </div>
            </div>

            {/* Offer Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
              {offer.title}
            </h1>

            {/* Client Profile Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-black/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary text-white flex items-center justify-center font-extrabold text-lg shadow-[3px_3px_8px_#cbd5e1]">
                  {userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#111827]">{clientDisplayName}</span>
                    {clientHandle && (
                      <span className="text-xs text-text-secondary font-medium">{clientHandle}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mt-0.5">
                    {clientTitle && (
                      <span className="font-semibold text-primary">{clientTitle}</span>
                    )}
                    {clientTitle && clientLocation && <span>•</span>}
                    {clientLocation && (
                      <span className="flex items-center gap-1">
                        <Icon path={ICON_PATHS.mapPin} size="sm" className="w-3.5 h-3.5 text-text-secondary" />
                        <span>{clientLocation}</span>
                      </span>
                    )}
                    {memberSince && (
                      <>
                        <span>•</span>
                        <span>Member since {memberSince}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Offer Specifications Strip */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                  <Icon path={ICON_PATHS.currency} size="sm" className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Project Budget</p>
                    <p className="text-xs font-bold text-text-primary font-mono">${budget.toLocaleString()} USD</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                  <Icon path={ICON_PATHS.clock} size="sm" className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Submission Deadline</p>
                    <p className="text-xs font-bold text-text-primary">{deadline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                  <Icon path={ICON_PATHS.users} size="sm" className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Applications</p>
                    <p className="text-xs font-bold text-text-primary">{offer.applicantsCount} candidate{offer.applicantsCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-background shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] mb-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "overview"
                  ? "bg-primary text-white shadow-[3px_3px_8px_#cbd5e1]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Overview & Requirements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("client")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "client"
                  ? "bg-primary text-white shadow-[3px_3px_8px_#cbd5e1]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              About the Client
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("process")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "process"
                  ? "bg-primary text-white shadow-[3px_3px_8px_#cbd5e1]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Hiring & Escrow Workflow
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "faq"
                  ? "bg-primary text-white shadow-[3px_3px_8px_#cbd5e1]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Frequently Asked Questions
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Area (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Description Card */}
                  <div
                    className={cn(
                      "rounded-3xl p-6 sm:p-8 bg-background",
                      "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                      "border border-white/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-black/5">
                      <div className="w-2 h-6 bg-primary rounded-full" />
                      <h2 className="text-lg sm:text-xl font-bold text-[#111827]">
                        Project Requirements
                      </h2>
                    </div>

                    <div className="text-text-primary leading-relaxed space-y-4 text-sm sm:text-base font-normal">
                      <p className="whitespace-pre-wrap break-words">{offer.description}</p>
                    </div>

                    {/* Attachments Section if available */}
                    {validAttachments.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-black/5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
                          Specification Documents ({validAttachments.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {validAttachments.map((attachment) => {
                            const fileUrl = attachment.url;
                            const isImage = attachment.mimeType.startsWith("image/");

                            return (
                              <a
                                key={attachment.id}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-3 p-3.5 rounded-2xl",
                                  "bg-white/60 hover:bg-white transition-all duration-200",
                                  "shadow-[2px_2px_6px_#e2e8f0] border border-white",
                                  "group"
                                )}
                              >
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                  <Icon path={isImage ? ICON_PATHS.image : ICON_PATHS.document} size="sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                                    {attachment.filename}
                                  </p>
                                  <p className="text-[11px] text-text-secondary">
                                    {(attachment.size / 1024).toFixed(1)} KB • Open File
                                  </p>
                                </div>
                                <Icon path={ICON_PATHS.externalLink} size="sm" className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specifications Matrix Card */}
                  <div
                    className={cn(
                      "rounded-3xl p-6 sm:p-8 bg-background",
                      "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                      "border border-white/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-black/5">
                      <div className="w-2 h-6 bg-primary rounded-full" />
                      <h2 className="text-lg sm:text-xl font-bold text-[#111827]">
                        Offer Specifications
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                          Category
                        </span>
                        <p className="text-sm font-semibold text-text-primary">{category}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                          Deadline
                        </span>
                        <p className="text-sm font-semibold text-text-primary">{deadline}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                          Current Proposals
                        </span>
                        <p className="text-sm font-semibold text-text-primary">{offer.applicantsCount} applicants</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                          Offer Identifier
                        </span>
                        <p className="text-xs font-mono font-semibold text-text-primary truncate">{offer.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENT INFORMATION */}
              {activeTab === "client" && (
                <div
                  className={cn(
                    "rounded-3xl p-6 sm:p-8 bg-background",
                    "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                    "border border-white/70"
                  )}
                >
                  <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-black/5">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    <h2 className="text-lg sm:text-xl font-bold text-[#111827]">
                      About {clientDisplayName}
                    </h2>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-secondary text-white flex items-center justify-center font-extrabold text-2xl shadow-[4px_4px_12px_#cbd5e1] flex-shrink-0">
                      {userInitials}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-extrabold text-[#111827]">{clientDisplayName}</h3>
                        {clientHandle && (
                          <span className="text-sm font-medium text-text-secondary">{clientHandle}</span>
                        )}
                      </div>

                      {clientTitle && (
                        <p className="text-sm font-semibold text-primary">{clientTitle}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                        {clientLocation && (
                          <span className="flex items-center gap-1.5">
                            <Icon path={ICON_PATHS.mapPin} size="sm" className="w-4 h-4 text-text-secondary" />
                            <span>{clientLocation}</span>
                          </span>
                        )}
                        {memberSince && (
                          <span className="flex items-center gap-1.5">
                            <Icon path={ICON_PATHS.calendar} size="sm" className="w-4 h-4 text-text-secondary" />
                            <span>Member since {memberSince}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {clientBio ? (
                    <div className="p-6 rounded-2xl bg-white/60 shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] border border-white/80 mb-8">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">
                        Client Overview
                      </span>
                      <p className="text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
                        {clientBio}
                      </p>
                    </div>
                  ) : null}

                  <div className="pt-4 flex flex-wrap gap-4">
                    <Link
                      href={`/app/chat?userId=${offer.user?.id || ""}`}
                      className={cn(
                        "inline-flex items-center gap-2 px-6 py-3 rounded-2xl",
                        "bg-primary text-white font-semibold text-sm hover:bg-primary-hover",
                        "shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff]",
                        "transition-all duration-200"
                      )}
                    >
                      <Icon path={ICON_PATHS.chat} size="sm" />
                      <span>Contact Client</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: PROCESS */}
              {activeTab === "process" && (
                <div
                  className={cn(
                    "rounded-3xl p-6 sm:p-8 bg-background",
                    "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                    "border border-white/70"
                  )}
                >
                  <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-black/5">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#111827]">
                        Application & Escrow Workflow
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Clear process protecting both client expectations and freelancer compensation.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Submit Your Proposal</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        Describe your approach, delivery estimate, and proposed rate. The client receives your pitch immediately.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Escrow Deposit</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        When the client accepts your application, funds are reserved in an escrow contract before work commences.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Work & Delivery</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        Use the dedicated order workspace for chat, file deliveries, and progress review.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          4
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Approval & Payout</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        Upon client sign-off, escrowed funds are released directly to your OfferHub balance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FAQ */}
              {activeTab === "faq" && (
                <div
                  className={cn(
                    "rounded-3xl p-6 sm:p-8 bg-background",
                    "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                    "border border-white/70"
                  )}
                >
                  <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-black/5">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#111827]">
                        Frequently Asked Questions
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Key details about applying and delivering projects on OfferHub.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {OFFER_FAQS.map((faq, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={faq.question}
                          className="rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white overflow-hidden transition-all duration-200"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-[#111827]"
                          >
                            <span>{faq.question}</span>
                            <Icon
                              path={isOpen ? ICON_PATHS.chevronDown : ICON_PATHS.chevronRight}
                              size="sm"
                              className="text-text-secondary flex-shrink-0"
                            />
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-black/5 pt-3">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right Sticky Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* Budget & Action Card */}
              <div
                className={cn(
                  "rounded-3xl p-6 sm:p-7 bg-background",
                  "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                  "border border-white/80"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Target Budget
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    Fixed Project
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-[#111827] tracking-tight font-mono">
                    ${budget.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary uppercase">USD</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 shadow-[inset_2px_2px_4px_#e2e8f0,inset_-2px_-2px_4px_#ffffff] mb-6 space-y-3 border border-white/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Icon path={ICON_PATHS.clock} size="sm" className="text-primary" />
                      Target Deadline:
                    </span>
                    <span className="font-bold text-text-primary">{deadline}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Icon path={ICON_PATHS.users} size="sm" className="text-primary" />
                      Proposals:
                    </span>
                    <span className="font-bold text-text-primary">{offer.applicantsCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Icon path={ICON_PATHS.shield} size="sm" className="text-primary" />
                      Escrow:
                    </span>
                    <span className="font-bold text-text-primary">Funded on Acceptance</span>
                  </div>
                </div>

                {/* Apply Button / Status */}
                {!isAuthenticated ? (
                  <div>
                    <Link
                      href={`/login?redirect=/marketplace/offers/${offerId}`}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5",
                        "bg-primary text-white font-bold text-base hover:bg-primary-hover",
                        "shadow-[5px_5px_14px_#cbd5e1,-5px_-5px_14px_#ffffff]",
                        "hover:shadow-[7px_7px_18px_#cbd5e1,-7px_-7px_18px_#ffffff]",
                        "active:scale-[0.99] transition-all duration-200"
                      )}
                    >
                      <span>Sign In to Apply</span>
                      <Icon path={ICON_PATHS.chevronRight} size="sm" />
                    </Link>
                    <p className="mt-2.5 text-[11px] text-center text-text-secondary font-medium">
                      Account required to submit proposal
                    </p>
                  </div>
                ) : hasApplied ? (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm mb-1">
                      <Icon path={ICON_PATHS.checkCircle} size="sm" />
                      <span>Proposal Submitted</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      You have applied to this offer.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(true)}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5",
                      "bg-primary text-white font-bold text-base hover:bg-primary-hover",
                      "shadow-[5px_5px_14px_#cbd5e1,-5px_-5px_14px_#ffffff]",
                      "hover:shadow-[7px_7px_18px_#cbd5e1,-7px_-7px_18px_#ffffff]",
                      "active:scale-[0.99] transition-all duration-200"
                    )}
                  >
                    <span>Apply to This Offer</span>
                    <Icon path={ICON_PATHS.chevronRight} size="sm" />
                  </button>
                )}

                <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-center gap-2 text-xs text-text-secondary">
                  <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
                  <span>Escrow protected upon agreement</span>
                </div>
              </div>

              {/* Client Quick Sidebar Card */}
              <div
                className={cn(
                  "rounded-3xl p-6 sm:p-7 bg-background",
                  "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                  "border border-white/80"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    About the Client
                  </h3>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-extrabold text-base shadow-[3px_3px_8px_#cbd5e1]">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#111827] truncate">
                      {clientDisplayName}
                    </h4>
                    {clientTitle && (
                      <p className="text-xs font-semibold text-primary">{clientTitle}</p>
                    )}
                    {clientLocation && (
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                        <Icon path={ICON_PATHS.mapPin} size="sm" className="w-3 h-3 text-text-secondary" />
                        <span>{clientLocation}</span>
                      </p>
                    )}
                  </div>
                </div>

                {clientBio && (
                  <div className="p-3 rounded-xl bg-white/50 shadow-[inset_1px_1px_3px_#e2e8f0] border border-white mb-4 text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {clientBio}
                  </div>
                )}

                <Link
                  href={`/app/chat?userId=${offer.user?.id || ""}`}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2",
                    "bg-background text-text-primary font-semibold text-xs",
                    "shadow-[3px_3px_8px_#d1d5db,-3px_-3px_8px_#ffffff]",
                    "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                    "transition-all duration-200"
                  )}
                >
                  <Icon path={ICON_PATHS.chat} size="sm" className="text-primary" />
                  <span>Contact Client</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
