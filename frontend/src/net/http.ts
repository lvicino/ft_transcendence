const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();

    if (text) {
      let message = text;

      try {
        const data = JSON.parse(text) as { message?: string; error?: string };
        message = data.message || data.error || text;
      } catch {
        // Keep raw text fallback for non-JSON responses.
      }

      throw new Error(message);
    }

    throw new Error("API error");
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}
