export type OrderStatus =
  | 'ORDER_CREATED'
  | 'FUNDS_RESERVED'
  | 'ESCROW_CREATING'
  | 'ESCROW_FUNDING'
  | 'ESCROW_FUNDED'
  | 'IN_PROGRESS'
  | 'RELEASE_REQUESTED'
  | 'RELEASED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'CLOSED';

export type OrderSource = 'DIRECT' | 'SERVICE' | 'APPLICATION';

/** Either side of an order, as embedded in the order payload. */
export interface OrderParticipantWallet {
  type: string;
  publicKey: string;
}

export interface OrderParticipant {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  /** Present when the API includes the participant's primary wallet. */
  wallet?: OrderParticipantWallet;
}

/** Soroban escrow backing an order, present once the contract has been created. */
export interface OrderEscrow {
  id: string;
  status: string;
  trustlessContractId?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  serviceId?: string;
  source: OrderSource;
  title: string;
  description: string;
  amount: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  buyer?: OrderParticipant;
  seller?: OrderParticipant;
  service?: {
    id: string;
    title: string;
  };
  escrow?: OrderEscrow;
  milestones?: Milestone[];
  metadata?: {
    attachments?: OrderAttachment[];
    notes?: OrderProjectNote[];
    [key: string]: unknown;
  };
}

export interface OrderAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  publicId?: string;
  uploadedBy: string;
  uploaderRole: 'buyer' | 'seller';
  uploaderName?: string;
  category?: 'brief' | 'deliverable' | 'evidence' | 'reference';
  note?: string | null;
  createdAt: string;
}

export interface OrderProjectNote {
  id: string;
  message: string;
  authorId: string;
  authorRole: 'buyer' | 'seller';
  authorName?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  orderId: string;
  title: string;
  description: string;
  amount: string;
  status: 'OPEN' | 'COMPLETED';
  dueDate?: string;
  completedAt?: string;
}

export type PayoutStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'ON_HOLD'
  /** Authorized BlindPay quote parked, waiting for a non-custodial seller to sign the transfer client-side. */
  | 'AWAITING_SIGNATURE';

/** BlindPay off-ramp for a released escrow. Mirrors the `Payout` Prisma model. */
export interface Payout {
  id: string;
  userId: string;
  orderId: string;
  bankAccountId: string;
  /** Set once BlindPay accepts the payout; null until then. */
  blindpayPayoutId: string | null;
  /** `"{country}/{rail}"`, e.g. `"MX/SPEI_BITSO"` — matches a rail in `SUPPORTED_CORRIDORS`. */
  corridor: string;
  status: PayoutStatus;
  usdcAmount: string;
  /** Set once BlindPay quotes/settles the payout; null before that. */
  fiatAmount: string | null;
  fiatCurrency: string;
  exchangeRate: string | null;
  /** Set only when `status` is `FAILED`. */
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  buyer_id: string;
  seller_id: string;
  service_id?: string;
  amount: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  ORDER_CREATED: { label: 'Created', color: 'text-text-secondary', bg: 'bg-text-secondary/10' },
  FUNDS_RESERVED: { label: 'Funds Reserved', color: 'text-primary', bg: 'bg-primary/10' },
  ESCROW_CREATING: { label: 'Creating Escrow', color: 'text-primary', bg: 'bg-primary/10' },
  ESCROW_FUNDING: { label: 'Funding Escrow', color: 'text-warning', bg: 'bg-warning/10' },
  ESCROW_FUNDED: { label: 'Escrow Funded', color: 'text-success', bg: 'bg-success/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-primary', bg: 'bg-primary/10' },
  RELEASE_REQUESTED: { label: 'Release Requested', color: 'text-warning', bg: 'bg-warning/10' },
  RELEASED: { label: 'Released', color: 'text-success', bg: 'bg-success/10' },
  REFUND_REQUESTED: { label: 'Refund Requested', color: 'text-warning', bg: 'bg-warning/10' },
  REFUNDED: { label: 'Refunded', color: 'text-warning', bg: 'bg-warning/10' },
  DISPUTED: { label: 'Disputed', color: 'text-error', bg: 'bg-error/10' },
  CLOSED: { label: 'Closed', color: 'text-text-secondary', bg: 'bg-text-secondary/10' },
};
