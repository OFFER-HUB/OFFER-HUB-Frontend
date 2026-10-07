"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { PORTFOLIO_CATEGORY_LABELS, type PortfolioCategory } from "@/types/portfolio.types";
import type { PublicPortfolioProject } from "@/lib/api/freelancer-public";
import { PortfolioLightbox, type LightboxState } from "@/components/portfolio/PortfolioLightbox";

const CARD = cn(
  "rounded-3xl bg-white overflow-hidden",
  "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
);

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
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary hover:underline"
                  >
                    <Icon path={ICON_PATHS.link} size="sm" />
                    Repo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <PortfolioLightbox
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