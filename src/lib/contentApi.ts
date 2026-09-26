import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_URL } from "@/lib/api";

export type ContentKind = "news" | "competitions" | "results" | "media" | "disciplines" | "about";

export interface ContentItem {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Turns `/api/uploads/...` paths into absolute URLs. Absolute URLs and
 * app assets (`/placeholder.svg`, Vite-bundled images) pass through unchanged.
 */
export const contentUrl = (p: string): string => {
  if (!p) return p;
  if (/^(https?:|data:|blob:)/.test(p)) return p;
  if (p.startsWith("/api/")) return `${API_URL}${p}`;
  return p;
};

interface ListResult<T> {
  items: T[];
  /** true when the API returned nothing (or failed) and the static fallback was used */
  isFallback: boolean;
}

const EMPTY: unique symbol = Symbol("empty");

const fetchContent = async <T>(kind: ContentKind): Promise<T[] | typeof EMPTY> => {
  try {
    const data = await apiRequest<T[]>(`/api/content/${kind}`);
    return Array.isArray(data) && data.length > 0 ? data : EMPTY;
  } catch {
    return EMPTY;
  }
};

/**
 * Fetches a content kind from the API. When the API has no items yet (fresh
 * install) or is unreachable, `fallback` (the legacy static dataset) is used
 * so the public site keeps working before the admin migrates real content.
 */
export const useContent = <T>(
  kind: ContentKind,
  fallback: T[] = [],
): ListResult<T> => {
  const { data } = useQuery({
    queryKey: ["content", kind],
    queryFn: () => fetchContent<T>(kind),
    staleTime: 60_000,
  });
  if (data && data !== EMPTY) return { items: data as T[], isFallback: false };
  return { items: fallback, isFallback: true };
};

// ---------- Admin helpers ----------

export const adminListContent = <T extends ContentItem>(kind: ContentKind) =>
  apiRequest<T[]>(`/api/content/${kind}`);

export const adminCreateContent = (kind: ContentKind, body: Record<string, unknown>) =>
  apiRequest<ContentItem>(`/api/admin/content/${kind}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const adminUpdateContent = (kind: ContentKind, id: number, body: Record<string, unknown>) =>
  apiRequest<ContentItem>(`/api/admin/content/${kind}/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const adminDeleteContent = (kind: ContentKind, id: number) =>
  apiRequest<{ ok: true }>(`/api/admin/content/${kind}/${id}`, { method: "DELETE" });

/** Uploads files to the persistent media endpoint and returns their URLs. */
export const uploadMediaFiles = async (files: File[]): Promise<string[]> => {
  if (!files.length) return [];
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const response = await apiRequest<{ files: { url: string }[] }>("/api/admin/uploads", {
    method: "POST",
    body: formData,
  });
  return response.files.map((f) => f.url);
};

/** Uploads one file; returns its URL or null on failure. */
export const uploadMediaFile = async (file: File): Promise<string | null> => {
  const urls = await uploadMediaFiles([file]);
  return urls[0] ?? null;
};
