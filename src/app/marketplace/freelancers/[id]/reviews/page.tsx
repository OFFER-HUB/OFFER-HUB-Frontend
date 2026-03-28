import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FreelancerReviewsControls,
  ReviewHighlights,
  ReviewList,
  ReviewRatingStats,
  parseReviewsSearchParams,
} from "@/components/marketplace/freelancer-reviews";
import { getPublicFreelancerSummary, getPublicFreelancerReviews } from "@/lib/api/freelancer-public";
import { generatePageMetadata, getBreadcrumbSchema, SITE_CONFIG } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const summary = await getPublicFreelancerSummary(id);

  if (!summary) {
    return generatePageMetadata({
      title: "Reviews not found",
      description: "These reviews could not be found on OFFER HUB.",
      path: `/marketplace/freelancers/${id}/reviews`,
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: `Reviews — ${summary.displayName}`,
    description: `Read verified client reviews for ${summary.displayName} on OFFER HUB. See ratings, feedback, and responses.`,
    path: `/marketplace/freelancers/${id}/reviews`,
  });
}

function JsonLd({ data }: { data: object }): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function PublicFreelancerReviewsPage({
  params,
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const sp = await searchParams;
  const { sort, stars, page, pageSize } = parseReviewsSearchParams(sp);

  const summary = await getPublicFreelancerSummary(id);
  if (!summary) {
    notFound();
  }

  let reviewsResult;
  let loadError: string | null = null;
  try {
    reviewsResult = await getPublicFreelancerReviews(id, {
      sort,
      stars,
      page,
      pageSize,
    });
  } catch {
    loadError = "We couldn't load reviews right now. Please try again later.";
    reviewsResult = {
      stats: {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      reviews: [],
      page: 1,
      pageSize,
      totalItems: 0,
      totalPages: 0,
    };
  }

  const profileHref = `/marketplace/freelancers/${id}`;
  const breadcrumbJson = getBreadcrumbSchema([
    { name: "Marketplace", url: "/marketplace" },
    { name: summary.displayName, url: profileHref },
    { name: "Reviews", url: `/marketplace/freelancers/${id}/reviews` },
  ]);

  const personJson =
    reviewsResult.stats.totalRatings > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Person",
          name: summary.displayName,
          url: `${SITE_CONFIG.url}${profileHref}`,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(reviewsResult.stats.averageRating),
            reviewCount: String(reviewsResult.stats.totalRatings),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : null;

  const showHighlights = reviewsResult.reviews.length > 0 && !stars;

  return (
    <>
      <JsonLd data={breadcrumbJson} />
      {personJson ? <JsonLd data={personJson} /> : null}
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <nav className="text-sm text-text-secondary mb-6 flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link href="/marketplace" className="hover:text-primary">
              Marketplace
            </Link>
            <span aria-hidden>/</span>
            <Link href={profileHref} className="hover:text-primary truncate max-w-[12rem] sm:max-w-none">
              {summary.displayName}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-text-primary font-medium">Reviews</span>
          </nav>

          <Link
            href={profileHref}
            className="inline-flex items-center gap-2 mb-6 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Back to profile
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              Reviews for {summary.displayName}
            </h1>
            <p className="text-text-secondary mt-2">
              Transparent feedback from clients who worked with this freelancer.
            </p>
          </header>

          {loadError ? (
            <EmptyState
              variant="card"
              icon={ICON_PATHS.alertCircle}
              title="Something went wrong"
              message={loadError}
              linkHref={profileHref}
              linkText="Back to profile"
            />
          ) : (
            <>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                <div className="space-y-8 order-2 lg:order-1">
                  <FreelancerReviewsControls
                    freelancerId={id}
                    currentSort={sort}
                    currentStars={stars}
                    page={reviewsResult.page}
                    pageSize={reviewsResult.pageSize}
                    totalItems={reviewsResult.totalItems}
                    totalPages={reviewsResult.totalPages}
                    placement="top"
                  />

                  {showHighlights ? (
                    <ReviewHighlights reviews={reviewsResult.reviews} />
                  ) : null}

                  {reviewsResult.reviews.length === 0 ? (
                    <EmptyState
                      variant="card"
                      icon={ICON_PATHS.chat}
                      title={stars ? "No reviews for this filter" : "No reviews yet"}
                      message={
                        stars
                          ? "Try clearing the star filter or check back later."
                          : "When clients leave feedback, it will show up here."
                      }
                      linkHref={stars ? `/marketplace/freelancers/${id}/reviews` : "/marketplace/services"}
                      linkText={stars ? "Show all reviews" : "Browse services"}
                    />
                  ) : (
                    <ReviewList reviews={reviewsResult.reviews} freelancerDisplayName={summary.displayName} />
                  )}

                  {reviewsResult.totalPages > 0 ? (
                    <FreelancerReviewsControls
                      freelancerId={id}
                      currentSort={sort}
                      currentStars={stars}
                      page={reviewsResult.page}
                      pageSize={reviewsResult.pageSize}
                      totalItems={reviewsResult.totalItems}
                      totalPages={reviewsResult.totalPages}
                      placement="bottom"
                    />
                  ) : null}
                </div>

                <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
                  <ReviewRatingStats
                    freelancerId={id}
                    stats={reviewsResult.stats}
                    selectedStars={stars}
                    sort={sort}
                    pageSize={pageSize}
                  />
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
