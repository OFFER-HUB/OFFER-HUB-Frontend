"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import { NEUMORPHIC_CARD, ICON_BUTTON } from "@/lib/styles";
import { PORTFOLIO_CATEGORY_LABELS, type PortfolioItem } from "@/types/portfolio.types";

export interface PortfolioCardProps {
  item: PortfolioItem;
  isFirst: boolean;
  isLast: boolean;
  isDragging?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublic: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function PortfolioCard({
  item,
  isFirst,
  isLast,
  isDragging = false,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onTogglePublic,
  dragHandleProps,
}: PortfolioCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        NEUMORPHIC_CARD,
        "overflow-hidden p-0 flex flex-col transition-all duration-200",
        isDragging && "opacity-60 scale-[0.98] shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff]"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-100 shrink-0">
        {item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon path={ICON_PATHS.image} size="xl" className="text-gray-300" />
          </div>
        )}

        {/* Image count badge */}
        {item.images.length > 1 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-lg">
            +{item.images.length - 1} more
          </span>
        )}

        {/* Public/private badge */}
        <span
          className={cn(
            "absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-lg",
            item.isPublic
              ? "bg-success/90 text-white"
              : "bg-black/60 text-white"
          )}
        >
          {item.isPublic ? "Public" : "Private"}
        </span>

        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-lg cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <Icon path={ICON_PATHS.menu} size="sm" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category chip */}
        <span className="inline-block self-start mb-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          {PORTFOLIO_CATEGORY_LABELS[item.category]}
        </span>

        <h3 className="font-semibold text-text-primary mb-1 line-clamp-1 text-sm">
          {item.title}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 flex-1">
          {item.description || "No description"}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-secondary"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 4 && (
              <span className="text-xs text-text-secondary">+{item.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Dates */}
        {(item.startDate || item.endDate) && (
          <p className="text-xs text-text-secondary mb-3 flex items-center gap-1">
            <Icon path={ICON_PATHS.calendar} size="sm" className="shrink-0" />
            {item.startDate && formatDate(item.startDate)}
            {item.startDate && item.endDate && " – "}
            {item.endDate && formatDate(item.endDate)}
          </p>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 mb-3">
          {item.projectUrl && (
            <a
              href={item.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Icon path={ICON_PATHS.externalLink} size="sm" />
              Live
            </a>
          )}
          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-primary hover:underline"
            >
              <Icon path={ICON_PATHS.link} size="sm" />
              Repo
            </a>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between pt-3 border-t border-border-light mt-auto">
          {/* Reorder arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className={cn(ICON_BUTTON, "w-7 h-7", isFirst && "opacity-30 cursor-not-allowed")}
              title="Move up"
            >
              <Icon path={ICON_PATHS.arrowUp} size="sm" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className={cn(ICON_BUTTON, "w-7 h-7", isLast && "opacity-30 cursor-not-allowed")}
              title="Move down"
            >
              <Icon path={ICON_PATHS.arrowDown} size="sm" />
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Toggle public */}
            <button
              type="button"
              onClick={onTogglePublic}
              className={cn(
                ICON_BUTTON,
                "w-7 h-7",
                item.isPublic ? "text-success" : "text-text-secondary"
              )}
              title={item.isPublic ? "Make private" : "Make public"}
            >
              <Icon path={item.isPublic ? ICON_PATHS.eye : ICON_PATHS.lock} size="sm" />
            </button>

            {/* Edit */}
            <Link
              href={`/app/freelancer/portfolio/${item.id}/edit`}
              className={cn(ICON_BUTTON, "w-7 h-7 flex items-center justify-center")}
              title="Edit"
              onClick={onEdit}
            >
              <Icon path={ICON_PATHS.edit} size="sm" className="text-text-secondary" />
            </Link>

            {/* Delete */}
            <button
              type="button"
              onClick={onDelete}
              className={cn(ICON_BUTTON, "w-7 h-7 text-error/60 hover:text-error")}
              title="Delete"
            >
              <Icon path={ICON_PATHS.trash} size="sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}
