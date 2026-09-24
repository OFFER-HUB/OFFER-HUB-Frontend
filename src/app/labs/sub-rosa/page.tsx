import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IS_SUBROSA_DEMO_ENABLED, SubRosaDemo } from "@/features/sub-rosa";

export const metadata: Metadata = {
  title: "Sub Rosa sealed proposals — demo",
};

/**
 * Evaluation demo for Sub Rosa's optional sealed-proposal layer.
 *
 * Disabled unless NEXT_PUBLIC_SUBROSA_DEMO=true, in which case the route
 * behaves as if it does not exist. See src/features/sub-rosa/README.md.
 */
export default function SubRosaDemoPage(): React.JSX.Element {
  if (!IS_SUBROSA_DEMO_ENABLED) {
    notFound();
  }

  return <SubRosaDemo />;
}
