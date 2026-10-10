/**
 * Browser-side API client. All calls go to /api on the same origin;
 * Next.js proxies them to the NestJS backend (see next.config.ts).
 */
export class ApiError extends Error {
  status: number;
  errors: Record<string, string>;
  constructor(status: number, message: string, errors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type ApiInit = Omit<RequestInit, 'body'> & { json?: unknown; body?: BodyInit };

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch('/api' + path, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...rest,
      headers: { Accept: 'application/json', ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, 'We couldn’t reach the server. Check your connection and try again.');
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const d = (data || {}) as { message?: string | string[]; errors?: Record<string, string> };
    let message = Array.isArray(d.message) ? d.message.join(' ') : d.message || '';
    if (res.status === 429) message = 'Too many attempts. Please wait a minute and try again.';
    if (res.status >= 500 || !message) message = 'Something went wrong on our side. Please try again.';
    // A staff session that has expired: send the user back to sign in.
    if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname.startsWith('/staff') && !window.location.pathname.startsWith('/staff/login')) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => window.location.assign(`/staff/login?expired=1&next=${next}`));
    }
    throw new ApiError(res.status, message, d.errors || {});
  }
  return data as T;
}

/** Turn a flat object into a query string, dropping empty values. */
export const qs = (params: Record<string, string | number | undefined | null>) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? '?' + s : '';
};
