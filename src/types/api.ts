/**
 * Generic envelope types for the future FastAPI backend. The HTTP provider
 * assumes endpoints return JSON shaped like ApiResponse<T>; adjust here if
 * the backend's actual contract differs — nothing else in the app should
 * need to change.
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    generatedAt?: string;
    source?: string;
  };
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
