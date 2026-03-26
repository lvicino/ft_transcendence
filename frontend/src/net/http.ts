const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}


export async function apiFetch(path: string, options?: RequestInit) {
  const response = await fetch(apiUrl(path), {
    credentials: "include",
	...options,
    headers: {
		"Content-Type": "application/json",
		...(options?.headers ?? {}),
    },
  });

  if (response.status === 401) {
	if (window.location.pathname !== "/auth") {
		window.location.href = "/auth";
		return new Promise(() => {});
	}
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    let messageError = "API_ERROR";
    try {
      const data = (await response.json()) as { error?: string };
      console.log("apiFetch data: ", data)
      if (data.error) {
        messageError = data.error;
      }
    } catch {
      // normal
    }
    throw new Error(messageError);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
