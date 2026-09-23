"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModeStore } from "@/stores/mode-store";
import { useAuthStore } from "@/stores/auth-store";
import { listOrders, openDispute } from "@/lib/api/orders";
import { toApiDisputeReason } from "@/lib/disputes/map-dispute";
import type { Order } from "@/types/order.types";
import type { DisputeReason } from "@/types/dispute.types";
import type { EvidenceUploadItem } from "@/components/disputes/EvidenceItem";

const MIN_DESCRIPTION_LENGTH = 50;

export interface UseDisputeFormOptions {
  mode: "client" | "freelancer";
}

export interface UseDisputeFormResult {
  role: "buyer" | "seller";
  orderErrorKey: string;
  eligibleOrders: Order[];
  ordersLoading: boolean;
  selectedItem: string;
  setSelectedItem: (value: string) => void;
  selectedReason: DisputeReason | "";
  setSelectedReason: (reason: DisputeReason | "") => void;
  description: string;
  setDescription: (value: string) => void;
  evidenceItems: EvidenceUploadItem[];
  setEvidenceItems: (items: EvidenceUploadItem[]) => void;
  isSubmitting: boolean;
  errors: Record<string, string>;
  hasPendingEvidence: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

interface DisputeFormConfig {
  role: "buyer" | "seller";
  openedBy: "BUYER" | "SELLER";
  successPath: string;
  orderParams: [string, string];
  orderErrorKey: string;
}

const CLIENT_CONFIG: DisputeFormConfig = {
  role: "buyer",
  openedBy: "BUYER",
  successPath: "/app/disputes?created=true",
  orderParams: ["orderId", "offerId"],
  orderErrorKey: "offer",
};

const FREELANCER_CONFIG: DisputeFormConfig = {
  role: "seller",
  openedBy: "SELLER",
  successPath: "/app/freelancer/disputes?created=true",
  orderParams: ["orderId", "order"],
  orderErrorKey: "service",
};

/** Shared open-dispute form state, validation and submission for the client and freelancer variants. */
export function useDisputeForm({ mode }: UseDisputeFormOptions): UseDisputeFormResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMode } = useModeStore();
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);

  const config = useMemo<DisputeFormConfig>(
    () => (mode === "client" ? CLIENT_CONFIG : FREELANCER_CONFIG),
    [mode]
  );

  const [eligibleOrders, setEligibleOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedReason, setSelectedReason] = useState<DisputeReason | "">("");
  const [description, setDescription] = useState("");
  const [evidenceItems, setEvidenceItems] = useState<EvidenceUploadItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasPendingEvidence = evidenceItems.some(
    (item) => item.status === "uploading" || item.status === "queued"
  );

  useEffect(() => {
    setMode(mode);
    const orderParam =
      searchParams.get(config.orderParams[0]) ?? searchParams.get(config.orderParams[1]);
    if (orderParam) {
      setSelectedItem(orderParam);
    }
  }, [setMode, mode, searchParams, config]);

  useEffect(() => {
    if (!token || !userId) {
      setOrdersLoading(false);
      return;
    }

    async function loadOrders(): Promise<void> {
      setOrdersLoading(true);
      try {
        const orders = await listOrders(token!, userId!, {
          role: config.role,
          status: "IN_PROGRESS",
        });
        setEligibleOrders(orders);
      } catch {
        setEligibleOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    }

    void loadOrders();
  }, [token, userId, config.role]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      const newErrors: Record<string, string> = {};
      if (!selectedItem) {
        newErrors[config.orderErrorKey] = "Please select an order";
      }
      if (!selectedReason) {
        newErrors.reason = "Please select a reason";
      }
      if (!description.trim()) {
        newErrors.description = "Please provide a description";
      } else if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
        newErrors.description = "Description must be at least 50 characters";
      }

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0 || !token || !selectedReason) return;

      setIsSubmitting(true);
      setErrors({});

      const evidenceUrls = evidenceItems
        .filter((item) => item.status === "uploaded" && item.evidence?.url)
        .map((item) => item.evidence!.url!);

      try {
        await openDispute(token, {
          orderId: selectedItem,
          openedBy: config.openedBy,
          reason: toApiDisputeReason(selectedReason),
          evidence: evidenceUrls.length > 0 ? evidenceUrls : undefined,
        });
        router.push(config.successPath);
      } catch (err) {
        setErrors({
          submit: err instanceof Error ? err.message : "Failed to submit dispute",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedItem, selectedReason, description, evidenceItems, token, config, router]
  );

  return {
    role: config.role,
    orderErrorKey: config.orderErrorKey,
    eligibleOrders,
    ordersLoading,
    selectedItem,
    setSelectedItem,
    selectedReason,
    setSelectedReason,
    description,
    setDescription,
    evidenceItems,
    setEvidenceItems,
    isSubmitting,
    errors,
    hasPendingEvidence,
    handleSubmit,
  };
}