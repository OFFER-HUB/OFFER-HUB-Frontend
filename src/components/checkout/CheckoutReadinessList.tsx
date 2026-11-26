"use client";

import { CHECKOUT_COPY } from "@/constants/checkout-copy";
import { Icon, ICON_PATHS } from "@/components/ui/Icon";
import type { CheckoutIssue } from "@/hooks/useCheckoutReadiness";

interface CheckoutReadinessListProps {
  issues: CheckoutIssue[];
  onFix?: (issue: CheckoutIssue) => void;
  primaryAddress?: string;
  amount?: string;
  balance?: string;
}

export function CheckoutReadinessList(props: CheckoutReadinessListProps): React.JSX.Element {
  const { issues, onFix } = props;

  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-black/5">
        <Icon path={ICON_PATHS.check} size="sm" className="text-emerald-600" />
        <span className="text-xs font-medium text-text-secondary">{CHECKOUT_COPY.ready}</span>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {issues.map((issue) => {
        let text: string = CHECKOUT_COPY.issues[issue];
        if (issue === "WRONG_WALLET" && props.primaryAddress) {
          text = text.replace("{address}", props.primaryAddress);
        }
        if (issue === "INSUFFICIENT_USDC") {
          text = text.replace("{amount}", props.amount ?? "").replace("{balance}", props.balance ?? "");
        }
        return (
          <li key={issue} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background border border-black/5">
            <div className="flex items-start gap-2">
              <Icon path={ICON_PATHS.alertCircle} size="sm" className="text-amber-600 mt-0.5" />
              <span className="text-xs text-text-secondary">{text}</span>
            </div>
            {onFix && (
              <button
                type="button"
                onClick={() => onFix(issue)}
                className="text-xs font-semibold text-primary whitespace-nowrap"
              >
                {CHECKOUT_COPY.fixes[issue]}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
