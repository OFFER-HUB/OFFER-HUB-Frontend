"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { PORTFOLIO_CATEGORY_LABELS, type PortfolioCategory } from "@/types/portfolio.types";
import type { PublicPortfolioProject } from "@/lib/api/freelancer-public";

const CARD = cn(
  "rounded-3xl bg-white overflow-hidden",
  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
);

interface LightboxState {
  project: PublicPortfolioProject;
  imageIndex: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

interface LightboxProps {
  state: LightboxState;
  onClose: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onPrevProject: () => void;
  onNextProject: () => void;
  projectIndex: number;
  totalProjects: number;
}

function Lightbox({
  state,
  onClose,
  onPrevImage,
  onNextImage,
  onPrevProject,
  onNextProject,
  projectIndex,
  totalProjects,
}: LightboxProps): React.JSX.Element {
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
                      i === imageIndex ? "bg-white scale-125" : "bg-white/40",
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

interface PublicPortfolioGalleryProps {
  projects: PublicPortfolioProject[];
}

export function PublicPortfolioGallery({ projects }: PublicPortfolioGalleryProps): React.JSX.Element {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const projectIndex = lightbox
    ? projects.findIndex((p) => p.id === lightbox.project.id)
    : -1;

  const openLightbox = useCallback((project: PublicPortfolioProject, imageIndex = 0) => {
    setLightbox({ project, imageIndex });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prevImage = useCallback(() => {
    if (!lightbox) return;
    const prev = (lightbox.imageIndex - 1 + lightbox.project.images.length) % lightbox.project.images.length;
    setLightbox({ ...lightbox, imageIndex: prev });
  }, [lightbox]);

  const nextImage = useCallback(() => {
    if (!lightbox) return;
    const next = (lightbox.imageIndex + 1) % lightbox.project.images.length;
    setLightbox({ ...lightbox, imageIndex: next });
  }, [lightbox]);

  const prevProject = useCallback(() => {
    if (projectIndex <= 0) return;
    setLightbox({ project: projects[projectIndex - 1], imageIndex: 0 });
  }, [projectIndex, projects]);

  const nextProject = useCallback(() => {
    if (projectIndex >= projects.length - 1) return;
    setLightbox({ project: projects[projectIndex + 1], imageIndex: 0 });
  }, [projectIndex, projects]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Icon path={ICON_PATHS.image} size="xl" className="text-gray-300 mb-4" />
        <p className="text-text-secondary font-medium">No portfolio projects yet</p>
        <p className="text-sm text-text-secondary mt-1">This freelancer hasn't published any work samples.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <div key={project.id} className={CARD}>
            <button
              type="button"
              className="relative w-full h-48 bg-gray-100 block overflow-hidden"
              onClick={() => openLightbox(project, 0)}
              aria-label={`View ${project.title}`}
            >
              {project.images.length > 0 ? (
                <img
                  src={project.images[0].url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon path={ICON_PATHS.image} size="xl" className="text-gray-300" />
                </div>
              )}
              {project.images.length > 1 && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-lg">
                  +{project.images.length - 1}
                </span>
              )}
            </button>

            <div className="p-4">
              <span className="inline-block mb-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {PORTFOLIO_CATEGORY_LABELS[project.category as PortfolioCategory] ?? project.category}
              </span>
              <h3 className="font-semibold text-text-primary text-sm mb-1 line-clamp-1">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-text-secondary">+{project.tags.length - 3}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openLightbox(project, 0)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View details
                </button>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary hover:underline"
                  >
                    <Icon path={ICON_PATHS.externalLink} size="sm" />
                    Live
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <Lightbox
          state={lightbox}
          onClose={closeLightbox}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onPrevProject={prevProject}
          onNextProject={nextProject}
          projectIndex={projectIndex}
          totalProjects={projects.length}
        />
      )}
    </>
  );
}
