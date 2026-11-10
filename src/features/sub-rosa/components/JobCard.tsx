import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { RoundPhase, SealedJob } from "../sub-rosa.types";
import { Badge, Panel } from "./ui";

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

function Fact({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="min-w-0 rounded-xl bg-background px-4 py-3 shadow-[var(--shadow-neumorphic-inset-light)]">
      <dt className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm font-bold text-text-primary mt-1 leading-snug break-words">
        {value}
      </dd>
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
    <Panel aria-label="Job">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge tone="primary" iconPath={ICON_PATHS.lock}>
          Sealed proposals on
        </Badge>
        <Badge tone="neutral" iconPath={ICON_PATHS.clock}>
          {PHASE_LABELS[phase]}
        </Badge>
      </div>

      <h2 className="text-xl font-bold text-text-primary sm:text-2xl">{job.title}</h2>
      <p className="text-sm text-text-secondary mt-2 leading-relaxed sm:text-base">
        {job.description}
      </p>

      <dl className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4">
        <Fact label="Budget" value={job.budget} />
        <Fact label="Deadline" value={job.deadlineLabel} />
        <Fact label="Proposals" value={String(proposalCount)} />
        <Fact label="Selection" value={selectedProviderName ?? "Not selected"} />
      </dl>

      <div className="flex items-start gap-3 mt-auto pt-6">
        <Icon
          path={ICON_PATHS.users}
          size="sm"
          className="shrink-0 mt-0.5 text-primary"
        />
        <p className="text-sm text-text-secondary leading-relaxed">
          Freelancer profiles, subscription visibility and job eligibility stay outside the sealed
          round — OFFER HUB decides who may take part before any proposal is sealed.
        </p>
      </div>
    </Panel>
  );
}
