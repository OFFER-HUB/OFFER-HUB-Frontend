"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPublicServiceById, type MarketplaceService } from "@/lib/api/marketplace";
import { hireService } from "@/lib/api/services";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { Navbar } from "@/components/landing/Navbar";
import { HireServiceModal } from "@/components/marketplace/HireServiceModal";
import { useAuthStore } from "@/stores/auth-store";
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

const PLATFORM_FAQS: FAQItem[] = [
  {
    question: "How does payment protection work?",
    answer:
      "When you hire this service, your funds are safely reserved in an escrow smart contract. The freelancer begins work knowing the funds are secure, and payment is only released to the seller once you inspect and approve the completed delivery.",
  },
  {
    question: "How do I communicate with the freelancer?",
    answer:
      "You can send a direct message using the 'Contact Freelancer' button prior to hiring, or use the dedicated project workspace with real-time chat and file attachments once an order is created.",
  },
  {
    question: "Can I request changes or revisions?",
    answer:
      "Yes. Once the freelancer delivers the project files, you can review them and request revisions directly through the order workspace before completing the order.",
  },
  {
    question: "What happens if there is a disagreement?",
    answer:
      "OfferHub provides a dispute resolution protocol where our support team can review project deliverables, agreed requirements, and chat logs to ensure a fair resolution or refund.",
  },
];

