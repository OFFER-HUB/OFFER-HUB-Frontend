import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RoundPhase, SealedJob } from "../sub-rosa.types";

interface JobCardProps {
  job: SealedJob;
  phase: RoundPhase;
  proposalCount: number;
  selectedProviderName: string | null;
}

const PHASE_LABELS: Record<RoundPhase, string> = {
  collecting: "Collecting sealed proposals",
  deadline_reached: "Deadline reached",
  revealed: "Proposals revealed",
  provider_selected: "Provider selected",
};

interface FactProps {
  label: string;
  value: string;
}

function Fact({ label, value }: FactProps): React.JSX.Element {
  return (
    <div>
      <dt className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-text-primary mt-1">{value}</dd>
    </div>
  );
}

/**
 * The job the round was opened for. This is OFFER HUB's own object — the
 * sealed-proposals toggle is the only thing Sub Rosa would add to it.
 */
export function JobCard({
  job,
  phase,
  proposalCount,
  selectedProviderName,
}: JobCardProps): React.JSX.Element {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            "text-xs font-semibold text-primary bg-background",
            "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
          )}
        >
          <Icon path={ICON_PATHS.lock} size="sm" />
          Private / Sealed Proposals on
        </span>
        <span className="text-xs font-medium text-text-secondary">{PHASE_LABELS[phase]}</span>
      </div>

      <h2 className="text-xl font-bold text-text-primary">{job.title}</h2>
      <p className="text-sm text-text-secondary mt-2 leading-relaxed">{job.description}</p>

      <dl className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4">
        <Fact label="Budget" value={job.budget} />
        <Fact label="Deadline" value={job.deadlineLabel} />
        <Fact label="Proposals" value={String(proposalCount)} />
        <Fact label="Selection" value={selectedProviderName ?? "Not selected"} />
      </dl>

      <p className="text-xs text-text-secondary mt-6 pt-5 border-t border-border-light">
        Freelancer profiles, subscription visibility and job eligibility stay outside the sealed
        round — OFFER HUB decides who may take part before any proposal is sealed.
      </p>
    </Card>
  );
}
