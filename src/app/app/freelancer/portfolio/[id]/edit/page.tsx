"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ICON_BUTTON } from "@/lib/styles";
import { PortfolioForm, INITIAL_FORM_DATA } from "@/components/portfolio/PortfolioForm";
import { getPortfolioItemById, updatePortfolioItem } from "@/lib/api/portfolio";
import type { PortfolioFormData, PortfolioItem } from "@/types/portfolio.types";

export default function PortfolioEditPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const id = params.id as string;

  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchItem() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPortfolioItemById(token, id);
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }
    fetchItem();
  }, [token, id, refreshKey]);

  async function handleSubmit(data: PortfolioFormData): Promise<void> {
    await updatePortfolioItem(token, id, data);
    router.push("/app/freelancer/portfolio");
  }

  if (isLoading) return <LoadingState message="Loading project..." />;
  if (error)
    return (
      <ErrorState message={error} onRetry={() => setRefreshKey((k) => k + 1)} />
    );

  const initialData: PortfolioFormData = item
    ? {
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
        images: item.images,
        projectUrl: item.projectUrl ?? "",
        repoUrl: item.repoUrl ?? "",
        startDate: item.startDate ?? "",
        endDate: item.endDate ?? "",
        isPublic: item.isPublic,
      }
    : INITIAL_FORM_DATA;

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/app/freelancer/portfolio"
          className={cn(ICON_BUTTON, "shrink-0")}
        >
          <Icon path={ICON_PATHS.chevronLeft} size="md" className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Project</h1>
          <p className="text-sm text-text-secondary truncate max-w-xs">
            {item?.title ?? ""}
          </p>
        </div>
      </div>

      <PortfolioForm
        initialData={initialData}
        isEditing
        onSubmit={handleSubmit}
        onCancel={() => router.push("/app/freelancer/portfolio")}
      />
    </div>
  );
}