export default function ServiceDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { isAuthenticated, token } = useAuthStore();

  const [service, setService] = useState<MarketplaceService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedServiceId, setCopiedServiceId] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "specialist" | "process" | "faq">("overview");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function fetchService() {
      if (!serviceId) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await getPublicServiceById(serviceId);
        setService(data);
      } catch (err) {
        console.error("Failed to fetch service:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch service");
      } finally {
        setIsLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

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

  const handleCopyServiceId = async () => {
    try {
      await navigator.clipboard.writeText(serviceId);
      setCopiedServiceId(true);
      setToast({
        message: "Service ID copied to clipboard",
        type: "success",
      });
      setTimeout(() => setCopiedServiceId(false), 2500);
    } catch {
      setToast({
        message: "Unable to copy Service ID",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-sm font-medium text-text-secondary">Loading service...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-background shadow-[8px_8px_20px_#d1d5db,-8px_-8px_20px_#ffffff] text-center border border-white/60">
            <EmptyState
              icon={ICON_PATHS.alertCircle}
              message={error || "Service not found."}
            />
            <Link
              href="/marketplace/services"
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

  const price = parseFloat(service.price);
  const averageRating = service.averageRating ? parseFloat(service.averageRating) : null;
  const category = CATEGORY_MAP[service.category] || service.category;
  
  const createdDate = new Date(service.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const memberSince = service.user?.createdAt
    ? new Date(service.user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  const freelancerFullName = [service.user?.firstName, service.user?.lastName].filter(Boolean).join(" ");
  const freelancerDisplayName = freelancerFullName || service.user?.username || service.user?.email?.split("@")[0] || "Specialist";
  const freelancerHandle = service.user?.username ? `@${service.user.username}` : null;
  const freelancerLocation = service.user?.location || service.user?.country || null;
  const professionalTitle = service.user?.professionalTitle || null;
  const freelancerBio = service.user?.bio || null;

  const userInitials = freelancerFullName
    ? freelancerFullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : freelancerDisplayName.slice(0, 2).toUpperCase();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-text-primary pb-24">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          {/* Top Bar: Navigation & Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Link
                href="/marketplace/services"
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-2xl",
                  "bg-background text-text-secondary hover:text-text-primary text-sm font-medium",
                  "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                  "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                  "transition-all duration-200"
                )}
              >
                <Icon path={ICON_PATHS.arrowLeft} size="sm" />
                <span>All Services</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-xs text-text-secondary pl-2">
                <span>/</span>
                <span>{category}</span>
                <span>/</span>
                <span className="text-text-primary font-medium truncate max-w-[240px]">{service.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyServiceId}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold",
                  "bg-background text-text-secondary hover:text-text-primary",
                  "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                  "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                  "transition-all duration-200"
                )}
                title="Copy Service ID"
              >
                <Icon path={copiedServiceId ? ICON_PATHS.check : ICON_PATHS.copy} size="sm" className={copiedServiceId ? "text-primary" : ""} />
                <span className="font-mono text-[11px]">{copiedServiceId ? "ID Copied" : service.id}</span>
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
                title="Share service"
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
                <span>Listed on {createdDate}</span>
              </div>
            </div>

            {/* Service Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight mb-6">
              {service.title}
            </h1>

            {/* Specialist Profile Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-black/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-lg shadow-[3px_3px_8px_#cbd5e1]">
                  {userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#111827]">{freelancerDisplayName}</span>
                    {freelancerHandle && (
                      <span className="text-xs text-text-secondary font-medium">{freelancerHandle}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mt-0.5">
                    {professionalTitle && (
                      <span className="font-semibold text-primary">{professionalTitle}</span>
                    )}
                    {professionalTitle && freelancerLocation && <span>•</span>}
                    {freelancerLocation && (
                      <span className="flex items-center gap-1">
                        <Icon path={ICON_PATHS.mapPin} size="sm" className="w-3.5 h-3.5 text-text-secondary" />
                        <span>{freelancerLocation}</span>
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

              {/* Service Specifications Strip */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                  <Icon path={ICON_PATHS.clock} size="sm" className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Delivery Time</p>
                    <p className="text-xs font-bold text-text-primary">{service.deliveryDays} business days</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                  <Icon path={ICON_PATHS.currency} size="sm" className="text-primary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Fixed Price</p>
                    <p className="text-xs font-bold text-text-primary font-mono">${price.toLocaleString()} USD</p>
                  </div>
                </div>

                {averageRating !== null ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                    <Icon path={ICON_PATHS.star} size="sm" className="text-amber-500 fill-amber-500" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Rating</p>
                      <p className="text-xs font-bold text-text-primary">{averageRating.toFixed(1)} / 5.0</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 shadow-[2px_2px_5px_#e2e8f0] border border-white">
                    <Icon path={ICON_PATHS.star} size="sm" className="text-text-secondary" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Rating</p>
                      <p className="text-xs font-medium text-text-secondary">No reviews yet</p>
                    </div>
                  </div>
                )}
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
              Overview & Scope
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("specialist")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "specialist"
                  ? "bg-primary text-white shadow-[3px_3px_8px_#cbd5e1]"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              About the Specialist
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
              Order & Escrow Process
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
                  {/* Service Description Card */}
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
                        Detailed Service Description
                      </h2>
                    </div>

                    <div className="text-text-primary leading-relaxed space-y-4 text-sm sm:text-base font-normal">
                      <p className="whitespace-pre-wrap">{service.description}</p>
                    </div>
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
                        Service Specifications
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
                          Delivery Window
                        </span>
                        <p className="text-sm font-semibold text-text-primary">{service.deliveryDays} business days</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                          Completed Orders
                        </span>
                        <p className="text-sm font-semibold text-text-primary">{service.totalOrders} orders completed</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                          Service Identifier
                        </span>
                        <p className="text-xs font-mono font-semibold text-text-primary truncate">{service.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SPECIALIST PROFILE */}
              {activeTab === "specialist" && (
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
                      About {freelancerDisplayName}
                    </h2>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center font-extrabold text-2xl shadow-[4px_4px_12px_#cbd5e1] flex-shrink-0">
                      {userInitials}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-extrabold text-[#111827]">{freelancerDisplayName}</h3>
                        {freelancerHandle && (
                          <span className="text-sm font-medium text-text-secondary">{freelancerHandle}</span>
                        )}
                      </div>

                      {professionalTitle && (
                        <p className="text-sm font-semibold text-primary">{professionalTitle}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                        {freelancerLocation && (
                          <span className="flex items-center gap-1.5">
                            <Icon path={ICON_PATHS.mapPin} size="sm" className="w-4 h-4 text-text-secondary" />
                            <span>{freelancerLocation}</span>
                          </span>
                        )}
                        {memberSince && (
                          <span className="flex items-center gap-1.5">
                            <Icon path={ICON_PATHS.calendar} size="sm" className="w-4 h-4 text-text-secondary" />
                            <span>Member since {memberSince}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Icon path={ICON_PATHS.briefcase} size="sm" className="w-4 h-4 text-text-secondary" />
                          <span>{service.totalOrders} total completed orders</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {freelancerBio ? (
                    <div className="p-6 rounded-2xl bg-white/60 shadow-[inset_2px_2px_5px_#e2e8f0,inset_-2px_-2px_5px_#ffffff] border border-white/80 mb-8">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">
                        Specialist Bio
                      </span>
                      <p className="text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
                        {freelancerBio}
                      </p>
                    </div>
                  ) : null}

                  <div className="pt-4 flex flex-wrap gap-4">
                    <Link
                      href={`/app/chat?userId=${service.user?.id || ""}`}
                      className={cn(
                        "inline-flex items-center gap-2 px-6 py-3 rounded-2xl",
                        "bg-primary text-white font-semibold text-sm hover:bg-primary-hover",
                        "shadow-[4px_4px_10px_#cbd5e1,-4px_-4px_10px_#ffffff]",
                        "transition-all duration-200"
                      )}
                    >
                      <Icon path={ICON_PATHS.chat} size="sm" />
                      <span>Message {freelancerDisplayName}</span>
                    </Link>

                    {service.user?.id && (
                      <Link
                        href={`/marketplace/freelancers/${service.user.id}`}
                        className={cn(
                          "inline-flex items-center gap-2 px-6 py-3 rounded-2xl",
                          "bg-background text-text-primary font-semibold text-sm",
                          "shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff]",
                          "hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                          "transition-all duration-200"
                        )}
                      >
                        <Icon path={ICON_PATHS.user} size="sm" />
                        <span>View Full Profile</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ORDER & ESCROW PROCESS */}
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
                        How Service Orders Work on OfferHub
                      </h2>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Your payment is held in escrow throughout the project lifecycle.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Hire & Escrow Funding</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        When you submit the hire form, the total price is safely deposited into smart escrow. The seller is notified and assigned the order.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Collaboration & Chat</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        You and the specialist share details, clarifications, and progress updates directly in your private order workspace.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Review Deliverables</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        The specialist uploads the final project files. You can inspect all deliverables and request adjustments if needed.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/60 shadow-[2px_2px_6px_#e2e8f0] border border-white">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                          4
                        </span>
                        <h4 className="font-bold text-sm text-[#111827]">Sign-off & Release</h4>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed pl-10">
                        Once you verify and approve the work, the escrowed funds are released to the seller, and the order is marked completed.
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
                        Everything you need to know about hiring services on OfferHub.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {PLATFORM_FAQS.map((faq, idx) => {
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
              
              {/* Order & Pricing Card */}
              <div
                className={cn(
                  "rounded-3xl p-6 sm:p-7 bg-background",
                  "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                  "border border-white/80"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Service Rate
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    Fixed Price
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-[#111827] tracking-tight font-mono">
                    ${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary uppercase">USD</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/60 shadow-[inset_2px_2px_4px_#e2e8f0,inset_-2px_-2px_4px_#ffffff] mb-6 space-y-3 border border-white/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Icon path={ICON_PATHS.clock} size="sm" className="text-primary" />
                      Delivery Window:
                    </span>
                    <span className="font-bold text-text-primary">{service.deliveryDays} business days</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Icon path={ICON_PATHS.shield} size="sm" className="text-primary" />
                      Payment Method:
                    </span>
                    <span className="font-bold text-text-primary">Escrow Protected</span>
                  </div>

                  {service.totalOrders > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <Icon path={ICON_PATHS.briefcase} size="sm" className="text-primary" />
                        Completed Orders:
                      </span>
                      <span className="font-bold text-text-primary">{service.totalOrders}</span>
                    </div>
                  )}
                </div>

                {/* Primary CTA Button */}
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5",
                      "bg-primary text-white font-bold text-base hover:bg-primary-hover",
                      "shadow-[5px_5px_14px_#cbd5e1,-5px_-5px_14px_#ffffff]",
                      "hover:shadow-[7px_7px_18px_#cbd5e1,-7px_-7px_18px_#ffffff]",
                      "active:scale-[0.99] transition-all duration-200"
                    )}
                  >
                    <span>Hire This Service</span>
                    <Icon path={ICON_PATHS.chevronRight} size="sm" />
                  </button>
                ) : (
                  <div>
                    <Link
                      href={`/login?redirect=/marketplace/services/${serviceId}`}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5",
                        "bg-primary text-white font-bold text-base hover:bg-primary-hover",
                        "shadow-[5px_5px_14px_#cbd5e1,-5px_-5px_14px_#ffffff]",
                        "hover:shadow-[7px_7px_18px_#cbd5e1,-7px_-7px_18px_#ffffff]",
                        "active:scale-[0.99] transition-all duration-200"
                      )}
                    >
                      <span>Sign In to Hire</span>
                      <Icon path={ICON_PATHS.chevronRight} size="sm" />
                    </Link>
                    <p className="mt-2.5 text-[11px] text-center text-text-secondary font-medium">
                      Account required to open an escrow contract
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-center gap-2 text-xs text-text-secondary">
                  <Icon path={ICON_PATHS.lock} size="sm" className="text-primary" />
                  <span>Funds held in smart escrow until delivery</span>
                </div>
              </div>

              {/* Specialist Quick Sidebar Card */}
              <div
                className={cn(
                  "rounded-3xl p-6 sm:p-7 bg-background",
                  "shadow-[8px_8px_20px_#cbd5e1,-8px_-8px_20px_#ffffff]",
                  "border border-white/80"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    About the Specialist
                  </h3>
                </div>

                <div className="flex items-start gap-3.5 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-base shadow-[3px_3px_8px_#cbd5e1]">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#111827] truncate">
                      {freelancerDisplayName}
                    </h4>
                    {professionalTitle && (
                      <p className="text-xs font-semibold text-primary">{professionalTitle}</p>
                    )}
                    {freelancerLocation && (
                      <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                        <Icon path={ICON_PATHS.mapPin} size="sm" className="w-3 h-3 text-text-secondary" />
                        <span>{freelancerLocation}</span>
                      </p>
                    )}
                  </div>
                </div>

                {freelancerBio && (
                  <div className="p-3 rounded-xl bg-white/50 shadow-[inset_1px_1px_3px_#e2e8f0] border border-white mb-4 text-xs text-text-secondary leading-relaxed line-clamp-3">
                    {freelancerBio}
                  </div>
                )}

                <Link
                  href={`/app/chat?userId=${service.user?.id || ""}`}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2",
                    "bg-background text-text-primary font-semibold text-xs",
                    "shadow-[3px_3px_8px_#d1d5db,-3px_-3px_8px_#ffffff]",
                    "hover:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
                    "transition-all duration-200"
                  )}
                >
                  <Icon path={ICON_PATHS.chat} size="sm" className="text-primary" />
                  <span>Contact Specialist</span>
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

      {/* Hire Service Modal */}
      {service && (
        <HireServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={service}
          onSubmit={async (requirements) => {
            if (!token) {
              router.push(`/login?redirect=/marketplace/services/${serviceId}`);
              return;
            }

            try {
              const order = await hireService(token, serviceId, requirements);
              setIsModalOpen(false);
              setToast({
                message: "Order created successfully! Redirecting...",
                type: "success",
              });
              setTimeout(() => {
                router.push(`/app/orders/${order.id}`);
              }, 1000);
            } catch (error) {
              console.error("Failed to hire service:", error);
              setToast({
                message: error instanceof Error ? error.message : "Failed to hire service",
                type: "error",
              });
              throw error;
            }
          }}
        />
      )}
    </>
  );
}
