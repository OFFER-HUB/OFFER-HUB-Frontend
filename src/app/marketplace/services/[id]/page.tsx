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
  OTHER: "Other",
};

export default function ServiceDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { isAuthenticated, token } = useAuthStore();

  const [service, setService] = useState<MarketplaceService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHiring, setIsHiring] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner className="text-primary" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          icon={ICON_PATHS.alertCircle}
          message={error || "Service not found. The service you're looking for doesn't exist or has been removed"}
        />
      </div>
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:4000";
  const price = parseFloat(service.price);
  const averageRating = service.averageRating ? parseFloat(service.averageRating) : null;
  const category = CATEGORY_MAP[service.category] || service.category;
  const createdDate = new Date(service.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  // Extract display name from email
  const userName = service.user?.email?.split("@")[0] || "Anonymous";

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
          <span className="text-sm font-medium">Back to services</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
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
              <h1 className="text-3xl font-bold text-text-primary mb-4">{service.title}</h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Icon path={ICON_PATHS.calendar} size="sm" />
                  <span>Listed {createdDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon path={ICON_PATHS.clock} size="sm" />
                  <span>{service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""} delivery</span>
                </div>
                {service.totalOrders > 0 && (
                  <div className="flex items-center gap-1">
                    <Icon path={ICON_PATHS.check} size="sm" />
                    <span>
                      {service.totalOrders} order{service.totalOrders !== 1 ? "s" : ""} completed
                    </span>
                  </div>
                )}
                {averageRating && (
                  <div className="flex items-center gap-1 text-warning">
                    <Icon path={ICON_PATHS.star} size="sm" />
                    <span>{averageRating.toFixed(1)} avg. rating</span>
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
              <h2 className="text-xl font-bold text-text-primary mb-4">About This Service</h2>
              <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">{service.description}</p>
            </div>

            {/* What's Included (Placeholder for future expansion) */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <h2 className="text-xl font-bold text-text-primary mb-4">What's Included</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon path={ICON_PATHS.check} size="sm" className="text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Professional delivery</p>
                    <p className="text-xs text-text-secondary">High-quality work within the specified timeframe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon path={ICON_PATHS.check} size="sm" className="text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Revisions included</p>
                    <p className="text-xs text-text-secondary">Adjustments to ensure your satisfaction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon path={ICON_PATHS.check} size="sm" className="text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Communication</p>
                    <p className="text-xs text-text-secondary">Regular updates throughout the project</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Card */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <div className="flex items-center gap-2 mb-2 text-text-secondary">
                <Icon path={ICON_PATHS.currency} size="sm" />
                <span className="text-sm font-medium">Starting at</span>
              </div>
              <div className="text-3xl font-bold text-primary mb-1">${price.toLocaleString()}</div>
              <p className="text-xs text-text-secondary mb-6">
                {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""} delivery
              </p>

              {/* Hire Button */}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={async () => {
                      if (!token) {
                        router.push(`/login?redirect=/marketplace/services/${serviceId}`);
                        return;
                      }

                      setIsHiring(true);
                      try {
                        const order = await hireService(token, serviceId);
                        // Success - redirect to order page
                        router.push(`/app/orders/${order.id}`);
                      } catch (error) {
                        console.error('Failed to hire service:', error);
                        setToast({
                          message: error instanceof Error ? error.message : 'Failed to hire service',
                          type: 'error',
                        });
                      } finally {
                        setIsHiring(false);
                      }
                    }}
                    disabled={isHiring}
                    className={cn(
                      "w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2",
                      "bg-primary text-white font-medium",
                      "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                      "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-200"
                    )}
                  >
                    {isHiring ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Hiring...</span>
                      </>
                    ) : (
                      <>
                        <span>Hire This Service</span>
                        <Icon path={ICON_PATHS.chevronRight} size="sm" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login?redirect=/marketplace/services/${serviceId}`}
                    className={cn(
                      "w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2",
                      "bg-primary text-white font-medium",
                      "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "hover:shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                      "active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]",
                      "transition-all duration-200"
                    )}
                  >
                    <span>Hire This Service</span>
                    <Icon path={ICON_PATHS.chevronRight} size="sm" />
                  </Link>
                  <p className="mt-3 text-xs text-center text-text-secondary">
                    You'll need to log in to hire
                  </p>
                </>
              )}
            </div>

            {/* Freelancer Card */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <h3 className="text-sm font-medium text-text-secondary mb-4">About the Freelancer</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{userName}</p>
                  <p className="text-xs text-text-secondary truncate">{service.user?.email}</p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div
              className={cn(
                "p-6 rounded-3xl bg-white",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
              )}
            >
              <h3 className="text-sm font-medium text-text-secondary mb-4">Service Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  <span
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      service.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-text-secondary/10 text-text-secondary"
                    )}
                  >
                    {service.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Total Orders</span>
                  <span className="text-sm font-medium text-text-primary">{service.totalOrders}</span>
                </div>
                {averageRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Rating</span>
                    <div className="flex items-center gap-1">
                      <Icon path={ICON_PATHS.star} size="sm" className="text-warning" />
                      <span className="text-sm font-medium text-text-primary">{averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Delivery Time</span>
                  <span className="text-sm font-medium text-text-primary">
                    {service.deliveryDays} day{service.deliveryDays !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
