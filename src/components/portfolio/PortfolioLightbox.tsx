"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { PORTFOLIO_CATEGORY_LABELS, type PortfolioCategory } from "@/types/portfolio.types";
import type { PublicPortfolioProject } from "@/lib/api/freelancer-public";

export interface LightboxState {
  project: PublicPortfolioProject;
  imageIndex: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export interface PortfolioLightboxProps {
  state: LightboxState;
  onClose: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onPrevProject: () => void;
  onNextProject: () => void;
  projectIndex: number;
  totalProjects: number;
}

export function PortfolioLightbox({
  state,
  onClose,
  onPrevImage,
  onNextImage,
  onPrevProject,
  onNextProject,
  projectIndex,
  totalProjects,
}: PortfolioLightboxProps): React.JSX.Element {
  const { project, imageIndex } = state;
  const image = project.images[imageIndex];
  const hasMultipleImages = project.images.length > 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrevImage();
      else if (e.key === "ArrowRight") onNextImage();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrevImage, onNextImage]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div
        className="relative flex flex-col lg:flex-row max-w-5xl w-full mx-4 max-h-[90vh] rounded-3xl overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area */}
        <div className="relative flex-1 bg-gray-900 flex items-center justify-center min-h-64 lg:min-h-0">
          {image ? (
            <img
              src={image.url}
              alt={project.title}
              className="max-h-[60vh] lg:max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-64">
              <Icon path={ICON_PATHS.image} size="xl" className="text-gray-500" />
            </div>
          )}

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={onPrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <Icon path={ICON_PATHS.chevronLeft} size="sm" />
              </button>
              <button
                type="button"
                onClick={onNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <Icon path={ICON_PATHS.chevronRight} size="sm" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {project.images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "block w-1.5 h-1.5 rounded-full transition-all",
                      i === imageIndex ? "bg-white scale-125" : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details panel */}
        <div className="w-full lg:w-80 flex-shrink-0 p-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-text-primary leading-snug">{project.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-background text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <Icon path={ICON_PATHS.close} size="sm" />
            </button>
          </div>

          <span className="inline-block mb-3 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {PORTFOLIO_CATEGORY_LABELS[project.category as PortfolioCategory] ?? project.category}
          </span>

          {project.description && (
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{project.description}</p>
          )}

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(project.startDate || project.endDate) && (
            <p className="text-xs text-text-secondary mb-4 flex items-center gap-1.5">
              <Icon path={ICON_PATHS.calendar} size="sm" className="shrink-0" />
              {project.startDate && formatDate(project.startDate)}
              {project.startDate && project.endDate && " – "}
              {project.endDate && formatDate(project.endDate)}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <Icon path={ICON_PATHS.externalLink} size="sm" />
                View live project
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary hover:underline font-medium"
              >
                <Icon path={ICON_PATHS.link} size="sm" />
                View repository
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-light">
            <button
              type="button"
              onClick={() => {
                const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({
                    title: project.title,
                    text: project.description,
                    url: shareUrl,
                  });
                } else {
                  navigator.clipboard?.writeText(shareUrl);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-primary hover:bg-background transition-colors"
              aria-label="Share project"
            >
              <Icon path={ICON_PATHS.share} size="sm" />
              Share
            </button>
          </div>

          {totalProjects > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-light">
              <button
                type="button"
                onClick={onPrevProject}
                disabled={projectIndex === 0}
                className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Icon path={ICON_PATHS.chevronLeft} size="sm" />
                Prev
              </button>
              <span className="text-xs text-text-secondary">
                {projectIndex + 1} / {totalProjects}
              </span>
              <button
                type="button"
                onClick={onNextProject}
                disabled={projectIndex === totalProjects - 1}
                className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <Icon path={ICON_PATHS.chevronRight} size="sm" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
