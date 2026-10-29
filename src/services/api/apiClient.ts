import { env } from '../../config/environment';
import { ApiError, type ApiErrorPayload, type ApiResponse } from '../../types/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      // Response body wasn't JSON — fall through to a generic error below.
    }
    throw new ApiError(
      response.status,
      payload?.error.code ?? 'unknown_error',
      payload?.error.message ?? `Request to ${path} failed with status ${response.status}.`,
    );
  }

  const envelope = (await response.json()) as ApiResponse<T>;
  return envelope.data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
};
