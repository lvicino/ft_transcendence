const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    try {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "API_ERROR");
    } catch {
      throw new Error("API_ERROR");
    }
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
