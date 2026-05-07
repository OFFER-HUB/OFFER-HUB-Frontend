import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { ReviewsPageClient } from "./ReviewsPageClient";
import { getPublicFreelancerSummary, getPublicFreelancerReviews } from "@/lib/api/freelancer-public";
import { generatePageMetadata, getBreadcrumbSchema, SITE_CONFIG } from "@/lib/seo";
import { parseReviewsSearchParams } from "@/components/marketplace/freelancer-reviews";

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
      <ReviewsPageClient
        summary={summary}
        reviewsResult={reviewsResult}
        loadError={loadError}
        sort={sort}
        stars={stars}
        page={page}
        pageSize={pageSize}
        profileHref={profileHref}
      />
    </>
  );
}
