import { ClientOffer, ClientOfferDetail, OfferStatus } from '@/types/client-offers';

export interface ApiOffer {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  budget?: number;
  currency?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: ApiAttachment[];
  metadata?: Record<string, unknown>;
  clientId?: string;
  organizationId?: string;
  [key: string]: unknown;
}

export interface ApiAttachment {
  id: string;
  name?: string;
  fileName?: string;
  url?: string;
  size?: number;
  type?: string;
}

export const CATEGORY_MAP: Record<string, string> = {
  design: 'Design',
  development: 'Development',
  marketing: 'Marketing',
  content: 'Content',
  consulting: 'Consulting',
  other: 'Other',
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  accepted: { label: 'Accepted', color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  completed: { label: 'Completed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusConfig(status?: string) {
  const key = (status || 'pending').toLowerCase();
  return STATUS_CONFIG[key] ?? STATUS_CONFIG.pending;
}

export function formatFilterLabel(value?: string): string {
  if (!value) return 'All';
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function countByStatus<T extends { status?: string }>(
  items: T[],
  getStatus: (item: T) => string | undefined = (item) => item.status,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = (getStatus(item) || 'unknown').toLowerCase();
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

export function mapApiOfferToClientOffer(offer: ApiOffer): ClientOffer {
  return {
    id: offer.id,
    title: offer.title ?? 'Untitled Offer',
    description: offer.description ?? '',
    status: (offer.status ?? 'pending') as OfferStatus,
    category: offer.category,
    budget: offer.budget,
    currency: offer.currency ?? 'USD',
    deadline: offer.deadline,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    attachmentCount: offer.attachments?.length ?? 0,
  };
}

export function mapApiOfferToDetail(offer: ApiOffer): ClientOfferDetail {
  const categoryKey = (offer.category ?? 'other').toLowerCase();
  const categoryLabel = CATEGORY_MAP[categoryKey] ?? formatFilterLabel(offer.category);
  return {
    id: offer.id,
    title: offer.title ?? 'Untitled Offer',
    description: offer.description ?? '',
    status: (offer.status ?? 'pending') as OfferStatus,
    category: categoryLabel,
    budget: offer.budget,
    currency: offer.currency ?? 'USD',
    deadline: offer.deadline,
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
    attachments: (offer.attachments ?? []).map((a) => ({
      id: a.id,
      name: a.name ?? a.fileName ?? 'Attachment',
      url: a.url ?? '',
      size: a.size ?? 0,
      type: a.type ?? 'application/octet-stream',
    })),
  };
}
