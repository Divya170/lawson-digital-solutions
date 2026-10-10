// Server components only (uses BACKEND_URL, which is not exposed to the browser).
import type { Content, Site } from './types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/** Server-side fetch straight to the NestJS API. Returns null if unreachable or not found. */
export async function serverGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getSite = () => serverGet<Site>('/site');
export const getContent = () => serverGet<Content>('/content');
