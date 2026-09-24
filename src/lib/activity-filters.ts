/**
 * Filters a list of activities based on search query, type filters, and sort options.
 */
export function filterActivities<T extends { title: string; description: string; type: string; createdAt: string }>(
    activities: T[],
    filters: {
        searchQuery: string;
        selectedTypes: Set<string>;
        sortBy: "date-desc" | "date-asc" | "type";
    }
): T[] {
    return activities
        .filter((activity) => {
            const matchesSearch =
                activity.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                activity.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

            const matchesType = filters.selectedTypes.size === 0 || filters.selectedTypes.has(activity.type);

            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            switch (filters.sortBy) {
                case "date-desc":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "date-asc":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "type":
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });
}

/**
 * Paginates a list of items.
 */
export function paginateResults<T>(
    items: T[],
    page: number,
    itemsPerPage: number
): { items: T[]; totalPages: number } {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, items.length);
    const paginatedItems = items.slice(start, end);

    return {
        items: paginatedItems,
        totalPages,
    };
}
