"use client";

import { useState, useMemo, useEffect } from "react";
import { useModeStore } from "@/stores/mode-store";
import { filterActivities, paginateResults } from "@/lib/activity-filters";
import { CLIENT_ACTIVITY, CLIENT_ACTIVITY_ICONS } from "@/data/client-dashboard.data";
import { SearchBar } from "@/components/activities/SearchBar";
import { FilterBar, FilterOption } from "@/components/activities/FilterBar";
import { ActivityList } from "@/components/activities/ActivityList";
import { Pagination } from "@/components/ui/Pagination";
import { useAuthStore } from "@/stores/auth-store";

const CLIENT_FILTER_OPTIONS: FilterOption[] = [
    { value: "offer_created", label: "Offer Created" },
    { value: "proposal_received", label: "Proposal Received" },
    { value: "message", label: "Messages" },
    { value: "payment", label: "Payments" },
    { value: "offer_completed", label: "Offer Completed" },
    { value: "review_given", label: "Reviews Given" },
];

/**
 * Client Activities Page.
 * Implements advanced filtering, search, and pagination for client activities.
 */
export default function ClientActivitiesPage() {
    const { setMode } = useModeStore();
    const user = useAuthStore((state) => state.user);

    // State for filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "type">("date-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setMode("client");
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setMode]);

    // Combined filtering logic
    const filteredActivities = useMemo(() => {
        return filterActivities(CLIENT_ACTIVITY, {
            searchQuery,
            selectedTypes,
            sortBy,
        });
    }, [searchQuery, selectedTypes, sortBy]);

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
                    <p className="text-text-secondary mt-1">Monitor your offers, proposals, and payments</p>
                </div>
                <div className="w-full md:w-96">
                    <SearchBar onSearch={setSearchQuery} placeholder="Search activities..." />
                </div>
            </div>

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
                    <ActivityList
                        activities={paginatedActivities}
                        icons={CLIENT_ACTIVITY_ICONS}
                        isLoading={isLoading}
                    />

                    {!isLoading && filteredActivities.length > 0 && (
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
                </div>
            </div>
        </div>
    );
}
