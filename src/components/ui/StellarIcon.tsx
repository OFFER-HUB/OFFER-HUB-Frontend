import { cn } from "@/lib/cn";

interface StellarIconProps {
  className?: string;
}

/**
 * Stellar brand mark.
 *
 * Kept apart from the shared `Icon` component because that one draws stroked
 * outline glyphs from `ICON_PATHS`, while this mark is a filled shape.
 */
export function StellarIcon({ className }: StellarIconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("w-3 h-3", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.283 1.999L6.36 4.595a.477.477 0 00-.217.638l.392.786a.477.477 0 00.638.217l8.477-3.718a.477.477 0 00.217-.638l-.392-.786a.477.477 0 00-.638-.217l-2.554 1.122zm6.44 2.831l-8.477 3.718a.477.477 0 00-.217.638l.392.786a.477.477 0 00.638.217l8.477-3.718a.477.477 0 00.217-.638l-.392-.786a.477.477 0 00-.638-.217zm-14.36 4.3l-.392.786a.477.477 0 00.217.638l8.477 3.718a.477.477 0 00.638-.217l.392-.786a.477.477 0 00-.217-.638L4.999 8.913a.477.477 0 00-.638.217zm14.36.9l-8.477 3.718a.477.477 0 00-.217.638l.392.786a.477.477 0 00.638.217l8.477-3.718a.477.477 0 00.217-.638l-.392-.786a.477.477 0 00-.638-.217zm-14.36 4.3l-.392.786a.477.477 0 00.217.638l8.477 3.718a.477.477 0 00.638-.217l.392-.786a.477.477 0 00-.217-.638l-8.477-3.718a.477.477 0 00-.638.217zm14.36.9l-8.477 3.718a.477.477 0 00-.217.638l.392.786a.477.477 0 00.638.217l8.477-3.718a.477.477 0 00.217-.638l-.392-.786a.477.477 0 00-.638-.217z" />
    </svg>
  );
}
