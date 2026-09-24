"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (count: number) => void;
    className?: string;
}

/**
 * Neumorphic pagination component with ellipsis support and items per page selector.
 */
export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    className,
}: PaginationProps) {
    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    }, [currentPage, totalPages]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={cn("flex flex-col md:flex-row items-center justify-between gap-6 w-full", className)}>
            {/* "Showing X-Y of Z" */}
            <div className="text-sm text-text-secondary order-2 md:order-1">
                Showing <span className="font-bold text-text-primary">{startItem}</span> -{" "}
                <span className="font-bold text-text-primary">{endItem}</span> of{" "}
                <span className="font-bold text-text-primary">{totalItems}</span> results
            </div>

            {/* Page Numbers */}
            <div className="flex items-center gap-2 order-1 md:order-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-white",
                        "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] disabled:opacity-30 disabled:cursor-not-allowed"
                    )}
                    aria-label="Previous Page"
                >
                    <Icon path={ICON_PATHS.chevronLeft} size="sm" />
                </button>

                <div className="flex items-center gap-2">
                    {pageNumbers.map((page, index) => {
                        if (page === "...") {
                            return (
                                <span key={`ellipsis-${index}`} className="w-10 text-center text-text-secondary">
                                    ...
                                </span>
                            );
                        }
                        const isCurrent = page === currentPage;
                        return (
                            <button
                                key={`page-${page}`}
                                onClick={() => onPageChange(page as number)}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200",
                                    isCurrent
                                        ? "bg-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] scale-110"
                                        : "bg-white text-text-secondary shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] hover:text-primary"
                                )}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => onPageChange(currentPage + 1)}
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-white",
                        "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]",
                        "hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] disabled:opacity-30 disabled:cursor-not-allowed"
                    )}
                    aria-label="Next Page"
                >
                    <Icon path={ICON_PATHS.chevronRight} size="sm" />
                </button>
            </div>

            {/* Items Per Page Select */}
            <div className="flex items-center gap-3 order-3">
                <span className="text-sm text-text-secondary whitespace-nowrap">Show</span>
                <div className="relative group">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className={cn(
                            "appearance-none bg-white px-4 py-2 pr-10 rounded-xl text-sm font-bold text-text-primary outline-none cursor-pointer transition-all duration-200",
                            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]",
                            "hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                        )}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-hover:text-primary transition-colors">
                        <Icon path={ICON_PATHS.chevronDown} size="sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}
