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
  buyer?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  seller?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  service?: {
    id: string;
    title: string;
  };
  escrow?: {
    id: string;
    status: string;
    trustlessContractId?: string;
  };
  milestones?: Milestone[];
  metadata?: Record<string, any>;
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

export interface CreateOrderPayload {
  buyer_id: string;
  seller_id: string;
  service_id?: string;
  amount: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
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
