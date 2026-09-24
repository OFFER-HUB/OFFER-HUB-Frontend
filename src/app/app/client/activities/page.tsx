"use client";

import { useState, useMemo, useEffect } from "react";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { filterActivities, paginateResults } from "@/lib/activity-filters";
import { getClientActivities, type ClientActivity } from "@/lib/api/client";
import { SearchBar } from "@/components/activities/SearchBar";
import { FilterBar, FilterOption } from "@/components/activities/FilterBar";
import { ActivityList } from "@/components/activities/ActivityList";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";

// Map real API activity types to icons
const ACTIVITY_ICONS: Record<string, string> = {
    order_created: ICON_PATHS.shoppingCart,
    order_completed: ICON_PATHS.check,
    topup_completed: ICON_PATHS.arrowDown,
};

const CLIENT_FILTER_OPTIONS: FilterOption[] = [
    { value: "order_created", label: "Orders Created" },
    { value: "order_completed", label: "Orders Completed" },
    { value: "topup_completed", label: "Top-ups" },
];

/**
 * Client Activities Page.
 * Implements advanced filtering, search, and pagination for client activities.
 */
export default function ClientActivitiesPage() {
    const { setMode } = useModeStore();
    const { token } = useAuthStore();

    // Data state
    const [activities, setActivities] = useState<ClientActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "type">("date-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setMode("client");
    }, [setMode]);

    // Fetch activities from API
    useEffect(() => {
        async function fetchActivities() {
            if (!token) return;

            setIsLoading(true);
            setError(null);

            try {
                const data = await getClientActivities(token);
                setActivities(data);
            } catch (err) {
                console.error("Failed to fetch activities:", err);
                setError(err instanceof Error ? err.message : "Failed to load activities");
            } finally {
                setIsLoading(false);
            }
        }

        fetchActivities();
    }, [token]);

    // Combined filtering logic
    const filteredActivities = useMemo(() => {
        return filterActivities(activities, {
            searchQuery,
            selectedTypes,
            sortBy,
        });
    }, [activities, searchQuery, selectedTypes, sortBy]);

    // Pagination logic
    const { items: paginatedActivities, totalPages } = useMemo(() => {
        return paginateResults(filteredActivities, currentPage, itemsPerPage);
    }, [filteredActivities, currentPage, itemsPerPage]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTypes, sortBy, itemsPerPage]);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Project Activity</h1>
                    <p className="text-text-secondary mt-1">Monitor your orders, payments, and transactions</p>
                </div>
                <div className="w-full md:w-96">
                    <SearchBar onSearch={setSearchQuery} placeholder="Search activities..." />
                </div>
            </div>

            {error ? (
                <EmptyState
                    icon={ICON_PATHS.alertCircle}
                    message={error}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1">
                        <FilterBar
                            options={CLIENT_FILTER_OPTIONS}
                            selectedTypes={selectedTypes}
                            onChange={setSelectedTypes}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            className="sticky top-24"
                        />
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <LoadingSpinner className="text-primary" />
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <EmptyState
                                icon={ICON_PATHS.clock}
                                message={searchQuery || selectedTypes.size > 0
                                    ? "No activities match your filters"
                                    : "No activities yet. Your activity history will appear here."}
                            />
                        ) : (
                            <>
                                <ActivityList
                                    activities={paginatedActivities}
                                    icons={ACTIVITY_ICONS}
                                    isLoading={false}
                                />

                                {filteredActivities.length > 0 && (
                                    <div className="pt-4 border-t border-border-light/50">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={filteredActivities.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={setCurrentPage}
                                            onItemsPerPageChange={setItemsPerPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
