import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { PublicPortfolioGallery } from "@/components/portfolio/PublicPortfolioGallery";
import { getPublicFreelancerPortfolio } from "@/lib/api/freelancer-public";
import { generatePageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicFreelancerPortfolio(id);

  if (!result) {
    return generatePageMetadata({
      title: "Portfolio not found",
      description: "This portfolio could not be found on OFFER HUB.",
      path: `/marketplace/freelancers/${id}/portfolio`,
      noIndex: true,
    });
  }

  const name = result.freelancer.professionalTitle ?? "Freelancer";
  return generatePageMetadata({
    title: `${name} — Portfolio`,
    description: `Browse ${name}'s work samples and projects on OFFER HUB.`,
    path: `/marketplace/freelancers/${id}/portfolio`,
  });
}

export default async function PublicPortfolioPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const result = await getPublicFreelancerPortfolio(id);

  if (!result) {
    notFound();
  }

  const { freelancer, projects, pagination } = result;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back nav */}
          <Link
            href={`/marketplace/freelancers/${id}`}
            className="inline-flex items-center gap-2 mb-8 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
          >
            <Icon path={ICON_PATHS.chevronLeft} size="sm" />
            Back to profile
          </Link>

          {/* Header */}
          <div
            className={cn(
              "p-6 rounded-3xl bg-white mb-8",
              "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {freelancer.professionalTitle ?? "Portfolio"}
                </h1>
                {freelancer.bio && (
                  <p className="text-sm text-text-secondary mt-1 max-w-xl line-clamp-2">
                    {freelancer.bio}
                  </p>
                )}
                <p className="text-sm text-text-secondary mt-2">
                  {pagination.total} {pagination.total === 1 ? "project" : "projects"}
                  {freelancer.location && ` · ${freelancer.location}`}
                </p>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <Link
                  href={`/marketplace/freelancers/${id}/reviews`}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                    "bg-white text-text-secondary border border-border-light",
                    "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                    "hover:text-text-primary transition-colors",
                  )}
                >
                  Reviews
                </Link>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <PublicPortfolioGallery projects={projects} />
        </div>
      </div>
    </>
  );
}
