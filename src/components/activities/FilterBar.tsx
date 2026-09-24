"use client";

import { cn } from "@/lib/cn";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";

export interface FilterOption {
    value: string;
    label: string;
}

interface FilterBarProps {
    options: FilterOption[];
    selectedTypes: Set<string>;
    onChange: (types: Set<string>) => void;
    sortBy: "date-desc" | "date-asc" | "type";
    onSortChange: (sort: "date-desc" | "date-asc" | "type") => void;
    className?: string;
}

/**
 * FilterBar component for activities sidebar.
 * Includes type filters and sorting options with neumorphic design.
 */
export function FilterBar({ options, selectedTypes, onChange, sortBy, onSortChange, className }: FilterBarProps) {
    const toggleType = (value: string) => {
        const next = new Set(selectedTypes);
        if (next.has(value)) {
            next.delete(value);
        } else {
            next.add(value);
        }
        onChange(next);
    };

    const selectAll = () => {
        onChange(new Set(options.map((o) => o.value)));
    };

    const clearAll = () => {
        onChange(new Set());
    };

    return (
        <aside className={cn("p-6 rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]", className)}>
            {/* Category Filters */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        Categories
                        {selectedTypes.size > 0 && (
                            <span className="flex items-center justify-center px-2 min-w-[20px] h-5 text-[10px] font-bold text-white bg-primary rounded-full animate-scale-in">
                                {selectedTypes.size}
                            </span>
                        )}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            All
                        </button>
                        <span className="text-border-light">|</span>
                        <button
                            onClick={clearAll}
                            className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {options.map((option) => {
                        const isSelected = selectedTypes.has(option.value);
                        return (
                            <label
                                key={option.value}
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleType(option.value);
                                }}
                            >
                                <div
                                    className={cn(
                                        "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200",
                                        isSelected
                                            ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] scale-110"
                                            : "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] group-hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                                    )}
                                >
                                    {isSelected && <Icon path={ICON_PATHS.check} size="sm" className="text-white" strokeWidth={3} />}
                                </div>
                                <span
                                    className={cn(
                                        "text-sm transition-colors duration-200",
                                        isSelected ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"
                                    )}
                                >
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Sorting Options */}
            <div>
                <h2 className="text-lg font-bold text-text-primary mb-6">Sort By</h2>
                <div className="space-y-3">
                    {[
                        { value: "date-desc", label: "Newest first" },
                        { value: "date-asc", label: "Oldest first" },
                        { value: "type", label: "By Category" },
                    ].map((option) => {
                        const isSelected = sortBy === option.value;
                        return (
                            <label
                                key={option.value}
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSortChange(option.value as any);
                                }}
                            >
                                <div
                                    className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                                        isSelected
                                            ? "bg-primary shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] scale-110"
                                            : "bg-background shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] group-hover:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]"
                                    )}
                                >
                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full animate-scale-in" />}
                                </div>
                                <span
                                    className={cn(
                                        "text-sm transition-colors duration-200",
                                        isSelected ? "text-text-primary font-medium" : "text-text-secondary group-hover:text-text-primary"
                                    )}
                                >
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
