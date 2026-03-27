import { cn } from "@/lib/cn";
import { NEUMORPHIC_INSET } from "@/lib/styles";
import type { PublicFreelancerReview } from "@/types/public-freelancer.types";

const MAX_LEN = 140;

function pickHighlights(reviews: PublicFreelancerReview[]): PublicFreelancerReview[] {
  const withText = reviews.filter((r) => r.comment && r.comment.trim().length > 20);
  const sorted = [...withText].sort((a, b) => b.comment.length - a.comment.length);
  return sorted.slice(0, 3);
}

function excerpt(text: string): string {
  const t = text.trim();
  if (t.length <= MAX_LEN) return t;
  return `${t.slice(0, MAX_LEN).trim()}…`;
}

interface ReviewHighlightsProps {
  reviews: PublicFreelancerReview[];
  className?: string;
}

export function ReviewHighlights({ reviews, className }: ReviewHighlightsProps): React.JSX.Element | null {
  const highlights = pickHighlights(reviews);
  if (highlights.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)} aria-label="Review highlights">
      <h2 className="text-lg font-bold text-text-primary">What clients say</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((r) => (
          <blockquote
            key={r.id}
            className={cn(NEUMORPHIC_INSET, "rounded-2xl p-4 text-sm text-text-secondary leading-relaxed")}
          >
            <p className="text-text-primary font-medium line-clamp-4">&ldquo;{excerpt(r.comment)}&rdquo;</p>
            <footer className="mt-3 text-xs text-text-secondary">— {r.reviewerName}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
