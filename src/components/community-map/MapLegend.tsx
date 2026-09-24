"use client";

export function MapLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-6">
      <LegendItem color="teal" label="Freelancers" />
      <LegendItem color="purple" label="Clients" />
    </div>
  );
}

interface LegendItemProps {
  color: "teal" | "purple";
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  const dotColor = color === "teal" ? "bg-teal-500" : "bg-purple-500";
  const glowColor = color === "teal"
    ? "shadow-[0_0_8px_rgba(20,184,166,0.6)]"
    : "shadow-[0_0_8px_rgba(168,85,247,0.6)]";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${dotColor} ${glowColor}`}
        aria-hidden="true"
      />
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}
