import { API_URL } from "@/config/api";

/**
 * skills-api.ts
 * API client functions for freelancer skill CRUD operations.
 * All functions call API_URL/users/me/skills and handle errors uniformly.
 */

export type SkillLevel = "Beginner" | "Intermediate" | "Expert";

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  order: number;
}

export interface ApiError {
  message: string;
  status: number;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      message: body.message ?? "An unexpected error occurred.",
      status: res.status,
    } as ApiError;
  }
  return res.json() as Promise<T>;
}

/** Fetch all skills for the authenticated user's profile */
export async function fetchSkills(token: string): Promise<Skill[]> {
  const res = await fetch(`${API_URL}/users/me/skills`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Skill[]>(res);
}

/** Add a new skill */
export async function addSkill(
  token: string,
  payload: Pick<Skill, "name" | "level" | "order">
): Promise<Skill> {
  const res = await fetch(`${API_URL}/users/me/skills`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Skill>(res);
}

/** Update an existing skill's level or order */
export async function updateSkill(
  token: string,
  id: string,
  payload: Partial<Pick<Skill, "level" | "order">>
): Promise<Skill> {
  const res = await fetch(`${API_URL}/users/me/skills/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<Skill>(res);
}

/** Delete a skill */
export async function deleteSkill(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/me/skills/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      message: body.message ?? "Failed to delete skill.",
      status: res.status,
    } as ApiError;
  }
}

/** Reorder skills — sends the full ordered id array */
export async function reorderSkills(token: string, orderedIds: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/users/me/skills/reorder`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      message: body.message ?? "Failed to reorder skills.",
      status: res.status,
    } as ApiError;
  }
}