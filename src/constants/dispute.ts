import type { DisputeComment } from "@/types/dispute.types";

export const COMMENT_ROLE_COLORS: Record<DisputeComment["authorRole"], string> = {
  client: "bg-primary/10 border-primary/20",
  freelancer: "bg-secondary/10 border-secondary/20",
  admin: "bg-warning/10 border-warning/20",
};

export const COMMENT_ROLE_LABELS: Record<DisputeComment["authorRole"], string> = {
  client: "Buyer",
  freelancer: "Seller",
  admin: "Support",
};
