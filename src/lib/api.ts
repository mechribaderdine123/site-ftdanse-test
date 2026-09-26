// In development Vite proxies this path to the backend. In production an
// explicit VITE_API_URL can still point the client at a separately deployed API.
const API_URL = import.meta.env.VITE_API_URL || "";

export const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("authToken");
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    if (window.location.pathname.startsWith("/admin")) {
      window.location.assign("/admin/login");
    }
  }
  if (!response.ok) throw new Error(data.error || "Une erreur est survenue");
  return data as T;
};

export { API_URL };
