"use client";

import { ICON_PATHS, Icon } from "@/components/ui/Icon";
import { ActivityItem } from "./ActivityItem";

interface Activity {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
}

interface ActivityListProps {
    activities: Activity[];
    icons: Record<string, string>;
    isLoading?: boolean;
}

/**
 * List of activities with loading and empty states.
 */
export function ActivityList({ activities, icons, isLoading }: ActivityListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="h-20 w-full animate-pulse bg-gray-100 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                    />
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
                    <Icon path={ICON_PATHS.alertCircle} size="lg" className="text-text-secondary/30" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">No activities found</h3>
                <p className="text-sm text-text-secondary mt-1">
                    Try adjusting your filters or search query to find what you&apos;re looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            {activities.map((activity) => (
                <ActivityItem
                    key={activity.id}
                    id={activity.id}
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    iconPath={icons[activity.type] || ICON_PATHS.infoCircle}
                />
            ))}
        </div>
    );
}
