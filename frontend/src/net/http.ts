import { z } from 'zod';

import { useAuthStore, useUIStore } from '@/store';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;

const FastifyErrorSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
});

const FastifyValidationErrorSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

function parseFastifyMessage(payload: unknown, fallbackStatus: number): string {
  const parsedError = FastifyErrorSchema.safeParse(payload);
  if (parsedError.success) return parsedError.data.message;

  const parsedValidationError = FastifyValidationErrorSchema.safeParse(payload);
  if (parsedValidationError.success) {
    const firstValidationError = parsedValidationError.data.errors?.[0]?.message;
    return firstValidationError ?? parsedValidationError.data.message;
  }

  return `Error ${fallbackStatus}`;
}

export async function apiFetch<T>(path: string, schema: z.ZodSchema<T>, init?: RequestInit): Promise<T | null> {
  const { token, actions } = useAuthStore.getState();
  const { addToast } = useUIStore.getState();

  const headers = new Headers(init?.headers);
  const hasBody = init?.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    const payload = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
      const msg = parseFastifyMessage(payload, res.status);
      addToast({ message: msg, type: 'error', title: 'API Error' });

      if (res.status === 401) actions.logout();
      return null;
    }

    const result = schema.safeParse(payload);
    if (!result.success) {
      console.error('Schema mismatch:', result.error);
      addToast({ message: 'Invalid data format from server', type: 'warning', title: 'Validation Error' });
      return null;
    }

    return result.data;
  } catch {
    addToast({ message: 'Check your connection', type: 'error', title: 'Network Error' });
    return null;
  }
}
