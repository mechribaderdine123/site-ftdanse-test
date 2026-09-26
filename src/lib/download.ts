import { API_URL } from "@/lib/api";

/**
 * Downloads a protected document (account-request files, etc.) with the auth
 * token attached and saves it via a temporary object URL.
 */
export const downloadProtectedFile = async (
  path: string,
  filename: string,
  token: string = localStorage.getItem("authToken") || "",
): Promise<void> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Document indisponible");
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/** Opens a protected document (auth required) in a new browser tab for preview. */
export const openProtectedFile = async (
  path: string,
  token: string = localStorage.getItem("authToken") || "",
): Promise<void> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Document indisponible");
  const url = URL.createObjectURL(await response.blob());
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
};
