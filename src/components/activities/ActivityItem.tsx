"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { NEUMORPHIC_INSET } from "@/lib/styles";

interface ActivityItemProps {
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    iconPath: string;
}

/**
 * Individual activity item component.
 * Reuses the design from the dashboard but with enhanced responsive styles.
 */
export function ActivityItem({ title, description, time, iconPath }: ActivityItemProps) {
    return (
        <div className={cn(
            "flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md",
            NEUMORPHIC_INSET
        )}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon path={iconPath} size="md" className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm md:text-base leading-tight">
                    {title}
                </p>
                <p className="text-sm text-text-secondary line-clamp-2 md:line-clamp-1 mt-0.5">
                    {description}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] md:text-xs text-text-secondary/70 whitespace-nowrap bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-white/20">
                    {time}
                </span>
            </div>
        </div>
    );
}
