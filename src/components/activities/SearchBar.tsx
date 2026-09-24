"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { ICON_PATHS, Icon } from "@/components/ui/Icon";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    initialValue?: string;
}

/**
 * SearchBar component with debounce support.
 * Reuses project design patterns for inputs and neumorphic shadows.
 */
export function SearchBar({ onSearch, placeholder = "Search activities...", initialValue = "" }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);

    // Memoize onSearch to avoid unnecessary effect triggers if passed as inline function
    const debouncedSearch = useCallback(
        (value: string) => {
            onSearch(value);
        },
        [onSearch]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            debouncedSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, debouncedSearch]);

    const handleClear = () => {
        setQuery("");
    };

    return (
        <div
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl bg-white transition-all duration-300",
                "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]",
                "focus-within:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] group"
            )}
        >
            <div className="text-text-secondary/50 group-focus-within:text-primary transition-colors">
                <Icon path={ICON_PATHS.search} size="md" />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "flex-1 bg-transparent border-none outline-none",
                    "text-text-primary placeholder:text-text-secondary/40 text-sm font-medium"
                )}
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="p-1 rounded-lg text-text-secondary/50 hover:text-error hover:bg-error/5 transition-all"
                    aria-label="Clear search"
                >
                    <Icon path={ICON_PATHS.close} size="sm" />
                </button>
            )}
        </div>
    );
}
