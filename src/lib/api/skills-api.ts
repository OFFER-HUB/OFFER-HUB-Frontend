/**
 * skills-api.ts
 * API client functions for freelancer skill CRUD operations.
 * All functions call /api/profile/skills and handle errors uniformly.
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
export async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch("/api/profile/skills", {
    method: "GET",
    credentials: "include",
  });
  return handleResponse<Skill[]>(res);
}

/** Add a new skill */
export async function addSkill(
  payload: Pick<Skill, "name" | "level" | "order">
): Promise<Skill> {
  const res = await fetch("/api/profile/skills", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Skill>(res);
}

/** Update an existing skill's level or order */
export async function updateSkill(
  id: string,
  payload: Partial<Pick<Skill, "level" | "order">>
): Promise<Skill> {
  const res = await fetch(`/api/profile/skills/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Skill>(res);
}

/** Delete a skill */
export async function deleteSkill(id: string): Promise<void> {
  const res = await fetch(`/api/profile/skills/${id}`, {
    method: "DELETE",
    credentials: "include",
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
export async function reorderSkills(orderedIds: string[]): Promise<void> {
  const res = await fetch("/api/profile/skills/reorder", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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