"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { ICON_BUTTON } from "@/lib/styles";
import { PortfolioForm } from "@/components/portfolio/PortfolioForm";
import { createPortfolioItem } from "@/lib/api/portfolio";
import type { PortfolioFormData } from "@/types/portfolio.types";

export default function PortfolioNewPage(): React.JSX.Element {
  const router = useRouter();
  const { token } = useAuthStore();

  async function handleSubmit(data: PortfolioFormData): Promise<void> {
    await createPortfolioItem(token, data);
    router.push("/app/freelancer/portfolio");
  }

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
          <h1 className="text-2xl font-bold text-text-primary">Add Project</h1>
          <p className="text-sm text-text-secondary">
            Add a new project to your portfolio
          </p>
        </div>
      </div>

      <PortfolioForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/app/freelancer/portfolio")}
      />
    </div>
  );
}
