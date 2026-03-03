const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export type OfferStatus = 'ACTIVE' | 'PENDING' | 'CLOSED' | 'COMPLETED';

export type OfferCategory =
  | 'WEB_DEVELOPMENT'
  | 'MOBILE_DEVELOPMENT'
  | 'DESIGN'
  | 'WRITING'
  | 'MARKETING'
  | 'VIDEO'
  | 'MUSIC'
  | 'DATA'
  | 'OTHER';

export interface OfferAttachment {
  id: string;
  offerId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: OfferCategory;
  budget: string;
  deadline: string;
  status: OfferStatus;
  applicantsCount: number;
  attachments: OfferAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  title: string;
  description: string;
  category: OfferCategory;
  budget: string;
  deadline: string;
}

export interface UpdateOfferPayload {
  title?: string;
  description?: string;
  category?: OfferCategory;
  budget?: string;
  deadline?: string;
}

export interface UpdateOfferStatusPayload {
  status: OfferStatus;
}

export async function createOffer(
  token: string,
  payload: CreateOfferPayload
): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/offers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to create offer');
  }

  const data = await response.json();
  return data.data;
}

export async function getMyOffers(token: string): Promise<Offer[]> {
  const response = await fetch(`${API_BASE_URL}/offers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch offers');
  }

  const data = await response.json();
  return data.data;
}

export async function getOfferById(
  token: string,
  offerId: string
): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch offer');
  }

  const data = await response.json();
  return data.data;
}

export async function updateOffer(
  token: string,
  offerId: string,
  payload: UpdateOfferPayload
): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update offer');
  }

  const data = await response.json();
  return data.data;
}

export async function updateOfferStatus(
  token: string,
  offerId: string,
  payload: UpdateOfferStatusPayload
): Promise<Offer> {
  const response = await fetch(`${API_BASE_URL}/offers/${offerId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update offer status');
  }

  const data = await response.json();
  return data.data;
}

export async function deleteOffer(
  token: string,
  offerId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete offer');
  }
}

export async function uploadAttachment(
  token: string,
  offerId: string,
  file: File
): Promise<OfferAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/offers/${offerId}/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload attachment');
  }

  const data = await response.json();
  return data.data;
}

export async function deleteAttachment(
  token: string,
  attachmentId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/offers/attachments/${attachmentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete attachment');
  }
}
