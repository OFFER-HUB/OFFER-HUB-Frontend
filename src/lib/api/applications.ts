const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

import type { Application, CreateApplicationPayload, UpdateApplicationStatusPayload, ApplicationFilters } from '@/types/application.types';

/**
 * Freelancer: Aplicar a una oferta
 */
export async function applyToOffer(
  token: string,
  offerId: string,
  payload: CreateApplicationPayload
): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/applications/offers/${offerId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to apply to offer');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Freelancer: Obtener mis aplicaciones
 */
export async function getMyApplications(
  token: string,
  filters?: ApplicationFilters
): Promise<Application[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.cursor) params.append('cursor', filters.cursor);

  const response = await fetch(`${API_BASE_URL}/applications/my?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch applications');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Cliente: Obtener aplicantes de una oferta
 */
export async function getOfferApplications(
  token: string,
  offerId: string,
  filters?: ApplicationFilters
): Promise<Application[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.cursor) params.append('cursor', filters.cursor);

  const response = await fetch(`${API_BASE_URL}/applications/offers/${offerId}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch applications');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Cliente: Actualizar estado de aplicación
 */
export async function updateApplicationStatus(
  token: string,
  applicationId: string,
  payload: UpdateApplicationStatusPayload
): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update application status');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Freelancer: Retirar aplicación
 */
export async function withdrawApplication(
  token: string,
  applicationId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to withdraw application');
  }
}

/**
 * Obtener detalles de aplicación
 */
export async function getApplicationById(
  token: string,
  applicationId: string
): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch application');
  }

  const data = await response.json();
  return data.data;
}
