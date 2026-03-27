import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { getPublicFreelancerSummary } from "@/lib/api/freelancer-public";
import { cn } from "@/lib/cn";
import { PRIMARY_BUTTON } from "@/lib/styles";
import { generatePageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const summary = await getPublicFreelancerSummary(id);

  if (!summary) {
    return generatePageMetadata({
      title: "Freelancer not found",
      description: "This freelancer profile could not be found on OFFER HUB.",
      path: `/marketplace/freelancers/${id}`,
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: summary.displayName,
    description:
      summary.bio?.trim() ||
      `View ${summary.displayName}'s public profile, services, and client reviews on OFFER HUB.`,
    path: `/marketplace/freelancers/${id}`,
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase() || "?";
}

export default async function PublicFreelancerProfilePage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const summary = await getPublicFreelancerSummary(id);

  if (!summary) {
    notFound();
  }

  const servicesHref = summary.showcaseServiceId
    ? `/marketplace/services/${summary.showcaseServiceId}`
    : "/marketplace/services";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 mb-8 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Back to marketplace
          </Link>

          <div
            className={cn(
              "p-8 rounded-3xl bg-white",
              "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
            )}
          >
            <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
              <div
                className={cn(
                  "relative shrink-0 w-24 h-24 rounded-3xl overflow-hidden mx-auto sm:mx-0",
                  "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                )}
              >
                {summary.avatarUrl ? (
                  <Image
                    src={summary.avatarUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-background text-primary font-bold text-2xl">
                    {initials(summary.displayName)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-text-primary mb-2">{summary.displayName}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-text-secondary mb-4">
                  {summary.averageRating != null && summary.totalReviews > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                      <Icon path={ICON_PATHS.star} size="sm" />
                      {summary.averageRating.toFixed(1)} · {summary.totalReviews} reviews
                    </span>
                  )}
                  {summary.totalReviews === 0 && (
                    <span className="text-text-secondary">New on the marketplace</span>
                  )}
                </div>
                {summary.bio ? (
                  <p className="text-text-secondary leading-relaxed mb-6">{summary.bio}</p>
                ) : null}
                <div className="flex flex-col xs:flex-row gap-3 justify-center sm:justify-start">
                  <Link
                    href={`/marketplace/freelancers/${id}/reviews`}
                    className={cn(
                      PRIMARY_BUTTON,
                      "justify-center px-6 py-3 text-sm font-semibold"
                    )}
                  >
                    View all reviews
                  </Link>
                  <Link
                    href={servicesHref}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold",
                      "bg-white text-primary border border-primary/20",
                      "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                      "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]"
                    )}
                  >
                    View services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
